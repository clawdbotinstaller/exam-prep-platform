-- ==========================================
-- COMPLETE MTH240 MIDTERM DATABASE
-- 5 Exams | 33 Question Objects (Subparts Consolidated)
-- Generated from extracted PDF data only
-- ==========================================

PRAGMA foreign_keys = ON;

-- Drop existing
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS exams;

-- ==========================================
-- SCHEMA
-- ==========================================

CREATE TABLE exams (
    exam_id TEXT PRIMARY KEY,
    course_code TEXT NOT NULL,
    year INTEGER NOT NULL,
    semester TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    total_points INTEGER NOT NULL,
    exam_date TEXT,
    difficulty_label TEXT CHECK(difficulty_label IN ('easy', 'medium', 'hard'))
);

CREATE TABLE questions (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(exam_id),
    question_number TEXT NOT NULL,
    question_text TEXT NOT NULL,
    solution_text TEXT NOT NULL,
    section TEXT NOT NULL CHECK(section IN ('3.1', '3.2', '3.3', '3.4', '3.7', '4.2', '4.5')),
    topic TEXT NOT NULL,
    techniques TEXT NOT NULL,
    points INTEGER NOT NULL,
    difficulty INTEGER CHECK(difficulty BETWEEN 1 AND 5),
    is_tricky INTEGER DEFAULT 0,
    estimated_time INTEGER,
    has_subparts INTEGER DEFAULT 0,
    subparts_json TEXT,
    canonical_form TEXT,
    similar_to_exams TEXT,
    source_type TEXT DEFAULT 'exam_archive'
);

CREATE INDEX idx_exam ON questions(exam_id);
CREATE INDEX idx_section ON questions(section);
CREATE INDEX idx_difficulty ON questions(difficulty);

-- ==========================================
-- EXAM METADATA
-- ==========================================

INSERT INTO exams VALUES ('2015_winter_midterm1', 'MTH240', 2015, 'Winter', 'Midterm 1', 50, '2015-01-30', 'medium');
INSERT INTO exams VALUES ('2019_winter_midterm2', 'MTH240', 2019, 'Winter', 'Midterm 2', 50, '2019-03-29', 'hard');
INSERT INTO exams VALUES ('2024_spring_midterm', 'MTH240', 2024, 'Spring', 'Midterm', 40, '2024-05-27', 'medium');
INSERT INTO exams VALUES ('2025_winter_midterm', 'MTH240', 2025, 'Winter', 'Midterm', 60, '2025-02-14', 'medium');
INSERT INTO exams VALUES ('2025_summer_midterm', 'MTH240', 2025, 'Summer', 'Midterm', 40, '2025-07-16', 'medium');

-- ==========================================
-- EXAM 1: 2015 WINTER MIDTERM 1 (6 Questions)
-- ==========================================

