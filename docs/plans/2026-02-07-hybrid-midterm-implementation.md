# Hybrid Smart Presets Midterm Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Option 3 - Smart Presets with Basic Customization for midterm generation

**Architecture:**
- 6 preset configurations (Balanced, Cram, Weakness, Technique, Exam, Comprehensive)
- Simple card-based UI for preset selection
- "Customize" button opens basic sliders (Recency, Repetition, Coverage, Difficulty)
- Save configurations to localStorage
- Add Midterms/Finals tabs to course page

**Tech Stack:** React + TypeScript, Cloudflare Workers, D1, localStorage

---

## Implementation Tasks

### T1: Update Types and Interfaces
**Files:**
- Create: `frontend/src/types/midterm.ts`

**Description:**
Define TypeScript interfaces for the configurable midterm system.

```typescript
export interface WeightFactors {
  recency: number;
  repetition: number;
  coverage: number;
  difficulty: number;
}

export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface MidtermWeightingConfig {
  id: string;
  name: string;
  description: string;
  weights: WeightFactors;
  difficultyDistribution: DifficultyDistribution;
  questionCount: number;
  targetDuration: number;
  creditCost: number;
}

export interface PresetConfig extends MidtermWeightingConfig {
  icon: string;
  color: string;
}
```

**Validation:** TypeScript compiles without errors

---

### T2: Create Preset Configurations
**Files:**
- Create: `frontend/src/data/midtermPresets.ts`

**Description:**
Define the 6 preset configurations with weights based on exam pattern analysis.

```typescript
export const PRESETS: Record<string, PresetConfig> = {
  balanced: {
    id: 'balanced',
    name: 'Balanced Practice',
    description: 'Well-rounded mix covering all areas equally',
    icon: 'Scale',
    color: 'bg-blueprint-navy',
    weights: { recency: 40, repetition: 30, coverage: 20, difficulty: 10 },
    difficultyDistribution: { easy: 25, medium: 50, hard: 25 },
    questionCount: 7,
    targetDuration: 75,
    creditCost: 3,
  },
  cram: {
    id: 'cram',
    name: 'Cram Mode',
    description: 'Quick review focusing on recent material',
    icon: 'Zap',
    color: 'bg-yellow-500',
    weights: { recency: 60, repetition: 10, coverage: 10, difficulty: 20 },
    difficultyDistribution: { easy: 40, medium: 40, hard: 20 },
    questionCount: 5,
    targetDuration: 45,
    creditCost: 2,
  },
  // ... weakness, technique, exam, comprehensive
};
```

**Validation:** All 6 presets defined with correct weights

---

### T3: Update Backend Midterm Endpoint
**Files:**
- Modify: `worker/src/index.ts` (update /api/midterm/generate)
- Modify: `worker/src/lib/midterm-generator.ts` (update algorithm)

**Description:**
Update the generation algorithm to use configurable weights.

```typescript
// Update generateMidterm to accept config parameter
export async function generateMidterm(
  db: D1Database,
  courseId: string,
  config: MidtermWeightingConfig
): Promise<{ questions: Question[]; stats: MidtermStats }> {
  // Use config.weights for scoring
  // Use config.difficultyDistribution for filtering
  // Use config.questionCount for limit
}
```

Update endpoint to accept config in request body.

**Validation:**
- Endpoint accepts config parameter
- Weights applied correctly
- Returns correct number of questions

---

### T4: Create Midterm Selection Component
**Files:**
- Create: `frontend/src/components/MidtermSelector.tsx`

**Description:**
Build the preset selection UI with 6 cards.

```typescript
export function MidtermSelector({ onSelect }: { onSelect: (preset: PresetConfig) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.values(PRESETS).map(preset => (
        <PresetCard key={preset.id} preset={preset} onClick={() => onSelect(preset)} />
      ))}
    </div>
  );
}
```

Each card shows: icon, name, description, question count, duration, credit cost.

**Validation:**
- All 6 cards render
- Clicking card triggers onSelect
- Responsive layout works

---

