# Configurable Weighting System Design

> **Generated:** 2026-02-07
> **Purpose:** Allow users to customize midterm generation algorithm

---

## Overview

This document describes a user-configurable weighting system that allows students to "rig" their practice midterms by customizing the question selection algorithm. The system provides both simple presets for common study scenarios and advanced controls for power users.

---

## User-Configurable Parameters

### 1. Core Weight Factors (0-100 each)

Users can adjust the importance of each factor:

| Factor | Default | Description |
|--------|---------|-------------|
| **Recency** | 40 | Prioritize recent exam questions (2024-2025) |
| **Repetition** | 30 | Reward questions appearing in multiple exams |
| **Coverage** | 20 | Ensure balanced section coverage |
| **Difficulty** | 10 | Match target difficulty distribution |
| **Exam Frequency** | 0 | Prioritize historically frequent topics |
| **Struggle Focus** | 0 | Target user's weak areas |
| **Technique Focus** | 0 | Focus on specific techniques |

### 2. Difficulty Distribution

Target percentage for each difficulty level:

```typescript
interface DifficultyDistribution {
  easy: number;      // 0-100, default: 25
  medium: number;    // 0-100, default: 50
  hard: number;      // 0-100, default: 25
}
```

### 3. Topic/Technique Filters

```typescript
interface TopicFilters {
  includeSections: string[];    // Empty = all sections
  focusTechniques: string[];    // Empty = all techniques
  excludeTechniques: string[];
  minExamFrequency: number;     // 0-1, minimum appearance rate
}
```

### 4. Complete Configuration Interface

```typescript
interface MidtermWeightingConfig {
  id: string;
  name: string;
  description?: string;

  // Core weights (0-100 each)
  weights: {
    recency: number;
    repetition: number;
    coverage: number;
    difficulty: number;
    examFrequency: number;
    struggleFocus: number;
    techniqueFocus: number;
  };

  // Difficulty distribution
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };

  // Filters
  filters: {
    includeSections: string[];
    focusTechniques: string[];
    excludeTechniques: string[];
    minExamFrequency: number;
  };

  // Session settings
  questionCount: number;
  targetDuration: number;  // minutes
  allowOvertime: boolean;

  // Metadata
  saveForReuse: boolean;
  createdAt: Date;
}
```

---

## Preset Configurations

### Built-in Presets

| Preset | Use Case | Question Count | Key Weights |
|--------|----------|----------------|-------------|
| **Balanced** | Well-rounded practice | 7 | All equal |
| **Cram Mode** | Quick pre-exam review | 5 | High recency |
| **Weakness Drill** | Target weak areas | 10 | High struggle focus |
| **Technique Mastery** | Master specific skills | 8 | High technique focus |
| **Exam Simulation** | Simulate real exam | 7 | High coverage + exam freq |
| **Comprehensive** | Cover everything | 10 | High coverage |

### Preset Definitions

```typescript
const PRESETS: Record<string, MidtermWeightingConfig> = {
  balanced: {
    id: 'balanced',
    name: 'Balanced Practice',
    weights: { recency: 40, repetition: 30, coverage: 20, difficulty: 10, examFrequency: 0, struggleFocus: 0, techniqueFocus: 0 },
    difficultyDistribution: { easy: 25, medium: 50, hard: 25 },
    filters: { includeSections: [], focusTechniques: [], excludeTechniques: [], minExamFrequency: 0 },
    questionCount: 7,
    targetDuration: 75,
    allowOvertime: true,
    saveForReuse: false,
  },

  cram: {
    id: 'cram',
    name: 'Cram Mode',
    weights: { recency: 60, repetition: 10, coverage: 10, difficulty: 10, examFrequency: 10, struggleFocus: 0, techniqueFocus: 0 },
    difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
    filters: { includeSections: [], focusTechniques: [], excludeTechniques: [], minExamFrequency: 0.1 },
    questionCount: 5,
    targetDuration: 45,
    allowOvertime: false,
    saveForReuse: false,
  },

  weakness: {
    id: 'weakness',
    name: 'Weakness Drill',
    weights: { recency: 10, repetition: 20, coverage: 10, difficulty: 10, examFrequency: 0, struggleFocus: 50, techniqueFocus: 0 },
    difficultyDistribution: { easy: 20, medium: 50, hard: 30 },
    filters: { includeSections: [], focusTechniques: [], excludeTechniques: [], minExamFrequency: 0 },
    questionCount: 10,
    targetDuration: 90,
    allowOvertime: true,
    saveForReuse: false,
  },

  technique: {
    id: 'technique',
    name: 'Technique Mastery',
    weights: { recency: 15, repetition: 20, coverage: 5, difficulty: 10, examFrequency: 0, struggleFocus: 10, techniqueFocus: 40 },
    difficultyDistribution: { easy: 30, medium: 50, hard: 20 },
    filters: { includeSections: [], focusTechniques: [], excludeTechniques: [], minExamFrequency: 0 },
    questionCount: 8,
    targetDuration: 60,
    allowOvertime: true,
    saveForReuse: false,
  },

  exam: {
    id: 'exam',
    name: 'Exam Simulation',
    weights: { recency: 10, repetition: 10, coverage: 40, difficulty: 10, examFrequency: 30, struggleFocus: 0, techniqueFocus: 0 },
    difficultyDistribution: { easy: 20, medium: 50, hard: 30 },
    filters: { includeSections: [], focusTechniques: [], excludeTechniques: [], minExamFrequency: 0.05 },
    questionCount: 7,
    targetDuration: 90,
    allowOvertime: false,
    saveForReuse: false,
  },

  comprehensive: {
    id: 'comprehensive',
    name: 'Comprehensive Review',
    weights: { recency: 15, repetition: 15, coverage: 50, difficulty: 10, examFrequency: 10, struggleFocus: 0, techniqueFocus: 0 },
    difficultyDistribution: { easy: 25, medium: 50, hard: 25 },
    filters: { includeSections: [], focusTechniques: [], excludeTechniques: [], minExamFrequency: 0 },
    questionCount: 10,
    targetDuration: 120,
    allowOvertime: true,
    saveForReuse: false,
  },
};
```