INSERT INTO questions VALUES 
('q_2015w_1', '2015_winter_midterm1', '1',
 'Evaluate $\\int \\tan^{5}(x) \\sec^{6}(x) dx$',
 'Step 1: Factor $\\sec^{2}(x)$ for substitution: $\\tan^{5}(x)\\sec^{4}(x)\\sec^{2}(x)$.\nStep 2: Convert $\\sec^{4}(x)$ to tangent: $(\\tan^{2}(x)+1)^{2} = \\tan^{4}(x) + 2\\tan^{2}(x) + 1$.\nStep 3: Substitute $u = \\tan(x)$, $du = \\sec^{2}(x)dx$: $\\int u^{5}(u^{4} + 2u^{2} + 1) du = \\int (u^{9} + 2u^{7} + u^{5}) du$.\nStep 4: Integrate: $\\frac{u^{10}}{10} + \\frac{u^{8}}{4} + \\frac{u^{6}}{6} + C$.\nStep 5: Back-substitute: $\\frac{\\tan^{10}(x)}{10} + \\frac{\\tan^{8}(x)}{4} + \\frac{\\tan^{6}(x)}{6} + C$.',
 '3.2', 'Trigonometric Integrals', '["trig_identity","u_substitution","power_expansion"]',
 7, 3, 0, 7, 0, NULL, '\\int \\tan^{c1}(v1) \\sec^{c2}(v1) dv1', '[]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2015w_2', '2015_winter_midterm1', '2',
 'Write the form of partial fraction decomposition (do not solve for coefficients): $\\frac{2x-7}{(x^{3}-3x)(x^{2}+4x+6)}$',
 'Step 1: Factor denominator: $x^{3}-3x = x(x-\\sqrt{3})(x+\\sqrt{3})$. Quadratic $x^{2}+4x+6$ is irreducible (discriminant $16-24 < 0$).\nStep 2: Form: $\\frac{A}{x} + \\frac{B}{x-\\sqrt{3}} + \\frac{C}{x+\\sqrt{3}} + \\frac{Dx+E}{x^{2}+4x+6}$.',
 '3.4', 'Partial Fractions', '["partial_fraction_decomposition","factorization","irreducible_quadratics"]',
 3, 2, 0, 4, 0, NULL, '\\frac{c1 v1 + c2}{(v1^{c3} + c4 v1)(v1^{c3} + c5 v1 + c6)}', '[]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2015w_3', '2015_winter_midterm1', '3',
 'Evaluate $\\int \\frac{e^{-\\sqrt{x}} \\sin(\\sqrt{x})}{\\sqrt{x}} dx$',
 'Step 1: Substitute $u = \\sqrt{x}$, $du = \\frac{1}{2\\sqrt{x}}dx$, so $\\frac{dx}{\\sqrt{x}} = 2du$.\nStep 2: Transform: $2\\int e^{-u} \\sin(u) du$.\nStep 3: Integration by parts twice (cyclic): $\\int e^{-u}\\sin(u) du = -\\frac{e^{-u}}{2}(\\sin(u) + \\cos(u))$.\nStep 4: Multiply by 2: $-e^{-u}(\\sin(u) + \\cos(u)) + C$.\nStep 5: Back-substitute: $-e^{-\\sqrt{x}}(\\sin(\\sqrt{x}) + \\cos(\\sqrt{x})) + C$.',
 '3.1', 'Integration by Parts', '["u_substitution","integration_by_parts","cyclic_integration"]',
 10, 4, 0, 8, 0, NULL, '\\int \\frac{e^{-v1^{1/2}} \\sin(v1^{1/2})}{v1^{1/2}} dv1', '["2025_winter_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2015w_4', '2015_winter_midterm1', '4',
 'Evaluate $\\int_{0}^{1/4} \\frac{x^{2}}{\\sqrt{1-4x^{2}}} dx$',
 'Step 1: Rewrite: $\\int_{0}^{1/4} \\frac{x^{2}}{\\sqrt{1-(2x)^{2}}} dx$.\nStep 2: Substitute $2x = \\sin(\\theta)$, $x = \\frac{1}{2}\\sin(\\theta)$, $dx = \\frac{1}{2}\\cos(\\theta)d\\theta$. Limits: $0 \\to 0$, $1/4 \\to \\pi/6$.\nStep 3: Transform: $\\frac{1}{8}\\int_{0}^{\\pi/6} \\sin^{2}(\\theta) d\\theta$.\nStep 4: Power reduction: $\\frac{1}{16}[\\theta - \\frac{1}{2}\\sin(2\\theta)]_{0}^{\\pi/6}$.\nStep 5: Evaluate: $\\frac{\\pi}{96} - \\frac{\\sqrt{3}}{64}$.',
 '3.3', 'Trigonometric Substitution', '["trig_substitution","power_reduction","definite_integral_evaluation"]',
 10, 4, 0, 10, 0, NULL, '\\int_{c1}^{c2} \\frac{v1^{c3}}{\\sqrt{c4 - c5 v1^{c3}}} dv1', '["2025_winter_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2015w_5', '2015_winter_midterm1', '5',
 'Evaluate $\\int \\frac{x^{2}-6x-15}{x^{2}-5x-6} dx$',
 'Step 1: Long division (equal degrees): $1 - \\frac{x+9}{x^{2}-5x-6}$.\nStep 2: Factor denominator: $(x-6)(x+1)$.\nStep 3: Partial fractions: $\\frac{x+9}{(x-6)(x+1)} = \\frac{15/7}{x-6} - \\frac{8/7}{x+1}$.\nStep 4: Integrate: $x - \\frac{15}{7}\\ln|x-6| + \\frac{8}{7}\\ln|x+1| + C$.\nStep 5: Combine: $x + \\frac{1}{7}\\ln|\\frac{(x+1)^{8}}{(x-6)^{15}}| + C$.',
 '3.4', 'Partial Fractions', '["polynomial_long_division","partial_fractions","linear_factors"]',
 10, 4, 0, 10, 0, NULL, '\\int \\frac{v1^{c1} + c2 v1 + c3}{v1^{c1} + c4 v1 + c5} dv1', '["2025_winter_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2015w_6', '2015_winter_midterm1', '6',
 'Determine whether convergent or divergent: $\\int_{0}^{1} z^{2}\\ln(z) dz$. Find value if convergent.',
 'Step 1: Type II improper at $z=0$. Set up: $\\lim_{t \\to 0^{+}} \\int_{t}^{1} z^{2}\\ln(z) dz$.\nStep 2: Integration by parts: $u=\\ln(z)$, $dv=z^{2}dz$, $v=\\frac{z^{3}}{3}$.\nStep 3: $[\\frac{z^{3}}{3}\\ln(z) - \\frac{z^{3}}{9}]_{t}^{1}$.\nStep 4: At $z=1$: $-\\frac{1}{9}$. Limit at $t$: $0$.\nStep 5: Converges to $-\\frac{1}{9}$.',
 '3.7', 'Improper Integrals', '["improper_integral_limit","integration_by_parts","limit_evaluation"]',
 10, 4, 1, 10, 0, NULL, '\\int_{c1}^{c2} v1^{c3} \\ln(v1) dv1', '["2025_winter_midterm"]', 'exam_archive');