### T5: Create Customization Modal
**Files:**
- Create: `frontend/src/components/MidtermCustomizer.tsx`

**Description:**
Build the customization modal with 4 sliders.

```typescript
export function MidtermCustomizer({
  baseConfig,
  onSave,
  onCancel
}: {
  baseConfig: PresetConfig;
  onSave: (config: MidtermWeightingConfig) => void;
  onCancel: () => void;
}) {
  // Sliders for: recency, repetition, coverage, difficulty
  // Display: question count, duration, credit cost
  // Save to localStorage
}
```

**Validation:**
- Sliders update weight values
- Preview updates in real-time
- Save stores to localStorage
- Cancel closes without saving

---

### T6: Update Course Archive Page with Tabs
**Files:**
- Modify: `frontend/src/pages/course/CourseArchive.tsx`

**Description:**
Add Midterms/Finals tabs to the archive page.

```typescript
// Add tab state
const [activeTab, setActiveTab] = useState<'midterms' | 'finals'>('midterms');

// Render tabs
<div className="flex gap-4 border-b border-pencil-gray/20 mb-6">
  <button
    className={activeTab === 'midterms' ? 'active-tab' : 'inactive-tab'}
    onClick={() => setActiveTab('midterms')}
  >
    Practice Midterms
  </button>
  <button
    className={activeTab === 'finals' ? 'active-tab' : 'inactive-tab'}
    onClick={() => setActiveTab('finals')}
  >
    Practice Finals (Coming Soon)
  </button>
</div>

// Show MidtermSelector when midterms tab active
// Show placeholder when finals tab active
```

**Validation:**
- Tabs switch correctly
- MidtermSelector renders in midterms tab
- Finals tab shows placeholder

---

### T7: Add localStorage Persistence
**Files:**
- Create: `frontend/src/lib/midtermStorage.ts`

**Description:**
Create utilities for saving/loading custom configurations.

```typescript
const STORAGE_KEY = 'epp_midterm_configs';

export function saveCustomConfig(config: MidtermWeightingConfig): void {
  const configs = loadCustomConfigs();
  configs.push({ ...config, id: crypto.randomUUID() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

export function loadCustomConfigs(): MidtermWeightingConfig[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function deleteCustomConfig(id: string): void {
  const configs = loadCustomConfigs().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}
```

**Validation:**
- Configs persist across page reloads
- Can save multiple configs
- Can delete configs

---

### T8: Add "Load Saved Config" Dropdown
**Files:**
- Modify: `frontend/src/components/MidtermSelector.tsx`

**Description:**
Add dropdown to load saved custom configurations.

```typescript
// Add to MidtermSelector
const [savedConfigs, setSavedConfigs] = useState<MidtermWeightingConfig[]>([]);

useEffect(() => {
  setSavedConfigs(loadCustomConfigs());
}, []);

// Render dropdown if savedConfigs.length > 0
{savedConfigs.length > 0 && (
  <select onChange={(e) => loadSavedConfig(e.target.value)}>
    <option>Load saved config...</option>
    {savedConfigs.map(config => (
      <option key={config.id} value={config.id}>{config.name}</option>
    ))}
  </select>
)}
```

**Validation:**
- Dropdown shows saved configs
- Selecting config loads it
- Configs persist after reload

---

### T9: Update Credit Deduct Logic
**Files:**
- Modify: `worker/src/index.ts` (midterm generate endpoint)

**Description:**
Ensure correct credit costs per preset:
- Easy/Cram: 2 credits
- Balanced/Sample/Exam: 3 credits
- Comprehensive: 4 credits

Update the credit check and deduction logic to use config.creditCost.

**Validation:**
- Correct credits deducted per preset
- 402 returned if insufficient credits
- Unlimited users skip deduction

---

### T10: Add Stats Preview Endpoint
**Files:**
- Modify: `worker/src/index.ts`

**Description:**
Add preview endpoint that shows stats without deducting credits.

