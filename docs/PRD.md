# Product Requirements Document (PRD)

## Exam Prep Platform - Calculus 2 MVP

---

## 1. Product Overview

**Product Name:** CalcPrep (working title)

**Tagline:** "Ace your Calc 2 exam with AI-powered analysis of past exams"

**Core Value Proposition:** Students upload past exams, our AI analyzes patterns across years, identifies high-probability topics, and generates targeted practice questions. Pay only for what you need with credits.

---

## 2. Target User

**Primary User:** Engineering/Science students taking Calculus 2
- Age: 18-22
- Technical literacy: High (comfortable with web apps)
- Pain point: Overwhelmed by volume of material, don't know what to prioritize
- Motivation: Pass exam with good grade, minimize study time
- Context: 1-2 weeks before exam, stressed, time-constrained

---

## 3. Core Features

### MVP Features (Must Have)

1. **User Authentication**
   - Email/password signup
   - 5 free credits per month (starts on registration)
   - Session persistence

2. **Exam Analysis Dashboard**
   - Topic frequency analysis (which topics appear most often)
   - Difficulty distribution (easy/medium/hard breakdown)
   - Points allocation (which topics are worth most)
   - Cost: 2 credits to unlock

3. **Targeted Practice Questions**
   - User selects weak topics
   - AI generates practice questions based on past exam patterns
   - Shows solution with step-by-step explanation
   - References source exam (year, question number, points)
   - Cost: 1 credit per question

4. **Exam Archive + Practice Midterms**
   - Browse real past exam questions by topic or section
   - Topic practice bundles: 3 questions for 1 credit
   - Practice midterms (easy / sample / hard)
   - Midterm sessions emulate real exam length and difficulty
   - Cost: 3 credits per midterm

5. **Credit System**
   - Free tier: 5 credits per month
   - $10/month: 15 credits per month
   - $20/month: Unlimited access
   - Credit balance display and monthly reset

6. **Payment Integration**
   - Stripe Checkout for subscription purchase
   - Webhook for instant credit delivery and plan status

### Post-MVP Features (Nice to Have)

- Referral system (earn credits for invites)
- Study streaks/gamification
- Peer comparison ("X students are studying this topic now")
- Mobile app
- Multiple courses (Calc 1, Calc 3, Physics, etc.)

---

## 4. User Stories

1. **As a student**, I want to see which Calc 2 topics are most frequently tested, so I can prioritize my study time.

2. **As a student**, I want to practice questions similar to what appeared on past exams, so I feel prepared for the format.

3. **As a student**, I want to focus on topics I struggle with, so I can improve my weak areas efficiently.

4. **As a student**, I want a monthly plan with predictable credits, so I can budget study time.

5. **As a student**, I want to see the source of each practice question, so I know it's based on real exams.

---

## 5. Success Criteria

### Technical Success
- [ ] App loads in < 3 seconds
- [ ] 99% uptime
- [ ] Mobile responsive
- [ ] Payment processing works end-to-end

### Business Success
- [ ] 50+ signups in first week
- [ ] 30% of users spend at least $10
- [ ] 4.0+ average user rating
- [ ] Break-even on OpenAI API costs by week 2

### User Success
- [ ] Users report feeling "more prepared" after using app
- [ ] Average session time > 10 minutes
- [ ] 50%+ of free credits are used before purchase decision

---

## 6. Scope

### In Scope (MVP)
- Single course: Calculus 2
- 6 past exams as data source
- Email/password auth only
- Monthly credit subscriptions
- Web app only (no native apps)

### Out of Scope (MVP)
- notes
- Multiple courses
- Social features (sharing, leaderboards)
- Tutor marketplace
- Live chat support
- PDF upload by users
- Mobile native apps
- SSO (Google, Apple login)

---

## 7. Technical Constraints

- Must work on mobile browsers
- Must handle payment via Stripe

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| AI-generated questions are wrong | Manual review of all questions before deployment |
| Low conversion (free → paid) | Optimize paywall timing, A/B test pricing |

---

## 9. Timeline

**Week 1:**
- Day 1-2: Documentation + planning (this PRD)
- Day 3-4: Data preparation (process 4 exams, generate questions)
- Day 5-7: Backend API + database

**Week 2:**
- Day 8-10: Frontend implementation
- Day 11-12: Payment integration
- Day 13-14: Testing, bug fixes, launch

---

## 10. Open Questions

1. Should we offer a "guarantee" (money back if you fail)? (NOO)
2. Should we partner with student organizations for distribution?(N
3. Do we need a professor approval process for questions?

---

## 10. Decisions Made

- **NO money-back guarantee** - Too risky for MVP
- **NO partnerships** - Direct to student marketing only
- **NO professor approval** - Self-reviewed questions
- **Tech Stack:** React 19 + Vite 7 + GSAP + Tailwind CSS 4 + Cloudflare Workers + D1 + Stripe

---

**Document Status:** Draft v1.0
**Last Updated:** 2026-02-05
**Next Review:** Before Week 2 implementation
