# Data Ingestion Plan (PDF → Structured Questions)

> **Last Updated:** 2026-02-06
> **Goal:** Convert 5 Calc II exam PDFs into a structured, queryable D1 database with minimal pipeline complexity.

---

## 1. Philosophy: Kimi-First, Two-Step Pipeline

Instead of a multi-stage pipeline with orchestration, we use Kimi's reasoning capabilities to do extraction, tagging, and canonicalization in **one shot per exam**.

**The Pipeline:**

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   5 PDFs    │────▶│ Kimi One-Shot   │────▶│ Aggregation      │────▶│  Cloudflare │
│             │     │ (per exam)      │     │ (cross-exam)     │     │  D1         │
└─────────────┘     └─────────────────┘     └──────────────────┘     └─────────────┘
                         5 JSON files           Pattern linking
```

**Why this works:**
- Kimi handles: extraction, solution generation, topic tagging, difficulty scoring, canonicalization
- Simple script handles: pattern grouping across exams, frequency calculation, D1 formatting
- Total processing time: ~15 minutes for 5 exams

---

## 2. Target Data Model (Unchanged)

**Exam**
- `exam_id`, `course_id`, `year`, `semester`, `exam_type`, `total_points`, `exam_date`

**Question**
- `question_id`, `exam_id`, `topic_id`, `question_number`
- `question_text` (LaTeX), `solution_text` (step-by-step)
- `points`, `difficulty` (1–5), `difficulty_reason`
- `techniques` (JSON array: ["integration_by_parts", "trig_sub"])
- `canonical_form` (normalized for pattern matching)
- `pattern_id` (assigned in aggregation step)
- `frequency_score` (computed in aggregation step)

**Question Pattern**
- `pattern_id`, `topic_id`, `techniques`, `canonical_form`
- `appearance_count`, `appearance_rate`, `first_seen_year`, `last_seen_year`

---

## 3. Step 1: Kimi One-Shot Extraction

### Input
Single exam PDF (or extracted text if PDF is image-based)

### Prompt Template

```
You are extracting structured data from a Calculus 2 exam. Parse all questions and output strict JSON.

## Output Format

{
  "exam": {
    "year": 2023,
    "semester": "Spring",
    "exam_type": "Midterm",
    "total_points": 100
  },
  "questions": [
    {
      "number": "3",
      "question_text": "Evaluate $\\int x^2 \\ln(x) dx$",
      "solution_text": "Step 1: Identify this requires integration by parts. Let $u = \\ln(x)$ and $dv = x^2 dx$. Then $du = \\frac{1}{x}dx$ and $v = \\frac{x^3}{3}$.\\n\\nStep 2: Apply the formula $\\int u dv = uv - \\int v du$...",
      "points": 12,
      "topic": "Integration by Parts",
      "techniques": ["integration_by_parts", "polynomial_integration"],
      "difficulty": 3,
      "difficulty_reason": "Requires correct identification of u and dv, plus handling polynomial integration",
      "canonical_form": "\\int v1^c1 \\ln(v1) dv1",
      "estimated_time_minutes": 5,
      "has_subparts": false
    }
  ]
}

## Rules

1. **question_text**: Use LaTeX for all math. Preserve the exact wording of the problem.

2. **solution_text**: Generate complete step-by-step solution even if source only shows answer. Use LaTeX for math. Number each step clearly.

3. **topic**: Use one of these exact values:
   - "Integration by Parts"
   - "Integration by Substitution"
   - "Trigonometric Integrals"
   - "Trigonometric Substitution"
   - "Partial Fractions"
   - "Improper Integrals"
   - "Areas and Volumes"
   - "Arc Length and Surface Area"
   - "Series Basics"
   - "Geometric Series"
   - "Integral Test"
   - "Comparison Tests"
   - "Alternating Series"
   - "Ratio and Root Tests"
   - "Power Series"
   - "Taylor and Maclaurin Series"
   - "Parametric Equations"
   - "Polar Coordinates"

