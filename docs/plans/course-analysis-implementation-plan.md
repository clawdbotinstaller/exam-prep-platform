# Course Analysis Redesign - Implementation Plan

**Date**: 2026-02-07
**Design Document**: `docs/designs/course-analysis-redesign.md`

---

## Dependency Graph

```
T1 ──┬── T3 ──┬── T5 ──┬── T7 ── T9
     │        │        │
T2 ──┴── T4 ──┴── T6 ──┴── T8 ── T10
```

---

## Tasks

### T1: Add KaTeX Dependency and LatexRenderer
- **depends_on**: []
- **location**: `frontend/package.json`, `frontend/src/components/LatexRenderer.tsx`
- **description**: Install KaTeX and create proper LaTeX rendering component that replaces the current stripping behavior
- **validation**: `npm run build` passes, LatexRenderer can render `\int x dx` without errors
- **estimated_time**: 30 min
- **status**: Not Started

### T2: Create Shared UI Components (Stamps, Cards)
- **depends_on**: []
- **location**: `frontend/src/index.css`, `frontend/src/components/`
- **description**: Add CSS for exam stamps, index cards, blueprint grid, technical footers. Create TechnicalStamp component.
- **validation**: Components render with proper visual style in Storybook or test page
- **estimated_time**: 45 min
- **status**: Not Started

### T3: Build ChapterCard Component
- **depends_on**: [T2]
- **location**: `frontend/src/components/analysis/ChapterCard.tsx`
- **description**: Create index-card style chapter preview with stats, mini topic icons, and navigation
- **validation**: Component accepts chapter data props and renders correctly
- **estimated_time**: 45 min
- **status**: Not Started

### T4: Create ExamTypeFilter Component
- **depends_on**: [T2]
- **location**: `frontend/src/components/analysis/ExamTypeFilter.tsx`
- **description**: Build toggle/filter for Midterm/Final/All selection
- **validation**: Component calls onChange with correct filter value
- **estimated_time**: 30 min
- **status**: Not Started

### T5: Refactor CourseAnalysis to Chapter Grid
- **depends_on**: [T1, T3, T4]
- **location**: `frontend/src/pages/course/CourseAnalysis.tsx`
- **description**: Replace accordion with chapter card grid. Add filtering. Link to chapter detail.
- **validation**: Page shows chapter cards, clicking navigates to `/analysis/:chapterId`
- **estimated_time**: 60 min
- **status**: Not Started

### T6: Build SectionTabs Component
- **depends_on**: [T2]
- **location**: `frontend/src/components/analysis/SectionTabs.tsx`
- **description**: Create vertical tab navigation for sections within a chapter
- **validation**: Tabs switch content, active state shows correctly
- **estimated_time**: 45 min
- **status**: Not Started

### T7: Create CourseAnalysisChapter Page
- **depends_on**: [T5, T6, T8]
- **location**: `frontend/src/pages/course/CourseAnalysisChapter.tsx`
- **description**: New page showing sections as tabs with technique pills and question previews
- **validation**: Page loads at `/analysis/:chapterId`, shows sections, LaTeX renders
- **estimated_time**: 60 min
- **status**: Not Started

### T8: Update API for Global Technique Counts
- **depends_on**: []
- **location**: `worker/src/index.ts`
- **description**: Modify analysis-detailed endpoint to count techniques globally, not per-section
- **validation**: API returns `{dedicated: N, crossReference: M, total: N+M}` for each technique
- **estimated_time**: 60 min
- **status**: Not Started

### T9: Build SectionDetailModal Component
- **depends_on**: [T1, T2, T8]
- **location**: `frontend/src/components/analysis/SectionDetailModal.tsx`
- **description**: Comprehensive modal with technique overview, common traps, study strategies, and all questions
- **validation**: Modal opens, shows all content sections, LaTeX renders in formulas
- **estimated_time**: 75 min
- **status**: Not Started

### T10: Build StepByStepSolution Component
- **depends_on**: [T1]
- **location**: `frontend/src/components/analysis/StepByStepSolution.tsx`
- **description**: Component that parses solution_steps string and renders numbered steps with LaTeX
- **validation**: Renders each step with number, LaTeX displays correctly
- **estimated_time**: 45 min
- **status**: Not Started

### T11: Add Routing for Chapter Detail
- **depends_on**: [T7]
- **location**: `frontend/src/App.tsx` or router config
- **description**: Add route `/course/:slug/analysis/:chapterId` pointing to CourseAnalysisChapter
- **validation**: Navigation works, back button returns to chapter grid
- **estimated_time**: 15 min
- **status**: Not Started

### T12: Responsive Testing and Polish
- **depends_on**: [T7, T9, T10, T11]
- **location**: All modified files
- **description**: Test mobile/tablet/desktop layouts, fix any issues, ensure TypeScript compiles
- **validation**: Build passes, manual testing on 3 viewport sizes
- **estimated_time**: 60 min
- **status**: Not Started

---

## Parallel Execution Groups

| Wave | Tasks | Can Start When |
|------|-------|----------------|
| 1 | T1, T2, T8 | Immediately |
| 2 | T3, T4, T6 | Wave 1 complete |
| 3 | T5, T7 | Wave 2 + T8 complete |
| 4 | T9, T10, T11 | Wave 3 complete |
| 5 | T12 | Wave 4 complete |

---

## Testing Strategy

### Unit Tests (if time permits)
- LatexRenderer handles inline and display math
- ChapterCard renders with missing data gracefully
- ExamTypeFilter calls onChange correctly

### Integration Tests
- Navigation: Chapter grid → Section tabs → Modal
- Data flow: API response → Component props → Render
- LaTeX: Question text with math renders correctly

### Manual Testing Checklist
- [ ] All chapters appear in grid
- [ ] Chapter cards show correct global question counts
- [ ] Filtering by exam type works
- [ ] Section tabs show all sections
- [ ] Technique counts show "dedicated + cross-reference"
- [ ] Modal opens with full section detail
- [ ] Step-by-step solutions render with LaTeX
- [ ] Mobile: Cards stack, tabs scroll horizontally
- [ ] Tablet: 2-column grid, vertical tabs
- [ ] Desktop: 3-column grid, fixed sidebar
- [ ] Build passes with no errors

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| KaTeX bundle size increase | Medium | Lazy load, only import on analysis pages |
| API changes break existing | High | Keep backward compatibility, add v2 endpoint |
| LaTeX parsing edge cases | Medium | Extensive testing with real question data |
| Modal performance with many questions | Low | Virtualize long lists, paginate if needed |

---

## Notes

- Keep existing accordion code commented out initially for rollback
- Coordinate with other Claude instance on shared CSS variables
- Consider feature flag for gradual rollout
- Document API changes in `.ai-coordination.md`