---

## Modified Weighting Algorithm

### Question Scoring Formula

```typescript
function calculateQuestionScore(
  question: Question,
  config: MidtermWeightingConfig,
  userHistory: UserHistory
): number {
  const scores = {
    // Recency: 2024-2025 = 100, 2020-2023 = 50, older = 25
    recency: getRecencyScore(question.source_exam_year),

    // Repetition: +20 per additional exam appearance
    repetition: getRepetitionScore(question.canonical_form),

    // Coverage: inverse of current section representation
    coverage: getCoverageScore(question.section),

    // Difficulty: how well it fits target distribution
    difficulty: getDifficultyMatchScore(question.difficulty, config.difficultyDistribution),

    // Exam frequency: historical appearance rate
    examFrequency: (question.exam_frequency || 0) * 100,

    // Struggle focus: high if user has low accuracy
    struggleFocus: userHistory.accuracy < 0.5 ? 100 : 0,

    // Technique focus: 100 if user wants this technique
    techniqueFocus: config.filters.focusTechniques.includes(question.technique) ? 100 : 50,
  };

  // Calculate weighted sum
  const weights = config.weights;
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  let finalScore = 0;
  for (const [key, weight] of Object.entries(weights)) {
    finalScore += (scores[key as keyof typeof scores] * weight) / totalWeight;
  }

  return finalScore;
}
```

### Generation Algorithm

```typescript
async function generateMidterm(
  db: D1Database,
  courseId: string,
  config: MidtermWeightingConfig,
  userId: string
): Promise<GeneratedMidterm> {
  // 1. Fetch all eligible questions
  let questions = await fetchQuestions(db, courseId, config.filters);

  // 2. Filter by time constraint
  if (!config.allowOvertime) {
    const maxTime = config.targetDuration / config.questionCount;
    questions = questions.filter(q => q.estimated_time <= maxTime);
  }

  // 3. Calculate score for each question
  const userHistory = await getUserHistory(db, userId);
  const scoredQuestions = questions.map(q => ({
    question: q,
    score: calculateQuestionScore(q, config, userHistory),
  }));

  // 4. Sort by score descending
  scoredQuestions.sort((a, b) => b.score - a.score);

  // 5. Two-pass selection
  const selected: typeof scoredQuestions = [];
  const usedSections = new Set<string>();

  // Pass 1: Guarantee section coverage
  for (const section of REQUIRED_SECTIONS) {
    if (usedSections.has(section)) continue;
    const candidate = scoredQuestions.find(sq => sq.question.section === section);
    if (candidate) {
      selected.push(candidate);
      usedSections.add(section);
    }
  }

  // Pass 2: Fill remaining slots by score
  for (const sq of scoredQuestions) {
    if (selected.length >= config.questionCount) break;
    if (selected.includes(sq)) continue;
    selected.push(sq);
  }

  // 6. Shuffle for presentation
  shuffleArray(selected);

  return {
    questions: selected.map(sq => sq.question),
    config,
    stats: calculateStats(selected),
  };
}
```

---

## UI/UX Design

### Simple Mode: Preset Cards

