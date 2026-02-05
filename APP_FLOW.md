# App Flow Document

> **Last Updated:** 2026-02-05
> **Status:** MVP Flow Complete

---

## Page Inventory

| Route | Page Name | Purpose | Auth Required |
|-------|-----------|---------|---------------|
| `/` | Landing | Convert visitors to signups | No |
| `/login` | Login | Existing users sign in | No |
| `/signup` | Signup | New user registration | No |
| `/dashboard` | Dashboard | Course selection, credit balance | Yes |
| `/course/calc2` | Course Home | Overview of Calc 2 prep | Yes |
| `/analysis` | Exam Analysis | Topic breakdown (2 credits) | Yes |
| `/practice` | Practice Mode | Topic selection + questions | Yes |
| `/question/:id` | Question View | Individual question + solution | Yes |
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
            ├── Create user in Turso
            ├── Set 10 credits (updated from research)
            ├── Create JWT session
            └── REDIRECT → DASHBOARD (/dashboard)
```

**Credit Strategy:** 10 initial credits (research showed 5 is too few)

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
            ├── Verify password with bcrypt
            ├── Create JWT session
            └── REDIRECT → DASHBOARD (/dashboard)
```

---

## User Flow 3: Dashboard → Analysis (Primary Flow)

```
DASHBOARD (/dashboard)
├── Header: Logo, credit balance (10), profile link
├── Welcome message
├── Course card: Calculus 2
│   ├── Progress indicator (optional for MVP)
│   └── CTA: "Start Studying"
│       └── COURSE HOME (/course/calc2)
│           ├── Course stats: "4 past exams analyzed"
│           ├── Topics covered count
│           ├── Actions:
│           │   ├── [View Exam Analysis] → 2 credits
│           │   └── [Practice Questions] → 1 credit/question
│           └── Click: "View Exam Analysis"
│               └── Check: Do they have 2+ credits?
│                   ├── YES → ANALYSIS PAGE (/analysis)
│                   └── NO → UPGRADE PAGE (/upgrade)
```

---

## User Flow 4: Analysis Page (2 Credits)

```
ANALYSIS PAGE (/analysis)
├── Header: Credit balance (deducted 2, now shows 8)
├── Page title: "Calculus 2 Exam Analysis"
├── Section 1: Topic Frequency
│   ├── Bar chart: Integration (28%), Series (32%), Applications (22%), etc.
│   └── Insight: "Series appears most often - prioritize this"
├── Section 2: Difficulty Distribution
│   ├── Pie/donut chart
│   └── Easy 30%, Medium 45%, Hard 25%
├── Section 3: High-Value Topics
│   ├── Table: Topic | Avg Points | Frequency
│   └── Highlight: "Integration by parts: 15 pts/question"
├── Section 4: Study Strategy
│   └── AI-generated: "Based on patterns, focus on..."
└── CTA: "Practice These Topics" → PRACTICE PAGE (/practice)
```

**State Change:** Credits decremented immediately on page load (atomic)

---

## User Flow 5: Practice Questions (1 Credit Each)

```
PRACTICE PAGE (/practice)
├── Header: Credit balance
├── Step 1: Select Weak Topics
│   ├── Checkbox list:
│   │   ☑ Integration by parts
│   │   ☐ Partial fractions
│   │   ☑ Series convergence
│   │   ☐ Polar coordinates
│   └── Button: "Generate Questions"
│       └── Check: Do they have credits?
│           ├── YES → Generate questions
│           └── NO → UPGRADE PAGE (/upgrade)
│
└── Step 2: Question View (QUESTION/:id)
    ├── Progress: "Question 1 of 3"
    ├── Question text (AI-generated)
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

## User Flow 6: Paywall/Upgrade

```
UPGRADE PAGE (/upgrade)
├── Header: Current credits (low)
├── Headline: "Need more practice?"
├── Pricing Cards (3 options):
│   │
│   ├── [CREDITS]        [WEEK PASS]      [SEMESTER]
│   │  $4.99             $7.99            $49.99
│   │  10 credits        Unlimited        Unlimited
│   │  Never expire      7 days           Full semester
│   │  ⭐ Popular        Best value
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
Any page requiring auth, JWT expired:
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

### Global State (Svelte Store)
```typescript
interface AppState {
  user: {
    id: string;
    email: string;
    credits: number;
    hasUnlimited: boolean;
    unlimitedExpiry?: Date;
  } | null;

  currentCourse: {
    id: 'calc2';
    name: 'Calculus 2';
    progress?: number;
  };

  cart: {
    selectedProduct: 'credits' | 'week' | 'semester' | null;
    quantity?: number;
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

## Open Questions

1. Should we show a preview/teaser of analysis before paying 2 credits?
2. Should incorrect answers cost credits, or only viewing solution?
3. Do unlimited users see any "credit" UI or is it hidden?
4. Should there be a daily login bonus (1 free credit)?

**Next Step:** User psychology research will inform these decisions.
