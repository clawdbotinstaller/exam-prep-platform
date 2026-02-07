# Course Analysis Redesign - Design Document

**Date**: 2026-02-07
**Status**: Design Complete, Ready for Implementation
**Related**: User feedback from walkthrough - addressing "hallucinated" data, poor UX, missing step-by-step solutions

---

## 1. Current Problems (User Feedback)

### 1.1 Navigation Issues
- **Dropdown hell**: Current accordion pattern makes scrolling excessively long
- **No filtering**: Students studying for midterms vs finals see the same content
- **Disorganized**: Hard to find specific topics quickly

### 1.2 Data Accuracy Issues
- **"2 IBP questions" is misleading**: Actually 7 questions use IBP across 4 different sections
- **Hallucinated summaries**: Generic content not tied to actual questions
- **Question counts**: Per-section counts don't reflect global technique usage

### 1.3 Content Quality Issues
- **LaTeX stripped**: Math displays as plain text with commands removed
- **Fake step-by-step**: Solutions are summaries, not actual worked steps
- **Missing depth**: No comprehensive topic overviews with common traps

### 1.4 Aesthetic Drift
- **Losing the engineering library feel**: Moving away from blueprint/technical document aesthetic
- **Needs more authenticity**: Stamps, technical footers, index cards

---

## 2. Proposed Solution: Hierarchical Navigation

### 2.1 Navigation Structure

```
/course/:slug/analysis (Chapter Grid)
    ↓ Click Chapter Card
/course/:slug/analysis/:chapterId (Section Tabs)
    ↓ Click Section Tab
    Modal/Sheet: Comprehensive Section Detail
```

### 2.2 Page 1: Chapter Grid

**Layout**: Responsive card grid (1 col mobile → 2 col tablet → 3 col desktop)

**Chapter Cards** (Styled as index cards):
```
┌─────────────────────────────────┐
│  CHAPTER 3          [stamp]     │  ← Technical stamp: "CORE" or "ADVANCED"
│  ─────────────────────────────  │
│  Integration Techniques         │  ← Serif heading
│                                 │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐  │  ← Mini topic icons (visual only)
│  │IBP │ │Trig│ │Subst│ │PF │  │
│  └────┘ └────┘ └────┘ └────┘  │
│                                 │
│  12 questions across 5 sections │  ← Global counts, not per-section
│  Avg difficulty: 3.2/5          │
│  Est. study time: 4.5 hours     │
│                                 │
│  [View Sections →]              │  ← Blueprint navy button
└─────────────────────────────────┘
```

**Filter Bar** (Sticky):
- Toggle: "Midterm Prep" | "Final Prep" | "All Topics"
- Shows chapters relevant to each exam type

**Visual Style**:
- Blueprint grid background (subtle)
- Cards cast soft shadow (index card aesthetic)
- Technical stamps: "CORE", "ADVANCED", "HIGH-YIELD"
- Font: JetBrains Mono for labels, Serif for headings

### 2.3 Page 2: Section Tabs

**Layout**: Vertical tabs (desktop) / Horizontal scroll (mobile)

```
┌────────────────────────────────────────────────────────────┐
│  ← Back to Chapters        Chapter 3: Integration          │
├──────────┬─────────────────────────────────────────────────┤
│          │                                                 │
│  3.1     │  SECTION 3.1                                    │
│  IBP   ● │  ─────────────────────────────────────────      │
│          │  Integration by Parts                           │
│  3.2     │                                                 │
│  Trig    │  [TABULAR] [CYCLIC] [STANDARD]                  │  ← Technique pills
│          │                                                 │
│  3.3     │  ┌─────────────────────────────────────────┐   │
│  Subst   │  │  TECHNIQUE OVERVIEW                     │   │
│          │  │  ─────────────────────────────────────  │   │
│  3.4     │  │                                         │   │
│  PF      │  │  ∫ u dv = uv - ∫ v du                   │   │  ← LaTeX rendered
│          │  │                                         │   │
│  3.7     │  │  Common Traps:                          │   │
│  Improp  │  │  • Forgetting the minus sign            │   │
│          │  │  • Wrong choice of u (LIATE rule)       │   │
│          │  │  • Not recognizing cyclic patterns      │   │
│          │  └─────────────────────────────────────────┘   │
│          │                                                 │
│          │  QUESTIONS (7 total)                           │
│          │  ─────────────────────────────────────────      │
│          │                                                 │
│          │  Dedicated to this section: 2 questions        │
│          │  Also use this technique: 5 questions    [→]   │  ← Key fix!
│          │                                                 │
│          │  ┌─────────────────────────────────────────┐   │
│          │  │ Q1. ∫ x e^x dx                    [3pt]│   │
│          │  │     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │   │
│          │  │     From: 2015 Winter Midterm          │   │
│          │  │                                         │   │
│          │  │     [View Full Solution →]             │   │
│          │  └─────────────────────────────────────────┘   │
│          │                                                 │
└──────────┴─────────────────────────────────────────────────┘
```

**Tab States**:
- Active: Blueprint navy background, cream text
- Inactive: Paper aged, hover shows subtle highlight

