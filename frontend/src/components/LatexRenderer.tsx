import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface LatexRendererProps {
  tex: string;
  className?: string;
}

export default function LatexRenderer({ tex, className = '' }: LatexRendererProps) {
  if (!tex) return null;

  // Extract LaTeX from $...$ delimiters
  const latexMatches = tex.match(/\$([^$]+)\$/g);

  if (!latexMatches || latexMatches.length === 0) {
    return <span className={className}>{tex}</span>;
  }

  // Render the first LaTeX expression found
  const latex = latexMatches[0].replace(/^\$|\$$/g, '');

  return (
    <span className={className}>
      <InlineMath math={latex} />
    </span>
  );
}

// For display math (centered, larger)
export function LatexDisplay({ tex, className = '' }: LatexRendererProps) {
  if (!tex) return null;

  // Extract LaTeX from $$...$$ or $...$ delimiters
  const latex = tex.replace(/^\$\$?|\$\$?$/g, '');

  return (
    <span className={className}>
      <InlineMath math={latex} />
    </span>
  );
}
