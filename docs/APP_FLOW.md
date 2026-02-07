# App Flow Document

> **Last Updated:** 2026-02-07
> **Status:** Unified Topic Analysis Hub Implemented

---

## Page Inventory

| Route | Page Name | Purpose | Auth Required |
|-------|-----------|---------|---------------|
| `/` | Landing | Convert visitors to signups | No |
| `/login` | Login | Existing users sign in | No |
| `/signup` | Signup | New user registration | No |
| `/dashboard` | Dashboard | Course selection, credit balance | Yes |
| `/course/calc2` | Course Home | Overview of Calc 2 prep | Yes |
| `/course/:slug/analysis` | Topic Analysis Hub | Chapter → Section → Technique breakdown (2 credits) | Yes |
| `/course/:slug/practice` | Practice Mode | Topic selection + questions | Yes |
| `/course/:slug/archive` | Archive | Browse past exam questions | Yes |
| `/course/:slug/archive/midterm/:difficulty` | Practice Midterm | Easy / sample / hard | Yes |
| `/course/:slug/question/:id` | Question View | Individual question + solution | Yes |
| `/upgrade` | Paywall | Credit purchase options | Yes |
| `/checkout` | Stripe Checkout | Payment processing | Yes |
| `/success` | Payment Success | Credit confirmation | Yes |
| `/profile` | User Profile | History, settings | Yes |

---

## User Flow 1: First-Time Signup

```
LANDING PAGE (/)
├── Value proposition
├── "How it works" section (3 steps)
├── Social proof (fake initially: "Join 100+ students")
└── CTA: "Start Studying Free"
    └── SIGNUP PAGE (/signup)
            ├── Email input
            ├── Password input (8+ chars, 1 number)
            ├── Confirm password
            ├── Submit
            └── On success:
            ├── Create user in D1
            ├── Set 5 credits (monthly free tier)
            ├── Create session token
            └── REDIRECT → DASHBOARD (/dashboard)
```

**Credit Strategy:** 5 credits per month on free tier (refreshes monthly)

---

## User Flow 2: Returning User Login

```
LANDING PAGE (/)
└── CTA: "Sign In"
    └── LOGIN PAGE (/login)
        ├── Email input
        ├── Password input
        ├── Submit
        └── On success:
            ├── Verify password with PBKDF2
            ├── Create session token
            └── REDIRECT → DASHBOARD (/dashboard)
```

---

## User Flow 3: Dashboard → Analysis (Primary Flow)

```
DASHBOARD (/dashboard)
├── Header: Logo, credit balance (5), profile link
├── Welcome message
├── Course card: Calculus 2
│   ├── Progress indicator (optional for MVP)
│   └── CTA: "Start Studying"
│       └── COURSE HOME (/course/calc2)
│           ├── Course stats: "4 past exams analyzed"
│           ├── Topics covered count
│           ├── Actions:
│           │   ├── [View Exam Analysis] → 2 credits
│           │   ├── [Practice Questions] → 1 credit/question
│           │   ├── [Archive by Topic] → 3 questions / 1 credit
│           │   └── [Practice Midterm] → 3 credits
│           └── Click: "View Exam Analysis"
│               └── Check: Do they have 2+ credits?
│                   ├── YES → ANALYSIS PAGE (/course/calc2/analysis)
│                   └── NO → UPGRADE PAGE (/upgrade)
```

---

## User Flow 4: Topic Analysis Hub (2 Credits)

