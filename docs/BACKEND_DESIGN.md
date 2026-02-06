# Backend Design - Exam Prep Platform

> **Status:** Planning Phase
> **Database:** Cloudflare D1
> **Runtime:** Cloudflare Workers

---

## 1. Database Schema (D1)

### Core Tables

```sql
-- Users and authentication
CREATE TABLE users (
    id TEXT PRIMARY KEY,                    -- UUID
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,            -- bcrypt
    credits INTEGER DEFAULT 5,              -- Current credit balance
    plan TEXT DEFAULT 'free',               -- 'free' | 'starter' | 'unlimited'
    monthly_credits INTEGER DEFAULT 5,      -- Plan allowance (ignored for unlimited)
    credits_reset_at INTEGER,               -- Next monthly reset timestamp
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at INTEGER NOT NULL,            -- Unix timestamp
    updated_at INTEGER NOT NULL
);

-- Courses (scalable for multiple courses)
CREATE TABLE courses (
    id TEXT PRIMARY KEY,                    -- 'calc2', 'physics1', etc.
    code TEXT NOT NULL,                     -- 'MATH-201'
    name TEXT NOT NULL,                     -- 'Calculus 2'
    description TEXT,
    university TEXT,
    total_exams INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at INTEGER NOT NULL
);

-- Exams (past midterms/finals)
CREATE TABLE exams (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    year INTEGER NOT NULL,                  -- 2022, 2023, etc.
    semester TEXT,                          -- 'Fall', 'Spring', 'Summer'
    exam_type TEXT NOT NULL,                -- 'midterm', 'final', 'quiz'
    total_points INTEGER,
    exam_date INTEGER,                      -- When exam was given
    upload_date INTEGER NOT NULL,           -- When uploaded to platform
    processed BOOLEAN DEFAULT FALSE,        -- AI processed?
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Topics (hierarchical, per course)
CREATE TABLE topics (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    parent_id TEXT,                         -- For subtopics (optional)
    name TEXT NOT NULL,                     -- 'Integration by Parts'
    description TEXT,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    frequency_score REAL,                   -- 0-100, how often appears
    avg_points REAL,                        -- Average points when tested
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (parent_id) REFERENCES topics(id)
);

-- Questions (exam + AI-generated)
CREATE TABLE questions (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    exam_id TEXT,                           -- NULL if AI-generated
    topic_id TEXT NOT NULL,
    pattern_id TEXT,                        -- Groups similar question patterns
    techniques TEXT,                        -- JSON array: ["integration_by_parts", "trig_sub"]

    -- Question content
    question_text TEXT NOT NULL,            -- LaTeX supported
    solution_text TEXT NOT NULL,            -- Step-by-step
    hint TEXT,                              -- Optional hint

    -- Metadata
    question_type TEXT DEFAULT 'free_response', -- 'multiple_choice', 'free_response'
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
    difficulty_reason TEXT,                 -- Why it's rated 1-5 (length/trickiness)
    frequency_score REAL,                   -- 0-1 rate across exams for this pattern
    points INTEGER,                         -- Original exam points
    time_estimate INTEGER,                  -- Minutes to solve

    -- Source tracking
    source_exam_year INTEGER,               -- For display: "From 2022 Midterm"
    source_exam_type TEXT,
    source_question_number INTEGER,

    -- AI generation tracking
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_model TEXT,                          -- 'gpt-4', etc.
    generated_at INTEGER,

    -- Validation
    reviewed BOOLEAN DEFAULT FALSE,         -- Human reviewed?
    verified_correct BOOLEAN DEFAULT TRUE,

    created_at INTEGER NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (exam_id) REFERENCES exams(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- Multiple choice options (if applicable)
CREATE TABLE question_options (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    option_letter TEXT NOT NULL,            -- 'A', 'B', 'C', 'D'
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Question pattern groups (for repeat frequency across exams)
CREATE TABLE question_patterns (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    name TEXT NOT NULL,                     -- "IBP + log(x)" pattern
    techniques TEXT,                        -- JSON array of techniques
    canonical_form TEXT,                    -- Normalized text or LaTeX
    appearance_count INTEGER DEFAULT 0,     -- Total occurrences
    appearance_rate REAL,                   -- appearance_count / total_exams
    first_seen_year INTEGER,
    last_seen_year INTEGER,
    example_question_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (topic_id) REFERENCES topics(id)
);

-- User progress tracking
CREATE TABLE user_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    question_id TEXT NOT NULL,
    course_id TEXT NOT NULL,

    -- Attempt data
    attempted_at INTEGER NOT NULL,
    is_correct BOOLEAN,
    user_answer TEXT,                       -- Their answer
    time_spent INTEGER,                     -- Seconds

    -- Credit tracking
    credits_used INTEGER DEFAULT 1,         -- Should be 1 per question

    -- For spaced repetition (future)
    next_review_at INTEGER,
    ease_factor REAL DEFAULT 2.5,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    UNIQUE(user_id, question_id)            -- One record per question
);

-- Credit transactions (audit trail)
CREATE TABLE credit_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,                -- Positive = add, negative = use
    transaction_type TEXT NOT NULL,         -- 'signup_bonus', 'monthly_refresh', 'purchase', 'subscription_renewal', 'question_view', 'analysis_view', 'refund'

    -- For purchases
    stripe_payment_intent_id TEXT,
    amount_paid_cents INTEGER,              -- For revenue tracking

    description TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Course enrollments (for multi-course)
CREATE TABLE user_courses (
    user_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    enrolled_at INTEGER NOT NULL,
    last_accessed_at INTEGER,
    progress_percentage REAL DEFAULT 0,
    PRIMARY KEY (user_id, course_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Exam analysis cache (pre-computed)
CREATE TABLE exam_analysis (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    generated_at INTEGER NOT NULL,

    -- Analysis data (JSON)
    topic_distribution TEXT,                -- JSON: [{topic_id, count, percentage}]
    difficulty_distribution TEXT,           -- JSON: {easy: 10, medium: 15, hard: 5}
    year_trends TEXT,                       -- JSON: trends over years

    -- Valid until new exams added
    valid_until INTEGER,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Indexes for performance
CREATE INDEX idx_questions_course ON questions(course_id);
CREATE INDEX idx_questions_topic ON questions(topic_id);
CREATE INDEX idx_questions_exam ON questions(exam_id);
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_course ON user_progress(course_id);
CREATE INDEX idx_transactions_user ON credit_transactions(user_id);
```