```
┌─────────────────────────────────────────────────────────────┐
│  Choose Your Practice Style                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ [Icon]   │  │ [Icon]   │  │ [Icon]   │                  │
│  │ Balanced │  │  Cram    │  │ Weakness │                  │
│  │ Practice │  │  Mode    │  │   Drill  │                  │
│  │          │  │          │  │          │                  │
│  │ 7 Qs     │  │  5 Qs    │  │ 10 Qs    │                  │
│  │ 75 min   │  │ 45 min   │  │ 90 min   │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ [Icon]   │  │ [Icon]   │  │ [Icon]   │                  │
│  │ Technique│  │   Exam   │  │Comprehen-│                  │
│  │ Mastery  │  │Simulation│  │  sive    │                  │
│  │          │  │          │  │          │                  │
│  │  8 Qs    │  │  7 Qs    │  │ 10 Qs    │                  │
│  │ 60 min   │  │ 90 min   │  │120 min   │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
│                                                             │
│         [ Advanced Options ▼ ]  [ Load Saved ▼ ]          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Advanced Mode: Sliders

```
┌─────────────────────────────────────────────────────────────┐
│  [ Simple Mode ]  [ Advanced Mode ]                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Weight Factors (drag to adjust):                          │
│                                                             │
│  Recency        [====●====] 40%  Questions from recent exams
│  Repetition     [===●=====] 30%  Questions that repeat     │
│  Coverage       [==●======] 20%  All sections covered      │
│  Difficulty     [=●=======] 10%  Match difficulty targets  │
│  Exam Frequency [========●]  0%  Historically frequent     │
│  Struggle Focus [========●]  0%  Your weak areas           │
│  Technique Focus[========●]  0%  Specific techniques       │
│                                                             │
│  [ Normalize Weights ]  [ Reset to Default ]               │
│                                                             │
│  Difficulty Mix:                                           │
│  Easy   [====●====] 25%                                    │
│  Medium [=====●===] 50%                                    │
│  Hard   [====●====] 25%                                    │
│                                                             │
│  Question Count: [ 7 ▼]    Target Time: [ 75 ] min        │
│                                                             │
│  Focus Sections:                                           │
│  [3.1] [3.2] [3.3] [3.4] [3.7] [4.2] [4.5]               │
│  (Click to toggle - empty means all)                       │
│                                                             │
│  Focus Techniques:                                         │
│  [Search...]                                               │
│  [x] integration_by_parts  [ ] trig_substitution          │
│  [x] separation_of_vars    [ ] partial_fractions          │
│                                                             │
│  Config Name: [ My Custom Config        ]                  │
│  [ ] Save for future use                                   │
│                                                             │
│              [    Preview Stats    ]                       │
│              [    Generate Midterm    ]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Storage Strategy

### Guest Users (localStorage)

```typescript
const STORAGE_KEY = 'epp_midterm_configs';

function saveConfig(config: MidtermWeightingConfig): void {
  const configs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  configs.push(config);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}
```

### Authenticated Users (Database)

```sql
CREATE TABLE user_midterm_configs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    description TEXT,
    config_json TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    use_count INTEGER DEFAULT 0
);

CREATE INDEX idx_user_configs_user ON user_midterm_configs(user_id);
```

---

## API Endpoints

```typescript
// Get all presets + user's saved configs
GET /api/midterm/configs
Response: {
  presets: PresetConfig[];
  saved: MidtermWeightingConfig[];
}

// Save a custom configuration
POST /api/midterm/configs
Body: MidtermWeightingConfig
Response: { id: string }

// Delete a saved configuration
DELETE /api/midterm/configs/:id

// Preview midterm with configuration (no credits)
POST /api/midterm/preview
Body: {
  courseId: string;
  config: MidtermWeightingConfig;
}
Response: {
  stats: MidtermStats;
  coverage: SectionCoverage;
  creditCost: number;
}

// Generate midterm with configuration
POST /api/midterm/generate
Body: {
  courseId: string;
  config: MidtermWeightingConfig;
}
Response: {
  midtermId: string;
  questions: Question[];
  stats: MidtermStats;
}
```

---

## Example User Configurations

### "I have a test tomorrow"
```javascript
{
  name: "Last Minute Cram",
  weights: { recency: 60, repetition: 10, coverage: 10, difficulty: 10, examFrequency: 10, struggleFocus: 0, techniqueFocus: 0 },
  difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
  questionCount: 5,
  targetDuration: 45,
  allowOvertime: false,
}
```

### "I keep getting IBP wrong"
```javascript
{
  name: "IBP Mastery",
  weights: { recency: 10, repetition: 30, coverage: 0, difficulty: 10, examFrequency: 0, struggleFocus: 20, techniqueFocus: 30 },
  filters: { focusTechniques: ['integration_by_parts', 'cyclic_integration'] },
  questionCount: 10,
  targetDuration: 90,
  allowOvertime: true,
}
```

### "Real exam simulation"
```javascript
{
  name: "Exam Simulation",
  weights: { recency: 10, repetition: 10, coverage: 40, difficulty: 10, examFrequency: 30, struggleFocus: 0, techniqueFocus: 0 },
  filters: { minExamFrequency: 0.05 },
  questionCount: 7,
  targetDuration: 90,
  allowOvertime: false,
}
```

---

## Implementation Phases

### Phase 1: Basic Presets (MVP)
- Implement 6 preset configurations
- Simple selection UI (cards)
- No persistence

### Phase 2: Advanced Mode
- Add sliders for all weights
- Difficulty distribution controls
- Section/technique filters

### Phase 3: Persistence
- localStorage for guests
- Database for authenticated users
- "Save configuration" feature

### Phase 4: Smart Features
- "Regenerate with same settings"
- Preview stats before generating
- Auto-suggest configs based on user history

---

## Benefits

1. **User Control:** Students can tailor practice to their needs
2. **Study Flexibility:** Cram mode vs deep learning vs exam simulation
3. **Weakness Targeting:** Focus on areas where they struggle
4. **Technique Mastery:** Drill specific skills
5. **Engagement:** Gamification through customization

---

*This design enables true personalization of the midterm generation experience.*