-- ==========================================
-- EXAM 2: 2019 WINTER MIDTERM 2 (6 Questions)
-- ==========================================

INSERT INTO questions VALUES 
('q_2019w_1', '2019_winter_midterm2', '1',
 'Determine whether series convergent or divergent',
 'Parent with subparts (a) and (b).',
 '4.5', 'Series', '["divergence_test","geometric_series_formula","algebraic_manipulation"]',
 8, 3, 0, 10, 1, 
 '[{"number": "1a", "points": 4, "text": "$\\sum_{n=1}^{\\infty} \\ln(\\frac{n^{2}+1}{5n^{2}+3})$", "solution": "Divergence Test: limit = ln(1/5) ≠ 0, diverges."}, {"number": "1b", "points": 4, "text": "$\\sum_{n=1}^{\\infty} \\frac{6 \\cdot 2^{2n-1}}{5^{n+1}}$", "solution": "Simplify to geometric with a=12/25, r=4/5. Converges to 12/5."}]',
 '\\sum \\ln(\\frac{v1^{c1}+c2}{c3 v1^{c1}+c4})', '[]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2019w_2', '2019_winter_midterm2', '2',
 'Integral Test application',
 'Parent with subparts (a) and (b).',
 '3.7', 'Integral Test', '["integral_test_conditions","trig_substitution","improper_integral_evaluation"]',
 8, 4, 0, 11, 1,
 '[{"number": "2a", "points": 2, "text": "Explain why Integral Test applies to $\\sum \\frac{1}{(1+4n^{2})^{3/2}}$", "solution": "Check: positive, continuous, decreasing on [1,∞). All satisfied."}, {"number": "2b", "points": 6, "text": "Use Integral Test to determine convergence", "solution": "Substitute x=(1/2)tan(θ). Evaluates to finite value 1/2[1-2/√5]. Converges."}]',
 '\\sum \\frac{1}{(c1 + c2 v1^{c3})^{c4}}', '[]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2019w_3', '2019_winter_midterm2', '3',
 'Determine absolute, conditional convergence, or divergence: $\\sum_{n=1}^{\\infty} \\frac{(-1)^{n-1}\\sqrt{2n^{2}-1}}{5n^{2}-3n+1}$',
 'Step 1: Absolute convergence: Limit Comparison with 1/n diverges.\nStep 2: Alternating Series Test: limit = 0, decreasing.\nStep 3: Conditionally convergent.',
 '4.5', 'Alternating Series', '["alternating_series_test","limit_comparison_test","absolute_vs_conditional"]',
 8, 4, 1, 9, 0, NULL,
 '\\sum \\frac{(-1)^{v1-c1}\\sqrt{c2 v1^{c3}-c4}}{c5 v1^{c3}-c6 v1+c7}', '[]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2019w_4', '2019_winter_midterm2', '4',
 'Determine convergence: $\\sum_{n=1}^{\\infty} \\frac{(2n)!}{n^{n-1}(n+1)^{n+1}}$',
 'Step 1: Ratio Test. Compute a_{n+1}/a_n.\nStep 2: Simplify factorials. Numerator ~ 4n^3, Denominator ~ n^{n+2}.\nStep 3: Limit = 0 < 1. Converges.',
 '4.5', 'Ratio and Root Tests', '["ratio_test","factorial_simplification","growth_comparison"]',
 8, 5, 0, 10, 0, NULL,
 '\\sum \\frac{(c1 v1)!}{v1^{v1-c2}(v1+c3)^{v1+c4}}', '[]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2019w_5', '2019_winter_midterm2', '5',
 'Solve implicitly: $4y\\frac{dy}{dx} = (y^{4}-1)\\tan^{-1}(x)$',
 'Step 1: Separate: $\\frac{4y}{y^{4}-1} dy = \\tan^{-1}(x) dx$.\nStep 2: Partial fractions LHS, IBP RHS.\nStep 3: $\\ln|\\frac{y-1}{y+1}| - 2\\tan^{-1}(y) = x\\tan^{-1}(x) - \\frac{1}{2}\\ln(1+x^{2}) + C$.',
 '4.2', 'Separable Differential Equations', '["separation_of_variables","partial_fractions","integration_by_parts"]',
 8, 4, 1, 10, 0, NULL,
 'c1 v2 \\frac{dv2}{dv1} = (v2^{c2}-c3)\\tan^{-1}(v1)', '["2025_winter_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2019w_6', '2019_winter_midterm2', '6',
 'Solve IVP: $\\frac{1}{\\sqrt{x}}\\frac{dy}{dx} = \\frac{x^{3/2}(1-12y)}{x^{3}+2}$, $y(1)=1$',
 'Step 1: Separate: $\\frac{dy}{1-12y} = \\frac{x^{2}}{x^{3}+2} dx$.\nStep 2: Integrate: $-\\frac{1}{12}\\ln|1-12y| = \\frac{1}{3}\\ln|x^{3}+2| + C$.\nStep 3: Apply IC: $y = \\frac{1}{12}(1 + \\frac{891}{(x^{3}+2)^{4}})$.',
 '4.2', 'Separable Differential Equations', '["separation_of_variables","u_substitution","initial_value_problem"]',
 10, 4, 0, 12, 0, NULL,
 '\\frac{1}{v1^{c1}}\\frac{dv2}{dv1} = \\frac{v1^{c2}(c3-c4 v2)}{v1^{c5}+c6}', '["2024_spring_midterm","2025_summer_midterm"]', 'exam_archive');

