# Calculus Volume 2 - AI-Parsed Formats

This directory contains the OpenStax Calculus Volume 2 textbook converted into multiple AI-friendly formats while preserving the original structure and formatting.

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

### 1. `Calculus_Volume_2_AI_Friendly.md` (Recommended for LLMs)

A comprehensive Markdown file with:
- **Hierarchical structure**: Chapters → Sections → Examples/Theorems/Definitions
- **Preserved formatting**: Headers, lists, emphasis, and special blocks
- **Clean text**: Hyphenation fixed, proper paragraph breaks
- **Special blocks marked**: Examples, Theorems, Definitions, Checkpoints clearly labeled
- **Table of Contents**: Linked navigation to all chapters

**Best for:**
- Direct ingestion by LLMs (ChatGPT, Claude, etc.)
- Semantic search and retrieval
- Human reading and reference

**Size:** ~900KB of structured text

---

### 2. `Calculus_Volume_2_Structure.json` (For Programmatic Access)

A JSON file with structured data:
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
          "content": "..."
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

### 3. `Calculus_Volume_2_Structured.md` (Alternative Markdown)

An alternative Markdown format with slightly different formatting choices.

## Content Structure

### Chapters

1. **Integration**
   - Approximating Areas
   - The Definite Integral
   - The Fundamental Theorem of Calculus
   - Integration Formulas and the Net Change Theorem
   - Substitution
   - Integrals Involving Exponential and Logarithmic Functions
   - Integrals Resulting in Inverse Trigonometric Functions

2. **Applications of Integration**
   - Areas between Curves
   - Determining Volumes by Slicing
   - Volumes of Revolution: Cylindrical Shells
   - Arc Length of a Curve and Surface Area
   - Physical Applications
   - Moments and Centers of Mass
   - Integrals, Exponential Functions, and Logarithms
   - Exponential Growth and Decay
   - Calculus of the Hyperbolic Functions

3. **Techniques of Integration**
   - Integration by Parts
   - Trigonometric Integrals
   - Trigonometric Substitution
   - Partial Fractions
   - Other Strategies for Integration
   - Numerical Integration
   - Improper Integrals

4. **Introduction to Differential Equations**
   - Basics of Differential Equations
   - Direction Fields and Numerical Methods
   - Separable Equations
   - The Logistic Equation
   - First-order Linear Equations

5. **Sequences and Series**
   - Sequences
   - Infinite Series
   - The Divergence and Integral Tests
   - Comparison Tests
   - Alternating Series
   - Ratio and Root Tests

6. **Power Series**
   - Power Series and Functions
   - Properties of Power Series
   - Taylor and Maclaurin Series
   - Working with Taylor Series

7. **Parametric Equations and Polar Coordinates**
   - Parametric Equations
   - Calculus of Parametric Curves
   - Polar Coordinates
   - Area and Arc Length in Polar Coordinates
   - Conic Sections

## How to Use with AI Systems

### For ChatGPT/Claude (Direct Upload)

Upload `Calculus_Volume_2_AI_Friendly.md` directly. The file is structured with clear headers that help the AI understand the hierarchy:

```
# Chapter 1: Integration
## 1.1 Approximating Areas
### Example 1.1
**Solution:**
```

### For RAG (Retrieval-Augmented Generation)

Use the JSON format to create chunks:

```python
import json

with open('Calculus_Volume_2_Structure.json') as f:
    data = json.load(f)

for chapter in data['chapters']:
    for section in chapter['sections']:
        chunk = {
            'chapter': chapter['title'],
            'section': section['title'],
            'content': section['content'],
            'metadata': {
                'chapter_num': chapter['chapter_number'],
                'section_num': section['section_number']
            }
        }
        # Add to your vector database
```

### For Semantic Search

The Markdown format works well with semantic search because:
- Headers provide clear context
- Mathematical content is preserved as text
- Examples and theorems are clearly labeled

## Formatting Conventions

- **Chapters**: `## Chapter N: Title`
- **Sections**: `### N.M Section Title`
- **Examples**: `#### Example N.M`
- **Theorems**: `#### Theorem N.M`
- **Definitions**: `#### Definition N.M`
- **Solutions**: `**Solution:**`
- **Key Terms/Equations**: `#### Key Terms`

## Known Limitations

1. **Mathematical notation**: Complex equations are preserved as text but may not render perfectly in all Markdown viewers. The original LaTeX-style notation is maintained.

2. **Figures**: Figure captions are preserved, but the actual images are not included (text-only extraction).

3. **Tables**: Tables are converted to text representation.

4. **Exercise numbers**: Some exercise numbering may have merged during extraction.

## License

This converted version maintains the same CC BY-NC-SA 4.0 license as the original OpenStax textbook.

**Attribution:** Access for free at openstax.org

## Conversion Details

- **Tool used**: PyMuPDF (fitz) for text extraction
- **Processing**: Custom Python script with regex-based structure detection
- **Date converted**: 2026-02-07
- **Original PDF**: 737 pages, 15.7 MB

---

For questions about the original content, visit: https://openstax.org/details/books/calculus-volume-2
