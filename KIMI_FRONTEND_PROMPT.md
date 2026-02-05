# Kimi K2.5 Frontend Generation Prompt

## Project Context
Exam Prep Platform - Calculus 2 study tool with credit-based access to exam analysis and practice questions.

## Design System: "Focused Scholar"

### Color Palette
```css
/* Backgrounds */
--bg-primary: #1a1a2e;      /* Deep charcoal - main background */
--bg-surface: #16213e;      /* Slightly lighter - cards/panels */
--bg-elevated: #1e2a4a;     /* Hover states, elevated elements */

/* Accents */
--accent-primary: #f39c12;   /* Amber/gold - CTAs, highlights */
--accent-secondary: #3498db; /* Cyan - math equations, links */
--accent-success: #2ecc71;   /* Soft green - correct answers */
--accent-error: #e74c3c;     /* Red - errors, wrong answers */

/* Text */
--text-primary: #ffffff;     /* White - headings */
--text-secondary: #b8c5d6;   /* Light blue-gray - body text */
--text-muted: #6b7c93;       /* Muted - placeholders, hints */

/* Glassmorphism */
--glass-bg: rgba(22, 33, 62, 0.7);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

### Typography
```css
/* Headings - Inter or similar clean sans-serif */
--font-heading: 'Inter', -apple-system, sans-serif;
--font-math: 'KaTeX_Math', 'Times New Roman', serif;  /* For equations */
--font-code: 'JetBrains Mono', monospace;  /* For code/explanations */

