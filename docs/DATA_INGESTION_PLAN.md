# Data Ingestion Plan (PDF → Structured Questions)

> **Last Updated:** 2026-02-06
> **Goal:** Convert past exam PDFs into clean, structured data for analysis, practice, and archive modes.

---

## 1. Inputs & Assumptions

- Sources: Past midterms/finals PDFs (2022–2026).
- Some PDFs are text-based, others may be scanned images.
- Output must include topic, techniques, difficulty (1–5), frequency, and exam metadata.

---

## 2. Pipeline Overview

1. **Classify PDF Type**
   - Detect text-based vs scanned.
   - If scanned, use OCR; if text-based, extract directly.

2. **Extract Raw Text**
   - Text-based: `pdfplumber` or `pdf-parse`.
   - Scanned: OCR (Tesseract or a paid service for math fidelity).

3. **Segment Into Questions**
   - Heuristics: question numbering patterns, point values, section headings.
   - Output: raw question blocks with page references.

4. **Normalize & Clean**
   - Fix encoding artifacts.
   - Normalize spacing and symbols.
   - Preserve LaTeX where possible.

5. **Tag & Structure**
   - Topic (e.g., integration, series).
   - Techniques (e.g., integration by parts, ratio test).
   - Difficulty (1–5).
   - Question type (free response vs multiple choice).

6. **Generate Pattern Signatures**
   - Canonicalize question text and techniques.
   - Assign to a `pattern_id` for similarity grouping.

7. **Compute Frequency**
   - For each `pattern_id`, calculate appearance rate across exams.

8. **Manual QA**
   - Spot check random samples.
   - Fix bad tagging or OCR mistakes.

9. **Export**
   - Create JSON exports and seed D1 tables.

---

## 3. JSON Schema (Intermediate)

```json
{
  "exam": {
    "course_id": "calc2",
    "year": 2024,
    "semester": "Fall",
    "exam_type": "midterm",
    "total_points": 100
  },
  "questions": [
    {
      "question_id": "q_2024_fall_m1_04",
      "question_number": 4,
      "topic": "Integration by Parts",
      "techniques": ["integration_by_parts", "log_properties"],
      "difficulty": 3,
      "difficulty_reason": "4-step solution with a substitution pivot",
      "question_text": "Evaluate ∫ x^2 ln(x) dx",
      "solution_text": "Step-by-step solution here",
      "points": 12,
      "pattern_id": "ibp_log_variant",
      "frequency_score": 0.67
    }
  ]
}
```

---

## 4. Difficulty Scoring (1–5)

**Primary signals:**
- Solution length (number of steps)
- Number of techniques used
- Presence of common traps

**Suggested rubric:**
- **1:** 1–2 steps, single technique, minimal trickiness
- **2:** 2–3 steps, single technique, low trickiness
- **3:** 3–5 steps, 1–2 techniques, moderate traps
- **4:** 5–7 steps, multiple techniques, common mistakes likely
- **5:** 7+ steps, multi-technique, high trickiness or proof-like

---

## 5. Frequency / Repeat Rate

**Goal:** Identify patterns that repeat across exams.

**Method:**
1. Assign `pattern_id` using:
   - Topic + technique set
   - Canonicalized question text
   - (Optional) embedding similarity for fuzzy matches
2. For each pattern:
   - `appearance_count` = number of exams containing that pattern
   - `appearance_rate` = `appearance_count / total_exams`
3. Derive labels:
   - **High frequency:** rate ≥ 0.60
   - **Medium:** 0.30–0.59
   - **Low:** < 0.30

**Stored per question:**
- `pattern_id`
- `frequency_score` (0–1)

---

## 6. Midterm vs Final Organization

- Store `exam_type` on the exam record.
- Filterable in archive.
- Midterm practice generator:
  - Easy: shorter + easier mix
  - Sample: realistic distribution
  - Hard: longest + highest difficulty

---

## 7. D1 Ingestion Targets

- `exams` (metadata)
- `questions` (full content + tags)
- `question_patterns` (frequency groups)
- `topics` (topic taxonomy)

---

## 8. QA & Validation Checklist

- [ ] 100% of exams parsed into question blocks
- [ ] 90%+ of questions correctly tagged with a topic
- [ ] 100% of questions linked to exam/year/type
- [ ] Random sample of 20 questions validated by human
- [ ] Pattern frequency computed and stored

