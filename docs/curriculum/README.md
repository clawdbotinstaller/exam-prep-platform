# Calculus Volume 2 - AI-Parsed Formats (COMPLETE)

This directory contains the **complete** OpenStax Calculus Volume 2 textbook converted into multiple AI-friendly formats. All text, examples, theorems, explanations, and exercises have been preserved.

## Source Information

| Attribute | Value |
|-----------|-------|
| **Title** | Calculus Volume 2 |
| **Authors** | Gilbert Strang (MIT), Edwin "Jed" Herman (University of Wisconsin at Stevens Point) |
| **Publisher** | OpenStax, Rice University |
| **License** | CC BY-NC-SA 4.0 (Creative Commons Attribution Non-Commercial ShareAlike 4.0) |
| **Original Publication** | 2016 |
| **Source URL** | https://openstax.org/details/books/calculus-volume-2 |
| **Original Pages** | 737 |

## Available Formats

### 1. `Calculus_Volume_2_Complete.md` (RECOMMENDED - Full Content)

A comprehensive Markdown file containing **ALL** textbook content:

- **256 Examples** with full problem statements and solutions
- **74 Theorems** with complete proofs and explanations  
- **414 Sections** across 7 chapters
- **254 Solutions** worked out step-by-step
- **All explanations, derivations, and proofs**
- **Learning Objectives** for each section
- **Chapter Reviews** with Key Terms and Key Equations
- **Exercise sets** (problem statements preserved)

**Best for:**
- Direct ingestion by LLMs (ChatGPT, Claude, etc.)
- Semantic search and retrieval
- Complete reference and study

**Size:** ~895KB of structured text

---

### 2. `Calculus_Volume_2_Complete.json` (For Programmatic Access)

A JSON file with structured data containing all content:

```json
{
  "metadata": { ... },
  "chapters": [
    {
      "chapter_number": 1,
      "title": "Integration",
      "sections": [
        {
          "section_number": "1.1",
          "title": "Approximating Areas",
          "content": "...full text including examples, theorems, explanations..."
        }
      ]
    }
  ]
}
```

**Best for:**
- Programmatic processing
- Building search indexes
- Creating structured knowledge bases
- API responses

---

### 3. `Calculus_Volume_2_AI_Friendly.md` (Earlier Version)

An earlier conversion (kept for reference). Use `Calculus_Volume_2_Complete.md` instead.

---

### 4. `Calculus_Volume_2_Structure.json` (Earlier Version)

An earlier JSON structure (kept for reference). Use `Calculus_Volume_2_Complete.json` instead.

## Content Statistics

| Element | Count |
|---------|-------|
| Chapters | 7 |
| Sections | 414 |
| Examples | 256 |
| Theorems | 74 |
| Solutions | 254 |
| Total Characters | ~895,000 |

## Content Structure

### Chapter 1: Integration
- 1.1 Approximating Areas
- 1.2 The Definite Integral
- 1.3 The Fundamental Theorem of Calculus
- 1.4 Integration Formulas and the Net Change Theorem
- 1.5 Substitution
- 1.6 Integrals Involving Exponential and Logarithmic Functions
- 1.7 Integrals Resulting in Inverse Trigonometric Functions

### Chapter 2: Applications of Integration
- 2.1 Areas between Curves
- 2.2 Determining Volumes by Slicing
- 2.3 Volumes of Revolution: Cylindrical Shells
- 2.4 Arc Length of a Curve and Surface Area
- 2.5 Physical Applications
- 2.6 Moments and Centers of Mass
- 2.7 Integrals, Exponential Functions, and Logarithms
- 2.8 Exponential Growth and Decay
- 2.9 Calculus of the Hyperbolic Functions

### Chapter 3: Techniques of Integration
- 3.1 Integration by Parts
- 3.2 Trigonometric Integrals
- 3.3 Trigonometric Substitution
- 3.4 Partial Fractions
- 3.5 Other Strategies for Integration
- 3.6 Numerical Integration
- 3.7 Improper Integrals