-- ==========================================
-- EXAM 3: 2024 SPRING MIDTERM (7 Questions)
-- ==========================================

INSERT INTO questions VALUES 
('q_2024s_1', '2024_spring_midterm', '1',
 'Determine convergent or divergent: $\\int_{1}^{\\infty} \\frac{\\ln(x)}{x^{3}} dx$. Evaluate if convergent.',
 'Step 1: Type I improper. Set up limit.\nStep 2: Integration by parts.\nStep 3: Converges to $\\frac{1}{4}$.',
 '3.7', 'Improper Integrals', '["improper_integral_limit","integration_by_parts","limit_at_infinity"]',
 6, 4, 0, 8, 0, NULL,
 '\\int_{c1}^{\\infty} \\frac{\\ln(v1)}{v1^{c2}} dv1', '["2025_summer_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2024s_2', '2024_spring_midterm', '2',
 'Evaluate: $\\int \\frac{dx}{x^{4}\\sqrt{x^{2}-4}}$. Write without trigonometric functions.',
 'Step 1: Substitute $x = 2\\sec(\\theta)$.\nStep 2: Simplify to $\\frac{1}{16}\\int \\cos^{3}(\\theta) d\\theta$.\nStep 3: Result: $\\frac{(x^{2}+2)\\sqrt{x^{2}-4}}{24x^{3}} + C$.',
 '3.3', 'Trigonometric Substitution', '["trig_substitution","secant_substitution","power_reduction"]',
 8, 4, 0, 10, 0, NULL,
 '\\int \\frac{dv1}{v1^{c1}\\sqrt{v1^{c1}-c2}}', '["2025_summer_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2024s_3', '2024_spring_midterm', '3',
 'Solve IVP: $y'' + y = \\cos(e^{x})$, $y(\\ln(\\pi)) = 2$',
 'Step 1: IF = $e^{x}$.\nStep 2: $\\frac{d}{dx}[e^{x}y] = e^{x}\\cos(e^{x})$.\nStep 3: $y = e^{-x}\\sin(e^{x}) + Ce^{-x}$.\nStep 4: IC gives $C = 2\\pi$.\nStep 5: $y = e^{-x}\\sin(e^{x}) + 2\\pi e^{-x}$.',
 '4.5', 'First-Order Linear Differential Equations', '["integrating_factor","u_substitution","initial_value_problem"]',
 6, 4, 0, 8, 0, NULL,
 'v2'' + v2 = \\cos(e^{v1})', '["2025_summer_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2024s_4', '2024_spring_midterm', '4',
 'Write partial fraction form: $\\frac{4x^{5}-2x^{2}+x}{(x+1)(x^{2}-1)^{2}(x^{2}+x+1)^{2}}$',
 'Step 1: Factor: $(x+1)^{3}(x-1)^{2}(x^{2}+x+1)^{2}$.\nStep 2: Form with 7 terms for repeated/irreducible factors.',
 '3.4', 'Partial Fractions', '["partial_fraction_decomposition","repeated_factors","irreducible_quadratics"]',
 5, 3, 0, 6, 0, NULL,
 '\\frac{c1 v1^{c2}+c3}{(v1+c4)(v1^{c5}-c6)^{c7}(v1^{c5}+v1+c8)^{c9}}', '["2025_summer_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2024s_5', '2024_spring_midterm', '5',
 'Determine convergence using Comparison: $\\int_{1}^{\\infty} \\frac{x^{2}+\\sin^{2}(x)}{x^{5}} dx$',
 'Step 1: Bound: $\\leq \\frac{2}{x^{3}}$.\nStep 2: $\\int \\frac{2}{x^{3}}$ converges (p=3>1).\nStep 3: Original converges.',
 '3.7', 'Comparison Tests', '["comparison_test","p_series_test","inequality_bounds"]',
 6, 3, 0, 6, 0, NULL,
 '\\int_{c1}^{\\infty} \\frac{v1^{c2}+\\sin^{c3}(v1)}{v1^{c4}} dv1', '["2025_summer_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2024s_6', '2024_spring_midterm', '6',
 'Determine convergence: $\\int_{0}^{2} \\frac{1}{(x-1)^{2/3}} dx$. Evaluate if convergent.',
 'Step 1: Discontinuity at $x=1$. Split.\nStep 2: Antiderivative: $3(x-1)^{1/3}$.\nStep 3: Both sides converge to 3. Total = 6.',
 '3.7', 'Improper Integrals', '["improper_integral_discontinuity","split_integral","limit_evaluation"]',
 6, 4, 0, 7, 0, NULL,
 '\\int_{c1}^{c2} \\frac{1}{(v1-c3)^{c4}} dv1', '[]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2024s_7', '2024_spring_midterm', '7',
 'Solve explicitly: $(x^{2}+3x+2)y'' = y$',
 'Step 1: Factor: $(x+1)(x+2)y'' = y$.\nStep 2: Separate: $\\frac{dy}{y} = (\\frac{1}{x+1} - \\frac{1}{x+2})dx$.\nStep 3: $y = A \\cdot \\frac{x+1}{x+2}$.',
 '4.2', 'Separable Differential Equations', '["separation_of_variables","partial_fractions","explicit_solution"]',
 6, 3, 0, 7, 0, NULL,
 '(v1^{c1}+c2 v1+c3)v2'' = v2', '["2025_summer_midterm"]', 'exam_archive');

