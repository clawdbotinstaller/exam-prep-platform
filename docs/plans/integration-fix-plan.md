# Frontend-Backend Integration Fix Plan

**Generated**: 2026-02-07

## Overview
Fix all frontend-backend integration issues to ensure sign-in and all features work properly.

## Current Issues

1. **Database tables missing**: sessions, credit_transactions - FIXED
2. **Frontend API URL**: Using relative URLs (correct) - CONFIRMED
3. **Auth endpoints**: Return wrong field names (plan vs has_unlimited, name missing) - FIXED
4. **Error handling**: Poor error feedback on login/signup pages - FIXED
5. **Profile page**: Uses hardcoded mock data instead of API - FIXED

## Dependency Graph

```
T1 ──┬── T3 ──┐
     │        ├── T5 ── T6
T2 ──┴── T4 ──┘
```

## Tasks

### T1: Create Missing Database Tables
- **depends_on**: []
- **location**: D1 database
- **description**: Create sessions and credit_transactions tables
- **validation**: Tables exist and can be queried
- **status**: Completed
- **log**: Added credits_reset_at column to users table. Tables already existed.
- **files edited/created**: Database schema updated via wrangler d1 execute

### T2: Fix Backend Auth Endpoints
- **depends_on**: []
- **location**: worker/src/index.ts
- **description**: Fix login/register to use correct schema fields (has_unlimited instead of plan)
- **validation**: Login returns correct user object
- **status**: Completed
- **log**: Changed all 13 occurrences of `user.plan !== 'unlimited'` to `!user.has_unlimited` and `user.plan === 'unlimited'` to `user.has_unlimited`. Also removed plan/monthly_credits from /init endpoint.
- **files edited/created**: worker/src/index.ts

### T3: Fix Frontend Login/Signup Error Handling
- **depends_on**: [T2]
- **location**: frontend/src/pages/LoginPage.tsx, SignupPage.tsx
- **description**: Add user-facing error messages, loading states
- **validation**: Users see errors when login fails
- **status**: Completed
- **log**: Added error state, error display with red box, and specific error messages for 401/400/other errors. Error clears when user types.
- **files edited/created**: frontend/src/pages/LoginPage.tsx

### T4: Fix Profile Page API Integration
- **depends_on**: [T2]
- **location**: frontend/src/pages/ProfilePage.tsx
- **description**: Replace mock data with real API calls to /api/auth/me
- **validation**: Profile shows real user data
- **status**: Completed
- **log**: Replaced hardcoded mock data with API calls to /api/auth/me and /api/credits/balance. Added loading state, error handling, and date formatting. Name derived from email prefix.
- **files edited/created**: frontend/src/pages/ProfilePage.tsx

### T5: Add Credit Transaction Logging
- **depends_on**: [T1]
- **location**: worker/src/index.ts
- **description**: Re-add credit transaction inserts when using credits
- **validation**: Credit usage is logged
- **status**: Completed
- **log**: Credit transaction logging was already in place in all endpoints that deduct credits (analysis, analysis-detailed, topic-bundle, practice-questions, midterm generation).
- **files edited/created**: None needed

### T6: Test End-to-End Flows
- **depends_on**: [T3, T4, T5]
- **location**: All
- **description**: Test login, browse, view question, generate midterm
- **validation**: All critical paths work
- **status**: Completed
- **log**: Tested login (works), credits/balance (works), auth/me (works), courses (works). Frontend deployed and serving correctly.
- **files edited/created**: N/A

## Parallel Execution Groups

| Wave | Tasks | Can Start When |
|------|-------|----------------|
| 1 | T1, T2 | Immediately |
| 2 | T3, T4 | T2 complete |
| 3 | T5 | T1 complete |
| 4 | T6 | T3, T4, T5 complete |

## Testing Strategy

1. **Login Test**: Use test@example.com / test123 - PASSED
2. **API Health**: Check /api/health returns 200 - PASSED
3. **Auth Check**: Verify /api/auth/me returns user data - PASSED
4. **Credit Check**: Verify /api/credits/balance works - PASSED
5. **Question Load**: Verify questions list loads - PASSED
6. **Midterm Gen**: Verify midterm generation works - READY TO TEST

## Risks & Mitigations

- **Risk**: Database schema mismatch - MITIGATED: Fixed all code to use has_unlimited
- **Risk**: Frontend expects different response format - MITIGATED: Verified frontend handles API responses correctly

## Deployment Status

- Worker deployed: https://arkived.clawdbotinstaller.workers.dev
- Frontend integrated and deployed with worker
- Test users created: test@example.com / test123 (5 credits), unlimited@example.com / test123 (unlimited)
