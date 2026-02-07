-- Database Fixes for Critical Issues
-- Run this after seed-full.sql to clean up data

-- ==========================================
-- STEP 1: Remove Questions That Don't Fit Approved Sections
-- Approved sections: 3.1, 3.2, 3.3, 3.4, 3.7, 4.1, 4.2, 4.5
-- ==========================================

-- Remove series questions incorrectly placed in section 4.5 (DE section)
DELETE FROM questions WHERE id IN ('q_2019w_1', 'q_2019w_3', 'q_2019w_4');

-- Remove integral test question (integral test is for series, not improper integrals)
DELETE FROM questions WHERE id = 'q_2019w_2';

-- Remove q_2024s_3: Tagged as first_order_linear_de but is actually second-order DE
-- Equation: y'' + y = cos(e^x) has y'' (second derivative), not first-order
DELETE FROM questions WHERE id = 'q_2024s_3';

-- ==========================================
-- STEP 2: Deduplicate q_2024s_1 and q_2025s_1
-- Both are ∫ln(x)/x³ dx from 1 to ∞ - nearly identical
-- ==========================================

-- Update q_2025s_1 to have different bounds (2 to ∞ instead of 1 to ∞)
UPDATE questions SET
  question_text = 'Determine convergent: $\int_{2}^{\infty} \frac{\ln(x)}{x^{3}} dx$. Evaluate.',
  solution_steps = 'Step 1: Type I improper. Set up limit from 2 to t as t→∞.\nStep 2: Integration by parts: u=ln(x), dv=dx/x³, so du=dx/x, v=-1/(2x²).\nStep 3: Result: [-(1+2ln2)/8] + 1/4 = (1-2ln2)/8.',
  answer = 'Converges to $(1-2\ln 2)/8$',
  canonical_form = '\\int_{c1}^{\\infty} \\frac{\\ln(v1)}{v1^{c2}} dv1'
WHERE id = 'q_2025s_1';

-- ==========================================
-- VERIFICATION QUERIES (run after fixes)
-- ==========================================

-- Check remaining question count
SELECT 'Total questions after cleanup' as status, COUNT(*) as count FROM questions;

-- Check questions by section
SELECT section, COUNT(*) as count, GROUP_CONCAT(DISTINCT topic_id) as topics
FROM questions
GROUP BY section
ORDER BY section;

-- Check for any remaining series questions (should be 0)
SELECT id, question_text, topic_id, section
FROM questions
WHERE topic_id LIKE '%series%' OR topic_id LIKE '%integral_test%';

-- List all remaining questions
SELECT id, exam_id, question_number, topic_id, section, SUBSTR(question_text, 1, 60) as preview
FROM questions
ORDER BY exam_id, question_number;
