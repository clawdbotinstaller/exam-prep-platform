# Testament - Claude Context

## Project Summary
**Testament** (formerly Calc2Archive) - Real exam questions from real university exams.

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
```

## Tech Stack
- **Frontend:** React 19 + Vite 7 + TypeScript + Tailwind CSS 4 + GSAP ScrollTrigger
- **Backend:** Cloudflare Workers + Hono + D1 Database
- **Payments:** Stripe
- **Design:** "Engineering Library" aesthetic (cream paper, navy accents, graph paper grid)

## Key Design Decisions

### Kimi Base + Stitch Elements
- **Keep:** GSAP scroll animations, horizontal navigation, pinned sections
- **Add:** Red "Actual Exam" stamp, library checkout pricing card, technical footer
- **Avoid:** Sideways text, bright yellow (use 40% opacity instead)

### Credit System
- Free trial: 5 credits
- Unlimited: $12 one-time purchase
- Value prop: Cheaper than 2 hours of tutoring

## Architecture

### Database Tables
- `users` - accounts with credits/unlimited status
- `sessions` - session token management
- `courses` - calc2, calc3, etc.
- `topics` - integration, series, etc. with frequency scores
- `questions` - exam questions with solutions and source attribution
- `credit_transactions` - payment history

### Repository Structure
```
exam-prep-platform/
├── frontend/          # Kimi React app
├── worker/            # Cloudflare Worker with Hono
├── docs/              # PRD, Tech Stack, App Flow, Design System
├── research/          # Competitor analysis, curriculum
└── .github/workflows/ # CI/CD for auto-deployment
```

## CI/CD
- Worker deploys on pushes to `worker/**`
- Frontend deploys on pushes to `frontend/**`
- Requires: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

## Next Steps (When Resuming)
1. **Frontend:** Add Stitch elements (exam stamp, checkout card style)
2. **Backend:** Add auth endpoints, question endpoints, Stripe webhooks
3. **Deploy:** Set up D1 database, configure secrets, deploy to production

## Files Modified in This Session
- Repository organized (removed clutter, added README)
- Worker initialized with full database schema
- GitHub Actions workflows added
- Project renamed to Testament

## Semantic Memory
Full export saved to: `SEMANTIC_MEMORY_EXPORT.json`
