# Session Context Export

**Session Name:** exam
**Date:** 2026-02-05
**Original Location:** /Users/muadhsambul/Downloads/claude-test

---

## Project Summary

**Product:** Calculus 2 Exam Prep Platform
**Target User:** Engineering students in Calculus 2
**Timeline:** 2 weeks to MVP (before exam season)
**Business Model:** Freemium - 5 free credits, then pay for more

---

## Core User Flow

1. **Landing** → Sign up (email + password) → **5 free credits**
2. **Dashboard** → Select Calculus 2 → View "Analysis Breakdown" (**2 credits**)
   - Topic frequency chart
   - Difficulty distribution
   - "Most tested concepts"
3. **Weak Spot Quiz** → "Which topics do you struggle with?" → **3 targeted questions** (1 credit each)
   - Shows: Question + explanation + "From 2022 Midterm, Q3 (15 pts)"
4. **Paywall** → "Unlock 15 more questions + unlimited for $20" OR "Buy 10 credits for $10"

---

## Key Decisions Made

### Content Strategy
- **Source:** 4 PDF past exams + open source textbook
- **Professor-approved:** University has free use policy for old exams
- **Model:** User uploads exams → AI processes → Students earn credits for contributing
- **Differentiation:** Professor-specific analysis (not generic Calc 2 content)

### Pricing
- **Free:** 5 credits on signup
- **Analysis:** 2 credits
- **Questions:** 1 credit each
- **Purchase:** $10 for 10 credits OR $20 unlimited

### Tech Stack
- **Frontend:** SvelteKit + Tailwind + shadcn-svelte
- **Backend:** Cloudflare Workers
- **Database:** Turso (SQLite)
- **Auth:** JWT tokens
- **Payments:** Stripe Checkout
- **AI:** OpenAI API for question generation
- **Hosting:** Cloudflare Pages + Workers (free tier)

---

## Implementation Plan

See `IMPLEMENTATION_PLAN.md` for detailed 14-day breakdown.

**Key Milestones:**
- Day 1-2: Process PDFs, generate questions
- Day 3-4: Backend API (auth, courses, questions, credits)
- Day 5-7: Frontend foundation
- Day 8-10: Core features (analysis, practice, paywall)
- Day 11-12: Polish & mobile
- Day 13-14: Testing & launch

---

## Files Created

- `IMPLEMENTATION_PLAN.md` - Detailed 14-day plan with commands
- `CHAT_CONTEXT.md` - This file (session summary)

---

## Next Steps When Resuming

1. Upload 4 Calc 2 PDFs to `exams/` folder
2. Start Day 1: Process PDFs and extract questions
3. Follow implementation plan sequentially

---

## Key Learnings from Session

1. **University Policy:** Free use of old exams for study purposes (professor-approved)
2. **Business Model Pivot:** From exam-selling to analysis + practice questions (legitimate)
3. **Credit System:** 5 free → paywall at key moment (after seeing value)
4. **MVP Scope:** Single course (Calc 2), expand later

---

## Semantic Memory Stored

- Ralph Loop cancellation method
- CPU limit configurations (10% for Ollama)
- Ultimate coding workflow (swarm-planner + parallel-task + subagent-driven)
- This project's business model and tech stack
