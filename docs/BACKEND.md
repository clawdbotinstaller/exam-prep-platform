# Backend (Implemented vs Planned)

> **Last Updated:** 2026-02-06
> **Runtime:** Cloudflare Workers (Hono)
> **Database:** Cloudflare D1 (SQLite)

This document merges the prior backend docs into a single source with a clear split between **Implemented** and **Planned**. The implemented section reflects the current worker code in `worker/src/index.ts`.

---

## Implemented

### Database Schema (D1)

**Table: `users`**
```sql
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,   -- PBKDF2 (salt:hash)
  credits INTEGER DEFAULT 5,
  plan TEXT DEFAULT 'free',      -- 'free' | 'starter' | 'unlimited'
  monthly_credits INTEGER DEFAULT 5,
  credits_reset_at INTEGER,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Table: `sessions`**
```sql
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,           -- session token
  user_id TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Table: `courses`**
```sql
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,           -- 'calc2', 'calc3', etc.
  name TEXT NOT NULL,
  description TEXT,
  exam_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Table: `exams`**
```sql
CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  semester TEXT,
  exam_type TEXT NOT NULL,
  total_points INTEGER,
  exam_date INTEGER,
  upload_date INTEGER,
  processed BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
```

**Table: `topics`**
```sql
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  frequency_score DECIMAL(3,2),
  avg_points DECIMAL(4,1),
  total_appearances INTEGER DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);
```

**Table: `questions`**
```sql
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  exam_id TEXT,
  topic_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  pattern_id TEXT,
  techniques TEXT,               -- JSON string
  question_text TEXT NOT NULL,
  solution_steps TEXT NOT NULL,  -- JSON string
  answer TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  difficulty_reason TEXT,
  frequency_score DECIMAL(3,2),
  estimated_time INTEGER,
  source_exam_year INTEGER,
  source_exam_type TEXT,
  source_question_number INTEGER,
  source_points INTEGER,
  is_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE SET NULL
);
```

**Table: `question_patterns`**
```sql
CREATE TABLE IF NOT EXISTS question_patterns (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  name TEXT NOT NULL,
  techniques TEXT,
  canonical_form TEXT,
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

**Table: `credit_transactions`**
```sql
CREATE TABLE IF NOT EXISTS credit_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Indexes (created in init)**
```sql
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_course ON topics(course_id);
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_course ON questions(course_id);
```

### Auth & Sessions
- Password hashing: PBKDF2 via Web Crypto
- Session token stored in `sessions` table
- Auth header: `Authorization: Bearer <session>`

### Implemented API Endpoints

**Auth**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

**Credits**
- `GET /api/credits/balance`
- `POST /api/credits/purchase` (placeholder: returns checkout URL stub)

**Courses**
- `GET /api/courses`

**Topics**
- `GET /api/courses/:id/topics`

**Analysis**
- `GET /api/courses/:id/analysis` (costs 2 credits)

**Questions**
- `GET /api/questions` (browse)
- `GET /api/questions/:id` (single question)
- `POST /api/questions/practice` (cost per question)
- `POST /api/questions/bundle` (3 questions for 1 credit)

**Midterm**
- `POST /api/midterm/generate` (costs 3 credits)

---

## Planned (Not Implemented Yet)

These items came from the original backend design docs and are still planned.

### Additional Tables
- `question_options` (MCQ choices)
- `user_progress`
- `user_courses`
- `exam_analysis` or `analysis_cache`

### Planned/Unimplemented Endpoints
- `GET /api/courses/:id`
- `POST /api/courses/:id/enroll`
- `POST /api/questions/:id/start`
- `POST /api/questions/:id/solution`
- `POST /api/questions/:id/submit`
- `POST /api/assessment/weak-topics`
- `GET /api/credits/transactions`
- `POST /api/webhooks/stripe`

### Additional Backend Architecture (Planned)
- Modular route files (`routes/auth.ts`, `routes/questions.ts`, etc.)
- Service layer (`credit.service.ts`, `analysis.service.ts`, etc.)
- Rate limiting middleware
- Cache strategy for analysis/questions

---

## Notes

- This doc is the new backend single source. The old docs remain for now:
  - `docs/BACKEND_STRUCTURE.md`
  - `docs/BACKEND_DESIGN.md`
- If you want, I can replace the old files with a short pointer to this doc.
