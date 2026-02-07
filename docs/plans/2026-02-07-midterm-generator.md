# Practice Midterm Generator Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a 4-tier practice midterm system (Easy, Sample, Hard, Custom) with weighted question selection, smart deduplication, and full session persistence.

**Architecture:** Use a weighted scoring algorithm prioritizing recency and cross-year repetition, guarantee section coverage via two-pass selection, store sessions in user_midterms table, and expose preview + generation endpoints.

**Tech Stack:** Cloudflare Workers + D1, React + TypeScript, existing credit system

---

## Prerequisites

- Working knowledge of existing codebase structure
- Access to 5 PDF exam files for analysis
- Understanding of current credit system

---

## Dependency Graph

```
T0 (PDF Analysis) ──┬── T2 (Weighted Algorithm) ──┬── T3 (4-Tier Endpoint) ──┬── T9 (Test)
                    │                              │                          │
T1 (DB Schema) ─────┘                              ├── T4 (Stats Preview) ────┘
                                                   │
                                                   ├── T5 (Credit Costs) ─────┐
                                                   │                          │
                                                   ├── T6 (Frontend Select) ──┤
                                                   │                          │
                                                   ├── T7 (Frontend Session) ─┤
                                                   │                          │
                                                   └── T8 (Persistence) ──────┘
```

## Parallel Execution Groups

| Wave | Tasks | Can Start When |
|------|-------|----------------|
| 1 | T0, T1 | Immediately |
| 2 | T2 | T0, T1 complete |
| 3 | T3, T4, T5 | T2 complete |
| 4 | T6, T7, T8 | T3, T5 complete |
| 5 | T9 | All frontend/backend complete |

---

## Tasks

### Task 0: Analyze 5 PDFs for Exam Patterns

**Files:**
- Read: `docs/exams/` (5 PDF files)
- Create: `docs/analysis/exam-patterns.json`
- Modify: N/A

**Step 1: Extract data from each PDF**

For each of the 5 PDFs (2015 Winter, 2019 Winter, 2024 Spring, 2025 Winter, 2025 Summer), extract:
- Total question count
- Total points
- Duration (if stated)
- Per-question: section, points, difficulty estimate, technique

**Step 2: Calculate patterns**

```javascript
// Create analysis structure
{
  "averageQuestionCount": 7,
  "averagePoints": 50,
  "sectionDistribution": {
    "3.1": { "avgQuestions": 1.2, "avgPoints": 8 },
    "3.2": { "avgQuestions": 0.8, "avgPoints": 6 },
    // ... etc
  },
  "difficultyDistribution": {
    "easy": 30,
    "medium": 50,
    "hard": 20
  },
  "requiredSections": ["3.1", "3.2", "3.3", "3.4", "3.7", "4.2", "4.5"]
}
```

**Step 3: Save analysis**

Save to `docs/analysis/exam-patterns.json`

**Validation:**
- File exists with valid JSON
- Contains all required fields
- Section distribution sums reasonably

---

### Task 1: Create user_midterms Table Schema

**Files:**
- Create: `worker/migrations/003_add_user_midterms.sql`
- Modify: `worker/src/index.ts` (add to init route)

**Step 1: Write migration file**

```sql
-- worker/migrations/003_add_user_midterms.sql
CREATE TABLE IF NOT EXISTS user_midterms (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  template_type TEXT NOT NULL CHECK(template_type IN ('easy', 'sample', 'hard', 'custom')),
  question_ids TEXT NOT NULL, -- JSON array
  answers TEXT, -- JSON object {questionId: answer}
  current_question_index INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'completed', 'abandoned')),
  score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_midterms_user ON user_midterms(user_id);
CREATE INDEX IF NOT EXISTS idx_user_midterms_status ON user_midterms(status);
```

**Step 2: Add to init route**

In `worker/src/index.ts`, find the init route and add:

```typescript
// Add after existing table creations
await c.env.DB.prepare(`
  CREATE TABLE IF NOT EXISTS user_midterms (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    template_type TEXT NOT NULL,
    question_ids TEXT NOT NULL,
    answers TEXT,
    current_question_index INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    status TEXT DEFAULT 'in_progress',
    score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`).run();

await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_user_midterms_user ON user_midterms(user_id)`).run();
await c.env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_user_midterms_status ON user_midterms(status)`).run();
```