-- ==========================================
-- EXAM 4: 2025 WINTER MIDTERM (7 Questions)
-- ==========================================

INSERT INTO questions VALUES 
('q_2025w_1', '2025_winter_midterm', '1',
 'Evaluate integrals involving $e^{\\sqrt{x}}\\cos(\\sqrt{x})$',
 'Parent with subparts (a) and (b).',
 '3.1', 'Integration by Parts', '["u_substitution","integration_by_parts","cyclic_integration"]',
 10, 4, 0, 12, 1,
 '[{"number": "1a", "points": 7, "text": "$\\int \\frac{e^{\\sqrt{x}}\\cos(\\sqrt{x})}{\\sqrt{x}} dx$", "solution": "Substitute u=√x, cyclic IBP twice. Result: e^√x(sin√x + cos√x) + C"}, {"number": "1b", "points": 3, "text": "Show ∫₀^{π²} = -(1+e^π)", "solution": "Apply FTC. At π²: -e^π. At 0: 1. Result: -(1+e^π)."}]',
 '\\int \\frac{e^{v1^{1/2}}\\cos(v1^{1/2})}{v1^{1/2}} dv1', '["2015_winter_midterm1"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2025w_2', '2025_winter_midterm', '2',
 'Evaluate integrals involving $\\tan^{4}(x)$',
 'Parent with subparts (a) and (b).',
 '3.2', 'Trigonometric Integrals', '["trig_identity","u_substitution","power_reduction"]',
 10, 3, 0, 9, 1,
 '[{"number": "2a", "points": 7, "text": "$\\int \\tan^{4}(x) dx$", "solution": "Use tan² = sec² - 1. Result: tan³x/3 - tanx + x + C"}, {"number": "2b", "points": 3, "text": "$\\int_{0}^{\\pi/4} \\tan^{4}(x) dx$", "solution": "Use part (a). Result: π/4 - 2/3"}]',
 '\\int \\tan^{c1}(v1) dv1', '["2015_winter_midterm1"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2025w_3', '2025_winter_midterm', '3',
 'Evaluate and classify improper integral involving $(x-3)^{3}$',
 'Parent with subparts (a), (b), (c).',
 '3.7', 'Improper Integrals', '["u_substitution","improper_integral_discontinuity","limit_evaluation"]',
 10, 4, 1, 13, 1,
 '[{"number": "3a", "points": 4, "text": "$\\int \\frac{x}{(x-3)^{3}} dx$", "solution": "Substitute u=x-3. Result: -1/(x-3) - 3/(2(x-3)²) + C"}, {"number": "3b", "points": 2, "text": "Explain why ∫₁³ is improper", "solution": "Infinite discontinuity at x=3"}, {"number": "3c", "points": 4, "text": "Show convergence/divergence", "solution": "Both terms diverge to -∞. Divergent."}]',
 '\\int_{c1}^{c2} \\frac{v1}{(v1-c3)^{c4}} dv1', '[]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2025w_4', '2025_winter_midterm', '4',
 'Trigonometric substitution for $\\sqrt{16-x^{2}}$',
 'Parent with subparts (a) and (b).',
 '3.3', 'Trigonometric Substitution', '["trig_substitution","power_reduction","back_substitution"]',
 8, 3, 0, 9, 1,
 '[{"number": "4a", "points": 2, "text": "What technique for ∫ x²/√(16-x²) dx?", "solution": "Trigonometric substitution (form √(a²-x²))"}, {"number": "4b", "points": 6, "text": "Evaluate", "solution": "Substitute x=4sinθ. Result: 8arcsin(x/4) - x√(16-x²)/2 + C"}]',
 '\\int \\frac{v1^{c1}}{\\sqrt{c2-v1^{c1}}} dv1', '["2015_winter_midterm1"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2025w_5', '2025_winter_midterm', '5',
 'Evaluate: $\\int \\frac{2x+1}{x^{2}+2x-8} dx$',
 'Step 1: Factor: (x+4)(x-2).\nStep 2: Partial fractions: 7/6/(x+4) + 5/6/(x-2).\nStep 3: Integrate: 7/6 ln|x+4| + 5/6 ln|x-2| + C.',
 '3.4', 'Partial Fractions', '["partial_fractions","linear_factors","log_integration"]',
 7, 3, 0, 7, 0, NULL,
 '\\int \\frac{c1 v1 + c2}{v1^{c3} + c4 v1 + c5} dv1', '["2015_winter_midterm1"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2025w_6', '2025_winter_midterm', '6',
 'Find implicit solution: $\\frac{du}{dt} = \\frac{1+t^{4}}{ut^{2}+u^{4}t^{2}}$',
 'Step 1: Factor RHS.\nStep 2: Separate: u(1+u³)du = (t⁻²+t²)dt.\nStep 3: u²/2 + u⁵/5 = -1/t + t³/3 + C.',
 '4.2', 'Separable Differential Equations', '["separation_of_variables","polynomial_integration"]',
 5, 4, 1, 8, 0, NULL,
 '\\frac{dv1}{dv2} = \\frac{c1 + v2^{c2}}{v1 v2^{c3} + v1^{c4} v2^{c3}}', '["2019_winter_midterm2"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2025w_7', '2025_winter_midterm', '7',
 'Solve first-order linear DE: $x^{2}y'' + 2xy = \\ln(x)$, $y(1)=2$',
 'Parent with subparts (a) and (b).',
 '4.5', 'First-Order Linear Differential Equations', '["integrating_factor","integration_by_parts","initial_value_problem"]',
 10, 4, 0, 12, 1,
 '[{"number": "7a", "points": 2, "text": "Classify the DE", "solution": "First-order linear: y'' + (2/x)y = ln(x)/x²"}, {"number": "7b", "points": 8, "text": "Solve IVP", "solution": "IF = x². Result: y = (xlnx - x + 3)/x²"}]',
 'v1^{c1} v2'' + c2 v1 v2 = \\ln(v1)', '["2024_spring_midterm","2025_summer_midterm"]', 'exam_archive');