**Section Detail Modal** (On click):
```
┌──────────────────────────────────────────────────────────────┐
│  SECTION 3.1: INTEGRATION BY PARTS              [X]        │
│  ═══════════════════════════════════════════════════════   │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ 2 questions │  │ Avg 4.2/5   │  │ 15 min avg  │        │
│  │ dedicated   │  │ difficulty  │  │ solve time  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                             │
│  COMPREHENSIVE OVERVIEW                                     │
│  ────────────────────────────────────────────────────────  │
│  Integration by parts reverses the product rule. Essential │
│  for integrals involving products of algebraic and         │
│  transcendental functions.                                 │
│                                                             │
│  LIATE Priority Rule:                                       │
│  Logarithmic → Inverse trig → Algebraic → Trig → Expo      │
│                                                             │
│  COMMON TRAPS                    STUDY STRATEGIES          │
│  ─────────────────────           ─────────────────────     │
│  • Forgetting minus sign         • Practice LIATE          │
│  • Wrong u/dv choice             • Master cyclic cases     │
│  • Missing dx adjustments        • Check by differentiating│
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  QUESTIONS USING THIS TECHNIQUE (7 total)                  │
│                                                             │
│  Dedicated to this section:                                  │
│  ┌────────────────────────────────────────────────────┐   │
│  │ [2015 Winter] Q3. ∫ e^(-√x) sin(√x)/√x dx         │   │
│  │                                                     │   │
│  │ Step 1: Substitute u = √x, du = dx/(2√x)          │   │
│  │         Rewrite: 2∫ e^(-u) sin(u) du              │   │
│  │                                                     │   │
│  │ Step 2: Apply IBP twice (cyclic case)             │   │
│  │         ...                                        │   │
│  │                                                     │   │
│  │ [View Full Work →]                                 │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  Also uses this technique:                                  │
│  ┌────────────────────────────────────────────────────┐   │
│  │ [2019 Winter] Q5. Solve DE (requires IBP on RHS)  │   │
│  │ [2024 Spring] Q1. Improper integral with ln(x)    │   │
│  │ [etc...]                                            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│                    [APPROVED FOR RELEASE]                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Data Model Changes

### 3.1 API Response Changes

**Current** (`/api/courses/:id/analysis-detailed`):
```typescript
interface TechniqueStats {
  id: string;
  count: number;  // Per-section count (misleading!)
  sampleQuestions: Question[];  // Max 3, arbitrary selection
}
```

**New**:
```typescript
interface TechniqueStats {
  id: string;
  count: {
    dedicated: number;      // Questions in this section
    crossReference: number; // Questions in other sections using this
    total: number;          // Global count
  };
  sampleQuestions: {
    dedicated: Question[];      // From this section
    crossReference: Question[]; // From other sections (limited preview)
  };
  metadata: {
    displayName: string;
    description: string;
    formula?: string;       // LaTeX formula
    commonTraps: string[];
    studyStrategies: string[];
    prerequisites: string[];
    difficulty: 'basic' | 'intermediate' | 'advanced';
    estimatedTimeMinutes: number;
  };
}
```

### 3.2 Backend Changes Required

1. **Global technique counting**: Aggregate across all sections
2. **Cross-reference tracking**: Track which sections use which techniques
3. **Metadata endpoint**: Serve technique metadata from backend (currently frontend-only)
4. **Better sample selection**: Choose representative examples, not just first 3

---

## 4. Component Architecture

### 4.1 New Components

```
src/pages/course/
├── CourseAnalysis.tsx          # Refactored: Chapter grid view
├── CourseAnalysisChapter.tsx   # NEW: Section tabs view

src/components/analysis/
├── ChapterCard.tsx             # NEW: Index card style chapter preview
├── SectionTabs.tsx             # NEW: Vertical tab navigation
├── SectionDetailModal.tsx      # NEW: Comprehensive section detail
├── TechniquePill.tsx           # NEW: Small technique badges
├── QuestionPreview.tsx         # NEW: Question card with LaTeX
├── StepByStepSolution.tsx      # NEW: Expandable solution steps
├── ExamTypeFilter.tsx          # NEW: Midterm/Final/All toggle
└── TechnicalStamp.tsx          # NEW: Authentic exam stamps

src/lib/
└── latexRender.ts              # NEW: KaTeX integration utility
```

### 4.2 Shared Components (Update)

- `LatexRenderer.tsx`: Use proper KaTeX rendering instead of stripping
- `ErrorApology.tsx`: Already exists, use for error states

---

## 5. LaTeX Rendering Solution

### 5.1 Current Problem
```typescript
// CourseAnalysis.tsx line 137 - STRIPS LaTeX
{q.question_text?.replace(/\\\w+/g, '').substring(0, 120)}...
// Result: "Evaluate dx" (math completely removed!)
```

### 5.2 Solution: KaTeX Integration

```typescript
// lib/latexRender.ts
import katex from 'katex';
import 'katex/dist/katex.min.css';

