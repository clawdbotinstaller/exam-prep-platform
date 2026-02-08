import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { useState, Component, type ReactNode } from 'react';

interface LatexRendererProps {
  tex: string;
  className?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error boundary to catch KaTeX rendering errors
 */
class LatexErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('KaTeX rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * Strip dollar sign delimiters from LaTeX string
 */
const stripDelimiters = (tex: string): string => {
  return tex.replace(/^\$\$?|\$\$?$/g, '');
};

// Display math check is inlined in parseLatexText for efficiency

/**
 * Safe LaTeX component that handles errors
 */
function SafeInlineMath({ math }: { math: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return <span className="latex-error" title="Invalid LaTeX">${math}$</span>;
  }

  return (
    <LatexErrorBoundary fallback={<span className="latex-error" title="Invalid LaTeX">${math}$</span>}>
      <InlineMath
        math={math}
        renderError={(err) => {
          console.warn('Inline math render error:', err);
          setError(true);
          return <span className="latex-error" title="Invalid LaTeX">${math}$</span>;
        }}
      />
    </LatexErrorBoundary>
  );
}

/**
 * Safe BlockMath component that handles errors
 */
function SafeBlockMath({ math }: { math: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return <div className="latex-error block" title="Invalid LaTeX">$${math}$$</div>;
  }

  return (
    <LatexErrorBoundary fallback={<div className="latex-error block" title="Invalid LaTeX">$${math}$$</div>}>
      <BlockMath
        math={math}
        renderError={(err) => {
          console.warn('Block math render error:', err);
          setError(true);
          return <div className="latex-error block" title="Invalid LaTeX">$${math}$$</div>;
        }}
      />
    </LatexErrorBoundary>
  );
}

/**
 * Split text into parts, separating LaTeX expressions
 * Properly handles $...$ (inline) and $$...$$ (display) math
 */
const parseLatexText = (text: string): Array<{ type: 'text' | 'latex' | 'display'; content: string }> => {
  const parts: Array<{ type: 'text' | 'latex' | 'display'; content: string }> = [];
  let currentIndex = 0;

  // Match $$...$$ (display math) first, then $...$ (inline math)
  // Uses non-greedy matching to handle multiple expressions
  const regex = /\$\$[\s\S]*?\$\$|\$[^\$\s][^$]*?\$/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > currentIndex) {
      parts.push({
        type: 'text',
        content: text.slice(currentIndex, match.index),
      });
    }

    const matchedText = match[0];
    const isBlock = matchedText.startsWith('$$') && matchedText.endsWith('$$');

    // Add the LaTeX match (without delimiters)
    parts.push({
      type: isBlock ? 'display' : 'latex',
      content: stripDelimiters(matchedText),
    });

    currentIndex = match.index + matchedText.length;
  }

  // Add remaining text
  if (currentIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(currentIndex),
    });
  }

  return parts;
};

export default function LatexRenderer({ tex, className = '' }: LatexRendererProps) {
  if (!tex) return null;

  // Check if the text contains LaTeX delimiters
  if (!tex.includes('$')) {
    return <span className={className}>{tex}</span>;
  }

  const parts = parseLatexText(tex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'latex') {
          return <SafeInlineMath key={index} math={part.content} />;
        }
        if (part.type === 'display') {
          // For inline renderer, display math still renders inline but with block styling
          return (
            <span key={index} className="inline-block my-2">
              <SafeBlockMath math={part.content} />
            </span>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
}

// For display math (centered, larger)
export function LatexDisplay({ tex, className = '' }: LatexRendererProps) {
  if (!tex) return null;

  // Check if it's a block equation (wrapped in $$)
  const isBlock = tex.startsWith('$$') && tex.endsWith('$$');

  if (!tex.includes('$')) {
    return <span className={className}>{tex}</span>;
  }

  const parts = parseLatexText(tex);

  // If it's a single display math block, render with BlockMath
  if (isBlock && parts.length === 1 && parts[0].type === 'display') {
    return (
      <div className={className}>
        <SafeBlockMath math={parts[0].content} />
      </div>
    );
  }

  // Mixed content - render each part appropriately
  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === 'latex') {
          return <SafeInlineMath key={index} math={part.content} />;
        }
        if (part.type === 'display') {
          return (
            <div key={index} className="my-4">
              <SafeBlockMath math={part.content} />
            </div>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </div>
  );
}