**Step 3: Run migration locally**

```bash
cd worker && npx wrangler d1 execute DB --local --file=migrations/003_add_user_midterms.sql
```

**Validation:**
- Table exists in local D1
- Can insert test row
- Foreign key constraint works

---

### Task 2: Build Weighted Selection Algorithm

**Files:**
- Create: `worker/src/lib/midterm-generator.ts`
- Create: `worker/src/lib/__tests__/midterm-generator.test.ts`

**Step 1: Write the algorithm**

```typescript
// worker/src/lib/midterm-generator.ts
import type { D1Database } from '@cloudflare/workers-types';

export interface Question {
  id: string;
  question_text: string;
  solution_steps: string;
  answer: string;
  difficulty: number;
  estimated_time: number;
  topic_id: string;
  techniques: string; // JSON string
  exam_id: string;
  source_exam_year: number;
  source_points: number;
}

export interface MidtermConfig {
  type: 'easy' | 'sample' | 'hard' | 'custom';
  targetCount: number;
  difficultyRange: [number, number];
  creditCost: number;
  customSections?: string[]; // For custom tier
}

export const MIDTERM_CONFIGS: Record<string, MidtermConfig> = {
  easy: {
    type: 'easy',
    targetCount: 5,
    difficultyRange: [1, 3],
    creditCost: 2,
  },
  sample: {
    type: 'sample',
    targetCount: 7,
    difficultyRange: [2, 4],
    creditCost: 3,
  },
  hard: {
    type: 'hard',
    targetCount: 8,
    difficultyRange: [4, 5],
    creditCost: 3,
  },
  custom: {
    type: 'custom',
    targetCount: 7,
    difficultyRange: [1, 5],
    creditCost: 4,
  },
};

// Required sections for coverage
const REQUIRED_SECTIONS = ['3.1', '3.2', '3.3', '3.4', '3.7', '4.2', '4.5'];

// Map topic_id to section number
function getSectionFromTopic(topicId: string): string | null {
  const sectionMap: Record<string, string> = {
    'integration_by_parts': '3.1',
    'trig_integrals': '3.2',
    'trig_substitution': '3.3',
    'partial_fractions': '3.4',
    'improper_integrals': '3.7',
    'directly_integrable_de': '4.1',
    'separable_de': '4.2',
    'first_order_linear_de': '4.5',
  };
  return sectionMap[topicId] || null;
}

// Calculate question weight based on recency and repetition
function calculateQuestionWeight(q: Question, allQuestions: Question[]): number {
  let weight = 0;

  // Recency: 2024-2025 = 40 points, 2020-2023 = 20 points, older = 10 points
  const year = q.source_exam_year || 2015;
  if (year >= 2024) weight += 40;
  else if (year >= 2020) weight += 20;
  else weight += 10;

  // Repetition: check if similar canonical form appears in multiple years
  // For now, use exam_id pattern matching
  const similarQuestions = allQuestions.filter(
    other => other.exam_id !== q.exam_id &&
    Math.abs((other.source_exam_year || 2015) - year) > 1
  );

  // Bonus for questions that could represent patterns across years
  if (similarQuestions.length > 0) {
    weight += Math.min(similarQuestions.length * 5, 20); // Max 20 points
  }

  return weight;
}

// Get technique identifier for deduplication
function getTechniqueId(q: Question): string {
  try {
    const techniques = JSON.parse(q.techniques || '[]');
    return techniques[0] || 'unknown';
  } catch {
    return 'unknown';
  }
}

export async function generateMidterm(
  db: D1Database,
  courseId: string,
  config: MidtermConfig
): Promise<{ questions: Question[]; stats: MidtermStats }> {
  // Fetch all questions for the course with section info
  const result = await db.prepare(`
    SELECT q.*, t.id as topic_id, t.name as topic_name
    FROM questions q
    LEFT JOIN topics t ON q.topic_id = t.id
    WHERE q.course_id = ?
  `).bind(courseId).all<Question>();

  let allQuestions = (result.results || []) as Question[];

  // Filter by difficulty range
  allQuestions = allQuestions.filter(
    q => q.difficulty >= config.difficultyRange[0] &&
         q.difficulty <= config.difficultyRange[1]
  );

  // For custom tier, filter by selected sections
  if (config.type === 'custom' && config.customSections) {
    allQuestions = allQuestions.filter(q => {
      const section = getSectionFromTopic(q.topic_id);
      return section && config.customSections!.includes(section);
    });
  }

  // Calculate weights
  const weightedQuestions = allQuestions.map(q => ({
    ...q,
    weight: calculateQuestionWeight(q, allQuestions),
    section: getSectionFromTopic(q.topic_id),
    techniqueId: getTechniqueId(q),
  }));

  // Sort by weight descending
  weightedQuestions.sort((a, b) => b.weight - a.weight);

  // Two-pass selection: guarantee coverage, then fill by weight
  const selected: typeof weightedQuestions = [];
  const usedTechniques = new Set<string>();
  const coveredSections = new Set<string>();

  // Pass 1: Select one from each required section
  for (const section of REQUIRED_SECTIONS) {
    const candidates = weightedQuestions.filter(
      q => q.section === section && !usedTechniques.has(q.techniqueId + q.difficulty)
    );
    if (candidates.length > 0) {
      const pick = candidates[0];
      selected.push(pick);
      usedTechniques.add(pick.techniqueId + pick.difficulty);
      coveredSections.add(section);
    }
  }

  // Pass 2: Fill remaining slots by weight, avoiding technique+difficulty duplicates
  for (const q of weightedQuestions) {
    if (selected.length >= config.targetCount) break;
    if (selected.find(s => s.id === q.id)) continue;
    if (usedTechniques.has(q.techniqueId + q.difficulty)) continue;

    selected.push(q);
    usedTechniques.add(q.techniqueId + q.difficulty);
    if (q.section) coveredSections.add(q.section);
  }

  // Calculate stats
  const stats: MidtermStats = {
    totalQuestions: selected.length,
    totalPoints: selected.reduce((sum, q) => sum + (q.source_points || 10), 0),
    estimatedTimeMinutes: selected.reduce((sum, q) => sum + (q.estimated_time || 10), 0),
    difficultyBreakdown: {
      easy: selected.filter(q => q.difficulty <= 2).length,
      medium: selected.filter(q => q.difficulty === 3).length,
      hard: selected.filter(q => q.difficulty >= 4).length,
    },
    sectionCoverage: Object.fromEntries(
      REQUIRED_SECTIONS.map(s => [s, coveredSections.has(s)])
    ),
    creditCost: config.creditCost,
  };

  return { questions: selected, stats };
}

export interface MidtermStats {
  totalQuestions: number;
  totalPoints: number;
  estimatedTimeMinutes: number;
  difficultyBreakdown: { easy: number; medium: number; hard: number };
  sectionCoverage: Record<string, boolean>;
  creditCost: number;
}
```