4. **techniques**: Array of specific techniques used. Examples:
   - ["integration_by_parts", "polynomial_integration"]
   - ["u_substitution", "trig_identity"]
   - ["ratio_test", "factorial_simplification"]

5. **difficulty**: Rate 1-5 based on:
   - 1: 1-2 steps, single technique, obvious path
   - 2: 2-3 steps, single technique, minor decision
   - 3: 3-5 steps, 1-2 techniques, moderate complexity
   - 4: 5-7 steps, multiple techniques, common traps
   - 5: 7+ steps, multi-technique, high trickiness

6. **canonical_form**: Normalize the question for pattern matching:
   - Replace all variables with v1, v2, v3...
   - Replace all constants with c1, c2, c3...
   - Keep the structure (integral, sum, derivative, etc.)
   - Example: "∫ x² ln(x) dx" → "\\int v1^c1 \\ln(v1) dv1"

7. **has_subparts**: true if question has (a), (b), (c) parts

8. If subparts exist, create separate entries for each with numbers like "3a", "3b", "3c"

Process the attached exam and output valid JSON only.
```

### Output
`{year}_{semester}_{exam_type}.json` (e.g., `2023_Spring_Midterm.json`)

### Execution
Run for all 5 exams in parallel:

```bash
# Manual or script
kimi process 2022_Final.pdf > 2022_Final.json
kimi process 2023_Midterm.pdf > 2023_Midterm.json
kimi process 2023_Final.pdf > 2023_Final.json
kimi process 2024_Midterm.pdf > 2024_Midterm.json
kimi process 2024_Final.pdf > 2024_Final.json
```

---

## 4. Step 2: Aggregation Script

The aggregation script processes all 5 JSON files and:
1. Groups questions into patterns by canonical form similarity
2. Assigns `pattern_id` to each question
3. Computes frequency statistics
4. Outputs D1-ready seed files

### Pattern Grouping Logic

```python
def generate_pattern_signature(question):
    """Create deterministic signature from canonical form + techniques"""
    techniques = sorted(question['techniques'])
    return f"{question['topic']}|{','.join(techniques)}|{question['canonical_form']}"

# Group questions by signature
patterns = {}
for question in all_questions:
    sig = generate_pattern_signature(question)
    if sig not in patterns:
        patterns[sig] = {
            'pattern_id': hash(sig),
            'topic': question['topic'],
            'techniques': question['techniques'],
            'canonical_form': question['canonical_form'],
            'questions': [],
            'appearance_count': 0,
            'first_seen_year': 9999,
            'last_seen_year': 0
        }
    patterns[sig]['questions'].append(question)
    patterns[sig]['appearance_count'] += 1
    patterns[sig]['first_seen_year'] = min(patterns[sig]['first_seen_year'], question['exam_year'])
    patterns[sig]['last_seen_year'] = max(patterns[sig]['last_seen_year'], question['exam_year'])

# Calculate appearance rate
for pattern in patterns.values():
    pattern['appearance_rate'] = pattern['appearance_count'] / total_exams
```

### Output Files

**questions.seed.json**
```json
[
  {
    "question_id": "q_2023_spring_midterm_3",
    "exam_id": "2023_spring_midterm",
    "pattern_id": "p_12345",
    "question_number": "3",
    "question_text": "Evaluate $\\int x^2 \\ln(x) dx$",
    "solution_text": "Step 1: ...",
    "points": 12,
    "difficulty": 3,
    "difficulty_reason": "Requires correct identification of u and dv...",
    "techniques": "[\"integration_by_parts\",\"polynomial_integration\"]",
    "frequency_score": 0.6
  }
]
```

**patterns.seed.json**
```json
[
  {
    "pattern_id": "p_12345",
    "topic_id": "integration_by_parts",
    "techniques": "[\"integration_by_parts\",\"polynomial_integration\"]",
    "canonical_form": "\\int v1^c1 \\ln(v1) dv1",
    "appearance_count": 3,
    "appearance_rate": 0.6,
    "first_seen_year": 2022,
    "last_seen_year": 2024
  }
]
```

**exams.seed.json**
```json
[
  {
    "exam_id": "2023_spring_midterm",
    "course_id": "calc2",
    "year": 2023,
    "semester": "Spring",
    "exam_type": "Midterm",
    "total_points": 100,
    "exam_date": "2023-03-15"
  }
]
```

---

## 5. Step 3: D1 Import

Load the seed files into Cloudflare D1:

```bash
# Import exams
wrangler d1 execute testament-db --file=./exams.seed.sql

