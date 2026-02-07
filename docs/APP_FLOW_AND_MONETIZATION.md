# Testament - Complete App Flow, Monetization & Data Pipeline Documentation

> **Last Updated:** 2026-02-07
> **Version:** 1.0

---

## Table of Contents

1. [System Overview](#system-overview)
2. [User Journey Flow](#user-journey-flow)
3. [Monetization System](#monetization-system)
4. [Credit Tracking & Transactions](#credit-tracking--transactions)
5. [Data Pipeline](#data-pipeline)
6. [API Endpoints Reference](#api-endpoints-reference)
7. [Database Schema](#database-schema)
8. [Frontend Architecture](#frontend-architecture)
9. [Midterm Generation System](#midterm-generation-system)
10. [Analytics & Monitoring](#analytics--monitoring)

---

## System Overview

Testament is a Calculus 2 exam preparation platform that provides students with real past exam questions from universities. The system uses a credit-based monetization model with a hybrid approach: free monthly credits + unlimited paid access.

### Core Components

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React SPA     │────▶│  Cloudflare      │────▶│   Cloudflare    │
│   (Frontend)    │◀────│  Worker (API)    │◀────│   D1 (SQLite)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│  SessionStorage │     │  Credit System   │
│  (Guest State)  │     │  + Transactions  │
└─────────────────┘     └──────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| Backend | Cloudflare Workers (Hono framework) |
| Database | Cloudflare D1 (SQLite) |
| Auth | JWT tokens (stored in localStorage) |
| Styling | Custom design system (blueprint theme) |

---

## User Journey Flow

### 1. Landing Page → Sign Up

```
Landing Page
    │
    ├──► Hero: "Stop Guessing What's On The Exam"
    │    └── Value prop: Real exam questions from real universities
    │
    ├──► Stats: 340+ problems, 6 years of exams
    │
    ├──► Preview: Featured question showcase
    │
    └──► CTA: "Get Started" → Sign Up
```

**Key Actions:**
- Anonymous user sees featured question
- No credits required to view landing page
- Sign up creates account with 5 free monthly credits

### 2. Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sign Up   │────▶│  Verify     │────▶│  Dashboard  │
│   (email)   │     │  Email      │     │  (5 credits)│
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
┌─────────────┐     ┌─────────────┐          │
│   Dashboard │◀────│   Login     │◀─────────┘
│   (resume)  │     │   (JWT)     │
└─────────────┘     └─────────────┘
```

**Technical Details:**
- JWT token stored in localStorage (`auth_token`)
- Token includes: userId, email, plan type
- Monthly credits reset on 1st of each month

### 3. Dashboard → Course Selection

```
Dashboard (/dashboard)
    │
    ├──► User Stats Card
    │    ├── Credits remaining (X/5)
    │    ├── Unlimited plan status
    │    └── Recent activity
    │
    ├──► Course Cards
    │    └── Calculus II (sole course currently)
    │        ├── Preview image
    │        ├── Topic count (7 sections)
    │        └── Question count (33 currently)
    │
    └──► Upgrade Prompt (if free plan)
         └── "$12 Unlimited" CTA
```

### 4. Course Archive Page (Main Feature)

```
Course Archive (/course/{slug}/archive)
    │
    ├──► Header: "Exam Archive"
    │
    ├──► Midterms / Finals Tabs
    │    ├── [Midterms] (active implementation)
    │    │    ├── Preset Cards (6 presets)
    │    │    │   ├── Balanced Practice (3 credits)
    │    │    │   ├── Cram Mode (2 credits)
    │    │    │   ├── Weakness Drill (3 credits)
    │    │    │   ├── Technique Mastery (3 credits)
    │    │    │   ├── Exam Simulation (3 credits)
    │    │    │   └── Comprehensive Review (4 credits)
    │    │    │
    │    │    ├── Load Saved Configs (dropdown)
    │    │    │
    │    │    └── Browse/Topic/Midterm Modes
    │    │         ├── Browse: Search/filter questions
    │    │         ├── Topic Bundle: 3 questions, 1 credit
    │    │         └── Midterm: (replaced by presets)
    │    │
    │    └── [Finals] (placeholder - coming soon)
    │
    └──► Question List (Browse mode)
         ├── Index card UI
         ├── Topic tag
         ├── Difficulty badge
         └── Source attribution
```

### 5. Midterm Generation Flow

```
User Selects Preset
        │
        ▼
┌─────────────────┐
│  Preset Card    │
│  Click "Start"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  API: POST      │────▶│  Credit Check   │
│  /midterm/gen   │     │  (sufficient?)  │
└────────┬────────┘     └────────┬────────┘
         │                        │
         │ No                     │ Yes
         ▼                        ▼
┌─────────────────┐     ┌─────────────────┐
│  402 Response   │     │  Deduct Credits │
│  → /upgrade     │     │  + Log Txn      │
└─────────────────┘     └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Weighted Q     │
                         │  Selection      │
                         │  (algorithm)    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Save to        │
                         │  sessionStorage │
                         │  + user_midterms│
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │  Navigate to    │
                         │  Midterm Session│
                         └─────────────────┘
```

### 6. Midterm Session Flow

```
Midterm Session (/course/{slug}/archive/midterm/{id})
    │
    ├──► Header
    │    ├── Progress (Q1 of 7)
    │    ├── Timer (if enabled)
    │    └── Exit button
    │
    ├──► Question Display
    │    ├── Problem text
    │    ├── Multiple choice (if applicable)
    │    └── Work space
    │
    ├──► Navigation
    │    ├── Previous/Next
    │    ├── Flag for review
    │    └── Submit
    │
    └──► Results (on completion)
         ├── Score
         ├── Per-question breakdown
         └── Links to solutions
```

---

## Monetization System

### Credit Cost Structure

| Action | Credits | USD Equivalent* |
|--------|---------|-----------------|
| View single question | 1 | ~$0.33 |
| Topic bundle (3 questions) | 1 | ~$0.33 |
| Easy midterm (5-6 Q) | 2 | ~$0.66 |
| Standard midterm (7-8 Q) | 3 | ~$1.00 |
| Comprehensive (10 Q) | 4 | ~$1.33 |

*Based on $12 unlimited plan being equivalent to ~36 credits

### Preset Pricing

```typescript
const PRESET_CREDIT_COSTS = {
  cram: 2,           // 5 questions, 45 min
  balanced: 3,       // 7 questions, 75 min
  weakness: 3,       // 10 questions, 90 min
  technique: 3,      // 8 questions, 60 min
  exam: 3,           // 7 questions, 90 min
  comprehensive: 4,  // 10 questions, 120 min
};
```

### Plan Types

| Feature | Free | Unlimited |
|---------|------|-----------|
| Monthly Credits | 5 | Unlimited |
| Price | $0 | $12 one-time |
| Credit Rollover | No | N/A |
| All Questions | Yes | Yes |
| Midterm Generator | Yes | Yes |
| Solution Access | Yes | Yes |
| Progress Tracking | Yes | Yes |

### Revenue Model Math

**Per-User Economics:**
- Customer Acquisition: $12
- If user consumes 36 credits before stopping: $0.33/credit
- If user consumes 100 credits: $0.12/credit
- Break-even vs pay-per-credit: ~36 credits

**Projected Scenarios:**
| Users | Avg Credits Used | Revenue | ARPU |
|-------|------------------|---------|------|
| 100 | 25 | $1,200 | $12.00 |
| 100 | 50 | $1,200 | $12.00 |
| 1,000 | 40 | $12,000 | $12.00 |

---

## Credit Tracking & Transactions

### Database Schema

```sql
-- Users table with credit tracking
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  plan TEXT DEFAULT 'free',  -- 'free' or 'unlimited'
  credits INTEGER DEFAULT 5,
  monthly_credits_used INTEGER DEFAULT 0,
  credits_reset_at DATETIME,
  purchased_at DATETIME,
  created_at DATETIME
);

-- Credit transactions for audit trail
CREATE TABLE credit_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  amount INTEGER,          -- Negative for usage, positive for refill
  type TEXT,               -- 'question_view', 'midterm', 'monthly_reset', 'purchase'
  description TEXT,
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Credit Deduction Flow

```
User Action
    │
    ▼
┌─────────────────┐
│ Check Auth      │
│ (requireAuth)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Get User +      │
│ Ensure Credits  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Plan =          │
│ Unlimited?      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼ Yes     ▼ No
┌────────┐  ┌─────────────────┐
│ Skip   │  │ Credits >=      │
│ Deduction  │  Cost?           │
└────────┘  └────────┬────────┘
                     │
                ┌────┴────┐
                │         │
                ▼ Yes     ▼ No
           ┌────────┐  ┌─────────────┐
           │ Deduct │  │ 402 Error   │
           │ Credits   │  Insufficient │
           │ + Log     │  Credits      │
           └────────┘  └─────────────┘
```

### Monthly Credit Reset Logic

```typescript
async function ensureMonthlyCredits(db: D1Database, userId: string) {
  const user = await getUser(db, userId);

  // Check if it's a new month since last reset
  const now = new Date();
  const lastReset = user.credits_reset_at ? new Date(user.credits_reset_at) : null;

  if (!lastReset || now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    // Reset to 5 free credits
    await db.prepare('UPDATE users SET credits = 5, monthly_credits_used = 0, credits_reset_at = ? WHERE id = ?')
      .bind(now.toISOString(), userId)
      .run();
  }

  return getUser(db, userId);
}
```

### Transaction Logging

Every credit change is logged:

```typescript
// Example transaction records
{
  id: "txn_abc123",
  user_id: "user_xyz",
  amount: -3,                    // Negative = deduction
  type: "midterm",               // Category
  description: "Balanced Practice", // Which preset
  created_at: "2026-02-07T10:30:00Z"
}

{
  id: "txn_def456",
  user_id: "user_xyz",
  amount: 5,                     // Positive = refill
  type: "monthly_reset",
  description: "Monthly free credits",
  created_at: "2026-02-01T00:00:01Z"
}
```

---

## Data Pipeline

### Question Ingestion Flow

```
┌─────────────────┐
│  Source: PDF    │
│  (Exam scans)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Manual Extract │  ◄── CURRENT PROCESS
│  (Copy question │      (5 exams done)
│   text into DB) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  D1 Database    │
│  questions table│
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐  ┌─────────────┐
│Topics  │  │ Techniques  │
│Table   │  │ (JSON col)  │
└────────┘  └─────────────┘
```

### Database Schema - Questions

```sql
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  topic_id TEXT,
  exam_id TEXT,

  -- Content
  question_text TEXT,
  solution_text TEXT,
  solution_video_url TEXT,

  -- Metadata
  difficulty INTEGER,  -- 1-5 scale
  estimated_time INTEGER,  -- minutes
  techniques TEXT,  -- JSON array: ["integration_by_parts", "substitution"]
  canonical_form TEXT,  -- Normalized for deduplication

  -- Source attribution
  source_exam_type TEXT,  -- "Midterm", "Final"
  source_exam_year INTEGER,
  source_university TEXT,

  -- Tracking
  appears_in_exams TEXT,  -- JSON array of exam IDs
  frequency_score REAL,  -- 0-1, how often this pattern appears

  created_at DATETIME,
  updated_at DATETIME
);
```

### API Data Flow

```
Frontend Request
      │
      ▼
┌─────────────────┐
│ Cloudflare      │
│ Worker (Hono)   │
│ Router          │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐  ┌────────┐
│ Auth   │  │ Public │
│ Middleware   │  │ Routes │
└───┬────┘  └───┬────┘
    │           │
    ▼           ▼
┌─────────────────┐
│ D1 Database     │
│ Queries         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ JSON Response   │
└─────────────────┘
```

### Cache Strategy

Currently **no caching** - direct DB queries on each request. Suitable for low traffic.

Future optimization:
- Cache question lists in Workers KV
- Cache user sessions
- Cache featured question (daily)

---

## API Endpoints Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Get JWT token |
| POST | `/api/auth/logout` | Yes | Invalidate token |
| GET | `/api/auth/me` | Yes | Get current user |

### User & Credits

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user` | Yes | Get profile + credits |
| POST | `/api/user/purchase` | Yes | Upgrade to unlimited |
| GET | `/api/user/transactions` | Yes | Credit history |

### Questions

| Method | Endpoint | Auth | Credits | Description |
|--------|----------|------|---------|-------------|
| GET | `/api/questions` | Yes | - | List questions (browse) |
| GET | `/api/questions/:id` | Yes | 1 | View single question |
| POST | `/api/questions/bundle` | Yes | 1 | Get 3 topic questions |
| POST | `/api/questions/practice` | Yes | per Q | Practice with filters |
| GET | `/api/featured-question` | No | - | Public preview |

### Midterms

| Method | Endpoint | Auth | Credits | Description |
|--------|----------|------|---------|-------------|
| POST | `/api/midterm/generate` | Yes | 2-4 | Generate practice midterm |
| GET | `/api/midterm/:id` | Yes | - | Get midterm by ID |
| POST | `/api/midterm/:id/submit` | Yes | - | Submit answers |

### Courses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/courses` | Yes | List courses |
| GET | `/api/courses/:id` | Yes | Course details |
| GET | `/api/courses/:id/topics` | Yes | Course sections |
| GET | `/api/courses/:id/exams` | Yes | Past exams |
| GET | `/api/courses/:id/analysis` | Yes | Technique analysis |

---

## Database Schema

### Complete Entity Relationship

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    users     │────▶│credit_transactions│  │  courses     │
│  (accounts)  │     │  (audit log) │     │  (offerings) │
└──────┬───────┘     └──────────────┘     └──────┬───────┘
       │                                          │
       │         ┌──────────────┐                │
       └────────▶│user_midterms │◀───────────────┘
                 │  (sessions)  │
                 └──────┬───────┘
                        │
       ┌──────────────┐ │ ┌──────────────┐
       │   questions  │◀┘ │    exams     │
       │  (content)   │──▶│  (sources)   │
       └──────┬───────┘   └──────────────┘
              │
       ┌──────┴───────┐
       │    topics    │
       │  (sections)  │
       └──────────────┘
```

### Schema Definitions

```sql
-- Users: Accounts and credit tracking
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 5,
  monthly_credits_used INTEGER DEFAULT 0,
  credits_reset_at DATETIME,
  purchased_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Courses: Course offerings
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  university TEXT,
  semester TEXT,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Topics: Course sections/chapters
CREATE TABLE topics (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Exams: Source exams
CREATE TABLE exams (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  exam_type TEXT,  -- 'Midterm', 'Final', 'Quiz'
  year INTEGER,
  semester TEXT,
  university TEXT,
  total_questions INTEGER,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Questions: Core content
CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  topic_id TEXT,
  exam_id TEXT,
  question_text TEXT,
  solution_text TEXT,
  solution_video_url TEXT,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
  estimated_time INTEGER,
  techniques TEXT,  -- JSON array
  canonical_form TEXT,
  source_exam_type TEXT,
  source_exam_year INTEGER,
  source_university TEXT,
  appears_in_exams TEXT,  -- JSON array
  frequency_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (topic_id) REFERENCES topics(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- User midterms: Generated practice sessions
CREATE TABLE user_midterms (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  course_id TEXT,
  template_type TEXT,  -- preset ID or 'custom'
  question_ids TEXT,  -- JSON array
  status TEXT,  -- 'in_progress', 'completed', 'abandoned'
  score INTEGER,
  max_score INTEGER,
  answers TEXT,  -- JSON object
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Credit transactions: Audit trail
CREATE TABLE credit_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  amount INTEGER,
  type TEXT,
  description TEXT,
  midterm_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## Frontend Architecture

### Component Hierarchy

```
App
├── AuthProvider (context)
├── Router
│   ├── LandingPage (public)
│   ├── LoginPage
│   ├── SignupPage
│   ├── Dashboard (protected)
│   │   └── CourseGrid
│   ├── CourseArchive (protected)
│   │   ├── MidtermSelector
│   │   │   ├── PresetCard (×6)
│   │   │   └── SavedConfigsDropdown
│   │   ├── MidtermCustomizer (modal)
│   │   │   ├── WeightSliders
│   │   │   ├── DifficultyDistribution
│   │   │   └── QuestionCountSelector
│   │   └── ModeTabs (Browse/Topic/Midterm)
│   └── MidtermSession (protected)
│       ├── QuestionDisplay
│       ├── AnswerInput
│       └── Navigation
```

### State Management

| State | Location | Persistence |
|-------|----------|-------------|
| Auth token | localStorage | Permanent |
| User profile | AuthContext | Session |
| Credits | API + local cache | Sync on load |
| Current midterm | sessionStorage | Tab only |
| Custom configs | localStorage | Permanent |
| UI preferences | localStorage | Permanent |

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/api.ts` | API client with auth headers |
| `src/lib/midtermStorage.ts` | localStorage for custom configs |
| `src/types/midterm.ts` | TypeScript interfaces |
| `src/data/midtermPresets.ts` | 6 preset configurations |
| `src/components/MidtermSelector.tsx` | Preset selection UI |
| `src/components/MidtermCustomizer.tsx` | Customization modal |

---

## Midterm Generation System

### Weighted Scoring Algorithm

```typescript
// Score calculation for each question
function calculateScore(question, config) {
  let score = 0;
  const year = question.source_exam_year || 2015;

  // Recency weight (0-100 based on year)
  if (year >= 2024) score += config.weights.recency * 1.0;
  else if (year >= 2020) score += config.weights.recency * 0.5;
  else score += config.weights.recency * 0.25;

  // Repetition weight (canonical form = cross-year pattern)
  if (question.canonical_form?.length > 10) {
    score += config.weights.repetition * 0.7;
  }

  // Coverage weight (will be handled by section guarantee)
  score += config.weights.coverage * 0.5;

  // Difficulty weight (closeness to target)
  const targetDiff = (minDiff + maxDiff) / 2;
  const diffDiff = Math.abs(question.difficulty - targetDiff);
  score += config.weights.difficulty * (1 - diffDiff / 5);

  return score;
}
```

### Selection Process

```
Fetch Questions (by difficulty range)
      │
      ▼
Score Each Question (4 weights)
      │
      ▼
Sort by Score (descending)
      │
      ▼
Section Guarantee (1 per section)
      │
      ▼
Fill Remaining Slots (by score)
      │
      ▼
Return Question Set
```

### Preset Configurations

| Preset | Q Count | Duration | Credits | Weight Focus |
|--------|---------|----------|---------|--------------|
| Cram | 5 | 45 min | 2 | Recency (60%) |
| Balanced | 7 | 75 min | 3 | Balanced |
| Weakness | 10 | 90 min | 3 | User selects |
| Technique | 8 | 60 min | 3 | Technique focus |
| Exam | 7 | 90 min | 3 | Coverage (40%) |
| Comprehensive | 10 | 120 min | 4 | Coverage (50%) |

---

## Analytics & Monitoring

### Currently Tracked

- Credit transactions (full audit trail)
- User midterm generations
- Question views

### Not Yet Implemented

- Time spent per question
- Answer accuracy rates
- Drop-off points in funnel
- Popular presets used
- Credit usage patterns

### Recommended Metrics Dashboard

| Metric | Source | Value |
|--------|--------|-------|
| DAU/MAU | Login timestamps | Track engagement |
| Avg credits used/user | transactions | Optimize pricing |
| Conversion free→paid | users table | Funnel optimization |
| Popular presets | user_midterms | Feature focus |
| Completion rates | user_midterms | UX improvements |

---

## Security Considerations

1. **Authentication**: JWT tokens expire after 7 days
2. **Credit Security**: All credit checks server-side
3. **SQL Injection**: Parameterized queries throughout
4. **XSS**: React handles escaping; no raw HTML insertion
5. **CSRF**: Not applicable (JWT in header, not cookies)

---

## Future Enhancements

### Phase 1 (Immediate)
- [ ] Add 4.3 Separable Equations (80% exam frequency)
- [ ] Add more exam PDFs to database
- [ ] Finals tab implementation

### Phase 2 (Medium-term)
- [ ] User analytics dashboard
- [ ] Progress tracking over time
- [ ] Spaced repetition for weak areas

### Phase 3 (Long-term)
- [ ] AI solution generation
- [ ] Peer comparison
- [ ] Study group features

---

**End of Documentation**
