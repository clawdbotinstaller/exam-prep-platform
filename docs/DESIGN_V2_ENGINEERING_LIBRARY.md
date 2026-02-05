# Design Document: Calc 2 Exam Archive Landing Page

## Project Context

**What this is:** A study tool for Calculus 2 students that provides access to actual exam questions from real university midterms and finals (2022-2024). Not AI-generated practice problems. Real questions that have actually appeared on exams.

**The problem:** Students study generic practice problems, then get to the exam and the questions look nothing like what they practiced. They waste time on low-yield topics while missing high-frequency exam content.

**The solution:** An archive of real exam questions, analyzed by topic and frequency, so students can practice what actually matters.

**Target user:** Engineering and science students taking Calc 2. Stressed, time-constrained, skeptical of "study tools" that overpromise. They want proof this works before paying.

**Tech stack:** React 19 + Vite 7 + GSAP ScrollTrigger + Tailwind CSS 4

---

## Design Direction: "The Engineering Library"

**Aesthetic:** Technical drafting meets university engineering library. Think graph paper, blueprints, well-worn textbooks, card catalogs, mechanical pencils on drafting tables.

**NOT:** gradients, purple/pink AI startup vibes, floating cards with heavy shadows, generic SaaS templates.

**Color palette (FINAL):**
- Paper cream: `#F5F1E8` (main background)
- Paper aged: `#EDE8DC` (cards)
- Ink black: `#1A1A2E` (primary text)
- Pencil gray: `#4A5568` (secondary text, borders)
- Blueprint navy: `#1A365D` (headlines, CTAs, borders)
- Stamp red: `#C53030` (stamps, warnings, badges)
- Highlighter yellow: `#F4D03F` at 40% opacity (subtle highlights - NOT bright)

**Note:** Colors derived from Topic Frequency Analysis dashboard reference. Navy blue is primary accent, NOT bright yellow.

**Typography (FINAL):**
- Headlines: Source Serif 4 (engineering textbook feel)
- Body: Inter (clean, readable)
- Data/numbers/labels: JetBrains Mono (technical, monospace for consistency)

**Visual elements:**
- Graph paper grid backgrounds (20px squares, subtle)
- Index card style containers (sharp corners, pencil borders)
- Library date stamps (navy border, slight rotation)
- Red "Actual Exam" stamps (rotated, bold)
- Technical ruler dividers (repeating tick marks)
- Hand-drawn/highlighted accents (yellow at 40% opacity behind text)

**Navigation (NO sideways text):**
- Horizontal top navigation bar
- Sticky on scroll with subtle shadow
- Logo left, links center, CTA right
- Mobile: hamburger menu
- Technical "Drawing No." label visible on scroll

---

## Content Voice Guidelines

**WRITE LIKE A HUMAN, NOT AI:**

**Bad (AI-speak):**
- "Ace your exam with our AI-powered platform"
- "Revolutionary study tool leveraging cutting-edge technology"
- "Optimize your learning journey with data-driven insights"
- "Transform your academic performance today"

**Good (human, authentic):**
- "Questions from actual midterms. Not AI-generated practice."
- "I recognized three problems on my exam from this archive."
- "See which topics actually show up, and how often."
- "Built by someone who failed Calc 2 the first time."