---

## 2. API Endpoints

### Authentication

```typescript
// POST /api/auth/register
// Body: { email: string, password: string }
// Response: { success: true, token: string, user: { id, email, credits } }

// POST /api/auth/login
// Body: { email: string, password: string }
// Response: { success: true, token: string, user: { id, email, credits, plan, credits_reset_at } }

// POST /api/auth/logout
// Headers: Authorization: Bearer <token>
// Response: { success: true }

// GET /api/auth/me
// Headers: Authorization: Bearer <token>
// Response: { user: { id, email, credits, plan, credits_reset_at, created_at } }
```

### Courses

```typescript
// GET /api/courses
// Headers: Authorization: Bearer <token>
// Response: { courses: [{ id, code, name, description, total_exams, total_questions, is_enrolled }] }

// GET /api/courses/:id
// Headers: Authorization: Bearer <token>
// Response: { course: { id, code, name, description, topics: [...], stats: {...} } }

// POST /api/courses/:id/enroll
// Headers: Authorization: Bearer <token>
// Response: { success: true, enrolled_at: number }
```

### Exam Analysis (Costs 2 Credits)

```typescript
// GET /api/courses/:id/analysis
// Headers: Authorization: Bearer <token>
// Response: {
//   credits_deducted: 2,
//   analysis: {
//     topic_distribution: [
//       { topic_id: "integration_parts", name: "Integration by Parts", count: 5, percentage: 25, avg_points: 12 }
//     ],
//     difficulty_distribution: { easy: 10, medium: 15, hard: 5 },
//     year_over_year_trends: [...],
//     high_value_topics: [...],  // Topics that appear often + high points
//     recommended_study_order: [...],
//     estimated_exam_coverage: { topic_id: percentage }
//   }
// }
// Error (insufficient credits): { error: "Insufficient credits", credits_needed: 2, credits_available: 1 }
```

### Questions