```
ANALYSIS PAGE (/course/calc2/analysis)
├── Header: Credit balance (deducted 2, now shows 3)
├── Page title: "Topic Analysis"
├── Subtitle: "Based on MTH240 midterms from 2015-2025"
├── Chapter 3: Integration (expandable card)
│   ├── Header: Chapter number, name, total questions, exam frequency
│   └── Sections (expandable):
│       ├── 3.1 Integration by Parts
│       │   ├── Stats: Question count, avg difficulty, avg time, frequency
│       │   └── Techniques:
│       │       ├── Integration by Parts (Basic)
│       │       │   ├── Count: X questions from database
│       │       │   ├── Time estimate: 6-10 minutes
│       │       │   ├── [Details] → Expands to show:
│       │       │   │   ├── Common Traps (from real exam analysis)
│       │       │   │   │   ├── LIATE rule violations
│       │       │   │   │   ├── Forgetting boundary terms
│       │       │   │   │   └── Cyclical integration loops
│       │       │   │   ├── Study Strategies
│       │       │   │   │   ├── Always apply LIATE first
│       │       │   │   │   ├── Check if u-sub simplifies first
││   │   │   │   │   └── Tabular method for repeated integration
│       │       │   │   └── Sample questions from actual exams
│       │       │   └── [Practice This Technique] → Links to filtered practice
│       │       └── Tabular Integration
│       ├── 3.2 Trigonometric Integrals
│       │   └── Techniques: sin/cos odd powers, tan/sec, reduction formulas
│       ├── 3.3 Trigonometric Substitution
│       │   └── Techniques: sqrt(a²-x²), sqrt(a²+x²), sqrt(x²-a²)
│       ├── 3.4 Partial Fractions
│       │   └── Techniques: Linear factors, repeated, irreducible quadratic
│       └── 3.7 Improper Integrals
│           └── Techniques: Infinite limits, discontinuities, comparison test
│
├── Chapter 4: Differential Equations (expandable card)
│   ├── Header: Chapter number, name, total questions, exam frequency
│   └── Sections:
│       ├── 4.1 Directly Integrable DEs
│       │   └── Techniques: Basic integration, initial value problems
│       ├── 4.2 Separable DEs
│       │   └── Techniques: Separation of variables, mixing problems
│       └── 4.5 First-Order Linear DEs
│           └── Techniques: Integrating factor, standard form setup
│
└── Study Tip Card
    └── "Focus on high-frequency sections first (shown in navy blue)"
```

**State Change:** Credits decremented immediately on page load (atomic)
**Data Source:** All technique traps and strategies based on analysis of 33 real MTH240 exam questions (2015-2025)

---

## User Flow 5: Practice Questions (1 Credit Each)

```
PRACTICE PAGE (/course/calc2/practice)
├── Header: Credit balance
├── Filter Banner (if technique param present):
│   ├── "Filtered by: Integration by Parts"
│   ├── Shows question count for this technique
│   └── [Clear Filter] button
│
├── Mode Selection:
│   ├── Topic-based practice
│   │   ├── Checkbox list:
│   │   │   ☑ Integration by parts
│   │   │   ☐ Partial fractions
│   │   │   ☑ Series convergence
│   │   │   ☐ Polar coordinates
│   │   └── Button: "Generate Questions"
│   │       └── Check: Do they have credits?
│   │           ├── YES → Generate questions
│   │           └── NO → UPGRADE PAGE (/upgrade)
│   │
│   └── Technique-based practice (from Analysis Hub)
│       └── Direct link from Topic Analysis technique card
│       └── URL: /course/calc2/practice?technique=integration_by_parts
│       └── Filters questions to specific technique only
│
└── Question View (QUESTION/:id) (/course/calc2/question/:id)
    ├── Progress: "Question 1 of 3"
    ├── Technique tag (if applicable)
    ├── Question text
    ├── [Show Solution] button
    │   └── On click: Reveal step-by-step solution
    ├── Source citation: "Similar to 2023 Midterm, Q4 (12 pts)"
    ├── Navigation:
    │   ├── [Previous] (if not first)
    │   └── [Next Question] → Deduct 1 credit, load next
    └── Credit warning if < 3 credits:
        "You have X credits left. [Buy More]"
```

---

## User Flow 6: Archive + Practice Midterms

```
ARCHIVE PAGE (/course/calc2/archive)
├── Header: Credit balance
├── Filters: Topic, Exam Type (Midterm/Final), Year
├── Mode toggle:
│   ├── [Topic Practice] → 3 questions for 1 credit
│   └── [Practice Midterm] → 3 credits
│
├── Topic Practice Flow
│   ├── Select a topic or section
│   ├── Click "Generate 3 Questions"
│   ├── Check: Do they have 1+ credit?
│   │   ├── YES → Deduct 1 credit, load 3 questions
│   │   └── NO → UPGRADE PAGE (/upgrade)
│
└── Practice Midterm Flow
    ├── Choose difficulty:
    │   ├── Easy Midterm (shorter + easier mix)
    │   ├── Sample Midterm (realistic exam mix)
    │   └── Hard Midterm (longest + hardest)
    ├── Check: Do they have 3+ credits?
    │   ├── YES → Deduct 3 credits, launch midterm session
    │   └── NO → UPGRADE PAGE (/upgrade)
```