/* Sizes */
--text-xs: 0.75rem;    /* 12px - labels */
--text-sm: 0.875rem;   /* 14px - secondary text */
--text-base: 1rem;     /* 16px - body */
--text-lg: 1.125rem;   /* 18px - lead text */
--text-xl: 1.5rem;     /* 24px - subheadings */
--text-2xl: 2rem;      /* 32px - headings */
--text-3xl: 2.5rem;    /* 40px - hero */
```

### Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Glassmorphism Card Style
```css
.glass-card {
  background: rgba(22, 33, 62, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  padding: 24px;
}
```

---

## Page 1: Landing Page

### Layout
- Full-height hero section
- Centered content, max-width 800px
- Sticky glassmorphism header

### Header (Sticky, Glassmorphism)
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] ExamPrep    [How it works] [Pricing]  [Sign In]    │
└─────────────────────────────────────────────────────────────┘
- Height: 64px
- Background: glass-bg with blur
- Position: sticky top
```

### Hero Section
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│           Ace Your Calculus 2 Exam                          │
│           with AI-Powered Insights                          │
│                                                             │
│     Analyze past exams • Practice targeted questions        │
│     • Track your progress                                   │
│                                                             │
│              [Get Started - 5 Free Credits]                 │
│                  amber/gold button                          │
│                                                             │
│     "I went from a C to an A after using the exam          │
│      analysis. It showed exactly what to study."            │
│                      — Sarah, Engineering Student          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### How It Works Section
```
┌─────────────────────────────────────────────────────────────┐
│              How It Works                                   │
│                                                             │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐              │
│   │    1     │   │    2     │   │    3     │              │
│   │  Upload  │ → │ Analyze  │ → │ Practice │              │
│   │  Exams   │   │ Patterns │   │ Questions│              │
│   └──────────┘   └──────────┘   └──────────┘              │
│                                                             │
│   We analyze 4 years of exams to find patterns             │
│   in topics, difficulty, and question types                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Pricing Section
```
┌─────────────────────────────────────────────────────────────┐
│                    Simple Pricing                           │
│                                                             │
│   ┌──────────────────┐   ┌──────────────────┐              │
│   │   Free Start     │   │   Full Access    │              │
│   │                  │   │                  │              │
│   │   5 Credits      │   │   $20 one-time   │              │
│   │   on signup      │   │                  │              │
│   │                  │   │   ✓ Unlimited    │              │
│   │   • 1 Analysis   │   │     questions    │              │
│   │   • 3 Questions  │   │   ✓ All courses  │              │
│   │                  │   │   ✓ Progress     │              │
│   │   [Sign Up Free] │   │     tracking     │              │
│   │                  │   │                  │              │
│   │                  │   │   [Get Unlimited]│              │
│   └──────────────────┘   └──────────────────┘              │
│                                                             │
│              Or buy credits: $10 for 10 credits            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Page 2: Dashboard

### Layout
- Sidebar navigation (collapsible on mobile)
- Main content area
- Sticky credit counter in header

### Header
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    [📚 Courses ▼]              [💎 5]  [👤 Profile] │
└─────────────────────────────────────────────────────────────┘
```

### Main Content
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Welcome back, Alex!                                       │
│                                                             │
│   Your Courses                                              │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  📊 Calculus 2  (MATH-201)                         │  │
│   │                                                     │  │
│   │  Progress: ████████░░░░  65%                      │  │
│   │                                                     │  │
│   │  [View Analysis]  [Practice Questions]             │  │
│   │                                                     │  │
│   │  Next exam: Dec 15 (12 days away)                 │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  ⚛️ Physics 1   (PHYS-101)     [Enroll to start]   │  │
│   └─────────────────────────────────────────────────────┘  │
│                                                             │
│   Quick Stats                                               │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│   │ Questions│ │   Hours  │ │  Streak  │ │  Mastery │    │
│   │   47     │ │   12.5   │ │   5 days │ │   68%    │    │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Page 3: Exam Analysis (Costs 2 Credits)

### Layout
- Full-width header with course info
- Grid of analysis cards
- Sticky "Start Practice" CTA at bottom

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                        │
│                                                             │
│  Calculus 2 - Exam Analysis              [💎 5] → [💎 3]   │
│  Based on 4 past exams (2021-2024)                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📊 Topic Distribution                              │   │
│  │                                                     │   │
│  │  Integration by Parts     ████████████  28%        │   │
│  │  Partial Fractions        ████████░░░░  18%        │   │
│  │  Improper Integrals       ██████░░░░░░  14%        │   │
│  │  Series Convergence       █████░░░░░░░  12%        │   │
│  │  Power Series             ████░░░░░░░░  10%        │   │
│  │  ...                                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │  🎯 High-Value      │  │  ⚡ Difficulty      │          │
│  │     Topics          │  │     Distribution    │          │
│  │                     │  │                     │          │
│  │  Focus here for     │  │  Easy: 30%          │          │
│  │  maximum points:    │  │  Medium: 45%        │          │
│  │                     │  │  Hard: 25%          │          │
│  │  1. Integration     │  │                     │          │
│  │     by Parts        │  │  [Pie Chart]        │          │
│  │     (avg 15 pts)    │  │                     │          │
│  │                     │  │                     │          │
│  │  2. Series          │  │                     │          │
│  │     (avg 12 pts)    │  │                     │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🎓 Recommended Study Strategy                      │   │
│  │                                                     │   │
│  │  Week 1: Master Integration by Parts & Partial      │   │
│  │          Fractions (46% of exam content)            │   │
│  │                                                     │   │
│  │  Week 2: Focus on Series Convergence tests          │   │
│  │                                                     │   │
│  │  Week 3: Practice mixed problems & timed exams      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                             │
│     [Start Practicing - Target Your Weak Areas]            │
│              amber/gold full-width button                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Page 4: Practice Question

### Layout
- Clean, focused single-column
- Question card (glassmorphism)
- Progress indicator at top

```
┌─────────────────────────────────────────────────────────────┐
│  ← Exit Practice                                            │
│                                                             │
│  Question 3 of 10          [💎 3]  Save for Later  [✓]     │
│  ████████░░░░░░░░░░ 30%                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Integration by Parts                    [15 pts]   │   │
│  │  ★★★☆☆ Difficult                                    │   │
│  │  From 2022 Midterm, Question 3                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  Evaluate the following integral:                   │   │
│  │                                                     │   │
│  │  $$\\int x^2 e^{3x} \\, dx$$                        │   │
│  │                                                     │   │
│  │  [Show Hint]                                        │   │
│  │                                                     │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │                                                     │   │
│  │  Your answer:                                       │   │
│  │  ┌───────────────────────────────────────────────┐ │   │
│  │  │                                               │ │   │
│  │  │  Enter your solution... (LaTeX supported)    │ │   │
│  │  │                                               │ │   │
│  │  └───────────────────────────────────────────────┘ │   │
│  │                                                     │   │
│  │  [Submit Answer]                                    │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Previous]                      [Skip]  [Next Question]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

After Submit:

