import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className = '' }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
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
            duration: 0.6,
            stagger: 0.05,
            ease: 'power2.out',
            delay: 0.2,
          }
        );
      }

      // Headline animation
      const headlineWords = headlineRef.current?.querySelectorAll('.headline-line');
      if (headlineWords && headlineWords.length > 0) {
        gsap.fromTo(
          headlineWords,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power3.out',
            delay: 0.4,
          }
        );
      }

      // Subheadline
      gsap.fromTo(
        subheadRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.8 }
      );

      // CTA button
      gsap.fromTo(
        ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', delay: 1 }
      );

      // Image card
      gsap.fromTo(
        imageRef.current,
        { x: 200, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: 'power3.out',
          delay: 0.5,
        }
      );

      // Caption
      gsap.fromTo(
        captionRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.5, delay: 1.1 }
      );

      // Scroll-driven exit animation
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
          onLeaveBack: () => {
            // Reset all elements to visible when scrolling back
            if (headlineWords && headlineWords.length > 0) {
              gsap.set(headlineWords, { x: 0, opacity: 1 });
            }
            gsap.set(subheadRef.current, { y: 0, opacity: 1 });
            gsap.set(ctaRef.current, { y: 0, opacity: 1 });
            gsap.set(imageRef.current, { x: 0, opacity: 1 });
            gsap.set(gridRef.current, { opacity: 1 });
          },
        },
      });

      // EXIT phase (70% - 100%)
      if (headlineWords && headlineWords.length > 0) {
        scrollTl.fromTo(
          headlineWords,
          { x: 0, opacity: 1 },
          { x: '-40vw', opacity: 0, ease: 'power2.in' },
          0.7
        );
      }

      scrollTl.fromTo(
        subheadRef.current,
        { y: 0, opacity: 1 },
        { y: '-15vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        ctaRef.current,
        { y: 0, opacity: 1 },
        { y: '12vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        imageRef.current,
        { x: 0, opacity: 1 },
        { x: '55vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        captionRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.75
      );

      scrollTl.fromTo(
        gridRef.current,
        { opacity: 1 },
        { opacity: 0.2, ease: 'power2.in' },
        0.7
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
      className={`section-pinned flex items-center ${className}`}
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
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-0">
          {/* Left content */}
          <div className="max-w-xl">
            {/* Date stamp */}
            <div className="mb-6">
              <span className="date-stamp">2022—2024 Collection</span>
            </div>

            {/* Headline */}
            <div ref={headlineRef} className="mb-8">
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
              className="font-sans text-pencil-gray text-base lg:text-lg leading-relaxed mb-8 max-w-md"
            >
              Midterms & finals from 2022–2024. Sorted by topic. No generic
              practice problems.
            </p>

            {/* CTA */}
            <button
              ref={ctaRef}
              onClick={scrollToArchive}
              className="btn-blueprint inline-flex items-center gap-2 group"
            >
              Browse the Archive
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </button>
          </div>

          {/* Right content - Image card */}
          <div className="lg:w-[40vw] lg:max-w-xl">
            <div
              ref={imageRef}
              className="index-card overflow-hidden aspect-[4/3] lg:aspect-auto lg:h-[56vh]"
            >
              <img
                src="/hero-exam.jpg"
                alt="Exam booklet and drafting tools"
                className="w-full h-full object-cover"
              />
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
