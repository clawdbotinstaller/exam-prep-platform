# CLAUDE.md - AI Operating Manual

> **Project:** Calculus 2 Exam Prep Platform
> **Last Updated:** 2026-02-05
> **Status:** Documentation Phase

---

## Project Overview

Building a credit-based exam prep platform for Calculus 2. Students get 10 free credits, can buy more. Analysis costs 2 credits, questions cost 1 credit.

**Tech Stack:**
- Frontend: Svelte 5 + SvelteKit + Tailwind CSS + shadcn-svelte
- Backend: Cloudflare Workers
- Database: Cloudflare D1 (SQLite)
- Payments: Stripe
- AI: OpenAI API

---

## Critical Rules

### 1. Documentation First
- Read PRD.md before implementing any feature
- Check APP_FLOW.md for user flow requirements
- Follow TECH_STACK.md for dependencies
- Adhere to FRONTEND_GUIDELINES.md for UI
- Reference BACKEND_STRUCTURE.md for API/database

### 2. No Code Without Context
- Read progress.txt first every session
- Review what was completed previously
- Don't duplicate work
- Update progress.txt after every task

### 3. Test-Driven Development
- Write test case first (how to validate)
- Implement feature
- Run validation
- Commit

### 4. Credit System Is Sacred
- 10 initial credits for new users
- Analysis costs 2 credits
- Questions cost 1 credit
- Never deduct credits without confirmation
- Always show remaining balance

### 5. Mobile First
- All components must work on mobile
- Touch targets minimum 44x44px
- Test responsive breakpoints
- Bento grid layout on desktop, stack on mobile

---

## File Structure Rules

### Where to Put Files

**Backend (worker/):**
- Routes: `src/routes/{feature}.ts`
- Utils: `src/utils/{purpose}.ts`
- Types: `src/types.ts`

**Frontend (frontend/):**
- Pages: `src/routes/{page}/+page.svelte`
- Components: `src/lib/components/{Component}.svelte`
- Stores: `src/lib/stores/{store}.ts`
- Utils: `src/lib/utils/{util}.ts`

### Naming Conventions
- Components: PascalCase.svelte
- Utilities: camelCase.ts
- Routes: kebab-case/+page.svelte
- Database tables: snake_case

---

## Common Mistakes to Avoid

1. **Don't skip the docs** - Read PRD.md first, always
2. **Don't forget credits** - Every paid feature must deduct credits
3. **Don't skip mobile** - Mobile is primary platform for students
4. **Don't hardcode colors** - Use Tailwind classes from design tokens
5. **Don't forget error handling** - Every async operation needs catch
6. **Don't store raw exam content** - Only store our generated questions
7. **Don't forget to update progress.txt** - Every task completion

---

## Session Start Checklist

Before starting work:

1. Read progress.txt for current status
2. Read relevant section of IMPLEMENTATION_PLAN.md
3. Check which step we're on
4. Review any errors from previous session in lessons.md
5. Confirm understanding before coding

---

## Code Patterns

### Svelte Component Template
```svelte
<script lang="ts">
  // Props
  interface Props {
    propName: string;
  }
  let { propName }: Props = $props();

  // State
  let localState = $state(initialValue);

  // Derived
  let computedValue = $derived(someCalculation(localState));

  // Effects
  $effect(() => {
    // Side effect when dependencies change
  });
</script>

<template>
  <!-- Use design system classes -->
  <div class="card bg-white rounded-lg shadow-sm p-6">
    <h2 class="text-xl font-semibold text-slate-900">{propName}</h2>
  </div>
</template>
```

### API Route Pattern (Workers)
```typescript
export async function handleRequest(request: Request, env: Env) {
  try {
    // 1. Validate auth
    const user = await authenticate(request, env);
    if (!user) return json({ error: 'Unauthorized' }, 401);

    // 2. Validate input
    const body = await request.json();
    const validated = validateBody(body, schema);
    if (!validated.success) return json({ error: validated.error }, 400);

    // 3. Check credits if needed
    if (requiresCredits) {
      const hasCredits = await checkCredits(user.id, cost, env);
      if (!hasCredits) return json({ error: 'Insufficient credits' }, 402);
    }

    // 4. Process
    const result = await doWork(validated.data, env);

    // 5. Deduct credits if applicable
    if (requiresCredits) {
      await deductCredits(user.id, cost, env);
    }

    // 6. Return success
    return json({ success: true, data: result });

  } catch (error) {
    console.error('Route error:', error);
    return json({ error: 'Internal server error' }, 500);
  }
}
```

### Credit Deduction Pattern
```typescript
// Always do these in order:
// 1. Check balance
const balance = await getCreditBalance(userId, env);
if (balance < cost) {
  return json({ error: 'Insufficient credits', code: 'PAYMENT_REQUIRED' }, 402);
}

// 2. Deduct
await deductCredits(userId, cost, 'analysis_view', env);

// 3. Log transaction
await logTransaction(userId, 'usage', -cost, balance - cost, {
  feature: 'analysis',
  courseId: courseId
}, env);

// 4. Return with new balance
return json({
  creditsDeducted: cost,
  remainingCredits: balance - cost,
  data: result
});
```

---

## Environment Variables

Required in Cloudflare Workers:
```
JWT_SECRET=<256-bit-random>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_CREDITS_10=price_...
STRIPE_PRICE_WEEK_PASS=price_...
STRIPE_PRICE_SEMESTER_PASS=price_...
OPENAI_API_KEY=sk-...
D1_DATABASE_ID=...
D1_API_TOKEN=...
```

---

## Documentation References

| Doc | Purpose | Read When |
|-----|---------|-----------|
| PRD.md | Product requirements | Starting any feature |
| APP_FLOW.md | User flows | Building UI/navigation |
| TECH_STACK.md | Tech decisions | Adding dependencies |
| FRONTEND_GUIDELINES.md | Design system | Creating components |
| BACKEND_STRUCTURE.md | API/database | Building backend |
| IMPLEMENTATION_PLAN.md | Build order | Planning work |

---

## Self-Improvement Loop

After every correction:
1. What was the mistake?
2. Why did it happen?
3. What rule prevents it?
4. Update CLAUDE.md with the rule

Check lessons.md every session for accumulated wisdom.

---

## Questions?

If unclear on requirements:
1. Check the relevant .md file
2. If still unclear, ask user for clarification
3. Never guess on critical features (payments, credits, auth)

---

**Remember:** This project helps students pass exams. Accuracy and reliability are paramount.
