# AI Exam Ingestion Pipeline

**Status**: Tabled for future review (post-MVP)
**Priority**: Low (MVP launch first)

---

## Overview

Drop-in PDF → AI-extracted questions + AI-generated solutions → D1 database seed

**Goal**: Fully automated exam question ingestion without manual data entry

---

## The Workflow (Future State)

```
exam_drop/2024_winter_midterm.pdf
    ↓
[PDF Extraction] → Raw text + math (vision model)
    ↓
[AI Structuring] → JSON with fields (question_text, topic, section, etc.)
    ↓
[AI Solutions] → Step-by-step solutions generated
    ↓
[Confidence Check] → Auto-accept or flag for review
    ↓
[SQL Builder] → INSERT statements
    ↓
[D1 Seeding] → wrangler d1 execute
```

---

## Architecture Components

| Component | Tech | Notes |
|-----------|------|-------|
| PDF Extraction | Vision model (GPT-4V/Gemini) | Text-only PDF parsing loses math equations |
| AI Structuring | GLM-4.7 / GPT-4 | Extract question text, metadata, tag topics |
| AI Solutions | GLM-4.7 / GPT-4 | Generate step-by-step solutions |
| Validation | Zod + custom checks | Verify JSON schema, math parseability |
| Confidence Scoring | Heuristics | Flag uncertain solutions for review |
| D1 Seeding | Wrangler CLI | Execute generated SQL |

---

## Risk Areas

| Risk | Mitigation | Acceptable for MVP? |
|------|------------|---------------------|
| Math extraction errors | Vision model + human review flag | No - skip for MVP |
| AI solution hallucinations | Confidence scoring + spot checks | No - skip for MVP |
| Topic tagging mistakes | Validate against known topics | No - skip for MVP |
| Wrong difficulty estimation | Skip or default to medium | No - skip for MVP |

---

## Why Tabled for Post-MVP

**Current situation**: Have 33 questions seeded manually, sufficient for launch

**MVP needs**:
- Working platform with real questions
- User feedback on core features
- Payment/stripe integration
- Basic analytics

**This pipeline needs**:
- Extensive testing on real exam PDFs
- Confidence scoring calibration
- Review workflow UI
- Error handling for edge cases

**Time estimate**: 2-3 weeks to build + test properly

---

## When to Revisit

**Trigger conditions**:
- [ ] MVP launched and stable
- [ ] Need to ingest 5+ new exams quickly
- [ ] Manual question entry becomes bottleneck
- [ ] Have budget for GLM/OpenAI API costs at scale

**Pre-work before implementation**:
1. Test vision model on sample exam PDFs
2. Measure extraction accuracy (% of questions correctly parsed)
3. Measure solution accuracy (% of solutions mathematically correct)
4. Decide confidence threshold for auto-accept vs review

---

## Quick Reference

**Scaffold source**: User provided scaffold (Node + TypeScript + tsx)

**Key files to create** (when implemented):
- `ingest.ts` - Pipeline orchestrator
- `core/extractPdf.ts` - Vision model extraction
- `core/structureWithAI.ts` - GLM structuring
- `core/generateSolutions.ts` - AI solution generation
- `core/verifySolutions.ts` - Consistency checks
- `core/buildSql.ts` - SQL generation
- `core/seedD1.ts` - D1 execution

---

## Decision Log

**2026-02-07**: Table pipeline, focus on MVP launch with existing 33 questions
**Rationale**: Manual seeding is done, pipeline is "nice to have" not "must have"