# Import patterns (first, since questions reference them)
wrangler d1 execute testament-db --file=./patterns.seed.sql

# Import questions
wrangler d1 execute testament-db --file=./questions.seed.sql
```

Or use the D1 HTTP API from a script.

---

## 6. File Layout

```
/data
  /raw
    2022_Final.pdf
    2023_Midterm.pdf
    2023_Final.pdf
    2024_Midterm.pdf
    2024_Final.pdf

  /extracted
    2022_Final.json           # Kimi output
    2023_Midterm.json
    2023_Final.json
    2024_Midterm.json
    2024_Final.json

  /seed
    exams.seed.json           # Aggregation output
    patterns.seed.json
    questions.seed.json
    import.sql                # Combined SQL for D1

/scripts
  aggregate.py                # Pattern grouping + frequency
  validate.py                 # Check coverage, flag issues
  import_to_d1.py             # Load to Cloudflare
```

---

## 7. Validation Checklist

Run `validate.py` before importing:

- [ ] All 5 exams parsed (100% coverage)
- [ ] 80+ questions extracted (expect ~16 per exam)
- [ ] All questions have non-empty solution_text
- [ ] All questions tagged with valid topic
- [ ] Difficulty ratings distributed (not all 3s)
- [ ] Canonical forms are unique enough (manual spot-check)
- [ ] Pattern grouping looks reasonable (10-20 patterns expected)

---

## 8. Topics Ontology (Fixed List)

Kimi must use these exact topic names:

| Category | Topics |
|----------|--------|
| **Integration Techniques** | Integration by Parts, Integration by Substitution, Trigonometric Integrals, Trigonometric Substitution, Partial Fractions, Improper Integrals |
| **Applications** | Areas and Volumes, Arc Length and Surface Area, Work and Fluid Problems, Moments and Centers of Mass |
| **Series** | Series Basics, Geometric Series, Integral Test, Comparison Tests, Alternating Series, Ratio and Root Tests, Power Series, Taylor and Maclaurin Series |
| **Parametric/Polar** | Parametric Equations, Polar Coordinates |

---

## 9. Error Handling

**If Kimi produces invalid JSON:**
- Retry with same prompt (temperature=0 for consistency)
- If persists, manually fix JSON syntax

**If canonical forms are too vague:**
- Adjust prompt to include more structure
- Or manually review and refine

**If pattern grouping is wrong:**
- Override specific questions in `aggregate.py`
- Or accept approximation (80% correct grouping is fine for MVP)

---

## 10. Time Estimate

| Task | Time |
|------|------|
| Kimi extraction (5 exams) | 15 min |
| Review JSON outputs | 20 min |
| Run aggregation script | 1 min |
| Validate + spot check | 15 min |
| Import to D1 | 2 min |
| **Total** | **~1 hour** |

---

## 11. Next Steps

1. **Test Kimi prompt** with one PDF, refine until output is perfect
2. **Process all 5 exams** through Kimi
3. **Run aggregation script** to generate patterns + frequency
4. **Validate outputs** with spot checks
5. **Import to D1** using wrangler
6. **Test queries** in your app

---

**Document Status:** Ready for implementation
**Next Action:** Test Kimi prompt with first PDF