---

## User Flow 7: Paywall/Upgrade

```
UPGRADE PAGE (/upgrade)
├── Header: Current credits (low)
├── Headline: "Need more practice?"
├── Pricing Cards (2 options):
│   │
│   ├── [STARTER]         [UNLIMITED]
│   │  $10/month          $20/month
│   │  15 credits/month   Unlimited access
│   │  Monthly refresh    Monthly billing
│   │  ⭐ Popular          Best value
│   │
│   └── Selection → CHECKOUT (/checkout)
│       └── Stripe Checkout hosted page
│           ├── Email pre-filled
│           ├── Card entry
│           ├── Pay button
│           └── On success → SUCCESS PAGE (/success)
│
└── SUCCESS PAGE (/success)
    ├── "Payment successful!"
    ├── Credits added (or unlimited activated)
    ├── Button: "Continue Studying" → DASHBOARD
    └── Receipt sent to email (Stripe handles)
```

---

## User Flow 7: Credit Warning States

### Warning 1: Low Credits (< 3)
```
Show banner on all pages:
"⚠️ You have X credits left. [Buy More]"
```

### Warning 2: Zero Credits
```
On attempt to use feature:
Redirect to UPGRADE with message:
"You've used all your credits. Unlock more to continue studying."
```

### Warning 3: Insufficient for Action
```
User has 1 credit, tries Analysis (needs 2):
"This requires 2 credits. You have 1. [Buy More]"
```

---

## Error Flows

### Error 1: Auth Expired
```
Any page requiring auth, session expired:
Redirect to LOGIN with message:
"Session expired. Please sign in again."
```

### Error 2: Payment Failed
```
Stripe checkout fails:
Redirect to UPGRADE with message:
"Payment couldn't be processed. Try again or different card."
```

### Error 3: Question Generation Fails
```
OpenAI API error:
"Sorry, couldn't generate question. [Retry] (no credit charged)"
```

---

## Navigation Structure

### Header (Always Visible When Logged In)
```
[Logo] ← Dashboard

[Credit Balance: XX] ← Visual prominence

[Profile ▼]
  ├── My Progress
  ├── Purchase History
  └── Sign Out
```

### Footer
```
[How It Works] [Pricing] [FAQ] [Contact] [Terms] [Privacy]
```

---

## Mobile Adaptations

### Mobile-Specific Changes
- Header: Hamburger menu replaces nav links
- Credit balance: Always visible (top right)
- Analysis charts: Horizontal scroll or stacked
- Question view: Full-screen, swipe between questions
- Paywall: Single-column cards, stacked vertically

---

## State Management

### Global State (React Context)
```typescript
interface AppState {
  user: {
    id: string;
    email: string;
    credits: number;
    plan: 'free' | 'starter' | 'unlimited';
    creditsResetAt?: Date;
  } | null;

  currentCourse: {
    id: 'calc2';
    name: 'Calculus 2';
    progress?: number;
  };

  cart: {
    selectedPlan: 'starter' | 'unlimited' | null;
  };
}
```

### Local State (Component-Level)
- Form inputs
- Question navigation index
- Analysis view filters
- Modal open/closed states

---

## Analytics Events

Track these user actions:
- `signup_complete`
- `analysis_viewed` (with credit count before/after)
- `question_started`
- `question_completed` (solution viewed)
- `upgrade_viewed`
- `purchase_initiated`
- `purchase_completed` (with revenue)
- `credit_depleted`

---

## Recent Changes

### 2026-02-07: Unified Topic Analysis Hub
- **New:** Replaced split Analysis + Detail pages with unified hub at `/course/:slug/analysis`
- **New:** Two-level nesting: Chapter → Section → Technique cards
- **New:** 25+ techniques with curated traps and strategies from real exam analysis
- **New:** Technique filtering in practice mode via URL param (`?technique=`)
- **New:** Sample questions per technique from actual MTH240 exams (2015-2025)
- **Data:** All content based on analysis of 33 real exam questions

## Open Questions

1. Do unlimited users see any "credit" UI or is it hidden?
2. Should there be a daily login bonus (1 free credit)?
3. Should we add more chapters (5, 6, 7) as content expands?

**Next Step:** Deploy and verify full flow: Analysis → Expand → Practice