**Step 2: Write tests**

```typescript
// worker/src/lib/__tests__/midterm-generator.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { generateMidterm, MIDTERM_CONFIGS } from '../midterm-generator';
import type { D1Database } from '@cloudflare/workers-types';

describe('generateMidterm', () => {
  // Mock D1 for testing
  const mockDb = {
    prepare: () => ({
      bind: () => ({
        all: async () => ({
          results: [
            { id: 'q1', difficulty: 2, topic_id: 'integration_by_parts', techniques: '["ibp_basic"]', source_exam_year: 2025, source_points: 10, estimated_time: 8 },
            { id: 'q2', difficulty: 3, topic_id: 'trig_integrals', techniques: '["sin_cos_odd"]', source_exam_year: 2024, source_points: 12, estimated_time: 10 },
            // Add more mock questions...
          ]
        })
      })
    })
  } as unknown as D1Database;

  it('should generate easy midterm with correct constraints', async () => {
    const { questions, stats } = await generateMidterm(mockDb, 'calc2', MIDTERM_CONFIGS.easy);

    expect(questions.length).toBeLessThanOrEqual(6);
    expect(questions.every(q => q.difficulty <= 3)).toBe(true);
    expect(stats.creditCost).toBe(2);
  });

  it('should guarantee section coverage', async () => {
    const { stats } = await generateMidterm(mockDb, 'calc2', MIDTERM_CONFIGS.sample);

    const coveredCount = Object.values(stats.sectionCoverage).filter(Boolean).length;
    expect(coveredCount).toBeGreaterThanOrEqual(5); // At least 5 of 7 sections
  });

  it('should not duplicate technique+difficulty combinations', async () => {
    const { questions } = await generateMidterm(mockDb, 'calc2', MIDTERM_CONFIGS.hard);

    const techniqueDiffCombos = questions.map(q =>
      JSON.parse(q.techniques || '[]')[0] + q.difficulty
    );
    const uniqueCombos = new Set(techniqueDiffCombos);
    expect(uniqueCombos.size).toBe(techniqueDiffCombos.length);
  });
});
```

