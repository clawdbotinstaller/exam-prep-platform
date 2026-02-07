# Arkived - Claude Context

## Project Summary
**Arkived** (formerly Calc2Archive/Testament) - Real exam questions from real university exams.

**Repository:** `https://github.com/clawdbotinstaller/exam-prep-platform`

## Quick Start

```bash
# Frontend
cd frontend && npm install && npm run dev
# → http://localhost:5173

# Worker
cd worker && npm install && npx wrangler dev
# → http://localhost:8787

# Initialize database
curl -X POST http://localhost:8787/init

# Seed MTH240 exam data
curl -X POST http://localhost:8787/api/admin/seed-mth240
```

## Tech Stack
- **Frontend:** React 19 + Vite 7 + TypeScript + Tailwind CSS 4 + GSAP ScrollTrigger
- **Backend:** Cloudflare Workers + Hono + D1 Database
- **Payments:** Stripe
- **Design:** "Engineering Library" aesthetic (cream paper, navy accents, graph paper grid)

## Key Features

### Unified Topic Analysis Hub
- **Location:** `/course/:slug/analysis`
- **Cost:** 2 credits to unlock
- **Structure:**
  - Chapter 3: Integration (Sections 3.1, 3.2, 3.3, 3.4, 3.7)
  - Chapter 4: Differential Equations (Sections 4.1, 4.2, 4.5)
- **Content:**
  - 25+ techniques with curated metadata
  - Common traps from real MTH240 exams (2015-2025)
  - Study strategies based on actual student performance
  - Sample questions per technique
  - "Practice This Technique" direct links

### Credit System
- Free trial: 5 credits
- Unlimited: $12 one-time purchase
- Value prop: Cheaper than 2 hours of tutoring

### Practice Mode
- Topic-based filtering
- Technique-based filtering (`?technique=` URL param)
- 1 credit per question

## Architecture

### Database Tables
- `users` - accounts with credits/unlimited status
- `sessions` - session token management
- `courses` - calc2, calc3, etc.
- `topics` - integration, series, etc. with frequency scores
- `questions` - exam questions with solutions, techniques JSON, source attribution
- `exams` - exam metadata (year, semester, type)
- `credit_transactions` - payment history

### API Endpoints

#### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

#### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id/stats` - Course stats
- `GET /api/courses/:id/exams` - List exams for course
- `GET /api/courses/:id/topics` - List topics for course
- `GET /api/courses/:id/topics/public` - Public topics list

#### Analysis (Premium)
- `GET /api/courses/:id/analysis` - Basic analysis (2 credits)
- `GET /api/courses/:id/analysis-detailed` - **NEW:** Unified topic analysis hub (2 credits)

#### Questions
- `GET /api/questions` - Browse questions
- `GET /api/questions/:id` - Get single question
- `POST /api/questions/practice` - Get practice questions (1 credit/question)
- `POST /api/questions/bundle` - Get 3 questions (1 credit)
- `POST /api/midterm/generate` - Generate practice midterm (3 credits)

#### Credits
- `GET /api/credits/balance` - Get credit balance
- `POST /api/credits/purchase` - Purchase credits

### Repository Structure
```
exam-prep-platform/
├── frontend/              # React + Vite + TypeScript
│   ├── src/
│   │   ├── pages/         # Route pages
│   │   │   └── course/
│   │   │       ├── CourseAnalysis.tsx      # Unified analysis hub
│   │   │       ├── CoursePractice.tsx      # Practice mode
│   │   │       ├── CourseHome.tsx          # Course landing
│   │   │       ├── CourseArchive.tsx       # Exam archive
│   │   │       └── CourseMidterm.tsx       # Midterm generator
│   │   ├── sections/      # Landing page sections
│   │   ├── components/    # Shared components
│   │   ├── data/          # NEW: Technique metadata
│   │   │   └── techniqueMetadata.ts
│   │   ├── types/         # NEW: TypeScript interfaces
│   │   │   └── analysis.ts
│   │   └── lib/           # Utilities
├── worker/                # Cloudflare Worker
│   └── src/
│       └── index.ts       # API routes + D1 queries
├── docs/                  # Documentation
│   ├── CLAUDE_CONTEXT.md
│   ├── BACKEND.md
│   ├── APP_FLOW.md
│   └── ...
└── .github/workflows/     # CI/CD
```

## Key Design Decisions

### Kimi Base + Stitch Elements
- **Keep:** GSAP scroll animations, horizontal navigation, pinned sections
- **Add:** Red "Actual Exam" stamp, library checkout pricing card, technical footer
- **Avoid:** Sideways text, bright yellow (use 40% opacity instead)

### Technique Metadata System
- 25+ techniques with curated content
- Based on analysis of 33 real MTH240 exam questions
- Each technique includes:
  - Display name and description
  - 3-5 common traps (real student mistakes)
  - 3-5 study strategies (proven approaches)
  - Time estimates and difficulty indicators

### UI Patterns
- `index-card` - Paper-textured content containers
- `date-stamp` - Rotated label badges
- `exam-stamp-red` - Red stamp for authenticity
- `btn-blueprint` - Navy primary buttons
- Font system: Source Serif 4 (headings), Inter (body), JetBrains Mono (data)

## CI/CD
- Worker deploys on pushes to `worker/**`
- Frontend deploys on pushes to `frontend/**`
- Requires: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

## Recent Changes (Unified Topic Analysis)

### New Files
- `frontend/src/types/analysis.ts` - TypeScript interfaces
- `frontend/src/data/techniqueMetadata.ts` - Technique metadata (25+ techniques)

### Modified Files
- `worker/src/index.ts` - Added `/analysis-detailed` endpoint + technique filtering
- `frontend/src/pages/course/CourseAnalysis.tsx` - Complete rewrite with unified hub
- `frontend/src/pages/course/CoursePractice.tsx` - Added technique filtering support

### Data Source
All technique traps and strategies based on analysis of:
- 33 MTH240 exam questions
- 5 exams from 2015-2025
- Real student performance patterns

## Next Steps (When Resuming)
1. **Deploy:** Run GitHub Actions to deploy worker + frontend
2. **Test:** Verify full flow: Analysis → Expand → Practice
3. **Data:** Add more exam questions to increase technique coverage
4. **Analytics:** Track which techniques students struggle with most

## Semantic Memory
Full export saved to: `SEMANTIC_MEMORY_EXPORT.json`