```typescript
// GET /api/questions
// Query: ?course_id=calc2&topic_id=optional&difficulty=optional&limit=10
// Headers: Authorization: Bearer <token>
// Response: {
//   questions: [
//     { id, topic_id, difficulty, points, preview: "first 100 chars..." }
//   ],
//   total_available: 50,
//   user_credits: 5
// }

// POST /api/questions/:id/reveal
// Headers: Authorization: Bearer <token>
// Body: { weak_topics?: string[] }  // For personalized context
// Response: {
//   credits_deducted: 1,
//   question: {
//     id,
//     question_text: "full LaTeX question",
//     topic_id,
//     difficulty,
//     points,
//     source_exam_year,
//     source_exam_type,
//     source_question_number,
//     hint: "optional hint"
//   },
//   user_credits_remaining: 4
// }

// POST /api/questions/:id/solution
// Headers: Authorization: Bearer <token>
// Response: {
//   solution: {
//     steps: [
//       { step_number: 1, explanation: "...", math: "LaTeX" },
//       { step_number: 2, explanation: "...", math: "LaTeX" }
//     ],
//     final_answer: "...",
//     key_insights: ["pattern to recognize", "common mistake to avoid"]
//   }
// }

// POST /api/questions/:id/attempt
// Headers: Authorization: Bearer <token>
// Body: { answer: string, time_spent: number }
// Response: {
//   is_correct: boolean,  // AI-evaluated for free response
//   feedback: "specific feedback",
//   weak_areas_identified: [...]
// }
```

### Weak Topics Assessment

```typescript
// POST /api/assessment/weak-topics
// Headers: Authorization: Bearer <token>
// Body: {
//   course_id: "calc2",
//   self_reported_weaknesses: ["integration_parts", "partial_fractions"]
// }
// Response: {
//   personalized_question_set: [
//     { question_id, topic_id, reason: "You reported weakness in this area" }
//   ],
//   recommended_study_plan: [
//     { topic_id, priority: "high", estimated_time: 30 }
//   ]
// }
```

### Credits & Payments

```typescript
// GET /api/credits/balance
// Headers: Authorization: Bearer <token>
// Response: {
//   credits: 5,
//   plan: "free",
//   credits_reset_at: 1738800000
// }

// POST /api/credits/purchase
// Headers: Authorization: Bearer <token>
// Body: { plan: "starter" | "unlimited" }
// Response: {
//   checkout_url: "https://checkout.stripe.com/...",
//   session_id: "cs_..."
// }

// GET /api/credits/transactions
// Headers: Authorization: Bearer <token>
// Response: {
//   transactions: [
//     { id, amount, type, description, created_at }
//   ]
// }
```

### Webhooks

```typescript
// POST /api/webhooks/stripe
// Stripe webhook for payment confirmation
// Body: Stripe event payload
// Actions: Add credits to user on successful payment
```

---

## 3. Question Display System

### Question Card Component Structure

```typescript
interface QuestionDisplay {
  // Header
  topic: string;                    // "Integration by Parts"
  difficulty: 1-5;                  // Visual indicator (dots)
  points: number;                   // 15 pts
  source: {                         // "From 2022 Midterm, Q3"
    year: number;
    exam_type: string;
    question_number: number;
  };

  // Body
  question_text: string;            // LaTeX rendered
  is_multiple_choice: boolean;
  options?: Option[];               // If MC

  // Interaction
  show_hint: boolean;
  user_answer?: string;
  time_started: number;

  // Solution (revealed after attempt)
  solution?: {
    steps: Step[];
    final_answer: string;
    key_insights: string[];
  };
}
```

### Display Flow

```
┌─────────────────────────────────────┐
│ Integration by Parts    [15 pts]   │
│ ★★★☆☆ Difficult                     │
│ From 2022 Midterm, Q3              │
├─────────────────────────────────────┤
│                                     │
│  Question text with LaTeX...        │
│  $$\\int x e^x dx$$                 │
│                                     │
│  [Show Hint]                        │
│                                     │
├─────────────────────────────────────┤
│  Your answer:                       │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Submit Answer]                    │
│                                     │
└─────────────────────────────────────┘

After submit:
├─────────────────────────────────────┤
│  ✓ Correct! (or ✗ Needs work)      │
│                                     │
│  Step 1: Identify u and dv          │
│  ...                                │
│                                     │
│  Key insight: Look for products     │
│  of polynomial × exponential        │
│                                     │
│  [Next Question]  [Review Later]    │
└─────────────────────────────────────┘
```

### Adaptive Question Selection

```typescript
// Algorithm for choosing next question
function selectNextQuestion(userId: string, courseId: string): Question {
  // 1. Get user's weak topics from progress
  const weakTopics = getWeakTopics(userId, courseId);

  // 2. Prioritize weak topics, but add variety
  const candidateQuestions = db.query(`
    SELECT * FROM questions
    WHERE course_id = ?
    AND topic_id IN (${weakTopics})
    AND id NOT IN (SELECT question_id FROM user_progress WHERE user_id = ?)
    ORDER BY RANDOM()
    LIMIT 5
  `, [courseId, userId]);

  // 3. Mix in 1-2 questions from strong topics (spaced repetition)
  // 4. Ensure difficulty progression (start easier, build up)
  // 5. Return best match
}
```