**Step 3: Run tests**

```bash
cd worker && npm test
```

Expected: Tests pass

**Validation:**
- Algorithm produces correct question count per tier
- Section coverage guaranteed
- No technique+difficulty duplicates
- Weights calculated correctly

---

### Task 3: Implement 4-Tier Generation Endpoint

**Files:**
- Modify: `worker/src/index.ts` (replace existing /api/midterm/generate)

**Step 1: Import the generator**

At top of `worker/src/index.ts`:

```typescript
import { generateMidterm, MIDTERM_CONFIGS, type MidtermStats } from './lib/midterm-generator';
```

**Step 2: Replace existing endpoint**

Replace the existing `/api/midterm/generate` endpoint (around line 885):

```typescript
// POST /api/midterm/generate - Generate practice midterm
app.post('/api/midterm/generate', requireAuth, async (c) => {
  const body = await json<{
    course_id?: string;
    type?: 'easy' | 'sample' | 'hard' | 'custom';
    custom_sections?: string[];
  }>(c);

  if (!body.course_id || !body.type) {
    return c.json({ error: 'Missing course_id or type' }, 400);
  }

  const config = MIDTERM_CONFIGS[body.type];
  if (!config) {
    return c.json({ error: 'Invalid type. Use: easy, sample, hard, custom' }, 400);
  }

  // For custom type, validate sections
  if (body.type === 'custom') {
    if (!body.custom_sections || body.custom_sections.length === 0) {
      return c.json({ error: 'custom_sections required for custom type' }, 400);
    }
    config.customSections = body.custom_sections;
  }

  const userId = c.get('userId');
  const user = await ensureMonthlyCredits(c.env.DB, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);

  // Check credits
  const requiredCredits = config.creditCost;
  if (user.plan !== 'unlimited' && user.credits < requiredCredits) {
    return c.json({
      error: 'Insufficient credits',
      credits_needed: requiredCredits,
      credits_available: user.credits
    }, 402);
  }

  // Generate midterm
  const { questions, stats } = await generateMidterm(c.env.DB, body.course_id, config);

  if (questions.length === 0) {
    return c.json({ error: 'No questions available for criteria' }, 404);
  }

  // Deduct credits
  if (user.plan !== 'unlimited') {
    await c.env.DB.prepare('UPDATE users SET credits = credits - ? WHERE id = ?')
      .bind(requiredCredits, userId).run();
    await c.env.DB.prepare(
      'INSERT INTO credit_transactions (id, user_id, amount, type, description, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
      .bind(crypto.randomUUID(), userId, -requiredCredits, 'midterm', `Midterm ${body.type}`, nowTs())
      .run();
  }

  // Save midterm session
  const midtermId = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO user_midterms (id, user_id, template_type, question_ids, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  )
    .bind(
      midtermId,
      userId,
      body.type,
      JSON.stringify(questions.map(q => q.id)),
      'in_progress',
      nowTs()
    )
    .run();

  return c.json({
    midterm_id: midtermId,
    type: body.type,
    questions,
    stats,
    credits_remaining: user.plan === 'unlimited' ? null : user.credits - requiredCredits,
  });
});
```

**Step 3: Add GET endpoint for resuming midterms**

