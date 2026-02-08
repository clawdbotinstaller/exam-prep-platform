# Codex Topic Analysis Fix Doc

> **Status:** Proposed implementation spec  
> **Last Updated:** 2026-02-07  
> **Goal:** Define a complete, implementable topic analysis response with data derivation paths.

---

## Overview (Product Lens)

Good question — the topic analysis should feel like a practical study briefing, not just stats. Here’s the detail set I’d include:

- Topic overview: short plain‑language description of what the topic covers.
- Exam frequency: how often it appears (count and % of exams).
- Recency weighting: how recent appearances affect likelihood (last seen year).
- Question pattern clusters: 2–5 common pattern archetypes with canonical forms.
- Typical question types: list of the usual prompts (e.g., “evaluate integral”, “determine convergence”).
- Difficulty distribution: histogram of difficulty 1–5 for this topic.
- Time expectations: typical time per question and range.
- Common tricks/pitfalls: why students miss these, based on past errors.
- Technique breakdown: most frequent techniques used in the topic.
- Representative examples: 2–3 example questions with metadata.
- Cross‑topic links: related topics that co‑appear on the same exams.
- Study strategy: prioritized approach (what to master first, what to skip).
- Practice recommendations: suggested number of questions + targeted types.
- Confidence checklist: criteria the student should meet before moving on.

---

## 1) Target API Response Shape

```json
{
  "topic": {
    "id": "integration_by_parts",
    "name": "Integration by Parts",
    "section": "3.1",
    "course_id": "calc2",
    "category": "Integration Techniques",
    "description": "When to use IBP, how to choose u/dv, and cyclic patterns."
  },
  "stats": {
    "appearance_count": 7,
    "appearance_rate": 0.7,
    "last_seen_year": 2025,
    "recency_score": 0.85,
    "avg_difficulty": 3.6,
    "difficulty_distribution": { "1": 0, "2": 2, "3": 3, "4": 2, "5": 0 },
    "avg_points": 9.4,
    "avg_time_minutes": 9
  },
  "patterns": [
    {
      "pattern_id": "p_ibp_cyclic_exp_trig",
      "name": "Cyclic IBP with exp/trig",
      "canonical_form": "\\int e^{v1} \\sin(v1) dv1",
      "appearance_count": 3,
      "appearance_rate": 0.3,
      "example_question_ids": ["q_2015w_3", "q_2025w_1"]
    }
  ],
  "question_types": [
    "Evaluate ∫ e^{ax} sin(bx) dx (cyclic IBP)",
    "Evaluate ∫ x^n ln(x) dx (u=ln x)"
  ],
  "techniques": [
    { "id": "integration_by_parts", "count": 7 },
    { "id": "cyclic_integration", "count": 3 },
    { "id": "u_substitution", "count": 2 }
  ],
  "pitfalls": [
    "Incorrect u/dv choice leads to harder algebra",
    "Missing the cyclic pattern and solving for the original integral"
  ],
  "examples": [
    {
      "id": "q_2015w_3",
      "question_text": "Evaluate $\\int \\frac{e^{-\\sqrt{x}}\\sin(\\sqrt{x})}{\\sqrt{x}} dx$",
      "difficulty": 4,
      "points": 10,
      "exam": { "year": 2015, "semester": "Winter", "type": "Midterm 1" }
    }
  ],
  "cross_topic_links": [
    { "topic_id": "trig_integrals", "coappear_rate": 0.4 },
    { "topic_id": "trig_substitution", "coappear_rate": 0.2 }
  ],
  "study_strategy": [
    "Master IBP formula and choose u to simplify derivatives",
    "Practice cyclic IBP until you can solve in 2–3 passes"
  ],
  "practice_recommendation": {
    "target_questions": 6,
    "focus": ["cyclic IBP", "ln(x) integrals"],
    "estimated_time_total": 50
  },
  "confidence_checklist": [
    "Can identify IBP in ≤10 seconds",
    "Can solve cyclic IBP without algebra errors",
    "Average time per problem ≤ 10 minutes"
  ]
}
```

---

## 2) Data Requirements (Current vs Needed)

**Already present in worker schema**
- `questions.topic_id`, `questions.techniques`, `questions.difficulty`
- `questions.estimated_time`, `questions.points`, `questions.source_exam_year`
- `exams.year`, `exams.semester`, `exams.exam_type`

**Recommended additions**
- `topics.description` (short topic overview)
- `topics.section` (canonical section string if not already stored)
- `question_patterns.example_question_id` (or query example from questions)

---

## 3) Computation Logic (Derived Fields)

**appearance_count**
```
COUNT(*) FROM questions WHERE topic_id = ?
```

**appearance_rate**
```
appearance_count / total_exam_count_for_course
```

**last_seen_year**
```
MAX(source_exam_year) FROM questions WHERE topic_id = ?
```

**recency_score** (example)
```
if last_seen_year >= current_year - 1 → 1.0
if last_seen_year >= current_year - 3 → 0.7
else → 0.4
```

**difficulty_distribution**
```
GROUP BY difficulty
```

**avg_points / avg_time_minutes**
```
AVG(points), AVG(estimated_time)
```

**techniques**
- Parse JSON array from `questions.techniques`, count frequency

**patterns**
- Use `question_patterns` table if available
- If not, group by `canonical_form + techniques`

**examples**
- Select 2–3 representative questions with exam metadata

**cross_topic_links**
- For each exam, count co-appearing topics; compute co-appear rate

**study_strategy / pitfalls**
- Start with fixed defaults per topic, later make data-driven

---

## 4) Implementation Steps (Backend)

1. **Extend DB (if needed)**
   - Add `topics.description`
   - Add `topics.section`
   - Optional: `question_patterns.example_question_id`

2. **Build `/api/courses/:courseId/topics/:topicId`**
   - Aggregate question stats for the topic
   - Pull example questions + exam metadata
   - Compute techniques + distributions
   - Return JSON in the shape above

3. **Add fallback handling**
   - If insufficient data (e.g., no questions), return explicit error
   - If missing techniques JSON, default to empty array

---

## 5) Validation Checklist

- ✅ Topic appears with non-zero question count
- ✅ Distributions sum correctly
- ✅ Examples exist and show exam metadata
- ✅ Recency reflects last seen year
- ✅ Techniques parsed correctly for all questions

---

## 6) Notes

- This spec is designed to be computed from existing tables without heavy new infra.
- Start minimal: compute stats + examples, then add patterns + cross-topic links.