export function renderLatex(tex: string, displayMode = false): string {
  return katex.renderToString(tex, {
    displayMode,
    throwOnError: false,
    strict: false,
  });
}

// Usage in components
<div
  className="math-content"
  dangerouslySetInnerHTML={{
    __html: renderLatex('\\int x e^x dx')
  }}
/>
```

### 5.3 Extracting LaTeX from Question Text

```typescript
// Handle both inline ($...$) and display ($$...$$) math
function extractMathSegments(text: string): Array<{type: 'text' | 'math', content: string}> {
  const segments = [];
  const regex = /\$\$?([^$]+)\$\$?/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      });
    }
    segments.push({
      type: 'math',
      content: match[1]
    });
    lastIndex = regex.lastIndex;
  }

  return segments;
}
```

---

## 6. Step-by-Step Solutions

### 6.1 Current Problem
- Solution is a single string with newlines
- Not actually step-by-step, just a summary
- No formatting, hard to follow

### 6.2 New Format

**Database storage** (already exists in seed file!):
```sql
solution_steps: 'Step 1: Substitute u = √x
Step 2: Apply IBP twice
Step 3: Solve for the original integral
Step 4: Add constant of integration'
```

**UI Rendering**:
```tsx
<div className="solution-steps">
  {steps.split(/\n/).map((step, i) => (
    <div key={i} className="step">
      <span className="step-number">{i + 1}</span>
      <div
        className="step-content"
        dangerouslySetInnerHTML={{
          __html: renderLatex(step.replace(/^Step \d+:\s*/, ''))
        }}
      />
    </div>
  ))}
</div>
```

**Visual Style**:
- Numbered steps in circles
- Each step on its own line
- LaTeX rendered within steps
- Final answer box at bottom

---

## 7. Engineering Library Aesthetic

### 7.1 Visual Elements to Add

**Stamps** (Red ink, rotated):
```css
.exam-stamp {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--stamp-red);
  border: 2px solid var(--stamp-red);
  padding: 4px 12px;
  border-radius: 2px;
  transform: rotate(-8deg);
  opacity: 0.9;
}
/* Variants: EXAM QUESTION, ACTUAL MIDTERM, CORE, etc. */
```

**Technical Footer**:
```
Drawing No. CALC-II-2024-REF // Technical Document // No. 0082-C2
SYSTEM: STABLE // DATA_STREAM: ACTIVE
```

**Index Card Shadow**:
```css
.index-card {
  background: var(--paper-cream);
  box-shadow:
    2px 3px 8px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(26, 26, 46, 0.08);
}
```

**Blueprint Grid Background**:
```css
.blueprint-grid {
  background-image:
    linear-gradient(rgba(30, 58, 95, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30, 58, 95, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

---

## 8. Responsive Behavior

### 8.1 Mobile (< 768px)
- Chapter cards: Single column, stacked
- Section tabs: Horizontal scroll
- Modal: Full screen sheet (slides up)
- Filter: Dropdown instead of toggle

### 8.2 Tablet (768px - 1024px)
- Chapter cards: 2 columns
- Section tabs: Vertical, collapsible
- Modal: Centered with overlay

### 8.3 Desktop (> 1024px)
- Chapter cards: 3 columns
- Section tabs: Fixed left sidebar
- Modal: Large centered card

---

## 9. Accessibility

- All interactive elements keyboard accessible
- ARIA labels for technique pills
- Focus management for modal
- Reduced motion support
- High contrast mode support

---

## 10. Implementation Phases

### Phase 1: Foundation
- Add KaTeX dependency and LatexRenderer component
- Create new route structure (chapter grid + section tabs)
- Build ChapterCard and SectionTabs components

### Phase 2: API Updates
- Add global technique counting to backend
- Create technique metadata endpoint
- Update analysis-detailed response format

### Phase 3: Detail View
- Build SectionDetailModal component
- Implement StepByStepSolution
- Add QuestionPreview with LaTeX

### Phase 4: Polish
- Add stamps and visual elements
- Implement filtering (midterm/final)
- Responsive testing and refinement

---

## 11. Files to Modify

| File | Change |
|------|--------|
| `worker/src/index.ts` | Add global technique counting, metadata endpoint |
| `frontend/src/pages/course/CourseAnalysis.tsx` | Refactor to chapter grid view |
| `frontend/src/pages/course/CourseAnalysisChapter.tsx` | NEW: Section tabs view |
| `frontend/src/components/LatexRenderer.tsx` | Use KaTeX instead of stripping |
| `frontend/src/index.css` | Add stamps, cards, grid styles |
| `frontend/package.json` | Add katex dependency |

---

## 12. Success Criteria

- [ ] Chapter grid shows 3 chapters with accurate global counts
- [ ] Section tabs show all sections in a chapter
- [ ] Modal displays comprehensive section detail
- [ ] LaTeX renders properly in questions and solutions
- [ ] "2 dedicated + 5 cross-reference" shows correctly
- [ ] Step-by-step solutions are complete and readable
- [ ] Visual design matches engineering library aesthetic
- [ ] Mobile layout works smoothly
- [ ] Build passes with no TypeScript errors
