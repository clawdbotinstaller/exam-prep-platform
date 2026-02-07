# Exam Patterns Analysis (from Database)

> **Generated:** 2026-02-07
> **Source:** 33 questions from 5 exams (2015-2025)
> **Method:** Database analysis of seed data

---

## Exam Metadata Overview

| Exam ID | Year | Semester | Type | Total Points | Difficulty | Questions |
|---------|------|----------|------|--------------|------------|-----------|
| 2015_winter_midterm1 | 2015 | Winter | Midterm 1 | 50 | medium | 6 |
| 2019_winter_midterm2 | 2019 | Winter | Midterm 2 | 50 | hard | 6 |
| 2024_spring_midterm | 2024 | Spring | Midterm | 40 | medium | 7 |
| 2025_winter_midterm | 2025 | Winter | Midterm | 60 | medium | 7 |
| 2025_summer_midterm | 2025 | Summer | Midterm | 40 | medium | 7 |

### Key Statistics
- **Average questions per exam:** 6.6
- **Average points per exam:** 50
- **Average points per question:** 7.6
- **Most common exam type:** Midterm (not final)

---

## Section Coverage Analysis

### Question Frequency by Section

| Section | Topic | Questions | % of Total | Avg Points |
|---------|-------|-----------|------------|------------|
| 3.7 | Improper Integrals | 9 | 27% | 7.8 |
| 4.2 | Separable DEs | 6 | 18% | 6.7 |
| 3.4 | Partial Fractions | 5 | 15% | 8.0 |
| 3.3 | Trig Substitution | 4 | 12% | 8.5 |
| 3.2 | Trig Integrals | 4 | 12% | 7.5 |
| 4.5 | First-Order Linear DEs | 4 | 12% | 7.0 |
| 3.1 | Integration by Parts | 3 | 9% | 8.0 |
| 4.1 | Directly Integrable DEs | 1 | 3% | 10.0 |

### Section Appearance by Exam

| Section | 2015 | 2019 | 2024 | 2025W | 2025S | Frequency |
|---------|------|------|------|-------|-------|-----------|
| 3.1 | ✓ | ✓ | ✓ | ✗ | ✗ | 60% |
| 3.2 | ✗ | ✓ | ✓ | ✓ | ✗ | 60% |
| 3.3 | ✓ | ✗ | ✓ | ✗ | ✓ | 60% |
| 3.4 | ✓ | ✓ | ✓ | ✗ | ✓ | 80% |
| 3.7 | ✓ | ✓ | ✓ | ✓ | ✓ | 100% |
| 4.1 | ✗ | ✓ | ✗ | ✗ | ✗ | 20% |
| 4.2 | ✓ | ✓ | ✓ | ✓ | ✗ | 80% |
| 4.5 | ✓ | ✓ | ✓ | ✓ | ✓ | 100% |

**Key Finding:** Sections 3.7 (Improper Integrals) and 4.5 (First-Order Linear DEs) appear in **100% of exams**.

---

## Cross-Year Pattern Analysis

### Highly Recurring Question Patterns

#### 1. Cyclic Integration by Parts
- **Appears in:** 2015 Winter, 2025 Winter
- **Canonical form:** `∫ (e^√x × sin(√x)) / √x dx`
- **Pattern:** Exponential × trigonometric with root substitution
- **Exam frequency:** 40% (2/5 exams)
- **Difficulty:** 4-5 (Hard)

#### 2. Trig Substitution (sqrt form)
- **Appears in:** 2015 Winter, 2024 Spring, 2025 Summer
- **Canonical form:** `∫ x² / √(a² - x²) dx`
- **Pattern:** Polynomial over square root difference
- **Exam frequency:** 60% (3/5 exams)
- **Difficulty:** 4 (Hard)

#### 3. Improper Integrals with Logarithm
- **Appears in:** 2015 Winter, 2024 Spring, 2025 Summer
- **Canonical form:** `∫ x^n × ln(x) dx`
- **Pattern:** Polynomial × logarithm
- **Exam frequency:** 60% (3/5 exams)
- **Difficulty:** 3-4 (Medium-Hard)

#### 4. Separable Differential Equations
- **Appears in:** 2019 Winter, 2024 Spring, 2025 Winter/Summer
- **Canonical form:** `(x^n + c)y' = y`
- **Pattern:** Factored polynomial coefficients
- **Exam frequency:** 80% (4/5 exams)
- **Difficulty:** 3-4 (Medium-Hard)

#### 5. Integration by Parts (Basic)
- **Appears in:** 2015, 2019, 2024
- **Canonical form:** `∫ x^n × e^x dx` or `∫ x^n × sin(x) dx`
- **Pattern:** Polynomial × elementary function
- **Exam frequency:** 60% (3/5 exams)
- **Difficulty:** 3 (Medium)

---

## Difficulty Distribution

### Overall Distribution

| Difficulty | Count | Percentage | Description |
|------------|-------|------------|-------------|
| 1 (Very Easy) | 0 | 0% | - |
| 2 (Easy) | 3 | 9% | Straightforward application |
| 3 (Medium) | 10 | 30% | Standard exam questions |
| 4 (Hard) | 17 | 52% | Multi-step, tricky elements |
| 5 (Very Hard) | 3 | 9% | Complex, time-consuming |