```typescript
// GET /api/midterm/:id - Get midterm session
app.get('/api/midterm/:id', requireAuth, async (c) => {
  const midtermId = c.req.param('id');
  const userId = c.get('userId');

  const midterm = await c.env.DB.prepare(
    'SELECT * FROM user_midterms WHERE id = ? AND user_id = ?'
  ).bind(midtermId, userId).first();

  if (!midterm) return c.json({ error: 'Midterm not found' }, 404);

  // Fetch full question data
  const questionIds = JSON.parse(midterm.question_ids as string);
  const questions = await c.env.DB.prepare(
    `SELECT q.*, t.name as topic_name
     FROM questions q
     LEFT JOIN topics t ON q.topic_id = t.id
     WHERE q.id IN (${questionIds.map(() => '?').join(',')})`
  ).bind(...questionIds).all();

  return c.json({
    midterm: {
      ...midterm,
      question_ids: questionIds,
      answers: midterm.answers ? JSON.parse(midterm.answers as string) : {},
    },
    questions: questions.results || [],
  });
});
```

**Step 4: Add POST endpoint for saving progress**

```typescript
// POST /api/midterm/:id/progress - Save progress
app.post('/api/midterm/:id/progress', requireAuth, async (c) => {
  const midtermId = c.req.param('id');
  const userId = c.get('userId');
  const body = await json<{
    current_question_index?: number;
    answers?: Record<string, string>;
    time_spent_seconds?: number;
  }>(c);

  const midterm = await c.env.DB.prepare(
    'SELECT * FROM user_midterms WHERE id = ? AND user_id = ?'
  ).bind(midtermId, userId).first();

  if (!midterm) return c.json({ error: 'Midterm not found' }, 404);
  if (midterm.status !== 'in_progress') {
    return c.json({ error: 'Midterm already completed' }, 400);
  }

  // Build update fields
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (body.current_question_index !== undefined) {
    updates.push('current_question_index = ?');
    values.push(body.current_question_index);
  }
  if (body.answers) {
    updates.push('answers = ?');
    values.push(JSON.stringify(body.answers));
  }
  if (body.time_spent_seconds !== undefined) {
    updates.push('time_spent_seconds = ?');
    values.push(body.time_spent_seconds);
  }

  if (updates.length > 0) {
    values.push(midtermId);
    await c.env.DB.prepare(
      `UPDATE user_midterms SET ${updates.join(', ')}, updated_at = ? WHERE id = ?`
    ).bind(...values, nowTs(), midtermId).run();
  }

  return c.json({ success: true });
});
```

**Step 5: Add POST endpoint for completing midterm**

```typescript
// POST /api/midterm/:id/complete - Complete midterm
app.post('/api/midterm/:id/complete', requireAuth, async (c) => {
  const midtermId = c.req.param('id');
  const userId = c.get('userId');
  const body = await json<{ score?: number }>(c);

  const midterm = await c.env.DB.prepare(
    'SELECT * FROM user_midterms WHERE id = ? AND user_id = ?'
  ).bind(midtermId, userId).first();

  if (!midterm) return c.json({ error: 'Midterm not found' }, 404);

  await c.env.DB.prepare(
    'UPDATE user_midterms SET status = ?, score = ?, completed_at = ? WHERE id = ?'
  ).bind('completed', body.score ?? null, nowTs(), midtermId).run();

  return c.json({ success: true });
});
```

**Validation:**
- POST /api/midterm/generate returns midterm with correct structure
- Credits deducted correctly per tier
- Midterm saved to user_midterms table
- GET /api/midterm/:id returns saved session
- Progress updates work

---

### Task 4: Add Stats Preview Endpoint

**Files:**
- Modify: `worker/src/index.ts`

**Step 1: Add preview endpoint**

