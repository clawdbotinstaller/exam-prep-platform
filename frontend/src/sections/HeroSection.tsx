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
      className={`min-h-screen flex items-center py-20 lg:py-0 bg-paper-cream ${className}`}
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
      <div className="relative z-10 w-full px-8 lg:px-[8vw] pt-20 lg:pt-24">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12 lg:gap-16">
          {/* Left content */}
          <div className="max-w-xl">
            {/* Date stamp */}
            <div className="mb-6">
              <span className="date-stamp">2022—2024 Collection</span>
            </div>

            {/* Headline - Single H1 for SEO/accessibility */}
            <div ref={headlineRef} className="mb-6">
              <h1 className="font-serif font-semibold text-4xl sm:text-5xl lg:text-6xl xl:text-7xl tracking-tight leading-none">
                <span className="headline-line block overflow-hidden">
                  <span className="block text-ink-black">Know The Exam</span>
                </span>
                <span className="headline-line block overflow-hidden">
                  <span className="block text-ink-black">Before You</span>
                </span>
                <span className="headline-line block overflow-hidden">
                  <span className="block text-blueprint-navy hand-highlight">Walk In</span>
                </span>
              </h1>
            </div>

            {/* Subheadline */}
            <p
              ref={subheadRef}
              className="font-sans text-pencil-gray text-base lg:text-lg leading-relaxed mb-6 max-w-md"
            >
              Your professor is not original. We found the patterns they recycle year after year—
              the integration by parts setup, the ratio test they always tweak, the volume of revolution
              that shows up every spring. Here's what they actually put on exams.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['Real exam questions', 'Step-by-step solutions', 'Pattern-matched'].map((item) => (
                <span key={item} className="topic-tag text-[10px]">
                  {item}
                </span>
              ))}
            </div>

            {/* CTAs - Primary button prominent, secondary outlined */}
            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/signup"
                className="btn-blueprint inline-flex items-center justify-center gap-2 order-first sm:order-last"
              >
                <UserPlus className="w-4 h-4" strokeWidth={1.5} />
                Sign Up Free
              </Link>
              <button
                onClick={scrollToArchive}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 font-condensed text-xs uppercase tracking-widest text-blueprint-navy border border-blueprint-navy hover:bg-blueprint-navy hover:text-paper-cream transition-colors min-touch-target"
              >
                Browse the Archive
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Right content - Image card */}
          <div className="lg:w-[40vw] lg:max-w-xl lg:mt-20">
            <div
              ref={imageRef}
              className="index-card overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[52vh] relative"
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
