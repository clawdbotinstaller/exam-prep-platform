import { Link, useLocation } from 'react-router-dom';
import { Zap, BookOpen } from 'lucide-react';

interface NavbarProps {
  credits?: number;
  plan?: 'free' | 'starter' | 'unlimited';
  userName?: string;
  showCredits?: boolean;
}

export default function Navbar({ credits = 0, plan = 'free', userName, showCredits = true }: NavbarProps) {
  const location = useLocation();
  const isCoursePage = location.pathname.startsWith('/course/');

  return (
    <header className="bg-paper-cream border-b border-pencil-gray/10 sticky top-0 z-50">
      <div className="px-8 lg:px-[8vw] py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-blueprint-navy" strokeWidth={1.5} />
          <span className="font-serif font-semibold text-ink-black text-xl tracking-tight">
            Arkived
          </span>
          <span className="hidden sm:inline date-stamp">v1.0</span>
        </Link>

        {/* Center - Back to course link if on course page */}
        {isCoursePage && (
          <Link
            to="/dashboard"
            className="hidden md:flex items-center gap-2 text-pencil-gray hover:text-ink-black transition-colors"
          >
            <span className="font-sans text-sm">← Back to Dashboard</span>
          </Link>
        )}

        {/* Right side */}
        <div className="flex items-center gap-4">
          {showCredits && (
            <Link
              to="/upgrade"
              className="flex items-center gap-2 px-3 py-2 bg-blueprint-navy/10 hover:bg-blueprint-navy/20 transition-colors"
            >
              <Zap className="w-4 h-4 text-blueprint-navy" />
              <span className="font-mono text-sm text-blueprint-navy">
                {plan === 'unlimited' ? 'Unlimited' : `${credits} cr`}
              </span>
            </Link>
          )}

          <Link
            to="/profile"
            className="w-8 h-8 bg-blueprint-navy flex items-center justify-center hover:bg-ink-black transition-colors"
          >
            <span className="font-serif text-paper-cream text-sm">
              {userName?.charAt(0) || 'U'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