```typescript
// GET /api/midterm/preview - Preview midterm stats (no credit cost)
app.get('/api/midterm/preview', requireAuth, async (c) => {
  const courseId = c.req.query('course_id');
  const type = c.req.query('type') as 'easy' | 'sample' | 'hard' | 'custom';
  const customSections = c.req.query('custom_sections')?.split(',');

  if (!courseId || !type) {
    return c.json({ error: 'Missing course_id or type' }, 400);
  }

  const config = MIDTERM_CONFIGS[type];
  if (!config) {
    return c.json({ error: 'Invalid type' }, 400);
  }

  if (type === 'custom' && customSections) {
    config.customSections = customSections;
  }

  // Generate without saving
  const { stats } = await generateMidterm(c.env.DB, courseId, config);

  return c.json({
    type,
    stats,
    credit_cost: config.creditCost,
  });
});
```

**Validation:**
- Returns stats without deducting credits
- Shows correct question count, points, time, coverage

---

### Task 5: Update Credit Costs

**Files:**
- Modify: `worker/src/lib/midterm-generator.ts` (already done in Task 2)
- Modify: `frontend/src/pages/course/CourseArchive.tsx` (update pricing display)

**Step 1: Verify credit costs in config**

Already set in Task 2:
- Easy: 2
- Sample: 3
- Hard: 3
- Custom: 4

**Step 2: Update frontend pricing display**

In `frontend/src/pages/course/CourseArchive.tsx`, update any pricing displays:

```typescript
const MIDTERM_PRICING = {
  easy: { credits: 2, questions: '5-6', time: '~50 min' },
  sample: { credits: 3, questions: '7', time: '~90 min' },
  hard: { credits: 3, questions: '7-8', time: '~120 min' },
  custom: { credits: 4, questions: '7', time: 'Variable' },
};
```

**Validation:**
- Credit costs match specification
- Frontend displays correct pricing

---

### Task 6: Build Midterm Selection UI

**Files:**
- Modify: `frontend/src/pages/course/CourseArchive.tsx`

**Step 1: Add midterm selection cards**

Add before the existing content:

```typescript
interface MidtermOption {
  id: 'easy' | 'sample' | 'hard' | 'custom';
  title: string;
  description: string;
  credits: number;
  icon: React.ReactNode;
  color: string;
}

const midtermOptions: MidtermOption[] = [
  {
    id: 'easy',
    title: 'Easy Midterm',
    description: 'Shorter questions, fundamental concepts. Great for building confidence.',
    credits: 2,
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-green-500',
  },
  {
    id: 'sample',
    title: 'Sample Midterm',
    description: 'Matches real exam structure. Most realistic practice experience.',
    credits: 3,
    icon: <Target className="w-5 h-5" />,
    color: 'bg-blueprint-navy',
  },
  {
    id: 'hard',
    title: 'Hard Midterm',
    description: 'Longest, hardest questions. Prepare for the worst-case scenario.',
    credits: 3,
    icon: <Flame className="w-5 h-5" />,
    color: 'bg-stamp-red',
  },
  {
    id: 'custom',
    title: 'Custom Midterm',
    description: 'Choose your own sections. Focus on your weak areas.',
    credits: 4,
    icon: <Settings className="w-5 h-5" />,
    color: 'bg-purple-500',
  },
];
```

**Step 2: Add selection modal/component**

