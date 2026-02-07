/**
 * Technique Metadata Module
 *
 * Curated traps and strategies based on analysis of 33 MTH240 exam questions
 * from 2015-2025. Each technique includes real patterns observed in actual exams.
 */

import type { TechniqueMetadata, ChapterMetadata, SectionMetadata } from '../types/analysis';

// =============================================================================
// TECHNIQUE METADATA (based on actual exam analysis)
// =============================================================================

export const TECHNIQUE_METADATA: Record<string, TechniqueMetadata> = {
  // ===========================================================================
  // Section 3.1: Integration by Parts
  // ===========================================================================

  integration_by_parts: {
    id: 'integration_by_parts',
    displayName: 'Integration by Parts',
    description: '∫u dv = uv - ∫v du — used for products of functions where one term simplifies when differentiated',
    commonTraps: [
      'LIATE rule violation: Choosing wrong u (e.g., picking exponential over logarithm)',
      'Missing the preliminary u-substitution that simplifies before IBP (e.g., u=√x)',
      'Sign errors when integrating by parts multiple times',
      'Forgetting to apply bounds at each step for definite integrals',
      'Not recognizing when IBP makes the integral worse (wrong choice)'
    ],
    studyStrategies: [
      'Always apply LIATE: Logarithm > Inverse trig > Algebraic > Trigonometric > Exponential',
      'Check for preliminary u-substitution first — it often simplifies the integral dramatically',
      'Write u, dv, du, v explicitly in a table format to track your work',
      'For definite integrals, apply bounds to the uv term immediately',
      'If the integral gets more complex, stop and reconsider your u choice'
    ],
    prerequisites: ['basic_integration', 'u_substitution'],
    difficultyIndicators: ['Multiple IBP applications needed', 'Mixed with u-substitution'],
    timeEstimate: '6-10 minutes',
    sectionId: 'integration_by_parts'
  },

  cyclic_integration: {
    id: 'cyclic_integration',
    displayName: 'Cyclic Integration',
    description: 'When IBP twice returns to the original integral form, requiring algebraic solution (common with e^ax·sin(bx))',
    commonTraps: [
      'Not recognizing the cyclic pattern after two IBP applications',
      'Sign errors when moving the cyclic integral to the left side',
      'Dividing by the wrong coefficient when solving for the original integral',
      'Losing track of accumulated constants through multiple IBP rounds',
      'Forgetting to add the constant of integration at the final step'
    ],
    studyStrategies: [
      'Recognize the pattern: e^ax·sin(bx) and e^ax·cos(bx) always require cyclic IBP',
      'Keep careful sign tracking — use a table to track signs through each round',
      'After two IBP applications, collect like terms: I = [result] - c·I, then solve',
      'Verify by differentiating your final answer — cyclic integrals are easy to check',
      'Consider the tabular method for repeated IBP to reduce errors'
    ],
    prerequisites: ['integration_by_parts'],
    difficultyIndicators: ['Exponential × trigonometric products', 'Multiple IBP rounds required'],
    timeEstimate: '10-15 minutes',
    sectionId: 'integration_by_parts'
  },

  tabular_integration: {
    id: 'tabular_integration',
    displayName: 'Tabular Integration',
    description: 'Shortcut for repeated IBP when one factor differentiates to zero (e.g., x^n·e^x)',
    commonTraps: [
      'Using tabular method when it does not apply (neither factor differentiates to zero)',
      'Sign errors in alternating column (+ - + - pattern)',
      'Missing the last row when the derivative becomes zero',
      'Diagonal pairing errors — connecting wrong terms',
      'Forgetting to integrate the second factor in each row'
    ],
    studyStrategies: [
      'Only use when one factor is a polynomial that differentiates to zero',
      'Set up columns: Derivatives of polynomial, alternating signs, integrals of other factor',
      'Multiply diagonally and sum — stop when derivative column hits zero',
      'Double-check your alternating signs: start with +, then -, +, -...',
      'Verify by differentiating — tabular results are easy to check'
    ],
    prerequisites: ['integration_by_parts'],
    difficultyIndicators: ['Polynomial × exponential/trig', 'High polynomial degree'],
    timeEstimate: '4-6 minutes',
    sectionId: 'integration_by_parts'
  },

  // ===========================================================================
  // Section 3.2: Trigonometric Integrals
  // ===========================================================================

  trig_identity: {
    id: 'trig_identity',
    displayName: 'Trigonometric Identities',
    description: 'Using Pythagorean identities (sin² + cos² = 1, 1 + tan² = sec²) to simplify integrals',
    commonTraps: [
      'Choosing the wrong identity direction (converting sin² to cos² vs vice versa)',
      'Not recognizing when an integral requires identity substitution',
      'Algebra errors when expanding (tan² + 1)² or similar expressions',
      'Forgetting the ± sign when taking square roots',
      'Missing that sec² - 1 = tan² (using wrong identity variant)'
    ],
    studyStrategies: [
      'Memorize the three Pythagorean identities and their rearrangements',
      'For tan/sec integrals: convert everything to the "higher power" function first',
      'For sin/cos integrals: use sin² = (1-cos(2x))/2, cos² = (1+cos(2x))/2',
      'When you see even powers, think power reduction; odd powers, think substitution',
      'Verify by differentiating — trig identities are self-checking'
    ],
    prerequisites: ['basic_trig', 'basic_integration'],
    difficultyIndicators: ['High even powers', 'Mixed sin/cos products'],
    timeEstimate: '5-8 minutes',
    sectionId: 'trig_integrals'
  },

  power_reduction: {
    id: 'power_reduction',
    displayName: 'Power Reduction Formulas',
    description: 'Converting sin²(x) and cos²(x) to first power using double-angle identities',
    commonTraps: [
      'Using power reduction when u-substitution would work directly',
      'Sign errors: sin² = (1-cos(2x))/2 (minus!), cos² = (1+cos(2x))/2 (plus!)',
      'Forgetting to adjust the angle: sin²(x) involves cos(2x), not cos(x)',
      'Missing the 1/2 coefficient in front of the entire expression',
      'Not applying power reduction before attempting integration'
    ],
    studyStrategies: [
      'Memorize: sin²(x) = (1-cos(2x))/2 and cos²(x) = (1+cos(2x))/2',
      'For even powers ≥ 2, apply power reduction repeatedly until first power',
      'Combine with Pythagorean identities for mixed sin/cos integrals',
      'Watch for the pattern: sin^n(x) where n is even → power reduction',
      'After reduction, the integral becomes straightforward u-substitution'
    ],
    prerequisites: ['trig_identity'],
    difficultyIndicators: ['Even powers ≥ 4', 'Multiple applications needed'],
    timeEstimate: '6-10 minutes',
    sectionId: 'trig_integrals'
  },

  half_angle: {
    id: 'half_angle',
    displayName: 'Half-Angle Substitution',
    description: 'Using t = tan(x/2) to convert rational trig functions to rational functions',
    commonTraps: [
      'Not recognizing when half-angle is needed (complex rational trig expressions)',
      'Errors in the substitution formulas: sin(x) = 2t/(1+t²), cos(x) = (1-t²)/(1+t²)',
      'Forgetting that dx = 2dt/(1+t²) — missing the factor of 2',
      'Algebra errors when simplifying the resulting rational expression',
      'Not converting back to x at the end — leaving answer in terms of t'
    ],
    studyStrategies: [
      'Reserve for complex rational trig functions that resist other methods',
      'Write out all three formulas: sin(x), cos(x), dx in terms of t',
      'Simplify the rational function carefully — factor and decompose if needed',
      'The resulting integral is often a standard partial fractions problem',
      'Back-substitute t = tan(x/2) at the end'
    ],
    prerequisites: ['trig_identity', 'partial_fractions'],
    difficultyIndicators: ['Rational function of sin and cos', 'Other methods fail'],
    timeEstimate: '12-18 minutes',
    sectionId: 'trig_integrals'
  },

  product_to_sum: {
    id: 'product_to_sum',
    displayName: 'Product-to-Sum Formulas',
    description: 'Converting products like sin(A)cos(B) to sums for easier integration',
    commonTraps: [
      'Not recognizing product patterns that benefit from these formulas',
      'Formula confusion: mixing up sin·cos vs cos·cos vs sin·sin formulas',
      'Sign errors in the formulas (especially the sin·sin case)',
      'Forgetting the 1/2 coefficient in all product-to-sum formulas',
      'Not simplifying before applying the formula'
    ],
    studyStrategies: [
      'Use for integrals like ∫sin(mx)cos(nx)dx where m ≠ n',
      'Memorize the three key formulas or derive from angle addition',
      'After conversion, the integral becomes simple term-by-term integration',
      'Watch for orthogonality: integrals over full periods often vanish',
      'Consider if standard u-substitution would be simpler first'
    ],
    prerequisites: ['trig_identity'],
    difficultyIndicators: ['Product of different frequencies', 'Periodic integrals'],
    timeEstimate: '6-10 minutes',
    sectionId: 'trig_integrals'
  },

  // ===========================================================================
  // Section 3.3: Trigonometric Substitution
  // ===========================================================================

  trig_substitution: {
    id: 'trig_substitution',
    displayName: 'Trigonometric Substitution',
    description: 'Substituting x = a·sin(θ), x = a·tan(θ), or x = a·sec(θ) to eliminate radicals',
    commonTraps: [
      'Form recognition failure: not seeing √(1-4x²) as √(a²-u²) pattern',
      'Substitution scaling errors: missing the chain factor when coefficient ≠ 1',
      'Wrong substitution choice: using sin when sec is needed, etc.',
      'Not converting limits for definite integrals (or converting incorrectly)',
      'Back-substitution geometry errors — drawing the reference triangle wrong'
    ],
    studyStrategies: [
      'Memorize the three forms: √(a²-x²)→x=asin(θ), √(a²+x²)→x=atan(θ), √(x²-a²)→x=asec(θ)',
      'Always factor out coefficients first: √(1-4x²) = √(1-(2x)²), then substitute inner expression',
      'For definite integrals: convert limits immediately to θ and stay in θ world',
      'Always draw the reference triangle for back-substitution — label all sides',
      'After substitution, you often get sin² or cos² — apply power reduction'
    ],
    prerequisites: ['trig_identity', 'power_reduction'],
    difficultyIndicators: ['√(quadratic) form', 'Coefficient ≠ 1 inside radical'],
    timeEstimate: '10-15 minutes',
    sectionId: 'trig_substitution'
  },

  completing_the_square: {
    id: 'completing_the_square',
    displayName: 'Completing the Square',
    description: 'Rewriting quadratics like x² + bx + c as (x + b/2)² + (c - b²/4) for substitution',
    commonTraps: [
      'Not recognizing when completing the square is needed (irreducible quadratics under radical)',
      'Sign errors: (x + b/2)² when b is negative requires careful handling',
      'Arithmetic errors in computing c - b²/4 (the constant term)',
      'Forgetting to handle the coefficient of x² if it is not 1',
      'Not following through with the subsequent u-substitution'
    ],
    studyStrategies: [
      'Use when you see √(x² + bx + c) or 1/(x² + bx + c) where discriminant < 0',
      'Formula: x² + bx + c = (x + b/2)² + (c - b²/4)',
      'If coefficient of x² is a ≠ 1, factor it out first from the x terms',
      'After completing the square, substitute u = x + b/2',
      'The result often becomes a standard trig substitution form'
    ],
    prerequisites: ['algebra_manipulation', 'trig_substitution'],
    difficultyIndicators: ['Irreducible quadratic', 'Radical with linear term'],
    timeEstimate: '8-12 minutes',
    sectionId: 'trig_substitution'
  },

  inverse_trig: {
    id: 'inverse_trig',
    displayName: 'Inverse Trigonometric Forms',
    description: 'Recognizing integrals that yield arcsin, arctan, or arcsec directly',
    commonTraps: [
      'Not recognizing the standard forms: 1/√(a²-x²), 1/(a²+x²), 1/(x√(x²-a²))',
      'Confusing the three inverse trig derivatives and their domains',
      'Missing coefficient adjustments: 1/√(1-4x²) requires factoring out the 4',
      'Forgetting the constant factor in the result (e.g., (1/a)arctan(x/a))',
      'Not verifying the domain matches the inverse trig function'
    ],
    studyStrategies: [
      'Memorize the three basic forms and their corresponding inverse trig results',
      'Always factor out coefficients to match standard form exactly',
      'For 1/(a²+x²), result is (1/a)arctan(x/a) — do not forget the 1/a!',
      'Check if u-substitution reduces to one of these basic forms',
      'Verify by differentiating — inverse trig derivatives are distinctive'
    ],
    prerequisites: ['basic_integration', 'trig_substitution'],
    difficultyIndicators: ['1/√(quadratic) or 1/(quadratic) forms'],
    timeEstimate: '4-6 minutes',
    sectionId: 'trig_substitution'
  },

  // ===========================================================================
  // Section 3.4: Partial Fractions
  // ===========================================================================

  partial_fractions: {
    id: 'partial_fractions',
    displayName: 'Partial Fraction Decomposition',
    description: 'Decomposing rational functions into simpler fractions for term-by-term integration',
    commonTraps: [
      'Not factoring the denominator completely before decomposing',
      'Forgetting polynomial long division when degree(numerator) ≥ degree(denominator)',
      'Missing irreducible quadratics — not checking discriminant (b²-4ac)',
      'Wrong form for repeated factors — need separate terms for each power',
      'Algebra errors when solving for coefficients (especially with many unknowns)'
    ],
    studyStrategies: [
      'Always check: if deg(num) ≥ deg(den), do polynomial long division first',
      'Factor denominator completely — check discriminant for quadratics',
      'Linear factor (ax+b): contributes A/(ax+b)',
      'Irreducible quadratic: contributes (Ax+B)/(quadratic)',
      'Repeated factor (ax+b)^n: contributes n terms with powers 1, 2, ..., n',
      'Use strategic x-values (roots, x=0, x=1) to solve for coefficients efficiently'
    ],
    prerequisites: ['polynomial_long_division', 'algebra_manipulation'],
    difficultyIndicators: ['Repeated roots', 'Irreducible quadratics', 'Many unknowns'],
    timeEstimate: '10-18 minutes',
    sectionId: 'partial_fractions'
  },

  linear_factors: {
    id: 'linear_factors',
    displayName: 'Linear Factors',
    description: 'Decomposing rational functions with distinct linear factors: A/(x-a) + B/(x-b) + ...',
    commonTraps: [
      'Not factoring completely — missing hidden common factors',
      'Sign errors when factors are (x + a) vs (x - a)',
      'Cover-up method errors when coefficients are not 1',
      'Not combining like terms properly when checking the decomposition',
      'Forgetting that distinct linear factors are the easiest case'
    ],
    studyStrategies: [
      'Use the cover-up method for distinct linear factors — it is fast and reliable',
      'For factor (x - a), cover up (x - a) and substitute x = a in the remainder',
      'If leading coefficient ≠ 1, factor it out or adjust the cover-up calculation',
      'Always verify by recombining — the original numerator should match',
      'After decomposition, integrate term-by-term to get natural logs'
    ],
    prerequisites: ['partial_fractions'],
    difficultyIndicators: ['Many distinct linear factors'],
    timeEstimate: '6-10 minutes',
    sectionId: 'partial_fractions'
  },

  irreducible_quadratics: {
    id: 'irreducible_quadratics',
    displayName: 'Irreducible Quadratics',
    description: 'Handling quadratic factors with negative discriminant: (Ax+B)/(ax²+bx+c)',
    commonTraps: [
      'Not checking discriminant — trying to factor when b²-4ac < 0',
      'Using single constant numerator instead of (Ax+B) for quadratic factors',
      'Completing the square errors when preparing to integrate',
      'Not recognizing the arctan form after completing the square',
      'Algebra errors in splitting the numerator to match standard forms'
    ],
    studyStrategies: [
      'Always check discriminant first: b²-4ac < 0 means irreducible',
      'Quadratic factor contributes (Ax+B)/(quadratic) to the decomposition',
      'Split the integral: ∫(Ax)/(quadratic) + ∫(B)/(quadratic)',
      'First term: u-substitution (u = quadratic, du = 2Ax + ... )',
      'Second term: complete the square, then arctan form',
      'The result involves ln|quadratic| and arctan terms'
    ],
    prerequisites: ['partial_fractions', 'completing_the_square'],
    difficultyIndicators: ['Quadratic in denominator', 'Negative discriminant'],
    timeEstimate: '12-18 minutes',
    sectionId: 'partial_fractions'
  },

  repeated_roots: {
    id: 'repeated_roots',
    displayName: 'Repeated Linear Factors',
    description: 'Decomposing when denominator has (x-a)^n: need terms for each power',
    commonTraps: [
      'Only including one term for repeated factor — missing A/(x-a)², A/(x-a)³, etc.',
      'Not recognizing hidden repeated roots: (x²-1)² = (x-1)²(x+1)²',
      'Algebra complexity when solving for many coefficients simultaneously',
      'Not using strategic x-values to simplify the system of equations',
      'Giving up too early — these problems require patience'
    ],
    studyStrategies: [
      'For (x-a)^n, include n terms: A₁/(x-a) + A₂/(x-a)² + ... + Aₙ/(x-a)ⁿ',
      'Look for hidden repeated factors: (x²-a²) = (x-a)(x+a), so (x²-a²)² has repeated roots',
      'Use x = a to eliminate all but one coefficient at a time',
      'Compare coefficients of like powers of x to build equations',
      'Integrate term-by-term: powers > 1 give rational functions, power = 1 gives ln',
      'When question says "write form only" — do NOT solve for coefficients!'
    ],
    prerequisites: ['partial_fractions', 'linear_factors'],
    difficultyIndicators: ['(quadratic)² or higher', 'Many repeated factors'],
    timeEstimate: '15-20 minutes',
    sectionId: 'partial_fractions'
  },

  polynomial_long_division: {
    id: 'polynomial_long_division',
    displayName: 'Polynomial Long Division',
    description: 'Dividing polynomials when degree(numerator) ≥ degree(denominator)',
    commonTraps: [
      'Not checking degrees first — attempting partial fractions when division is needed',
      'Missing terms with zero coefficients — need placeholders like 0x²',
      'Sign errors during subtraction steps',
      'Not continuing until remainder degree < divisor degree',
      'Forgetting to add the remainder/divisor term at the end'
    ],
    studyStrategies: [
      'Always compare degrees first: if deg(num) ≥ deg(den), divide first',
      'Include all descending powers, using 0 coefficients for missing terms',
      'Divide leading terms, multiply, subtract, bring down — repeat',
      'Stop when remainder degree < divisor degree',
      'Result: quotient + remainder/divisor — now apply partial fractions to remainder/divisor',
      'Synthetic division shortcut when divisor is linear (x - a)'
    ],
    prerequisites: ['algebra_manipulation'],
    difficultyIndicators: ['Equal degrees', 'Missing terms in numerator'],
    timeEstimate: '6-10 minutes',
    sectionId: 'partial_fractions'
  },

  // ===========================================================================
  // Section 3.7: Improper Integrals
  // ===========================================================================

  improper_integral_limit: {
    id: 'improper_integral_limit',
    displayName: 'Improper Integrals (Limit Definition)',
    description: 'Evaluating integrals with infinite bounds or discontinuities using limits',
    commonTraps: [
      'Type confusion: not recognizing Type I (∞ bound) vs Type II (discontinuity)',
      'Hidden discontinuities: missing that integrand blows up inside the interval',
      'Wrong split point for discontinuities — not factoring denominator completely',
      'Limit direction errors: t→a+ vs t→a- for one-sided limits',
      'Not setting up the limit notation before integrating'
    ],
    studyStrategies: [
      'Always check for discontinuities first — factor all denominators completely',
      'Type I (∞): replace ∞ with t, integrate, take limit as t→∞',
      'Type II (discontinuity at c): split into two integrals, limits from each side',
      'If discontinuity is at endpoint, use one-sided limit',
      'Both sides must converge independently for the integral to converge',
      'Memorize: lim_{x→0+} x^a·ln(x) = 0 for a > 0'
    ],
    prerequisites: ['basic_integration', 'limit_evaluation'],
    difficultyIndicators: ['Infinite bounds', 'Denominator zeros in interval'],
    timeEstimate: '8-15 minutes',
    sectionId: 'improper_integrals'
  },

  comparison_test: {
    id: 'comparison_test',
    displayName: 'Comparison Test for Improper Integrals',
    description: 'Determining convergence by comparing to a known integral without evaluating',
    commonTraps: [
      'Wrong inequality direction: need 0 ≤ f ≤ g for convergence comparison',
      'Picking a poor comparison function that does not help determine convergence',
      'Not verifying f(x) ≥ 0 before applying the test',
      'Confusing the logic: if larger converges, smaller converges; if smaller diverges, larger diverges',
      'Not justifying the inequality with actual algebra'
    ],
    studyStrategies: [
      'For convergence: find g(x) where 0 ≤ f(x) ≤ g(x) and ∫g converges',
      'For divergence: find g(x) where 0 ≤ g(x) ≤ f(x) and ∫g diverges',
      'Use dominant terms for comparison: ignore lower-order terms for large x',
      'Reference p-series: ∫₁^∞ 1/x^p converges iff p > 1',
      'Reference p-series Type II: ∫₀¹ 1/x^p converges iff p < 1',
      'Always state the inequality and verify the comparison integral'
    ],
    prerequisites: ['improper_integral_limit', 'p_integrals'],
    difficultyIndicators: ['Complex integrands', 'Difficult to evaluate directly'],
    timeEstimate: '8-12 minutes',
    sectionId: 'improper_integrals'
  },

  limit_comparison: {
    id: 'limit_comparison',
    displayName: 'Limit Comparison Test',
    description: 'Using lim_{x→∞} f(x)/g(x) to compare convergence behavior',
    commonTraps: [
      'Computing the limit incorrectly — often requires L\'Hôpital\'s rule',
      'Not recognizing when limit is 0 or ∞ (test inconclusive)',
      'Forgetting that limit must be finite and positive for the test to apply',
      'Picking a comparison function with different growth rate',
      'Not stating the conclusion clearly based on the limit value'
    ],
    studyStrategies: [
      'Choose g(x) with the same growth rate as f(x) — look at dominant terms',
      'Compute L = lim_{x→∞} f(x)/g(x)',
      'If 0 < L < ∞, then both integrals converge or both diverge',
      'If L = 0 and ∫g converges, then ∫f converges',
      'If L = ∞ and ∫g diverges, then ∫f diverges',
      'Use when direct comparison inequalities are hard to establish'
    ],
    prerequisites: ['comparison_test', 'limit_evaluation'],
    difficultyIndicators: ['Rational functions', 'Algebraic complexity'],
    timeEstimate: '8-12 minutes',
    sectionId: 'improper_integrals'
  },

  p_integrals: {
    id: 'p_integrals',
    displayName: 'p-Series Reference',
    description: 'Using ∫ 1/x^p as the benchmark for comparison tests',
    commonTraps: [
      'Confusing Type I vs Type II p-integral conditions',
      'Type I (∞): converges if p > 1, diverges if p ≤ 1',
      'Type II (0): converges if p < 1, diverges if p ≥ 1',
      'Not recognizing when an integral can be transformed to p-form',
      'Forgetting the strict inequality (p = 1 is the harmonic series — diverges)'
    ],
    studyStrategies: [
      'Memorize both cases: Type I (∞ bound) and Type II (singularity at 0)',
      'Type I: ∫₁^∞ 1/x^p converges ⟺ p > 1',
      'Type II: ∫₀¹ 1/x^p converges ⟺ p < 1',
      'Use substitution to transform integrals to p-form when possible',
      'p = 1 is always the boundary case (harmonic series diverges)',
      'Most comparison tests ultimately rely on p-integral convergence'
    ],
    prerequisites: ['improper_integral_limit'],
    difficultyIndicators: ['Rational functions', 'Comparison needed'],
    timeEstimate: '4-6 minutes',
    sectionId: 'improper_integrals'
  },

  // ===========================================================================
  // Section 4.1: Directly Integrable DEs
  // ===========================================================================

  direct_integration: {
    id: 'direct_integration',
    displayName: 'Direct Integration',
    description: 'Solving DEs of form dy/dx = f(x) by direct integration: y = ∫f(x)dx + C',
    commonTraps: [
      'Not recognizing when a DE is directly integrable (no y on right side)',
      'Forgetting the constant of integration +C',
      'Not applying initial conditions to solve for C',
      'Integration errors when f(x) requires complex techniques',
      'Not expressing final answer as y = explicit function of x'
    ],
    studyStrategies: [
      'Check: if DE has form dy/dx = f(x) with no y terms, integrate directly',
      'Integrate both sides: y = ∫f(x)dx + C',
      'If initial condition given, substitute to find C',
      'Express final answer as y = ... (explicit solution)',
      'Verify by differentiating — should recover original DE'
    ],
    prerequisites: ['basic_integration'],
    difficultyIndicators: ['No y on right side', 'Simple form'],
    timeEstimate: '4-8 minutes',
    sectionId: 'directly_integrable_de'
  },

  initial_value_problem: {
    id: 'initial_value_problem',
    displayName: 'Initial Value Problems',
    description: 'Using y(x₀) = y₀ to find the particular solution from the general solution',
    commonTraps: [
      'Applying initial condition before finding general solution',
      'Algebra errors when solving for C',
      'Not substituting both x₀ and y₀ correctly',
      'Forgetting to include C in the general solution',
      'Not verifying the particular solution satisfies both DE and IC'
    ],
    studyStrategies: [
      'Find general solution first (with +C)',
      'Substitute x = x₀ and y = y₀ into general solution',
      'Solve for C algebraically',
      'Write particular solution with C value substituted',
      'Verify: check that y(x₀) = y₀ and that DE is satisfied',
      'For implicit solutions, may need to solve for y explicitly if possible'
    ],
    prerequisites: ['direct_integration'],
    difficultyIndicators: ['Given y(x₀) = y₀'],
    timeEstimate: '4-6 minutes',
    sectionId: 'directly_integrable_de'
  },

  // ===========================================================================
  // Section 4.2: Separable DEs
  // ===========================================================================

  separation_of_variables: {
    id: 'separation_of_variables',
    displayName: 'Separation of Variables',
    description: 'Rewriting dy/dx = f(x)g(y) as dy/g(y) = f(x)dx and integrating both sides',
    commonTraps: [
      'Not recognizing separable form — missing that terms can be factored',
      'Division by zero: losing solutions when dividing by g(y)',
      'Algebra errors when separating complex expressions',
      'Not factoring completely before attempting to separate',
      'Integration errors on separated sides (often requires partial fractions)'
    ],
    studyStrategies: [
      'Check if right side factors as f(x)·g(y) — if yes, it is separable',
      'Rewrite: dy/g(y) = f(x)dx (separate variables)',
      'Consider constant solutions: if g(y₀) = 0, then y = y₀ is a solution',
      'Integrate both sides: ∫dy/g(y) = ∫f(x)dx',
      'Often requires partial fractions on the y side',
      'Add constant to one side only (conventionally the x side)'
    ],
    prerequisites: ['basic_integration', 'partial_fractions'],
    difficultyIndicators: ['Product of x and y functions', 'Rational functions'],
    timeEstimate: '10-18 minutes',
    sectionId: 'separable_des'
  },

  implicit_solution: {
    id: 'implicit_solution',
    displayName: 'Implicit Solutions',
    description: 'Leaving the solution in F(x,y) = C form without solving for y explicitly',
    commonTraps: [
      'Trying to force explicit solution when implicit is acceptable',
      'Not combining logarithmic terms using log rules',
      'Sign errors when moving terms between sides',
      'Forgetting the constant of integration',
      'Not recognizing when implicit is the expected answer format'
    ],
    studyStrategies: [
      'After integration, you may have ln|y| = ... + C or similar',
      'Combine logs: ln|y| + ln|x| = ln|xy| — simplifies implicit form',
      'Exponentiate both sides to eliminate logs: e^{ln|y|} = |y| = ...',
      'If question asks for "implicit solution", stop at F(x,y) = C form',
      'Check if the implicit relation can be simplified algebraically',
      'Verify by implicit differentiation — should recover original DE'
    ],
    prerequisites: ['separation_of_variables'],
    difficultyIndicators: ['Cannot solve for y easily', 'Logarithmic terms'],
    timeEstimate: '6-10 minutes',
    sectionId: 'separable_des'
  },

  explicit_solution: {
    id: 'explicit_solution',
    displayName: 'Explicit Solutions',
    description: 'Solving the implicit solution for y as a function of x: y = f(x)',
    commonTraps: [
      'Not recognizing when explicit solution is possible',
      'Algebra errors when isolating y (especially with fractional exponents)',
      'Sign ambiguity: ± when taking even roots',
      'Domain restrictions from the original DE',
      'Not using initial condition to determine sign or branch'
    ],
    studyStrategies: [
      'From implicit form F(x,y) = C, solve for y in terms of x',
      'Use initial condition to resolve ± ambiguities',
      'Consider domain: original DE may restrict valid x values',
      'Simplify radicals and exponents when possible',
      'Verify by substituting back into original DE',
      'Some DEs do not have closed-form explicit solutions — know when to stop'
    ],
    prerequisites: ['implicit_solution'],
    difficultyIndicators: ['Question asks for y = ...'],
    timeEstimate: '4-8 minutes',
    sectionId: 'separable_des'
  },

  // ===========================================================================
  // Section 4.5: First-Order Linear DEs
  // ===========================================================================

  integrating_factor: {
    id: 'integrating_factor',
    displayName: 'Integrating Factor Method',
    description: 'Using μ(x) = e^∫P(x)dx to solve y\' + P(x)y = Q(x)',
    commonTraps: [
      'Not converting to standard form y\' + P(x)y = Q(x) first',
      'Errors computing e^∫P(x)dx — especially when P(x) = 1/x',
      'Not recognizing the product rule pattern: d/dx[y·μ] = μ·y\' + μ\'·y',
      'Forgetting to multiply Q(x) by the integrating factor before integrating',
      'Not dividing by μ(x) at the end to solve for y'
    ],
    studyStrategies: [
      'Always write in standard form: y\' + P(x)y = Q(x) — divide by leading coefficient',
      'Compute μ(x) = e^∫P(x)dx — the constant of integration can be omitted',
      'Multiply entire equation by μ(x) — left side becomes d/dx[y·μ]',
      'Integrate both sides: y·μ = ∫μ·Q(x)dx + C',
      'Divide by μ(x): y = (∫μ·Q(x)dx + C)/μ(x)',
      'Apply initial condition if given, solve for C'
    ],
    prerequisites: ['basic_integration', 'integration_by_parts'],
    difficultyIndicators: ['Linear in y and y\'', 'P(x) involves 1/x'],
    timeEstimate: '10-15 minutes',
    sectionId: 'first_order_linear_de'
  },

  standard_form: {
    id: 'standard_form',
    displayName: 'Standard Form Conversion',
    description: 'Rewriting a(x)y\' + b(x)y = c(x) as y\' + P(x)y = Q(x)',
    commonTraps: [
      'Not recognizing the equation is first-order linear',
      'Division errors when normalizing the coefficient of y\' to 1',
      'Sign errors when dividing by negative coefficients',
      'Not identifying P(x) and Q(x) correctly after conversion',
      'Trying other methods (separable) when linear is more appropriate'
    ],
    studyStrategies: [
      'Check: equation is linear in y and y\' (no y², sin(y), etc.)',
      'Identify a(x), b(x), c(x) in a(x)y\' + b(x)y = c(x)',
      'Divide by a(x): y\' + (b(x)/a(x))y = c(x)/a(x)',
      'Now P(x) = b(x)/a(x) and Q(x) = c(x)/a(x)',
      'Proceed with integrating factor method',
      'Watch for a(x) = 0 points — may affect domain of solution'
    ],
    prerequisites: ['algebra_manipulation'],
    difficultyIndicators: ['y and y\' appear linearly'],
    timeEstimate: '3-5 minutes',
    sectionId: 'first_order_linear_de'
  },

  variation_of_parameters: {
    id: 'variation_of_parameters',
    displayName: 'Variation of Parameters',
    description: 'Advanced method for finding particular solutions (usually for higher-order, but included for completeness)',
    commonTraps: [
      'Not finding the homogeneous solution y_h first',
      'Errors in the Wronskian calculation',
      'Integration errors when finding u₁\' and u₂\'',
      'Not combining particular and homogeneous solutions',
      'Using when undetermined coefficients would be simpler'
    ],
    studyStrategies: [
      'First solve the homogeneous equation for y_h = C₁y₁ + C₂y₂',
      'Assume particular solution y_p = u₁(x)y₁ + u₂(x)y₂',
      'Set up system: u₁\'y₁ + u₂\'y₂ = 0, u₁\'y₁\' + u₂\'y₂\' = Q(x)',
      'Solve for u₁\' and u₂\' using Cramer\'s rule (Wronskian)',
      'Integrate to find u₁ and u₂ (omit constants)',
      'General solution: y = y_h + y_p'
    ],
    prerequisites: ['integrating_factor', 'wronskian'],
    difficultyIndicators: ['Non-constant coefficients', 'Higher-order equations'],
    timeEstimate: '15-25 minutes',
    sectionId: 'first_order_linear_de'
  }
};