┌─────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ✅ Correct! Well done!                             │   │
│  │      or                                             │   │
│  │  ❌ Not quite. Let's review.                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │                                                     │   │
│  │  Step-by-Step Solution:                             │   │
│  │                                                     │   │
│  │  Step 1: Identify u and dv                         │   │
│  │  Let u = x², dv = e³ˣdx                            │   │
│  │  Then du = 2x dx, v = ⅓e³ˣ                         │   │
│  │                                                     │   │
│  │  Step 2: Apply integration by parts formula        │   │
│  │  $$\\int u \\, dv = uv - \\int v \\, du$$           │   │
│  │                                                     │   │
│  │  ...                                                │   │
│  │                                                     │   │
│  │  Final Answer:                                      │   │
│  │  $$\\frac{e^{3x}}{27}(9x^2 - 6x + 2) + C$$          │   │
│  │                                                     │   │
│  │  💡 Key Insight:                                    │   │
│  │  When you see polynomial × exponential, always     │   │
│  │  choose the polynomial as u (LIATE rule).          │   │
│  │                                                     │   │
│  │  ⚠️ Common Mistake:                                │   │
│  │  Forgetting the chain rule factor when integrating │   │
│  │  e³ˣ (should be ⅓e³ˣ, not e³ˣ).                    │   │
│  │                                                     │   │
│  │  [Next Question]  [Practice Similar]  [Review Later]│   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Page 5: Credit Purchase / Paywall

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                                                     │
│                                                             │
│              You're out of credits!                         │
│                                                             │
│     Get more to continue practicing and ace your exam.      │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   Credit Pack    │  │   Unlimited      │                │
│  │                  │  │                  │                │
│  │      $10         │  │      $20         │                │
│  │                  │  │                  │                │
│  │    10 Credits    │  │   One-time fee   │                │
│  │                  │  │                  │                │
│  │   ~10 questions  │  │   Unlimited      │                │
│  │                  │  │   questions      │                │
│  │                  │  │                  │                │
│  │   [Buy Credits]  │  │   ⭐ Popular     │                │
│  │                  │  │                  │                │
│  │                  │  │   [Get Unlimited]│                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
│  🔒 Secure payment via Stripe                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Shared Components

### Credit Badge
```
┌──────────┐
│ 💎 5     │  -- Glassmorphism pill
└──────────┘
Background: glass-bg
Border: glass-border
Border-radius: 20px (full rounded)
Padding: 6px 12px
Font: Inter, 14px, white
```

### Topic Tag
```
┌────────────────┐
│ Integration    │  -- Small pill
└────────────────┘
Background: rgba(52, 152, 219, 0.2)  /* cyan with opacity */
Border: 1px solid rgba(52, 152, 219, 0.3)
Color: #3498db
Border-radius: 12px
Padding: 4px 10px
Font: 12px
```

### Difficulty Indicator
```
★★★☆☆  (3 out of 5 stars)
Color: #f39c12 (filled), #6b7c93 (empty)
Size: 16px
```

### Progress Bar
```
Background track: rgba(255, 255, 255, 0.1)
Fill: linear-gradient(90deg, #f39c12, #f1c40f)
Height: 8px
Border-radius: 4px
```

### Primary Button (Amber/Gold)
```css
.btn-primary {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 0 4px 16px rgba(243, 156, 18, 0.3);
  transition: all 0.2s ease;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(243, 156, 18, 0.4);
}
```

### Secondary Button (Outline)
```css
.btn-secondary {
  background: transparent;
  color: #b8c5d6;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 14px 28px;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
}
```

---

## Responsive Behavior

### Mobile (< 768px)
- Sidebar becomes bottom navigation
- Cards stack vertically
- Question text larger for readability
- Full-width buttons
- Simplified analysis view

### Tablet (768px - 1024px)
- Collapsible sidebar
- 2-column grids become 1-2 columns
- Adjusted spacing

### Desktop (> 1024px)
- Full sidebar
- Multi-column layouts
- Max-width containers (800-1200px)

---

## Animation Specifications

### Micro-interactions
- Button hover: 200ms ease, translateY(-2px)
- Card hover: 300ms ease, subtle lift + shadow increase
- Page transitions: 300ms fade + slight slide
- Credit deduction: 500ms pulse animation on badge
- Correct answer: 300ms green flash + checkmark scale
- Wrong answer: 200ms shake animation

### Loading States
- Skeleton screens with shimmer effect
- Spinner: Amber color, rotating
- Progress bars: Animated gradient

---

## Key Design Principles for Kimi

1. **Dark mode only** - No light mode for MVP
2. **Math-first typography** - LaTeX should render beautifully
3. **Focus mode** - Question page has minimal distractions
4. **Progressive disclosure** - Don't overwhelm with all features at once
5. **Credit awareness** - Always show credit balance, make cost clear
6. **Mobile-first** - Most students will use this on phones

---

## Generate These Files

Please generate:
1. `LandingPage.svelte` - Full landing page component
2. `Dashboard.svelte` - User dashboard
3. `ExamAnalysis.svelte` - Analysis view with charts
4. `PracticeQuestion.svelte` - Question + solution view
5. `CreditPurchase.svelte` - Paywall/purchase page
6. `components/CreditBadge.svelte` - Reusable credit display
7. `components/GlassCard.svelte` - Reusable glassmorphism container
8. `components/TopicTag.svelte` - Topic pill component
9. `components/ProgressBar.svelte` - Progress indicator

Use Svelte 5 syntax, TypeScript, Tailwind CSS classes where possible.