---

## 4. Modular Component Architecture

### Backend Modules

```
worker/src/
├── index.ts                    # Main entry, router
├── types.ts                    # Shared TypeScript types
├── config.ts                   # Environment variables
├── database.ts                 # D1 connection wrapper
│
├── routes/
│   ├── auth.ts                 # Register, login, logout
│   ├── courses.ts              # Course listing, enrollment
│   ├── analysis.ts             # Exam analysis (credit deducted)
│   ├── questions.ts            # Question fetching, reveal
│   ├── assessment.ts           # Weak topics evaluation
│   ├── credits.ts              # Balance, purchase
│   └── webhooks.ts             # Stripe webhooks
│
├── services/
│   ├── credit.service.ts       # Credit deduction logic
│   ├── question.service.ts     # Question selection algorithm
│   ├── analysis.service.ts     # Exam analysis generation
│   └── ai.service.ts           # OpenAI integration
│
├── utils/
│   ├── auth.ts                 # JWT verify/sign
│   ├── validators.ts           # Input validation
│   └── errors.ts               # Error handling
│
└── middleware/
    ├── auth.middleware.ts      # Verify JWT
    ├── credits.middleware.ts   # Check credit balance
    └── rate-limit.middleware.ts
```

### Reusable Backend Patterns

```typescript
// Generic credit-check decorator
function requireCredits(amount: number) {
  return async (request: Request, env: Env) => {
    const user = await getUserFromToken(request, env);
    if (user.credits < amount && user.plan !== 'unlimited') {
      return Response.json({
        error: "Insufficient credits",
        credits_needed: amount,
        credits_available: user.credits,
        upgrade_url: "/upgrade"
      }, { status: 402 }); // Payment Required
    }
    // Deduct credits
    await deductCredits(user.id, amount, env.DB);
    return { user, credits_deducted: amount };
  };
}

// Generic course loader
async function getCourseWithTopics(courseId: string, db: D1Database) {
  const course = await db.prepare(
    "SELECT * FROM courses WHERE id = ?"
  ).bind(courseId).first();

  const topics = await db.prepare(
    "SELECT * FROM topics WHERE course_id = ? ORDER BY frequency_score DESC"
  ).bind(courseId).all();

  return { ...course, topics: topics.results };
}
```

---

## 5. Multi-Course Scalability

### Adding a New Course (e.g., Physics 1)

**Step 1: Insert course record**
```sql
INSERT INTO courses (id, code, name, description)
VALUES ('physics1', 'PHYS-101', 'Physics 1', 'Mechanics and thermodynamics');
```

**Step 2: Define topics**
```sql
INSERT INTO topics (id, course_id, name, frequency_score) VALUES
('kinematics', 'physics1', 'Kinematics', 85),
('newtons_laws', 'physics1', "Newton's Laws", 90),
...;
```

**Step 3: Upload exams**
- Same process as Calc 2
- AI extracts questions
- Links to physics1 topics

**Frontend automatically works:**
- Course selector shows new course
- Same components, different data
- Analysis/practice flow identical

### No Code Changes Required

The backend is generic:
- `GET /api/courses` returns all active courses
- `GET /api/courses/physics1/analysis` just works
- Questions filtered by `course_id`

---

## 6. Key Design Decisions

### 1. Credit System
- **Immutable transactions** - Every credit change logged
- **Atomic deductions** - Check + deduct in one transaction
- **Graceful degradation** - Clear error messages, upgrade CTAs

### 2. Question Reveal (Not Bulk)
- User sees **preview** (topic, difficulty, points) for free
- Pays 1 credit to **reveal full question + solution**
- Prevents scraping, ensures payment fairness

### 3. Analysis Pre-computation
- Analysis generated when exams uploaded (background job)
- Cached in `exam_analysis` table
- User pays 2 credits to view (not regenerate)

### 4. AI Question Generation
- Triggered when: new exam uploaded, low question count
- Stored in same `questions` table with `is_ai_generated=true`
- Human review queue for quality control

---

## Next Steps

1. ✅ Database schema designed
2. ✅ API endpoints defined
3. ✅ Question display system planned
4. ✅ Multi-course architecture ready
5. 🔄 Implement schema in D1
6. 🔄 Build auth endpoints
7. 🔄 Build question endpoints

**Ready to start implementation?**
