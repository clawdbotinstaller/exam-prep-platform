/**
 * Format math text with common LaTeX replacements
 * Converts LaTeX commands to Unicode characters for display
 */
export function formatMathText(text: string): string {
  if (!text) return '';

  return (
    text
      // Integration
      .replace(/\\int/g, '∫')
      .replace(/\\iint/g, '∬')
      .replace(/\\iiint/g, '∭')

      // Differential
      .replace(/\\,?dx/g, ' dx')
      .replace(/\\,?dy/g, ' dy')
      .replace(/\\,?dt/g, ' dt')
      .replace(/\\,?du/g, ' du')
      .replace(/\\,?dv/g, ' dv')

      // Greek letters
      .replace(/\\pi/g, 'π')
      .replace(/\\theta/g, 'θ')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\delta/g, 'δ')
      .replace(/\\sigma/g, 'σ')
      .replace(/\\Sigma/g, 'Σ')
      .replace(/\\omega/g, 'ω')
      .replace(/\\Omega/g, 'Ω')
      .replace(/\\infty/g, '∞')

      // Trigonometric
      .replace(/\\sin/g, 'sin')
      .replace(/\\cos/g, 'cos')
      .replace(/\\tan/g, 'tan')
      .replace(/\\sec/g, 'sec')
      .replace(/\\csc/g, 'csc')
      .replace(/\\cot/g, 'cot')
      .replace(/\\arcsin/g, 'arcsin')
      .replace(/\\arccos/g, 'arccos')
      .replace(/\\arctan/g, 'arctan')
      .replace(/\\ln/g, 'ln')
      .replace(/\\log/g, 'log')
      .replace(/\\exp/g, 'exp')

      // Fractions
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')

      // Superscripts (simple cases)
      .replace(/\^\{1\}/g, '¹')
      .replace(/\^\{2\}/g, '²')
      .replace(/\^\{3\}/g, '³')
      .replace(/\^\{4\}/g, '⁴')
      .replace(/\^\{5\}/g, '⁵')
      .replace(/\^\{n\}/g, 'ⁿ')

      // Square roots
      .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')

      // Clean up LaTeX spacing
      .replace(/\\,/g, ' ')
      .replace(/\\;/g, '  ')
      .replace(/\\quad/g, '    ')
      .replace(/\\qquad/g, '        ')
  );
}

/**
 * Extract LaTeX content from $...$ delimiters
 */
export function extractLatex(text: string): string[] {
  const matches = text.match(/\$([^$]+)\$/g);
  return matches ? matches.map((m) => m.replace(/^\$|\$$/g, '')) : [];
}

/**
 * Check if text contains LaTeX
 */
export function hasLatex(text: string): boolean {
  return /\$[^$]+\$/.test(text);
}
