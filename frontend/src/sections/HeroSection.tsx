import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className = '' }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Grid lines draw-on animation
      const gridLines = gridRef.current?.querySelectorAll('.grid-line');
      if (gridLines && gridLines.length > 0) {
        gsap.fromTo(
          gridLines,
          { scaleY: 0, transformOrigin: 'top' },
          {
            scaleY: 1,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power2.out',
            delay: 0.3,
          }
        );
      }

      // Headline animation - smoother, more deliberate
      const headlineWords = headlineRef.current?.querySelectorAll('.headline-line');
      if (headlineWords && headlineWords.length > 0) {
        gsap.fromTo(
          headlineWords,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            delay: 0.5,
          }
        );
      }

      // Subheadline
      gsap.fromTo(
        subheadRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', delay: 1 }
      );

      // CTA buttons
      gsap.fromTo(
        ctaRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 1.2 }
      );

      // Image card - gentler entrance
      gsap.fromTo(
        imageRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out',
          delay: 0.7,
        }
      );

      // Caption
      gsap.fromTo(
        captionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, delay: 1.4 }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  const scrollToArchive = () => {
    const el = document.getElementById('archive');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={`min-h-screen flex items-center py-20 lg:py-0 ${className}`}
      style={{ backgroundColor: '#F5F1E8' }}
    >
      {/* Graph paper background */}
      <div className="absolute inset-0 graph-paper" />

      {/* Grid overlay */}
      <div ref={gridRef} className="absolute left-1/2 -translate-x-1/2 w-[min(1100px,86vw)] h-full pointer-events-none z-[1]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="grid-line absolute top-0 h-full w-px"
            style={{
              left: `${(i / 11) * 100}%`,
              backgroundColor: 'rgba(61, 61, 61, 0.12)'
            }}
          />
        ))}
      </div>

      {/* Ruler divider at bottom */}
      <div className="absolute bottom-[15vh] left-0 right-0 px-[8vw]">
        <div className="ruler-divider" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full px-8 lg:px-[8vw]">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-0">
          {/* Left content */}
          <div className="max-w-xl">
            {/* Date stamp */}
            <div className="mb-6">
              <span className="date-stamp">2022—2024 Collection</span>
            </div>

            {/* Headline */}
            <div ref={headlineRef} className="mb-6">
              <div className="headline-line overflow-hidden">
                <h1 className="font-serif font-semibold text-ink-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-none">
                  Real Questions
                </h1>
              </div>
              <div className="headline-line overflow-hidden">
                <h1 className="font-serif font-semibold text-ink-black text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-none">
                  From Real
                </h1>
              </div>
              <div className="headline-line overflow-hidden">
                <h1 className="font-serif font-semibold text-blueprint-navy text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-none hand-highlight">
                  Exams
                </h1>
              </div>
            </div>

            {/* Subheadline */}
            <p
              ref={subheadRef}
              className="font-sans text-pencil-gray text-base lg:text-lg leading-relaxed mb-6 max-w-md"
            >
              Midterms and finals from 2022–2024, organized by the patterns professors actually repeat.
              Same structures, different numbers.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['Pattern-matched', 'Full solutions', 'Not AI-generated'].map((item) => (
                <span key={item} className="topic-tag text-[10px]">
                  {item}
                </span>
              ))}
            </div>

            {/* CTAs - cleaner, less aggressive */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={scrollToArchive}
                className="btn-blueprint inline-flex items-center justify-center gap-2 group"
              >
                Browse the Archive
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </button>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 font-condensed text-xs uppercase tracking-widest text-blueprint-navy border border-blueprint-navy hover:bg-blueprint-navy hover:text-paper-cream transition-colors"
              >
                <UserPlus className="w-4 h-4" strokeWidth={1.5} />
                Sign Up Free
              </Link>
            </div>
          </div>

          {/* Right content - Image card */}
          <div className="lg:w-[40vw] lg:max-w-xl">
            <div
              ref={imageRef}
              className="index-card overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[56vh] relative"
            >
              <img
                src="/hero-exam.jpg"
                alt="Exam booklet and drafting tools"
                className="w-full h-full object-cover"
              />
              {/* Stitch exam stamp */}
              <div className="absolute top-4 right-4 exam-stamp-red bg-paper-cream/90">
                Actual Exam
              </div>
            </div>
            <p
              ref={captionRef}
              className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mt-3 text-right"
            >
              Source: scanned exam booklets + instructor release
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
