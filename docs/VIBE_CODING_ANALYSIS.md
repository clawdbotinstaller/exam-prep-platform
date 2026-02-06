# Vibe Coding Analysis - Multi-Agent Workflow Implementation

**Source:** @kloss_xyz comprehensive guide
**Date:** 2026-02-05
**Project:** Exam Prep Platform

---

## Biggest Takeaways

### 1. Documentation-First Architecture
The guide emphasizes 6 canonical docs before any code:
- PRD.md (Product Requirements)
- APP_FLOW.md (User flows)
- TECH_STACK.md (Locked dependencies)
- FRONTEND_GUIDELINES.md (Design system)
- BACKEND_STRUCTURE.md (Database/API)
- IMPLEMENTATION_PLAN.md (Step-by-step build)

**Key insight:** AI hallucinates when clarity ends. These docs act as guardrails.

### 2. The Multi-Claude Workflow (Most Important)
The guide describes parallel Claude instances:

**Claude #1: The Planner/Interrogator**
- Tears apart your idea with questions
- Writes all 6 canonical docs
- Creates CLAUDE.md rules
- Never writes code

**Claude #2: The Orchestrator**
- Reads IMPLEMENTATION_PLAN.md
- Spawns subagents for tasks
- Manages parallel git worktrees
- Coordinates execution

**Claude #3: The Reviewer/Debugger**
- Code quality review
- Testing and verification
- Bug fixing with Codex
- Final polish

### 3. Session Persistence System
- CLAUDE.md: Auto-read every session (rules, patterns, constraints)
- progress.txt: What's done, what's next, known bugs
- lessons.md: Self-improving rulebook (mistakes → rules)

### 4. Tool Specialization
- **Claude:** Thinking, planning, documentation
- **Cursor:** Code editor with 4 modes (Ask/Plan/Agent/Debug)
- **Kimi K2.5:** Visual/pixel-accurate frontend
- **Codex:** Debugging, testing, finalization

### 5. Parallel Execution via Git Worktrees
- 3-5 worktrees running simultaneously
- Each with own Claude session
- Independent but mergeable
- Massive speed multiplier

---

## Implementation for Exam Prep Project

### Phase 1: Planning Phase (Claude #1 - THIS SESSION)

**Current Status:** Already completed!
- ✅ PRD.md created
- ✅ APP_FLOW.md created
- ✅ TECH_STACK.md created
- ✅ FRONTEND_GUIDELINES.md created
- ✅ BACKEND_STRUCTURE.md created
- ✅ IMPLEMENTATION_PLAN.md created
- ✅ CLAUDE.md created

**Missing:** lessons.md (will create as we build)

### Phase 2: Execution Setup (Claude #2 - Parallel Sessions)

**Worktree Strategy:**

```
~/projects/exam-prep-platform/
├── main/                    # Main branch (docs only)
├── .worktrees/
│   ├── backend-api/         # Claude #2A - Backend worktree
│   ├── frontend-auth/       # Claude #2B - Auth & dashboard
│   ├── questions-system/    # Claude #2C - Questions & credits
│   └── payment-paywall/     # Claude #2D - Stripe integration
```

**Parallel Execution Plan:**

| Worktree | Task | Dependencies | Claude Instance |
|----------|------|--------------|-----------------|
| backend-api | Database + API | None | #2A |
| frontend-auth | Auth + Dashboard | None | #2B |
| questions-system | Questions + Credits | backend-api | #2C |
| payment-paywall | Stripe + Paywall | backend-api | #2D |

### Phase 3: Review & Integration (Claude #3)

**After parallel work completes:**
1. Merge all worktrees to main
2. End-to-end testing
3. Bug fixing with Codex
4. Performance optimization
5. Deployment

---

## Specific Workflow for This Project

### Step 1: Create Worktrees (5 minutes)
```bash
cd ~/projects/exam-prep-platform
git worktree add .worktrees/backend-api -b feature/backend-api
git worktree add .worktrees/frontend-auth -b feature/frontend-auth
git worktree add .worktrees/questions-system -b feature/questions-system
git worktree add .worktrees/payment-paywall -b feature/payment-paywall
```

### Step 2: Launch Parallel Sessions (Simultaneous)

**Terminal 1 - Backend API:**
```bash
cd .worktrees/backend-api
# Start Claude Code here
# "Implement steps 2.1-2.4 from IMPLEMENTATION_PLAN.md"
```