// =============================================================================
// CHAPTER & SECTION METADATA
// =============================================================================

export const CHAPTER_METADATA: ChapterMetadata[] = [
  {
    id: 'integration',
    name: 'Integration',
    chapterNum: '3',
    description: 'Advanced integration techniques for complex functions',
    sectionIds: ['integration_by_parts', 'trig_integrals', 'trig_substitution', 'partial_fractions', 'improper_integrals']
  },
  {
    id: 'differential_equations',
    name: 'Differential Equations',
    chapterNum: '4',
    description: 'Solving first-order ordinary differential equations',
    sectionIds: ['directly_integrable_de', 'separable_des', 'first_order_linear_de']
  }
];

export const SECTION_METADATA: Record<string, SectionMetadata> = {
  integration_by_parts: {
    id: 'integration_by_parts',
    name: 'Integration by Parts',
    sectionNum: '3.1',
    description: '∫u dv = uv - ∫v du for products of functions',
    techniqueIds: ['integration_by_parts', 'cyclic_integration', 'tabular_integration']
  },
  trig_integrals: {
    id: 'trig_integrals',
    name: 'Trigonometric Integrals',
    sectionNum: '3.2',
    description: 'Integrating powers and products of trigonometric functions',
    techniqueIds: ['trig_identity', 'power_reduction', 'half_angle', 'product_to_sum']
  },
  trig_substitution: {
    id: 'trig_substitution',
    name: 'Trigonometric Substitution',
    sectionNum: '3.3',
    description: 'Eliminating radicals using trigonometric substitutions',
    techniqueIds: ['trig_substitution', 'completing_the_square', 'inverse_trig']
  },
  partial_fractions: {
    id: 'partial_fractions',
    name: 'Partial Fractions',
    sectionNum: '3.4',
    description: 'Decomposing rational functions for integration',
    techniqueIds: ['partial_fractions', 'linear_factors', 'irreducible_quadratics', 'repeated_roots', 'polynomial_long_division']
  },
  improper_integrals: {
    id: 'improper_integrals',
    name: 'Improper Integrals',
    sectionNum: '3.7',
    description: 'Integrals with infinite bounds or discontinuities',
    techniqueIds: ['improper_integral_limit', 'comparison_test', 'limit_comparison', 'p_integrals']
  },
  directly_integrable_de: {
    id: 'directly_integrable_de',
    name: 'Directly Integrable DEs',
    sectionNum: '4.1',
    description: 'Simple differential equations solvable by direct integration',
    techniqueIds: ['direct_integration', 'initial_value_problem']
  },
  separable_des: {
    id: 'separable_des',
    name: 'Separable DEs',
    sectionNum: '4.2',
    description: 'Separating variables and integrating both sides',
    techniqueIds: ['separation_of_variables', 'implicit_solution', 'explicit_solution']
  },
  first_order_linear_de: {
    id: 'first_order_linear_de',
    name: 'First-Order Linear DEs',
    sectionNum: '4.5',
    description: 'Using integrating factors for linear equations',
    techniqueIds: ['integrating_factor', 'standard_form', 'variation_of_parameters']
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get metadata for a specific technique
 * Returns fallback metadata if technique not found
 */
export function getTechniqueMetadata(techniqueId: string): TechniqueMetadata {
  const metadata = TECHNIQUE_METADATA[techniqueId];

  if (!metadata) {
    // Return fallback metadata for unknown techniques
    return {
      id: techniqueId,
      displayName: techniqueId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: 'Practice this technique to improve your skills.',
      commonTraps: ['Unknown technique — consult your textbook or instructor'],
      studyStrategies: ['Review course materials for this topic', 'Practice similar problems', 'Ask for help if stuck'],
      prerequisites: [],
      difficultyIndicators: ['Unknown difficulty'],
      timeEstimate: '8-12 minutes',
      sectionId: 'unknown'
    };
  }

  return metadata;
}

/**
 * Get all techniques for a section
 */
export function getSectionTechniques(sectionId: string): TechniqueMetadata[] {
  const section = SECTION_METADATA[sectionId];

  if (!section) {
    return [];
  }

  return section.techniqueIds
    .map(id => getTechniqueMetadata(id))
    .filter(meta => meta.id !== 'unknown');
}

/**
 * Get section metadata by ID
 */
export function getSectionMetadata(sectionId: string): SectionMetadata | null {
  return SECTION_METADATA[sectionId] || null;
}

/**
 * Get chapter metadata by ID
 */
export function getChapterMetadata(chapterId: string): ChapterMetadata | null {
  return CHAPTER_METADATA.find(ch => ch.id === chapterId) || null;
}

/**
 * Get all sections for a chapter
 */
export function getChapterSections(chapterId: string): SectionMetadata[] {
  const chapter = getChapterMetadata(chapterId);

  if (!chapter) {
    return [];
  }

  return chapter.sectionIds
    .map(id => getSectionMetadata(id))
    .filter((meta): meta is SectionMetadata => meta !== null);
}

/**
 * Get section by section number (e.g., "3.1")
 */
export function getSectionByNumber(sectionNum: string): SectionMetadata | null {
  return Object.values(SECTION_METADATA).find(s => s.sectionNum === sectionNum) || null;
}

/**
 * Check if a technique ID is valid
 */
export function isValidTechnique(techniqueId: string): boolean {
  return techniqueId in TECHNIQUE_METADATA;
}

/**
 * Get all technique IDs
 */
export function getAllTechniqueIds(): string[] {
  return Object.keys(TECHNIQUE_METADATA);
}

/**
 * Get techniques by prerequisite
 * Useful for showing "you should know this first" recommendations
 */
export function getTechniquesByPrerequisite(prereqId: string): TechniqueMetadata[] {
  return Object.values(TECHNIQUE_METADATA).filter(
    meta => meta.prerequisites.includes(prereqId)
  );
}