```typescript
// GET /api/midterm/preview?course_id=calc2&preset=balanced
app.get('/api/midterm/preview', requireAuth, async (c) => {
  const courseId = c.req.query('course_id');
  const presetId = c.req.query('preset');

  const config = PRESETS[presetId];
  const { stats } = await generateMidterm(c.env.DB, courseId, config);

  return c.json({ stats, creditCost: config.creditCost });
});
```

**Validation:**
- Returns stats without charging credits
- Shows correct question count, duration, coverage

---

### T11: Create Preview Modal
**Files:**
- Create: `frontend/src/components/MidtermPreview.tsx`

**Description:**
Show preview before generating midterm.

```typescript
export function MidtermPreview({
  preset,
  stats,
  onConfirm,
  onCancel
}: {
  preset: PresetConfig;
  stats: MidtermStats;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Display: question count, points, duration, section coverage
  // Credit cost with warning if low
  // Confirm/Cancel buttons
}
```

**Validation:**
- Shows correct stats from API
- Section coverage visualized
- Confirm generates midterm
- Cancel returns to selector

---

### T12: Integration Testing
**Files:**
- All modified files

**Description:**
Test complete flow:
1. Select preset → Preview → Generate
2. Customize preset → Save → Load → Generate
3. Verify credits deducted correctly
4. Verify midterm renders with correct questions
5. Test responsive design

**Validation:**
- End-to-end flow works
- Credits tracked correctly
- UI responsive on mobile/desktop

---

### T13: Chrome DevTools Visual Verification
**Files:**
- All UI components

**Description:**
Use Chrome DevTools to verify:
1. Component renders correctly
2. No console errors
3. Network requests succeed
4. UI matches design system (index-card, btn-blueprint, etc.)
5. Responsive breakpoints work

**Validation:**
- Screenshot comparison if needed
- No visual regressions
- Consistent with existing UI

---

### T14: Update Documentation
**Files:**
- Update: `docs/APP_FLOW.md`
- Update: `docs/BACKEND.md`
- Update: `docs/CLAUDE_CONTEXT.md`
- Create: `docs/MONETIZATION.md` (comprehensive)

**Description:**
Update all docs with new midterm flow and monetization details.

**Validation:**
- All docs current
- No outdated information
- Comprehensive monetization doc created

---

## Dependency Graph

```
T1 (Types) ──┬── T2 (Presets) ──┬── T4 (Selector) ──┬── T6 (Archive Tabs) ──┐
             │                   │                    │                       │
             │                   ├── T5 (Customizer) ─┤                       │
             │                   │                    │                       │
             │                   └── T11 (Preview) ───┘                       │
             │                                                                │
             └── T3 (Backend) ──┬── T9 (Credits) ────────────────────────────┤
                                │                                            │
                                ├── T10 (Preview API) ───────────────────────┤
                                │                                            │
                                └── T7 (Storage) ─── T8 (Load Saved) ────────┤
                                                                             │
T12 (Testing) ───────────────────────────────────────────────────────────────┤
                                                                             │
T13 (DevTools) ──────────────────────────────────────────────────────────────┤
                                                                             │
T14 (Docs) ──────────────────────────────────────────────────────────────────┘
```

## Parallel Execution Groups

| Wave | Tasks | Can Start When |
|------|-------|----------------|
| 1 | T1, T2, T3 | Immediately |
| 2 | T4, T5, T7, T9, T10 | Wave 1 complete |
| 3 | T6, T8, T11 | Wave 2 complete |
| 4 | T12, T13 | Wave 3 complete |
| 5 | T14 | All implementation complete |

---

## Testing Checklist

- [ ] All 6 presets render correctly
- [ ] Preset selection triggers preview
- [ ] Preview shows correct stats
- [ ] Generate deducts correct credits
- [ ] Customize modal opens with base preset
- [ ] Sliders update weights
- [ ] Save stores to localStorage
- [ ] Load saved configs works
- [ ] Delete saved config works
- [ ] Midterms/Finals tabs switch
- [ ] Responsive on mobile
- [ ] No console errors
- [ ] Credits update in real-time

---

**Plan complete. Ready for execution with superpowers:executing-plans.**
