import { useEffect, useState } from 'react';
import { BookOpen, Menu, X } from 'lucide-react';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileOpen(false);
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled
          ? 'bg-paper-cream/95 border-b border-pencil-gray/20'
          : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-6 lg:px-12 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-blueprint-navy" strokeWidth={1.5} />
          <span className="font-serif font-semibold text-ink-black text-lg tracking-tight">
            Testament
          </span>
          <span className="hidden sm:inline date-stamp ml-2">v1.0</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo('archive')}
            className="font-condensed text-xs uppercase tracking-widest text-pencil-gray hover:text-blueprint-navy transition-colors"
          >
            Browse
          </button>
          <button
            onClick={() => scrollTo('topics')}
            className="font-condensed text-xs uppercase tracking-widest text-pencil-gray hover:text-blueprint-navy transition-colors"
          >
            Topics
          </button>
          <button
            onClick={() => scrollTo('about')}
            className="font-condensed text-xs uppercase tracking-widest text-pencil-gray hover:text-blueprint-navy transition-colors"
          >
            About
          </button>
          <button
            onClick={() => scrollTo('contact')}
            className="btn-blueprint"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="w-5 h-5 text-ink-black" strokeWidth={1.5} />
          ) : (
            <Menu className="w-5 h-5 text-ink-black" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-paper-cream border-t border-pencil-gray/20 px-6 py-4">
          <div className="flex flex-col gap-4">
            <button
              onClick={() => scrollTo('archive')}
              className="font-condensed text-xs uppercase tracking-widest text-ink-black text-left py-2"
            >
              Browse
            </button>
            <button
              onClick={() => scrollTo('topics')}
              className="font-condensed text-xs uppercase tracking-widest text-ink-black text-left py-2"
            >
              Topics
            </button>
            <button
              onClick={() => scrollTo('about')}
              className="font-condensed text-xs uppercase tracking-widest text-ink-black text-left py-2"
            >
              About
            </button>
            <button
              onClick={() => scrollTo('contact')}
              className="btn-blueprint w-full mt-2"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