**Voice characteristics:**
- Direct, no fluff
- Specific, not vague
- Slightly irreverent (engineering students hate corporate speak)
- Evidence-based (show, don't tell)
- Acknowledge the skepticism (students have seen too many study tools)

---

## Landing Page Structure

### Section 1: Header
**Left:** Logo/wordmark (simple, text-based: "EXAM ARCHIVE" or similar)
**Right:** "Browse Free" (secondary), "Get Access" (primary button)

### Section 2: Hero
**Headline:** Questions from actual Calc 2 midterms.
**Subhead:** Not AI-generated practice. Real problems from 2022–2024 exams.

**Visual:** Preview of 2-3 actual questions with metadata:
- "Integration by Parts (2023, Q4) — 15 points — appeared on 3 exams"
- "Series Convergence (2024, Q2) — 12 points — 87% of students missed this"

**CTA:** [Browse the Archive] (primary button)

### Section 3: The Problem (Why this exists)
**Headline:** Generic practice problems won't help you.
**Body:**
- "Most study apps use AI-generated questions that 'feel' like exam problems."
- "But actual exam questions have patterns. Specific phrasings. Traps professors reuse."
- "You can't learn those from generic practice."

**Visual:** Side-by-side comparison (generic problem vs. actual exam problem showing similarities across years)

### Section 4: How It Works
**Headline:** How the archive works

**Three steps:**
1. **Browse** — See questions from 4+ years of exams, organized by topic
2. **Analyze** — Which topics appear most? Which are worth the most points?
3. **Practice** — Work through real exam questions with full solutions

**Visual:** Simple icons, graph paper cards, ruler dividers between steps

### Section 5: Social Proof
**Quote:** "I recognized three problems on my midterm from this archive. The partial fractions question was almost identical. Worth every penny."
**Attribution:** Sarah M., Mechanical Engineering '25

**Visual:** Quote styled like a handwritten note or highlighted textbook margin

### Section 6: What's Inside
**Headline:** The archive includes

**List:**
- 4 years of exam questions (2022–2026)
- Full solutions with step-by-step work
- Topic frequency analysis (what actually appears)
- Difficulty ratings based on number of steps, number of marks assigned, and length of the question solution
- Source attribution (which exam, which year, which question)

**Visual:** File folder or index card aesthetic

### Section 7: Pricing
**Headline:** Get access

**Two tiers:**
- **Free** - 5 credits, free on signup, unlock one analysis, and 5 questions
- **Starter** — 10 credits — $4.99 — Browse and unlock individual questions, billed monthly
- **Full Archive** — Unlimited — $19.99 — Full access for all courses, billed monthly


**Visual:** Index cards or library checkout cards

### Section 8: FAQ
**Questions:**
- include common faqs

### Section 9: Contact

include a contact form

### Section 9: Footer
- Links: Browse, Pricing, FAQ, Contact
- Small text: "Built by a Calc 2 student who got tired of using turbo AI to study the wrong things"

---

## Visual Design Specifications

### Background
- Main: `#F5F1E8` (cream paper)
- Graph paper grid overlay (very subtle, 20px squares, `#D4CFC4` at 30% opacity)

### Cards/Containers
- Background: `#EDE8DC` (slightly aged paper)
- Border: 1px solid `#4A5568` (pencil gray)
- Border-radius: 2px (sharp, technical)
- Shadow: 1px 1px 0 rgba(0,0,0,0.1) (subtle, like a stacked paper)

### Typography
- Headlines: Source Serif 4, 600-700 weight, tight tracking
- Body: Inter, 400 weight, 1.6 line-height
- Captions/metadata: JetBrains Mono, 12-14px

### Buttons
**Primary (btn-blueprint):**
- Background: `#1A365D` (blueprint navy)
- Text: `#F5F1E8` (cream)
- Border-radius: 2px
- Font: JetBrains Mono, uppercase, letter-spacing 0.04em
- Hover: background to `#1A1A2E` (ink black)

**Secondary:**
- Background: transparent
- Border: 1.5px solid `#4A5568`
- Text: `#1A1A2E`
- Hover: background fills to `#EDE8DC`

### Accent Elements
- **Highlighter:** Yellow background (`#F4D03F` at 40% opacity) behind text, skewed -2deg
- **Date Stamp:** Navy border, slight rotation (-2deg), monospace font
- **Exam Stamp (red):** Red border (`#C53030`), rotation (-8deg), bold uppercase
- **Ruler:** Horizontal divider with tick marks (repeating linear gradient)

---

## Mobile Considerations

- Graph paper grid scales to 10px on mobile
- Cards become full-width with 16px padding
- Touch targets minimum 44px
- Typography scales down one step
- Bottom sticky CTA for "Get Access"

---

## Deliverables

**Implementation:** React 19 + TypeScript + Vite 7

**Sections built:**
1. Navigation (horizontal, no sideways text)
2. Hero (pinned scroll section with GSAP animations)
3. Problem (generic vs real exam comparison)
4. How It Works (3-step process)
5. Topic Frequency (histogram dashboard)
6. What's Inside (folder listing)
7. Social Proof (testimonial)
8. Pricing (library checkout card)
9. Footer

**Animation system:** GSAP ScrollTrigger with global scroll snap

**File format:** `.tsx` components in `src/sections/`

**Priority:** Authentic feel over pixel perfection. Built like a meticulous engineering student designed it.
