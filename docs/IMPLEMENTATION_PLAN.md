# Implementation Plan

> **Last Updated:** 2026-02-06
> **Timeline:** 14 days to MVP
> **Status:** Landing built + backend skeleton in place

---

## Day 1-2: Foundation & Planning

### Step 1.1: Finalize Documentation
- **Files:** PRD.md, APP_FLOW.md, TECH_STACK.md, FRONTEND_GUIDELINES.md, BACKEND_STRUCTURE.md
- **Validation:** All docs reviewed and consistent
- **Command:** None (documentation)

### Step 1.2: Process Exam PDFs
**Files:**
- Extract from: `exams/midterm-2022.pdf`, `exams/midterm-2023.pdf`, `exams/final-2023.pdf`, `exams/midterm-2024.pdf`
- Create: `data/extracted-questions.json`

**Reference:** `docs/DATA_INGESTION_PLAN.md`

**Process for each exam:**
1. Extract text from PDF (use pdf-parse or manual if needed)
2. Identify each question: topic, difficulty, points
3. Note question format and common patterns
4. Save structured data

**Validation:**
```bash
# Check we have data for all 4 exams
node -e "const data = require('./data/extracted-questions.json'); console.log('Exams:', data.length); console.log('Total questions:', data.reduce((a,b) => a + b.questions.length, 0));"
# Expected: Exams: 4, Total questions: 30+
```

### Step 1.3: AI Question Generation Setup
**Files:**
- Create: `scripts/generate-questions.ts`

**Process:**
1. Set up OpenAI API key
2. Create prompt template for question generation
3. Generate 50+ practice questions from patterns
4. Review for accuracy (manual check)

**Validation:**
```bash
# Run generation script
npx tsx scripts/generate-questions.ts
# Check output
ls data/generated-questions.json
# Expected: 50+ questions
```

---

## Day 3-4: Backend API

### Step 2.1: Database Setup
**Files:**
- Create: `database/schema.sql`
- Create: `database/seed.sql`

**Commands:**
```bash
# D1 is managed via Wrangler CLI (already installed)

# Create database
wrangler d1 create exam-prep-db

# Get database ID from output, add to wrangler.toml

# Push schema
wrangler d1 execute exam-prep-db --file=database/schema.sql

# Seed data
wrangler d1 execute exam-prep-db --file=database/seed.sql
```

**Validation:**
```bash
# Verify tables exist
wrangler d1 execute exam-prep-db --command="SELECT name FROM sqlite_master WHERE type='table';"
# Expected: users, sessions, courses, topics, questions, user_progress, credit_transactions
```

### Step 2.2: Cloudflare Worker Setup
**Files:**
- Create: `wrangler.toml`
- Create: `src/index.ts`

**Commands:**
```bash
# Create worker project
npm create cloudflare@latest worker -- --template hello-world

# Install dependencies
cd worker
npm install stripe jose bcryptjs
npm install -D @cloudflare/workers-types
```

**Validation:**
```bash
# Local dev
npm run dev
# Test: curl http://localhost:8787/health
# Expected: {"status": "ok"}
```

### Step 2.3: Auth Endpoints
**Files:**
- Create: `src/routes/auth.ts`
- Create: `src/utils/jwt.ts`
- Create: `src/utils/password.ts`

**Endpoints to implement:**
1. POST `/api/auth/register`
2. POST `/api/auth/login`
3. POST `/api/auth/logout`

**Validation:**
```bash
# Test register
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
# Expected: {"success": true, "token": "...", "user": {...}}

# Test login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
# Expected: {"success": true, "token": "...", "user": {...}}
```

### Step 2.4: Course & Topic Endpoints
**Files:**
- Create: `src/routes/courses.ts`
- Create: `src/routes/topics.ts`

**Endpoints:**
1. GET `/api/courses`
2. GET `/api/courses/:id`
3. GET `/api/courses/:id/topics`

**Validation:**
```bash
curl http://localhost:8787/api/courses
# Expected: {"courses": [{"id": "calc2", "name": "Calculus 2", ...}]}
```

### Step 2.5: Analysis Endpoint
**Files:**
- Create: `src/routes/analysis.ts`
- Create: `src/utils/credits.ts`

**Endpoint:** GET `/api/courses/:id/analysis`

**Logic:**
- Check user has 2+ credits
- Deduct 2 credits
- Return pre-computed analysis

**Validation:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8787/api/courses/calc2/analysis
# Expected: {"credits_deducted": 2, "analysis": {...}}
```

### Step 2.6: Questions Endpoints
**Files:**
- Create: `src/routes/questions.ts`

**Endpoints:**
1. GET `/api/questions` (list)
2. POST `/api/questions/:id/start` (deduct credit, return full question)
3. POST `/api/questions/:id/solution`

**Validation:**
```bash
# List questions
curl -H "Authorization: Bearer <token>" \
  http://localhost:8787/api/questions?course_id=calc2

# Start question (costs 1 credit)
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:8787/api/questions/<id>/start

