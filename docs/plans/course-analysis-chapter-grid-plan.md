# Course Analysis Chapter Grid - Implementation Plan

**Generated**: 2026-02-07
**Design Reference**: `docs/designs/course-analysis-redesign.md`

---

## Overview

Replace the current accordion-based CourseAnalysis page with a hierarchical chapter grid navigation:

```
/course/:slug/analysis (Chapter Grid)
    ↓ Click Chapter Card
/course/:slug/analysis/:chapterId (Section Tabs)
    ↓ Click Section Tab
Modal/Sheet: Comprehensive Section Detail
```

---

## Prerequisites

- Node.js + TypeScript + Vite setup
- React Router v6
- Tailwind CSS
- Existing API endpoint: `/api/courses/:slug/analysis-detailed`
- KaTeX for LaTeX rendering (optional but recommended)

---

## Dependency Graph

```
T1 ──┬── T3 ──┬── T6 ──┬── T8 ── T10
     │        │        │
T2 ──┴── T4 ──┴── T5 ──┴── T7 ── T9
```

---

## Tasks

### T1: Install KaTeX Dependency
- **depends_on**: []
- **location**: `frontend/package.json`
- **description**: Add katex and @types/katex for proper math rendering
- **validation**: `npm install` succeeds, can import katex in TypeScript
- **status**: Not Started

### T2: Create CSS Design Tokens for Grid
- **depends_on**: []
- **location**: `frontend/src/index.css`
- **description**: Add ChapterCard, TechnicalStamp, and grid layout styles to existing CSS
- **validation**: New classes render correctly in browser dev tools
- **status**: Not Started

### T3: Build ChapterCard Component
- **depends_on**: [T2]
- **location**: `frontend/src/components/analysis/ChapterCard.tsx`
- **description**: Index-card style chapter preview with stats, mini topic icons, and click navigation
- **validation**: Component renders with sample data, click handler fires
- **status**: Not Started

### T4: Build TechnicalStamp Component
- **depends_on**: [T2]
- **location**: `frontend/src/components/analysis/TechnicalStamp.tsx`
- **description**: Rotated stamp badges ("CORE", "ADVANCED", "HIGH-YIELD") for chapter cards
- **validation**: Stamps render with rotation and proper styling
- **status**: Not Started

### T5: Build ExamTypeFilter Component
- **depends_on**: [T2]
- **location**: `frontend/src/components/analysis/ExamTypeFilter.tsx`
- **description**: Toggle for Midterm/Final/All filter at chapter grid level
- **validation**: onChange callback fires with correct filter value
- **status**: Not Started

### T6: Refactor CourseAnalysis to Chapter Grid
- **depends_on**: [T1, T3, T4, T5]
- **location**: `frontend/src/pages/course/CourseAnalysis.tsx`
- **description**: Replace accordion with responsive chapter card grid, add filtering
- **validation**: Page shows chapter cards, responsive layout works (1/2/3 columns)
- **status**: Not Started

### T7: Build SectionTabs Component
- **depends_on**: [T2]
- **location**: `frontend/src/components/analysis/SectionTabs.tsx`
- **description**: Vertical tab navigation for sections within a chapter
- **validation**: Tabs switch content, active state shows correctly, mobile horizontal scroll works
- **status**: Not Started

### T8: Create CourseAnalysisChapter Page
- **depends_on**: [T6, T7, T9]
- **location**: `frontend/src/pages/course/CourseAnalysisChapter.tsx`
- **description**: New page showing sections as tabs with technique pills and question previews
- **validation**: Page loads at `/analysis/:chapterId`, shows sections, LaTeX renders
- **status**: Not Started

### T9: Update API for Global Technique Counts
- **depends_on**: []
- **location**: `worker/src/index.ts`
- **description**: Modify analysis-detailed endpoint to count techniques globally across sections
- **validation**: API returns `{dedicated: N, crossReference: M, total: N+M}` for each technique
- **status**: Not Started

### T10: Add Routing for Chapter Detail
- **depends_on**: [T8]
- **location**: `frontend/src/App.tsx`
- **description**: Add route `/course/:slug/analysis/:chapterId` pointing to CourseAnalysisChapter
- **validation**: Navigation works, back button returns to chapter grid
- **status**: Not Started

### T11: Responsive Testing and Polish
- **depends_on**: [T6, T8, T10]
- **location**: All modified files
- **description**: Test mobile/tablet/desktop, ensure TypeScript compiles, fix any layout issues
- **validation**: Build passes, manual testing on 3 viewport sizes
- **status**: Not Started

---

## Parallel Execution Groups

| Wave | Tasks | Can Start When |
|------|-------|----------------|
| 1 | T1, T2, T9 | Immediately |
| 2 | T3, T4, T5, T7 | Wave 1 complete |
| 3 | T6 | Wave 2 complete |
| 4 | T8, T10 | Wave 3 + T7 complete |
| 5 | T11 | Wave 4 complete |

---

## File Structure

```
frontend/src/
├── components/analysis/
│   ├── ChapterCard.tsx          # NEW (T3)
│   ├── TechnicalStamp.tsx       # NEW (T4)
│   ├── ExamTypeFilter.tsx       # NEW (T5)
│   ├── SectionTabs.tsx          # NEW (T7)
│   └── LatexRenderer.tsx        # UPDATE (T1)
├── pages/course/
│   ├── CourseAnalysis.tsx       # UPDATE (T6)
│   └── CourseAnalysisChapter.tsx # NEW (T8)
├── App.tsx                      # UPDATE (T10)
└── index.css                    # UPDATE (T2)

worker/src/
└── index.ts                     # UPDATE (T9)
```

---

## Testing Strategy

### Unit Tests (Optional)
- ChapterCard renders with missing data gracefully
- SectionTabs switches active tab correctly
- ExamTypeFilter calls onChange with correct value

### Integration Tests
- Navigation: Chapter grid → Section tabs
- Data flow: API response → Component props → Render
- LaTeX: Question text with math renders correctly

### Manual Testing Checklist
- [ ] All chapters appear in grid
- [ ] Chapter cards show correct global question counts
- [ ] Filtering by exam type works
- [ ] Section tabs show all sections
- [ ] Mobile: Cards stack, tabs scroll horizontally
- [ ] Tablet: 2-column grid, vertical tabs
- [ ] Desktop: 3-column grid, fixed sidebar
- [ ] Build passes with no errors

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| KaTeX bundle size increase | Lazy load, only import on analysis pages |
| API changes break existing | Keep backward compatibility, test old endpoints |
| Mobile layout issues | Test early, use responsive breakpoints consistently |
| Performance with many questions | Virtualize long lists if needed |

---

## Success Criteria

- [ ] Chapter grid replaces accordion on `/analysis`
- [ ] Clicking chapter navigates to section tabs
- [ ] Responsive layout works on all viewport sizes
- [ ] LaTeX renders properly in questions
- [ ] "Dedicated + cross-reference" counts display correctly
- [ ] TypeScript builds with no errors