-- ==========================================
-- EXAM 5: 2025 SUMMER MIDTERM (7 Questions)
-- ==========================================

INSERT INTO questions VALUES 
('q_2025s_1', '2025_summer_midterm', '1',
 'Determine convergent: $\\int_{1}^{\\infty} \\frac{\\ln(x)}{x^{3}} dx$. Evaluate.',
 'Step 1: Type I improper.\nStep 2: Integration by parts.\nStep 3: Converges to 1/4.',
 '3.7', 'Improper Integrals', '["improper_integral_limit","integration_by_parts","limit_at_infinity"]',
 6, 4, 0, 8, 0, NULL,
 '\\int_{c1}^{\\infty} \\frac{\\ln(v1)}{v1^{c2}} dv1', '["2024_spring_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2025s_2', '2025_summer_midterm', '2',
 'Evaluate: $\\int \\frac{dx}{x^{3}\\sqrt{x^{2}-4}}$ without trig functions.',
 'Step 1: Substitute x=2sec(θ).\nStep 2: Transform to 1/8 ∫ cos²(θ)dθ.\nStep 3: Result: (1/16)sec⁻¹(x/2) + √(x²-4)/(8x²) + C.',
 '3.3', 'Trigonometric Substitution', '["trig_substitution","secant_substitution","power_reduction"]',
 7, 4, 0, 9, 0, NULL,
 '\\int \\frac{dv1}{v1^{c3}\\sqrt{v1^{c1}-c2}}', '["2024_spring_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2025s_3', '2025_summer_midterm', '3',
 'Solve IVP: $xy'' = y + x^{2}\\sin(x)$, $y(\\pi) = 0$',
 'Step 1: Standard form: y'' - (1/x)y = xsin(x).\nStep 2: IF = x⁻¹.\nStep 3: y = -x(cos(x) + 1).',
 '4.5', 'First-Order Linear Differential Equations', '["integrating_factor","initial_value_problem"]',
 6, 4, 0, 8, 0, NULL,
 'v1 v2'' = v2 + v1^{c1}\\sin(v1)', '["2024_spring_midterm","2025_winter_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2025s_4', '2025_summer_midterm', '4',
 'Write partial fraction form: $\\frac{3x^{5}+12}{(x-2)(x^{2}+4)^{3}(x^{2}+x-6)^{2}}$',
 'Step 1: Factor: (x-2)³(x+3)²(x²+4)³.\nStep 2: Form with repeated linear and quadratic terms.',
 '3.4', 'Partial Fractions', '["partial_fraction_decomposition","repeated_linear","repeated_quadratic"]',
 5, 3, 0, 6, 0, NULL,
 '\\frac{c1 v1^{c2}+c3}{(v1-c4)(v1^{c5}+c6)^{c7}(v1^{c5}+v1-c8)^{c9}}', '["2024_spring_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2025s_5', '2025_summer_midterm', '5',
 'Determine convergence: $\\int_{1}^{\\infty} \\frac{1+\\sin^{2}(x)}{\\sqrt{x}} dx$',
 'Step 1: Lower bound: ≥ 1/√x.\nStep 2: ∫ x^(-1/2) diverges (p=1/2 < 1).\nStep 3: Diverges.',
 '3.7', 'Comparison Tests', '["comparison_test","p_series_test","lower_bound"]',
 3, 2, 0, 4, 0, NULL,
 '\\int_{c1}^{\\infty} \\frac{c2+\\sin^{c3}(v1)}{v1^{c4}} dv1', '["2024_spring_midterm"]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2025s_6', '2025_summer_midterm', '6',
 'Determine convergence: $\\int_{0}^{4} \\frac{1}{x^{2}-x-2} dx$',
 'Step 1: Factor: 1/((x-2)(x+1)). Discontinuity at x=2.\nStep 2: Partial fractions.\nStep 3: Logarithmic divergence. Diverges.',
 '3.7', 'Improper Integrals', '["improper_integral_discontinuity","partial_fractions","split_integral"]',
 7, 4, 1, 8, 0, NULL,
 '\\int_{c1}^{c2} \\frac{1}{v1^{c3}-v1-c4} dv1', '[]', 'exam_archive');

INSERT INTO questions VALUES 
('q_2025s_7', '2025_summer_midterm', '7',
 'Solve IVP: $x + 3y^{2}\\sqrt{1+x^{2}} y'' = 0$, $y(0)=1$',
 'Step 1: Separate: 3y² dy = -x/√(1+x²) dx.\nStep 2: Integrate: y³ = -√(1+x²) + C.\nStep 3: IC gives C=2.\nStep 4: y = (2 - √(1+x²))^(1/3).',
 '4.2', 'Separable Differential Equations', '["separation_of_variables","u_substitution","initial_value_problem"]',
 6, 3, 0, 7, 0, NULL,
 'v1 + c1 v2^{c2}\\sqrt{c2+v1^{c3}} v2'' = c4', '["2024_spring_midterm","2019_winter_midterm2"]', 'exam_archive');

-- ==========================================
-- VERIFICATION QUERY (COMMENTED OUT)
-- ==========================================
-- SELECT exam_id, COUNT(*) as question_count FROM questions GROUP BY exam_id;
-- Expected: 2015w(6), 2019w(6), 2024s(7), 2025w(7), 2025s(7) = 33 total