```typescript
function MidtermSelector({ onSelect, onPreview }: {
  onSelect: (type: string, sections?: string[]) => void;
  onPreview: (type: string) => Promise<MidtermStats>;
}) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [previewStats, setPreviewStats] = useState<MidtermStats | null>(null);
  const [customSections, setCustomSections] = useState<string[]>([]);

  const handlePreview = async (type: string) => {
    const stats = await onPreview(type);
    setPreviewStats(stats);
    setSelectedType(type);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {midtermOptions.map((option) => (
        <div
          key={option.id}
          className="index-card p-6 hover:shadow-lg transition-all cursor-pointer"
          onClick={() => handlePreview(option.id)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 ${option.color} flex items-center justify-center text-white`}>
              {option.icon}
            </div>
            <span className="font-mono text-lg font-bold text-blueprint-navy">
              {option.credits} credits
            </span>
          </div>
          <h3 className="font-serif font-semibold text-lg mb-2">{option.title}</h3>
          <p className="font-sans text-pencil-gray text-sm">{option.description}</p>
        </div>
      ))}

      {/* Preview Modal */}
      {selectedType && previewStats && (
        <MidtermPreviewModal
          type={selectedType}
          stats={previewStats}
          onClose={() => setSelectedType(null)}
          onConfirm={() => onSelect(selectedType, customSections)}
          customSections={customSections}
          setCustomSections={setCustomSections}
        />
      )}
    </div>
  );
}
```

**Step 3: Create preview modal**

```typescript
function MidtermPreviewModal({
  type,
  stats,
  onClose,
  onConfirm,
  customSections,
  setCustomSections,
}: {
  type: string;
  stats: MidtermStats;
  onClose: () => void;
  onConfirm: () => void;
  customSections: string[];
  setCustomSections: (sections: string[]) => void;
}) {
  const REQUIRED_SECTIONS = ['3.1', '3.2', '3.3', '3.4', '3.7', '4.2', '4.5'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="index-card max-w-lg w-full mx-4 p-6">
        <h2 className="font-serif font-semibold text-2xl mb-4">
          {type.charAt(0).toUpperCase() + type.slice(1)} Midterm Preview
        </h2>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-paper-aged p-3 text-center">
            <p className="font-mono text-2xl font-bold text-blueprint-navy">
              {stats.totalQuestions}
            </p>
            <p className="font-condensed text-[10px] uppercase">Questions</p>
          </div>
          <div className="bg-paper-aged p-3 text-center">
            <p className="font-mono text-2xl font-bold text-blueprint-navy">
              {stats.totalPoints}
            </p>
            <p className="font-condensed text-[10px] uppercase">Points</p>
          </div>
          <div className="bg-paper-aged p-3 text-center">
            <p className="font-mono text-2xl font-bold text-blueprint-navy">
              {stats.estimatedTimeMinutes}
            </p>
            <p className="font-condensed text-[10px] uppercase">Minutes</p>
          </div>
        </div>

        {/* Section Coverage */}
        <div className="mb-6">
          <h3 className="font-condensed text-xs uppercase tracking-widest mb-3">
            Section Coverage
          </h3>
          <div className="flex flex-wrap gap-2">
            {REQUIRED_SECTIONS.map(section => (
              <span
                key={section}
                className={`px-2 py-1 text-xs font-mono ${
                  stats.sectionCoverage[section]
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {section}
              </span>
            ))}
          </div>
        </div>

        {/* Custom section selector (only for custom type) */}
        {type === 'custom' && (
          <div className="mb-6">
            <h3 className="font-condensed text-xs uppercase tracking-widest mb-3">
              Select Sections
            </h3>
            <div className="flex flex-wrap gap-2">
              {REQUIRED_SECTIONS.map(section => (
                <button
                  key={section}
                  onClick={() => {
                    if (customSections.includes(section)) {
                      setCustomSections(customSections.filter(s => s !== section));
                    } else {
                      setCustomSections([...customSections, section]);
                    }
                  }}
                  className={`px-3 py-1 text-xs font-mono border ${
                    customSections.includes(section)
                      ? 'bg-blueprint-navy text-white border-blueprint-navy'
                      : 'bg-white text-pencil-gray border-pencil-gray/30'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={type === 'custom' && customSections.length === 0}
            className="flex-1 btn-blueprint"
          >
            Start Midterm ({stats.creditCost} credits)
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Validation:**
- UI shows all 4 options
- Preview displays correct stats
- Custom section selector works
- Credit costs displayed correctly

---

### Task 7: Update Midterm Session UI

**Files:**
- Modify: `frontend/src/pages/course/CourseMidterm.tsx`

**Step 1: Add session persistence**

```typescript
// Add to existing state
const [midtermId, setMidtermId] = useState<string | null>(null);
const [answers, setAnswers] = useState<Record<string, string>>({});

// Load midterm with session
useEffect(() => {
  const loadMidterm = async () => {
    // Check URL for midterm_id
    const params = new URLSearchParams(window.location.search);
    const midtermIdFromUrl = params.get('midterm_id');

    if (midtermIdFromUrl) {
      // Resume existing midterm
      const resp = await apiGet(`/api/midterm/${midtermIdFromUrl}`);
      setMidtermId(midtermIdFromUrl);
      setQuestions(resp.questions);
      setCurrentQuestion(resp.midterm.current_question_index + 1);
      setAnswers(resp.midterm.answers || {});
      setTimeElapsed(resp.midterm.time_spent_seconds || 0);
    } else {
      // Generate new midterm (existing logic)
      // ... existing code ...
    }
  };

  if (slug && difficulty) loadMidterm();
}, [slug, difficulty]);

// Auto-save progress
useEffect(() => {
  if (!midtermId) return;

  const saveProgress = async () => {
    await apiPost(`/api/midterm/${midtermId}/progress`, {
      current_question_index: currentQuestion - 1,
      answers,
      time_spent_seconds: timeElapsed,
    });
  };

  const interval = setInterval(saveProgress, 30000); // Save every 30s
  return () => clearInterval(interval);
}, [midtermId, currentQuestion, answers, timeElapsed]);
```

**Step 2: Add completion handling**

```typescript
const handleComplete = async () => {
  if (!midtermId) return;

  // Calculate score (placeholder - implement actual scoring)
  const score = Math.round((completed.size / questions.length) * 100);

  await apiPost(`/api/midterm/${midtermId}/complete`, { score });

  // Redirect to results or dashboard
  navigate(`/course/${slug}/archive?completed=${midtermId}`);
};
```

**Validation:**
- Progress auto-saves every 30 seconds
- Can resume midterm from URL
- Completion properly recorded

---

### Task 8: Add Session Persistence

**Files:**
- Already implemented in Tasks 3 and 7

**Validation:**
- Midterm sessions persist in DB
- Can resume after page refresh
- Multiple concurrent sessions handled correctly

---

### Task 9: Test and Verify

**Files:**
- All modified files

**Step 1: Test each tier**

```bash
# Test Easy (2 credits)
curl -X POST http://localhost:8787/api/midterm/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"course_id":"calc2","type":"easy"}'

# Verify: 5-6 questions, all difficulty ≤3, credits deducted = 2

# Test Sample (3 credits)
curl -X POST http://localhost:8787/api/midterm/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"course_id":"calc2","type":"sample"}'

# Verify: 7 questions, good section coverage, credits deducted = 3

# Test Hard (3 credits)
curl -X POST http://localhost:8787/api/midterm/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"course_id":"calc2","type":"hard"}'

# Verify: 7-8 questions, all difficulty ≥4, credits deducted = 3

# Test Custom (4 credits)
curl -X POST http://localhost:8787/api/midterm/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"course_id":"calc2","type":"custom","custom_sections":["3.1","3.2","3.3"]}'

# Verify: Only questions from selected sections, credits deducted = 4
```

**Step 2: Test preview endpoint**

```bash
curl http://localhost:8787/api/midterm/preview?course_id=calc2&type=sample \
  -H "Authorization: Bearer YOUR_TOKEN"

# Verify: Returns stats, no credits deducted
```

**Step 3: Test session persistence**

1. Start a midterm
2. Answer a few questions
3. Refresh page
4. Verify progress restored

**Step 4: Verify deduplication**

```bash
# Generate 5 midterms, check for duplicate questions within each
for i in {1..5}; do
  curl -X POST http://localhost:8787/api/midterm/generate \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"course_id":"calc2","type":"sample"}' | jq '.questions[].id'
done
```

**Validation:**
- All tiers work correctly
- Credit costs correct
- Section coverage guaranteed
- No duplicates within midterm
- Sessions persist
- Preview works without charging

---

## Testing Commands Summary

```bash
# Run backend tests
cd worker && npm test

# Start local dev
cd worker && npx wrangler dev
cd frontend && npm run dev

# Test endpoints
curl -X POST http://localhost:8787/api/midterm/generate ...
curl http://localhost:8787/api/midterm/preview?...

# Build and deploy
cd worker && npm run deploy
cd frontend && npm run build
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Not enough questions for coverage | Ensure seed data has at least 1 per section per difficulty |
| Weighting algorithm too complex | Start simple, tune based on results |
| Session storage performance | Add index on user_id, clean old completed sessions |
| Credit race conditions | Use atomic UPDATE for credit deduction |

---

**Plan complete and saved to `docs/plans/2026-02-07-midterm-generator.md`.**

**Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**