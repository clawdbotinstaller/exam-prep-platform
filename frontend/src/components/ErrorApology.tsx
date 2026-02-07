import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorApologyProps {
  title?: string;
  message?: string;
  errorDetails?: string;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorApology({
  title = "We're sorry, something went wrong",
  message = "We couldn't load this content. This might be a temporary issue.",
  errorDetails,
  onRetry,
  className = '',
}: ErrorApologyProps) {
  // Pre-fill bug report with error details
  const bugReportSubject = encodeURIComponent('Bug Report: Error loading content');
  const bugReportMessage = encodeURIComponent(
    `I encountered an error while using the site.\n\n` +
    `Error details: ${errorDetails || 'Unknown error'}\n\n` +
    `Page: ${window.location.href}\n\n` +
    `Please look into this issue.`
  );
  const contactLink = `/contact?subject=${bugReportSubject}&message=${bugReportMessage}`;

  return (
    <div className={`index-card p-8 ${className}`}>
      <div className="flex flex-col items-center text-center">
        {/* Error stamp */}
        <div className="exam-stamp-red mb-6">Error</div>

        {/* Icon */}
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" strokeWidth={1.5} />
        </div>

        {/* Title */}
        <h3 className="font-serif font-semibold text-ink-black text-xl mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="font-sans text-pencil-gray text-sm max-w-md mb-6">
          {message}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blueprint-navy text-paper-cream font-condensed text-xs uppercase tracking-widest hover:bg-highlighter-yellow hover:text-blueprint-navy transition-colors"
            >
              <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
              Try Again
            </button>
          )}

          <Link
            to={contactLink}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-blueprint-navy text-blueprint-navy font-condensed text-xs uppercase tracking-widest hover:bg-blueprint-navy hover:text-paper-cream transition-colors"
          >
            <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
            Report This Issue
          </Link>
        </div>
      </div>
    </div>
  );
}
