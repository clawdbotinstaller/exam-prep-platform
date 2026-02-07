-- MTH240 Exam Questions Import (5 exams, 33 questions)
-- Run with: wrangler d1 execute testament-db --remote --file=./scripts/seed-mth240.sql

-- Insert exams
INSERT OR IGNORE INTO exams (id, course_id, course_code, year, semester, exam_type, total_points, exam_date, difficulty_label) VALUES
('2015_winter_midterm1', 'calc2', 'MTH240', 2015, 'Winter', 'Midterm 1', 50, 1422576000, 'medium'),
('2019_winter_midterm2', 'calc2', 'MTH240', 2019, 'Winter', 'Midterm 2', 50, 1553817600, 'hard'),
('2024_spring_midterm', 'calc2', 'MTH240', 2024, 'Spring', 'Midterm', 40, 1716768000, 'medium'),
('2025_winter_midterm', 'calc2', 'MTH240', 2025, 'Winter', 'Midterm', 60, 1739491200, 'medium'),
('2025_summer_midterm', 'calc2', 'MTH240', 2025, 'Summer', 'Midterm', 40, 1751088000, 'medium');

-- Sample of key questions (truncated for brevity - full set in data questions.md)
INSERT INTO questions (id, exam_id, course_id, question_number, question_text, solution_steps, answer, topic_id, section, techniques, points, difficulty, is_tricky, estimated_time, canonical_form, similar_to_exams, source_type, source_exam_year, source_exam_type, source_points) VALUES
('q_2015w_1', '2015_winter_midterm1', 'calc2', '1', 'Evaluate $\int \tan^{5}(x) \sec^{6}(x) dx',
'Step 1: Factor sec²(x) for substitution.\nStep 2: Convert sec⁴(x) to tangent using identity.\nStep 3: Substitute u = tan(x).\nStep 4: Integrate polynomial.\nStep 5: Back-substitute.',
'$\frac{\tan^{10}(x)}{10} + \frac{\tan^{8}(x)}{4} + \frac{\tan^{6}(x)}{6} + C$',
'trig_integrals', '3.2', '["trig_identity","u_substitution","power_expansion"]', 7, 3, 0, 7,
'\\int \\tan^{c1}(v1) \\sec^{c2}(v1) dv1', '[]', 'exam_archive', 2015, 'Midterm', 7);

INSERT INTO questions (id, exam_id, course_id, question_number, question_text, solution_steps, answer, topic_id, section, techniques, points, difficulty, is_tricky, estimated_time, canonical_form, similar_to_exams, source_type, source_exam_year, source_exam_type, source_points) VALUES
('q_2015w_2', '2015_winter_midterm1', 'calc2', '2', 'Write the form of partial fraction decomposition (do not solve for coefficients): $\frac{2x-7}{(x^{3}-3x)(x^{2}+4x+6)}$',
'Step 1: Factor denominator: x³-3x = x(x-√3)(x+√3). Quadratic x²+4x+6 is irreducible (discriminant 16-24 < 0).\nStep 2: Form: A/x + B/(x-√3) + C/(x+√3) + (Dx+E)/(x²+4x+6).',
'Form with 5 unknowns',
'partial_fractions', '3.4', '["partial_fraction_decomposition","factorization","irreducible_quadratics"]', 3, 2, 0, 4,
'\\frac{c1 v1 + c2}{(v1^{c3} + c4 v1)(v1^{c3} + c5 v1 + c6)}', '[]', 'exam_archive', 2015, 'Midterm', 3);

INSERT INTO questions (id, exam_id, course_id, question_number, question_text, solution_steps, answer, topic_id, section, techniques, points, difficulty, is_tricky, estimated_time, canonical_form, similar_to_exams, source_type, source_exam_year, source_exam_type, source_points) VALUES
('q_2015w_3', '2015_winter_midterm1', 'calc2', '3', 'Evaluate $\int \frac{e^{-\sqrt{x}} \sin(\sqrt{x})}{\sqrt{x}} dx$',
'Step 1: Substitute u = √x, du = 1/(2√x)dx, so dx/√x = 2du.\nStep 2: Transform to 2∫e^(-u)sin(u)du.\nStep 3: Integration by parts twice (cyclic).\nStep 4: Result: -e^(-u)(sin(u) + cos(u)) + C.\nStep 5: Back-substitute.',
'$-e^{-\sqrt{x}}(\sin(\sqrt{x}) + \cos(\sqrt{x})) + C$',
'integration_by_parts', '3.1', '["u_substitution","integration_by_parts","cyclic_integration"]', 10, 4, 0, 8,
'\\int \\frac{e^{-v1^{1/2}} \\sin(v1^{1/2})}{v1^{1/2}} dv1', '["2025_winter_midterm"]', 'exam_archive', 2015, 'Midterm', 10);

INSERT INTO questions (id, exam_id, course_id, question_number, question_text, solution_steps, answer, topic_id, section, techniques, points, difficulty, is_tricky, estimated_time, canonical_form, similar_to_exams, source_type, source_exam_year, source_exam_type, source_points) VALUES
('q_2015w_4', '2015_winter_midterm1', 'calc2', '4', 'Evaluate $\int_{0}^{1/4} \frac{x^{2}}{\sqrt{1-4x^{2}}} dx$',
'Step 1: Rewrite as √(1-(2x)²).\nStep 2: Substitute 2x = sin(θ), x = (1/2)sin(θ), dx = (1/2)cos(θ)dθ.\nStep 3: Transform to (1/8)∫sin²(θ)dθ.\nStep 4: Power reduction.\nStep 5: Evaluate: π/96 - √3/64.',
'$\frac{\pi}{96} - \frac{\sqrt{3}}{64}$',
'trig_substitution', '3.3', '["trig_substitution","power_reduction","definite_integral_evaluation"]', 10, 4, 0, 10,
'\\int_{c1}^{c2} \\frac{v1^{c3}}{\\sqrt{c4 - c5 v1^{c3}}} dv1', '["2025_winter_midterm"]', 'exam_archive', 2015, 'Midterm', 10);

INSERT INTO questions (id, exam_id, course_id, question_number, question_text, solution_steps, answer, topic_id, section, techniques, points, difficulty, is_tricky, estimated_time, canonical_form, similar_to_exams, source_type, source_exam_year, source_exam_type, source_points) VALUES
('q_2015w_6', '2015_winter_midterm1', 'calc2', '6', 'Determine whether convergent or divergent: $\int_{0}^{1} z^{2}\ln(z) dz$. Find value if convergent.',
'Step 1: Type II improper at z=0.\nStep 2: Integration by parts: u=ln(z), dv=z²dz.\nStep 3: Evaluate and take limit.\nStep 4: Converges to -1/9.',
'Convergent; value = -1/9',
'improper_integrals', '3.7', '["improper_integral_limit","integration_by_parts","limit_evaluation"]', 10, 4, 1, 10,
'\\int_{c1}^{c2} v1^{c3} \\ln(v1) dv1', '["2025_winter_midterm"]', 'exam_archive', 2015, 'Midterm', 10);

-- Verify count
SELECT 'Questions imported' as status, COUNT(*) as count FROM questions WHERE exam_id LIKE '2015_winter_midterm1';