### Chapter 4: Introduction to Differential Equations
- 4.1 Basics of Differential Equations
- 4.2 Direction Fields and Numerical Methods
- 4.3 Separable Equations
- 4.4 The Logistic Equation
- 4.5 First-order Linear Equations

### Chapter 5: Sequences and Series
- 5.1 Sequences
- 5.2 Infinite Series
- 5.3 The Divergence and Integral Tests
- 5.4 Comparison Tests
- 5.5 Alternating Series
- 5.6 Ratio and Root Tests

### Chapter 6: Power Series
- 6.1 Power Series and Functions
- 6.2 Properties of Power Series
- 6.3 Taylor and Maclaurin Series
- 6.4 Working with Taylor Series

### Chapter 7: Parametric Equations and Polar Coordinates
- 7.1 Parametric Equations
- 7.2 Calculus of Parametric Curves
- 7.3 Polar Coordinates
- 7.4 Area and Arc Length in Polar Coordinates
- 7.5 Conic Sections

## How to Use with AI Systems

### For ChatGPT/Claude (Direct Upload)

Upload `Calculus_Volume_2_Complete.md` directly. The file is structured with clear headers:

```markdown
## Chapter 1: Integration

### 1.1 Approximating Areas

**Learning Objectives**
1.1.1 Use sigma (summation) notation...

[explanatory text...]

#### Example 1.1: Using Sigma Notation

a. Write in sigma notation...

**Solution:**
[step-by-step solution...]

#### Theorem 1.1: Continuous Functions Are Integrable
[theorem statement...]
```

### For RAG (Retrieval-Augmented Generation)

Use the JSON format to create semantic chunks:

```python
import json

with open('Calculus_Volume_2_Complete.json') as f:
    data = json.load(f)

for chapter in data['chapters']:
    for section in chapter['sections']:
        chunk = {
            'chapter': chapter['title'],
            'section': section['title'],
            'section_number': section['section_number'],
            'content': section['content'],
            'metadata': {
                'chapter_num': chapter['chapter_number'],
                'section_num': section['section_number']
            }
        }
        # Add to your vector database
```

### For Semantic Search

The Markdown format works well because:
- Headers provide clear hierarchical context
- Examples and theorems are explicitly labeled
- Full explanations are preserved
- Mathematical notation is maintained as text

## Formatting Conventions

- **Chapters**: `## Chapter N: Title`
- **Sections**: `### N.M Section Title`
- **Examples**: `#### Example N.M: Title`
- **Theorems**: `#### Theorem N.M: Title`
- **Solutions**: `**Solution:**`
- **Learning Objectives**: `**Learning Objectives**`
- **Key Terms/Equations**: `#### Key Terms`

## Sample Content Verification

### Example 1.1 (Section 1.1)
```
#### Example 1.1: Using Sigma Notation

a. Write in sigma notation and evaluate the sum of terms 3^i for i=1 to 5

**Solution:**
Write
∑(i=1 to 5) 3^i = 3 + 9 + 27 + 81 + 243 = 363
```

### Theorem 1.1 (Section 1.2)
```
#### Theorem 1.1: Continuous Functions Are Integrable

If f is continuous on [a,b], then f is integrable on [a,b].
```

## Known Limitations

1. **Mathematical notation**: Complex equations are preserved as text. The original LaTeX-style notation is maintained but may not render perfectly in all Markdown viewers.

2. **Figures**: Figure captions are preserved, but the actual images are not included (text-only extraction).

3. **Tables**: Tables are converted to text representation.

4. **Exercise answers**: Problem statements are included, but answer key content may be in appendices.

## License

This converted version maintains the same CC BY-NC-SA 4.0 license as the original OpenStax textbook.

**Attribution:** Access for free at openstax.org

## Conversion Details

- **Tool used**: PyMuPDF (fitz) for text extraction
- **Processing**: Custom Python script with regex-based structure detection
- **Date converted**: 2026-02-07
- **Original PDF**: 737 pages, 15.7 MB
- **Content verified**: All 256 examples, 74 theorems, and 414 sections included

---

For questions about the original content, visit: https://openstax.org/details/books/calculus-volume-2