# Get solution
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:8787/api/questions/<id>/solution
```

### Step 2.7: Credits & Payments
**Files:**
- Create: `src/routes/credits.ts`
- Create: `src/routes/webhooks.ts`

**Endpoints:**
1. GET `/api/credits/balance`
2. POST `/api/credits/purchase`
3. POST `/api/webhooks/stripe`

**Validation:**
```bash
# Get balance
curl -H "Authorization: Bearer <token>" \
  http://localhost:8787/api/credits/balance

# Create checkout session
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"product": "credits_10"}' \
  http://localhost:8787/api/credits/purchase
# Expected: {"checkout_url": "https://checkout.stripe.com/..."}
```

---

## Day 5-7: Frontend Foundation

### Step 3.1: Svelte Project Setup
**Commands:**
```bash
# Create SvelteKit project
npm create svelte@latest frontend
cd frontend
# Select: Skeleton project, Yes to TypeScript, Yes to ESLint/Prettier

# Install dependencies
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn-svelte
npx shadcn-svelte@latest init

# Add components
npx shadcn-svelte@latest add button card input label checkbox
```

**Files:**
- Update: `tailwind.config.js`
- Update: `src/app.css`
- Create: `src/lib/utils.ts`

**Validation:**
```bash
npm run dev
# Open http://localhost:5173
# Expected: Default SvelteKit page loads
```

### Step 3.2: Design System Implementation
**Files:**
- Create: `src/lib/components/CreditBadge.svelte`
- Create: `src/lib/components/Header.svelte`
- Create: `src/lib/components/Footer.svelte`
- Create: `src/lib/styles/variables.css`

**Validation:**
- Visual check: Components render correctly
- Credit badge shows "10" with proper styling
- Header has navigation, logo, credit display

### Step 3.3: Auth Pages
**Files:**
- Create: `src/routes/login/+page.svelte`
- Create: `src/routes/signup/+page.svelte`
- Create: `src/lib/stores/auth.ts`

**Features:**
- Login form with email/password
- Signup form with validation
- JWT storage in localStorage
- Redirect to dashboard on success

**Validation:**
```bash
# Test signup flow
# 1. Visit /signup
# 2. Enter email, password
# 3. Submit
# 4. Should redirect to /dashboard
# 5. localStorage should have token
```

### Step 3.4: Dashboard Page
**Files:**
- Create: `src/routes/dashboard/+page.svelte`
- Create: `src/lib/components/CourseCard.svelte`

**Features:**
- Welcome message with user's email
- Credit balance display
- Course selection (Calc 2 card)
- "Start Studying" CTA

**Validation:**
- Dashboard loads with user data
- Shows "10 credits"
- Clicking course navigates to course page

### Step 3.5: Course Home Page
**Files:**
- Create: `src/routes/course/[id]/+page.svelte`
- Create: `src/lib/components/TopicList.svelte`

**Features:**
- Course header with stats
- Two CTAs: "View Exam Analysis" and "Practice Questions"
- Topic list with checkboxes

**Validation:**
- Shows "4 past exams analyzed"
- Analysis button checks credit balance
- Practice button leads to topic selection

---

## Day 8-10: Core Features

### Step 4.1: Analysis Page
**Files:**
- Create: `src/routes/analysis/+page.svelte`
- Create: `src/lib/components/TopicFrequencyChart.svelte`
- Create: `src/lib/components/DifficultyChart.svelte`

**Features:**
- Topic frequency bar chart
- Difficulty distribution pie chart
- High-value topics table
- Study strategy text
- Credit deduction confirmation

**Validation:**
- Deducts 2 credits on load
- Shows visualizations
- "Practice These Topics" button works

### Step 4.2: Practice Page
**Files:**
- Create: `src/routes/practice/+page.svelte`
- Create: `src/lib/components/QuestionCard.svelte`
- Create: `src/lib/components/SolutionReveal.svelte`

**Features:**
- Topic selection checkboxes
- Question display
- "Show Solution" button
- Navigation between questions
- Credit deduction on question load

**Validation:**
- Select topics → generate questions
- Each question costs 1 credit
- Solution reveals step-by-step
- Shows source exam attribution

### Step 4.3: Paywall Page
**Files:**
- Create: `src/routes/upgrade/+page.svelte`
- Create: `src/lib/components/PricingCard.svelte`

**Features:**
- Three pricing tiers (Credits, Week, Semester)
- "Popular" badge on middle tier
- Stripe Checkout integration
- Test mode indicator

**Validation:**
- Click pricing → redirects to Stripe
- After payment → redirects to /success
- Credits added immediately

### Step 4.4: Payment Success Page
**Files:**
- Create: `src/routes/success/+page.svelte`

**Features:**
- Success message
- Updated credit balance
- "Continue Studying" CTA

**Validation:**
- Shows correct new credit balance
- Button navigates to dashboard

---

## Day 11-12: Integration & Polish

### Step 5.1: Credit System Polish
**Files:**
- Update: All pages with credit checks

**Features:**
- Low credit warning banner (< 3 credits)
- Zero credit redirect to upgrade
- Credit animation on deduction
- Daily login bonus (1 credit)

**Validation:**
- Banner appears at 2 credits
- Cannot use features at 0 credits
- Animation plays on deduction

### Step 5.2: Mobile Responsive
**Files:**
- Update: All page layouts

**Features:**
- Mobile hamburger menu
- Responsive charts
- Touch-friendly buttons
- Optimized question view

**Validation:**
- Test on mobile device or emulator
- All features accessible
- Readable text sizes

### Step 5.3: Error Handling
**Files:**
- Create: `src/lib/components/ErrorToast.svelte`
- Create: `src/lib/utils/error-handler.ts`

**Features:**
- Toast notifications for errors
- Friendly error messages
- Retry buttons where applicable
- 404 page

**Validation:**
- Trigger various errors
- Toast appears with message
- Can dismiss toast

---

## Day 13-14: Testing & Launch

### Step 6.1: End-to-End Testing
**Test Scenarios:**

1. **New User Flow**
   - Sign up → get 10 credits → view analysis (8 left) → practice 3 questions (5 left)

2. **Purchase Flow**
   - Run out of credits → click upgrade → Stripe checkout → payment → credits added

3. **Question Flow**
   - Select topic → load question → view solution → next question → credit deducted each time

4. **Edge Cases**
   - Try to view analysis with 1 credit (should redirect to upgrade)
   - Refresh during question (should preserve state)
   - Expired JWT (should redirect to login)

**Validation:**
- All flows complete successfully
- Credit math is correct
- No console errors

### Step 6.2: Performance Optimization
**Tasks:**
- Lazy load components
- Optimize images
- Add loading states
- Cache API responses

**Validation:**
- Lighthouse score > 80
- First paint < 2 seconds
- Interactive < 3.5 seconds

### Step 6.3: Deploy
**Commands:**
```bash
# Deploy backend
cd worker
npm run deploy

