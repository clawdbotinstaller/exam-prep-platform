# Frontend Hardcoded Data Fixes - Implementation Plan

## Overview
Replace all hardcoded fallback data with proper API calls and add consistent error handling that shows an apology message with a bug report option.

---

## Backend API Status

### Existing Endpoints (Ready to Use)
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/featured-question` | GET | Featured question for homepage |
| `/api/questions` | GET | List all questions |
| `/api/topics` | GET | List all topics |
| `/api/courses/calc2/topics/public` | GET | Public course topics |

### Missing Endpoints (Need Creation)
| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/contact` | POST | Contact form submission | HIGH |
| `/api/stats` | GET | Platform stats (question count, etc.) | MEDIUM |

---

## Components to Fix

### 1. QuestionSpotlight.tsx
**Current Issue:** Hardcoded fallback question (lines 49-61)
**Fix:** Remove fallback, show error state

**Changes:**
- Remove the `setQuestion({...})` fallback in catch block
- Set `question` to `null` on error
- Add error state: `const [error, setError] = useState<string | null>(null)`
- Render `<ErrorApology />` component when error occurs

**Error Display:**
```tsx
if (error) {
  return (
    <ErrorApology
      message="We couldn't load the featured question."
      errorDetails={error}
      onRetry={() => window.location.reload()}
    />
  );
}
```

---

### 2. TopicDeepDive.tsx
**Current Issue:** Hardcoded fallback questions (lines 64-84)
**Fix:** Remove fallbacks, show error state

**Changes:**
- Remove `setQuickQuestion({...})` and `setExamQuestion({...})` fallbacks
- Set both to `null` on error
- Add error state
- Render `<ErrorApology />` in place of cards when error occurs

**Note:** Background word "INTEGRATION" (line 224) can stay as it's decorative

---

### 3. TopicBreakdown.tsx
**Current Issue:** Hardcoded fallback topics (lines 54-60)
**Fix:** Remove fallback, show error state

**Changes:**
- Remove the `setTopics([...])` fallback array
- Set `topics` to empty array on error
- Show `<ErrorApology />` when topics.length === 0 && error

---

### 4. ContactSection.tsx
**Current Issue:** Form submission is non-functional (line 72-75 just sets state)
**Fix:** Add actual API call and proper error handling

**Changes:**
- Create `POST /api/contact` endpoint in backend (see below)
- Add `isSubmitting` state
- Add `error` state
- Update `handleSubmit` to make actual API call:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setError(null);

  try {
    await apiPost('/api/contact', formData);
    setSubmitted(true);
  } catch (err) {
    setError('Failed to send message. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## New Components to Create

### ErrorApology Component
**File:** `frontend/src/components/ErrorApology.tsx`

**Props:**
```tsx
interface ErrorApologyProps {
  title?: string;
  message?: string;
  errorDetails?: string;
  onRetry?: () => void;
  className?: string;
}
```

**Design:**
- Uses existing `index-card` styling
- Red "Error" stamp using `exam-stamp-red` class
- Apology message: "We're sorry, something went wrong."
- "Report this issue" button that opens contact form with pre-filled details
- Optional "Try Again" button if `onRetry` provided

**Pre-filled Bug Report:**
When user clicks "Report this issue", open contact form with:
- Subject: "Bug Report: [Component Name]"
- Message: "I encountered an error while using the site.\n\nError details: [errorDetails]\n\nPlease look into this issue."

---

## Backend Changes Required

### 1. Create Contact Endpoint
**File:** `worker/src/index.ts`

Add:
```typescript
app.post('/api/contact', async (c) => {
  const { name, email, subject, message } = await c.req.json();

  // Validate required fields
  if (!name || !email || !message) {
    return c.json({ error: 'Name, email, and message are required' }, 400);
  }

  // Store in database (create contact_submissions table)
  const db = c.env.DB;
  await db.prepare(
    'INSERT INTO contact_submissions (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, datetime("now"))'
  ).bind(name, email, subject || 'No subject', message).run();

  // Optional: Send email notification
  // await sendNotificationEmail({ name, email, subject, message });

  return c.json({ success: true, message: 'Your message has been sent' });
});
```

### 2. Create Contact Submissions Table
Add to database initialization:
```sql
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'new'
);
```

### 3. Create Stats Endpoint (Optional)
```typescript
app.get('/api/stats', async (c) => {
  const db = c.env.DB;

  const [questionCount, examCount, topicCount] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM questions').first(),
    db.prepare('SELECT COUNT(*) as count FROM exams').first(),
    db.prepare('SELECT COUNT(*) as count FROM topics').first()
  ]);

  return c.json({
    questions: questionCount?.count || 0,
    exams: examCount?.count || 0,
    topics: topicCount?.count || 0,
    years: '2022-2024'
  });
});
```

---

## Marketing Content Components (Keep Hardcoded)

These components contain marketing copy and don't need API integration:

| Component | Content | Reason |
|-----------|---------|--------|
| HeroSection.tsx | Date stamp, subheadline, feature pills | Marketing copy - changes rarely |
| StudyFlow.tsx | Steps array, stats row | Product explanation - static |
| ContactSection.tsx | Benefits list | Value proposition - static |

**Note:** Stats in StudyFlow ("80+ questions, 5 years") should ideally come from `/api/stats` but can stay hardcoded for MVP.

---

## Implementation Order

### Phase 1: Create ErrorApology Component
1. Create `frontend/src/components/ErrorApology.tsx`
2. Add to exports
3. Test in isolation

### Phase 2: Backend Contact Endpoint
1. Add `contact_submissions` table to worker
2. Add `POST /api/contact` endpoint
3. Deploy worker
4. Test endpoint

### Phase 3: Fix Components (Parallel)
1. QuestionSpotlight.tsx - remove fallback
2. TopicDeepDive.tsx - remove fallback
3. TopicBreakdown.tsx - remove fallback
4. ContactSection.tsx - add API call

### Phase 4: Testing
1. Test error states by blocking API calls
2. Verify bug report form pre-fills correctly
3. Test contact form submission
4. Verify all components show real data

---

## Files Modified

| File | Changes |
|------|---------|
| `frontend/src/components/ErrorApology.tsx` | NEW - Error apology component |
| `frontend/src/sections/QuestionSpotlight.tsx` | Remove fallback, add error state |
| `frontend/src/sections/TopicDeepDive.tsx` | Remove fallback, add error state |
| `frontend/src/sections/TopicBreakdown.tsx` | Remove fallback, add error state |
| `frontend/src/sections/ContactSection.tsx` | Add API call, loading/error states |
| `worker/src/index.ts` | Add contact endpoint and table |

---

## Success Criteria

- [ ] No component shows fake/hardcoded data when API fails
- [ ] All components show apology message with bug report option on error
- [ ] Contact form actually submits to backend
- [ ] Bug report button pre-fills contact form with error details
- [ ] All existing functionality still works when APIs succeed