**Average difficulty: 3.6/5** (Weighted toward hard)

### Difficulty by Section

| Section | Avg Difficulty | Distribution |
|---------|---------------|--------------|
| 3.1 | 3.7 | Medium-Hard |
| 3.2 | 3.5 | Medium-Hard |
| 3.3 | 4.0 | Hard |
| 3.4 | 3.6 | Medium-Hard |
| 3.7 | 3.8 | Medium-Hard |
| 4.1 | 3.0 | Medium |
| 4.2 | 3.5 | Medium-Hard |
| 4.5 | 3.8 | Medium-Hard |

**Hardest sections:** 3.3 (Trig Substitution), 3.7 (Improper Integrals)

---

## Time Estimate Analysis

### Time Estimates by Difficulty

| Difficulty | Avg Time (min) | Range |
|------------|----------------|-------|
| 2 | 6 | 5-8 |
| 3 | 10 | 8-12 |
| 4 | 14 | 12-18 |
| 5 | 18 | 15-25 |

### Total Time by Exam

| Exam | Total Time | Time/Question |
|------|------------|---------------|
| 2015 Winter | ~75 min | 12.5 min |
| 2019 Winter | ~85 min | 14.2 min |
| 2024 Spring | ~80 min | 11.4 min |
| 2025 Winter | ~90 min | 12.9 min |
| 2025 Summer | ~75 min | 10.7 min |

**Average exam time:** 81 minutes
**Recommended practice time:** 90 minutes (with buffer)

---

## Technique Frequency

### Most Common Techniques

| Technique | Occurrences | % of Questions |
|-----------|-------------|----------------|
| u-substitution | 18 | 55% |
| Integration by parts | 12 | 36% |
| Partial fractions | 10 | 30% |
| Trigonometric substitution | 8 | 24% |
| Limit evaluation | 9 | 27% |
| Improper integral handling | 9 | 27% |
| Separation of variables | 6 | 18% |
| Integrating factor | 4 | 12% |

---

## Recommended Sample Midterm Structure

Based on analysis of 5 exams, here is the optimal midterm structure:

### Format
- **Questions:** 7
- **Total Points:** 50
- **Estimated Time:** 75-90 minutes

### Question Distribution

| # | Section | Topic | Points | Difficulty | Time (min) |
|---|---------|-------|--------|------------|------------|
| 1 | 3.1 | Integration by Parts | 6 | 3 | 8 |
| 2 | 3.2 | Trigonometric Integrals | 6 | 3 | 10 |
| 3 | 3.3 | Trigonometric Substitution | 8 | 4 | 12 |
| 4 | 3.4 | Partial Fractions | 7 | 3 | 10 |
| 5 | 3.7 | Improper Integrals | 8 | 4 | 12 |
| 6 | 4.2 | Separable DE | 7 | 3 | 10 |
| 7 | 4.5 | First-Order Linear DE | 8 | 4 | 13 |

**Total:** 50 points, ~75 minutes

### Key Patterns to Include

1. **At least 1 subpart question** (a/b format)
   - Seen in 2019, 2025 Winter
   - Example: "(a) Find general solution (b) Solve IVP"

2. **Mix of definite and indefinite integrals**
   - Ratio: ~60% definite, 40% indefinite
   - Definite integrals often have "nice" answers

3. **At least 1 IVP (Initial Value Problem)**
   - Appears in 80% of exams
   - Usually worth 6-8 points

4. **One "tricky" question**
   - Typically involves subtle limit behavior
   - Often in improper integrals or IBP
   - Students frequently miss boundary conditions

5. **Coverage of both chapters**
   - Integration: ~70% of questions
   - Differential Equations: ~30% of questions

---

## Insights for Weighting Algorithm

### Recency Scoring
- **2024-2025 exams** (40% weight): Most predictive
- **2020-2023 exams** (20% weight): Moderately predictive
- **2015-2019 exams** (10% weight): Less predictive but still valuable

### Repetition Bonus
- Questions appearing in **2+ exams** get +20 points
- Questions appearing in **3+ exams** get +30 points
- Questions with similar canonical forms get +15 points

### Section Priority
1. **Must include:** 3.7, 4.5 (100% exam frequency)
2. **Should include:** 3.4, 4.2 (80% exam frequency)
3. **Rotate among:** 3.1, 3.2, 3.3 (60% exam frequency)
4. **Optional:** 4.1 (20% exam frequency)

### Difficulty Matching
- **Easy tier:** Focus on difficulty 2-3 (avoid 4.5)
- **Sample tier:** Match 30% medium, 50% hard, 20% very hard
- **Hard tier:** Focus on difficulty 4-5, prioritize multi-step

---

## Data Source

- **File:** `worker/src/index.ts`
- **Exams:** Lines 321-325
- **Questions:** Lines 331-400+
- **Related:** `worker/scripts/seed-full.sql`

---

*This analysis will be used to configure the Sample midterm tier and inform the weighted selection algorithm.*