# Deploy frontend
cd ../frontend
npm run build
npm run deploy  # or upload to Cloudflare Pages

# Set environment variables in Cloudflare dashboard
```

**Validation:**
- https://exam-prep.yourdomain.com loads
- API endpoints respond
- Payments work in live mode

### Step 6.4: Launch Checklist
- [ ] SSL certificate active
- [ ] Stripe webhooks configured
- [ ] Environment variables set
- [ ] Database migrated and seeded
- [ ] 50+ questions generated and reviewed
- [ ] Test user created
- [ ] Analytics tracking installed
- [ ] Error monitoring (Sentry) active

---

## Post-Launch (Week 2+)

### Immediate (Day 1-3)
- Monitor error logs
- Fix critical bugs
- Gather user feedback

### Week 2
- Add referral system
- A/B test pricing
- Add more questions

### Month 1
- Expand to Calc 1 and Calc 3
- Add study groups feature
- Mobile app consideration

---

## File Structure Target

```
exam-prep-platform/
├── worker/                    # Cloudflare Worker backend
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── courses.ts
│   │   │   ├── questions.ts
│   │   │   ├── analysis.ts
│   │   │   ├── credits.ts
│   │   │   └── webhooks.ts
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── password.ts
│   │   │   ├── credits.ts
│   │   │   └── openai.ts
│   │   └── types.ts
│   ├── wrangler.toml
│   └── package.json
│
├── frontend/                  # SvelteKit frontend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── +page.svelte           # Landing
│   │   │   ├── login/+page.svelte
│   │   │   ├── signup/+page.svelte
│   │   │   ├── dashboard/+page.svelte
│   │   │   ├── course/[id]/+page.svelte
│   │   │   ├── analysis/+page.svelte
│   │   │   ├── practice/+page.svelte
│   │   │   ├── upgrade/+page.svelte
│   │   │   └── success/+page.svelte
│   │   ├── lib/
│   │   │   ├── components/
│   │   │   ├── stores/
│   │   │   └── utils/
│   │   └── app.html
│   ├── static/
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── scripts/
│   ├── generate-questions.ts
│   └── process-pdfs.ts
│
├── data/
│   ├── extracted-questions.json
│   └── generated-questions.json
│
└── docs/
    ├── PRD.md
    ├── APP_FLOW.md
    ├── TECH_STACK.md
    ├── FRONTEND_GUIDELINES.md
    └── BACKEND_STRUCTURE.md
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| OpenAI costs too high | Cache questions, limit generations |
| Low conversion | A/B test pricing, add more free value |
| Question quality poor | Manual review before deployment |
| Stripe issues | Test mode thoroughly before live |
| Database limits | D1 free tier is generous, upgrade if needed |

---

## Success Metrics

- Day 1: Backend API working locally
- Day 3: Auth + database complete
- Day 7: Frontend scaffolded, auth working
- Day 10: Core features functional
- Day 14: Deployed and live

**Launch Goal:** 50 signups in first week, 10 paid conversions.