**Terminal 2 - Frontend Auth:**
```bash
cd .worktrees/frontend-auth
# Start Claude Code here
# "Implement steps 3.1-3.4 from IMPLEMENTATION_PLAN.md"
```

**Terminal 3 - Questions System:**
```bash
cd .worktrees/questions-system
# Wait for backend-api, then:
# "Implement steps 4.1-4.2 from IMPLEMENTATION_PLAN.md"
```

**Terminal 4 - Payment/Paywall:**
```bash
cd .worktrees/payment-paywall
# Wait for backend-api, then:
# "Implement steps 4.3-4.4 from IMPLEMENTATION_PLAN.md"
```

### Step 3: Orchestrator Role

**My job as orchestrator:**
1. Monitor all 4 sessions
2. Answer questions from subagents
3. Resolve conflicts between worktrees
4. Merge when each feature is complete
5. Update progress.txt after each merge

### Step 4: Review Phase

**Final session in main worktree:**
```bash
cd ~/projects/exam-prep-platform
# Merge all branches
git merge feature/backend-api
git merge feature/frontend-auth
git merge feature/questions-system
git merge feature/payment-paywall

# Start Claude Code for review
# "Review entire codebase, run tests, fix bugs"
```

---

## Key Adaptations for 5-Hour/Week Constraint

**The guide assumes full-time availability. We need to adapt:**

### 1. Async Workflow
- Don't wait in real-time for subagents
- Set them up, let them run, review later
- Use progress.txt to track async

### 2. Smaller Work Units
Instead of 4 parallel worktrees, maybe 2:
- Worktree A: Backend + Database
- Worktree B: Frontend + Integration

### 3. Checkpoint-Based
- Each session: pick up from progress.txt
- Complete 1-2 steps per week
- Don't try to do everything at once

### 4. Leverage Existing Code
- Use shadcn/ui components (don't build from scratch)
- Use Clerk for auth (don't roll own)
- Use Stripe Checkout (don't build payment UI)

---

## Critical Success Factors

### 1. CLAUDE.md Must Be Perfect
Every Claude instance reads this first. It needs:
- Exact tech stack versions
- File naming conventions
- Component patterns
- Forbidden actions
- Reference to all 6 docs

### 2. Progress.txt Must Be Updated
Without this, each session starts blind:
```
COMPLETED:
- Database schema created
- Auth endpoints working
- Login/signup pages built

IN PROGRESS:
- Credit system implementation
- Question generation script

BLOCKED:
- Stripe integration (waiting for credit system)

NEXT:
- Paywall page
- Question practice UI
- Testing & deployment
```

### 3. Lessons.md Self-Improvement
After every mistake:
```
## 2026-02-05 - Database Connection Issue
Mistake: Used wrong connection string format for Turso
Fix: Always use 'libsql://' protocol with Turso client
Rule: Check TECH_STACK.md for exact connection patterns
```

---

## My Recommended Approach for This Project

Given your constraints (5 hrs/week, engineering student), here's the realistic path:

### Week 1: Foundation (5 hours)
- Day 1: Process PDFs, extract questions
- Day 2-3: Backend API in worktree #1
- Day 4-5: Frontend auth in worktree #2

### Week 2: Core Features (5 hours)
- Day 1-2: Questions system in worktree #3
- Day 3-4: Payment integration in worktree #4
- Day 5: Merge and test

### Week 3: Polish (5 hours)
- Mobile responsiveness
- Bug fixes
- Stripe test mode verification

### Week 4: Launch (5 hours)
- Deploy to production
- Test with friends
- Iterate based on feedback

**Total:** 20 hours over 4 weeks (fits your timeline before exams)

---

## Next Actions

1. ✅ All planning docs created
2. 🔄 Create .worktrees/ directory
3. 🔄 Set up 2 parallel worktrees (not 4 - too much for 5 hrs/week)
4. 🔄 Start with backend worktree first
5. 🔄 Once backend is solid, start frontend worktree

**To start:**
```bash
cd ~/projects/exam-prep-platform
git worktree add .worktrees/backend -b feature/backend
# Then: cd .worktrees/backend and start Claude Code
```

---

## Stored to Semantic Memory

Key concept: "Multi-Claude workflow - Planner creates docs, Orchestrator manages parallel worktrees, Reviewer tests. 6 canonical docs required before code. CLAUDE.md + progress.txt + lessons.md for session persistence."
