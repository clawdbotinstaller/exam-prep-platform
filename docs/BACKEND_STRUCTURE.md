# Backend Structure

> **Last Updated:** 2026-02-05
> **Database:** Cloudflare D1 (SQLite at edge)
> **Runtime:** Cloudflare Workers

---

## Database Schema

### Table: `users`
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,           -- UUID v4
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,   -- bcrypt hash
  credits INTEGER DEFAULT 5,     -- Free tier monthly credits
  plan TEXT DEFAULT 'free',      -- 'free' | 'starter' | 'unlimited'
  monthly_credits INTEGER DEFAULT 5,
  credits_reset_at TIMESTAMP,    -- Next monthly reset
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_credits ON users(credits);
```

### Table: `sessions`
```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,           -- JWT jti claim
  user_id TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
```

### Table: `courses`
```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,           -- 'calc2', 'calc3', etc.
  name TEXT NOT NULL,
  description TEXT,
  exam_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
INSERT INTO courses (id, name, description, exam_count) VALUES
('calc2', 'Calculus 2', 'Integration techniques, series, applications', 4);
```

### Table: `topics`
```sql
CREATE TABLE topics (
  id TEXT PRIMARY KEY,           -- UUID
  course_id TEXT NOT NULL,
  name TEXT NOT NULL,            -- "Integration by Parts"
  slug TEXT NOT NULL,            -- "integration-by-parts"
  category TEXT NOT NULL,        -- "integration", "series", "applications"
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  frequency_score DECIMAL(3,2),  -- 0.00 to 1.00 (appears in X% of exams)
  avg_points DECIMAL(4,1),       -- Average points per question
  total_appearances INTEGER DEFAULT 0,

  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_topics_course ON topics(course_id);
CREATE INDEX idx_topics_category ON topics(category);
CREATE INDEX idx_topics_frequency ON topics(frequency_score DESC);
```

### Table: `questions`
```sql
CREATE TABLE questions (
  id TEXT PRIMARY KEY,           -- UUID
  topic_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  pattern_id TEXT,               -- Groups similar question patterns
  techniques TEXT,               -- JSON array of techniques

  -- Question content
  question_text TEXT NOT NULL,   -- LaTeX or plain text
  solution_steps TEXT NOT NULL,  -- JSON array of steps
  answer TEXT NOT NULL,          -- Final answer

  -- Metadata
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  difficulty_reason TEXT,
  frequency_score DECIMAL(3,2),  -- 0.00 to 1.00 across exams
  estimated_time INTEGER,        -- Minutes to solve

  -- Source attribution
  source_exam_year INTEGER,      -- 2023
  source_exam_type TEXT,         -- "midterm", "final"
  source_question_num INTEGER,   -- Question number
  source_points INTEGER,         -- Points in original exam

  -- AI tracking
  ai_generated BOOLEAN DEFAULT TRUE,
  ai_model TEXT,                 -- "gpt-4o-mini"
  reviewed BOOLEAN DEFAULT FALSE,-- Manual review status

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_course ON questions(course_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
```

### Table: `question_patterns`
```sql
CREATE TABLE question_patterns (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  name TEXT NOT NULL,                 -- "IBP + log(x)" pattern
  techniques TEXT,                    -- JSON array
  canonical_form TEXT,                -- Normalized text/LaTeX
  appearance_count INTEGER DEFAULT 0,
  appearance_rate DECIMAL(3,2),
  first_seen_year INTEGER,
  last_seen_year INTEGER,
  example_question_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);
```

### Table: `user_progress`
```sql
CREATE TABLE user_progress (
  id TEXT PRIMARY KEY,           -- UUID
  user_id TEXT NOT NULL,
  question_id TEXT NOT NULL,

  -- Attempt tracking
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  was_correct BOOLEAN,           -- NULL if just viewed solution
  time_spent_seconds INTEGER,    -- How long they spent

  -- Credit tracking
  credits_used INTEGER DEFAULT 1,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_question ON user_progress(question_id);
CREATE INDEX idx_progress_date ON user_progress(attempted_at);
```

### Table: `credit_transactions`
```sql
CREATE TABLE credit_transactions (
  id TEXT PRIMARY KEY,           -- UUID
  user_id TEXT NOT NULL,

  -- Transaction details
  type TEXT NOT NULL CHECK (type IN ('signup_bonus', 'monthly_refresh', 'subscription_renewal', 'purchase', 'usage', 'refund')),
  amount INTEGER NOT NULL,       -- Positive = added, Negative = spent
  balance_after INTEGER NOT NULL,-- Credit balance after transaction

  -- For purchases
  stripe_payment_intent_id TEXT, -- Link to Stripe
  amount_paid_cents INTEGER,     -- In cents ($10.00 = 1000)

  -- For usage
  question_id TEXT,              -- NULL if not question-related

  description TEXT,              -- "Signup bonus", "Purchased 15 credits", etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_transactions_type ON credit_transactions(type);
CREATE INDEX idx_transactions_date ON credit_transactions(created_at);
```

### Table: `analysis_cache`
```sql
CREATE TABLE analysis_cache (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,

  -- Pre-computed analysis results
  topic_frequency JSON NOT NULL, -- [{topic_id, frequency, avg_points}, ...]
  difficulty_distribution JSON,  -- {easy: 0.3, medium: 0.5, hard: 0.2}
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

---

## API Endpoints

### Authentication

#### POST `/api/auth/register`
```typescript
// Request
{
  email: string;      // Valid email format
  password: string;   // Min 8 chars, 1 number
}

// Response (201)
{
  success: true;
  token: string;      // JWT
  user: {
    id: string;
    email: string;
    credits: number;  // 10 (signup bonus)
  }
}

// Errors
// 400: Invalid email or password
// 409: Email already exists
```

#### POST `/api/auth/login`
```typescript
// Request
{
  email: string;
  password: string;
}

// Response (200)
{
  success: true;
  token: string;
  user: {
    id: string;
    email: string;
    credits: number;
    has_unlimited: boolean;
    unlimited_until?: string;
  }
}

// Errors
// 401: Invalid credentials
```

#### POST `/api/auth/logout`
```typescript
// Headers: Authorization: Bearer <token>
// Response (200)
{ success: true }
```

### User

#### GET `/api/me`
```typescript
// Headers: Authorization: Bearer <token>

// Response (200)
{
  id: string;
  email: string;
  credits: number;
  has_unlimited: boolean;
  unlimited_until?: string;
  created_at: string;
}
```

#### GET `/api/me/progress`
```typescript
// Headers: Authorization: Bearer <token>

// Response (200)
{
  total_questions_attempted: number;
  total_correct: number;
  accuracy_rate: number;  // 0.0 to 1.0
  credits_spent: number;
  favorite_topics: [{ topic_id, count }];
  recent_activity: [{
    question_id: string;
    topic_name: string;
    attempted_at: string;
    was_correct: boolean;
  }];
}
```

### Courses

#### GET `/api/courses`
```typescript
// Response (200)
{
  courses: [{
    id: string;
    name: string;
    description: string;
    exam_count: number;
    is_active: boolean;
  }]
}
```

#### GET `/api/courses/:id`
```typescript
// Response (200)
{
  id: string;
  name: string;
  description: string;
  exam_count: number;
  topics: [{
    id: string;
    name: string;
    category: string;
    difficulty: number;
    frequency_score: number;
  }];
}
```

### Analysis

#### GET `/api/courses/:id/analysis`
```typescript
// Headers: Authorization: Bearer <token>
// Query: ?force_refresh=false

// Response (200)
{
  course_id: string;
  credits_deducted: 2;
  remaining_credits: number;
  analysis: {
    topic_frequency: [{
      topic_id: string;
      topic_name: string;
      frequency: number;       // 0.0 to 1.0
      avg_points: number;
      total_appearances: number;
    }];
    difficulty_distribution: {
      easy: number;      // Percentage
      medium: number;
      hard: number;
    };
    high_value_topics: [{
      topic_id: string;
      topic_name: string;
      avg_points: number;
      frequency: number;
      priority_score: number;  // Computed: points * frequency
    }];
    study_strategy: string;  // AI-generated text
  }
}

// Errors
// 402: Insufficient credits (need 2)
```

### Questions

#### GET `/api/questions`
```typescript
// Headers: Authorization: Bearer <token>
// Query params:
//   - topic_id?: string     // Filter by topic
//   - difficulty?: 1-5      // Filter by difficulty
//   - limit?: number        // Default 10, max 50
//   - offset?: number       // For pagination

// Response (200)
{
  questions: [{
    id: string;
    topic_id: string;
    topic_name: string;
    difficulty: number;
    estimated_time: number;
    // Note: question_text NOT included (preview only)
  }];
  total: number;
  has_more: boolean;
}
```

#### POST `/api/questions/:id/start`
```typescript
// Headers: Authorization: Bearer <token>
// This deducts 1 credit and returns the full question

// Response (200)
{
  question: {
    id: string;
    topic_id: string;
    topic_name: string;
    question_text: string;     // Full question
    difficulty: number;
    estimated_time: number;
    source_exam_year: number;
    source_exam_type: string;
    source_question_num: number;
    source_points: number;
  };
  credits_deducted: 1;
  remaining_credits: number;
}

// Errors
// 402: Insufficient credits
// 404: Question not found
// 409: Already attempted this question
```

#### POST `/api/questions/:id/solution`
```typescript
// Headers: Authorization: Bearer <token>
// Call this when user clicks "Show Solution"

// Response (200)
{
  solution_steps: string[];  // Array of steps
  answer: string;
  explanation: string;       // AI explanation of approach
}
```

#### POST `/api/questions/:id/submit`
```typescript
// Headers: Authorization: Bearer <token>
// Optional - for tracking if user got it right

// Request
{
  was_correct: boolean;
  time_spent_seconds: number;
}

// Response (200)
{
  correct: boolean;
  stats: {
    total_attempts: number;
    accuracy_rate: number;
  }
}
```

### Credits

#### GET `/api/credits/balance`
```typescript
// Headers: Authorization: Bearer <token>

// Response (200)
{
  credits: number;
  has_unlimited: boolean;
  unlimited_until?: string;
  recent_transactions: [{
    type: string;
    amount: number;
    description: string;
    created_at: string;
  }];
}
```

#### POST `/api/credits/purchase`
```typescript
// Headers: Authorization: Bearer <token>

// Request
{
  product: 'credits_10' | 'credits_25' | 'credits_50' | 'week_pass' | 'semester_pass';
}

// Response (200)
{
  checkout_url: string;  // Stripe Checkout URL
  session_id: string;    // For webhook matching
}
```

### Webhooks

#### POST `/api/webhooks/stripe`
```typescript
// Stripe webhook endpoint
// Events handled:
// - checkout.session.completed -> Add credits/activate unlimited
// - invoice.payment_failed -> Notify user
// - customer.subscription.deleted -> Remove unlimited

// Response (200)
{ received: true }
```

---

## Authentication Flow

### JWT Structure
```typescript
interface JWTPayload {
  sub: string;        // User ID
  email: string;
  jti: string;        // Session ID (for revocation)
  iat: number;        // Issued at
  exp: number;        // Expires at (24 hours)
}
```

### Middleware Flow
```
Request with Authorization header
  ↓
Extract JWT from "Bearer <token>"
  ↓
Verify signature with SECRET_KEY
  ↓
Check expiration
  ↓
Check if session revoked in DB
  ↓
Attach user to context
  ↓
Proceed to handler
```

### Environment Variables
```
# Required in Cloudflare Workers
JWT_SECRET=<random-256-bit-key>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CREDITS_10=price_...
STRIPE_PRICE_WEEK_PASS=price_...
STRIPE_PRICE_SEMESTER_PASS=price_...
OPENAI_API_KEY=sk-...
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```

---

## Caching Strategy

### Cache Layers
1. **Analysis results** - Cache for 1 hour (course-level data doesn't change often)
2. **Question list** - Cache for 5 minutes
3. **User session** - Cache JWT validation for 5 minutes

### Cache Keys
```
analysis:{course_id}
questions:{course_id}:{topic_id}:{difficulty}:{page}
session:{jwt_jti}
```

---

## Rate Limiting

### Limits
- Anonymous: 10 requests/minute (basically blocked)
- Authenticated: 100 requests/minute
- Analysis generation: 5/hour per user
- Question generation: 20/hour per user

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707123456
```

---

## Error Response Format

```typescript
// Standard error response
{
  error: {
    code: string;           // Machine-readable
    message: string;        // Human-readable
    details?: any;          // Additional context
  }
}

// Example codes
// 400: BAD_REQUEST
// 401: UNAUTHORIZED
// 402: PAYMENT_REQUIRED (insufficient credits)
// 403: FORBIDDEN
// 404: NOT_FOUND
// 409: CONFLICT
// 429: RATE_LIMITED
// 500: INTERNAL_ERROR
```
