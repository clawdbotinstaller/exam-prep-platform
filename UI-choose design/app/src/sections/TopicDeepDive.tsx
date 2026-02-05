import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TopicDeepDiveProps {
  className?: string;
}

export default function TopicDeepDive({ className = '' }: TopicDeepDiveProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgWordRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=130%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0% - 30%)
      // Background topic word
      scrollTl.fromTo(
        bgWordRef.current,
        { x: '-20vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      // Left card
      scrollTl.fromTo(
        leftCardRef.current,
        { x: '-60vw', rotate: -5, opacity: 0 },
        { x: 0, rotate: 0, opacity: 1, ease: 'power2.out' },
        0.08
      );

      // Right card
      scrollTl.fromTo(
        rightCardRef.current,
        { x: '70vw', rotate: 5, opacity: 0 },
        { x: 0, rotate: 0, opacity: 1, ease: 'power2.out' },
        0.1
      );

      // Caption
      scrollTl.fromTo(
        captionRef.current,
        { y: '10vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.18
      );

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        leftCardRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        rightCardRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        bgWordRef.current,
        { opacity: 1 },
        { opacity: 0.1, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        captionRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.75
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="deep-dive"
      className={`section-pinned flex items-center ${className}`}
      style={{ backgroundColor: '#F5F1E8' }}
    >
      {/* Graph paper background */}
      <div className="absolute inset-0 graph-paper" />

      <div className="w-full px-8 lg:px-[8vw] relative">
        {/* Background topic word */}
        <div
          ref={bgWordRef}
          className="absolute top-1/2 left-[8vw] -translate-y-1/2 pointer-events-none select-none z-0"
        >
          <span
            className="font-serif font-semibold text-[12vw] lg:text-[14vw] tracking-tighter"
            style={{ color: 'rgba(30, 58, 95, 0.06)' }}
          >
            INTEGRATION
          </span>
        </div>

        {/* Cards */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-8">
          {/* Left card - medium */}
          <div
            ref={leftCardRef}
            className="index-card p-6 lg:p-8 lg:w-[34vw] lg:h-[40vh] flex flex-col justify-center"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="topic-tag text-[10px]">Quick Practice</span>
              <span className="date-stamp text-[9px]">2 min</span>
            </div>
            
            <p className="font-sans text-pencil-gray text-sm mb-4">
              Evaluate:
            </p>
            
            <div className="font-mono text-xl lg:text-2xl text-ink-black text-center py-4">
              ∫ eˣ cos(x) dx
            </div>
            
            <p className="font-sans text-pencil-gray text-xs mt-4">
              <span className="hand-highlight">Hint:</span> Apply integration by parts twice.
            </p>
          </div>

          {/* Right card - large */}
          <div
            ref={rightCardRef}
            className="index-card p-6 lg:p-10 lg:w-[46vw] lg:min-h-[64vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="topic-tag text-[10px]">Exam Problem</span>
              <div className="flex items-center gap-3">
                <span className="date-stamp text-[9px]">Final 2023</span>
                <span className="font-mono text-xs text-pencil-gray">10 pts</span>
              </div>
            </div>

            <p className="font-sans text-pencil-gray text-sm mb-4">
              Consider the region bounded by y = √x, y = 0, and x = 4.
            </p>

            <div className="space-y-4 font-sans text-ink-black text-sm">
              <p>(a) Find the area of the region. <span className="font-mono text-pencil-gray text-xs">(3 pts)</span></p>
              <p>(b) Find the volume when rotated about the x-axis. <span className="font-mono text-pencil-gray text-xs">(4 pts)</span></p>
              <p>(c) Find the volume when rotated about y = 2. <span className="font-mono text-pencil-gray text-xs">(3 pts)</span></p>
            </div>

            <div className="mt-auto pt-6 border-t border-pencil-gray/20">
              <div className="flex items-center gap-4">
                <div className="flex-1 h-2 bg-pencil-gray/10 rounded-sm overflow-hidden">
                  <div 
                    className="h-full rounded-sm"
                    style={{ width: '75%', backgroundColor: '#1E3A5F' }}
                  />
                </div>
                <span className="font-condensed text-[10px] uppercase tracking-widest text-pencil-gray">
                  Difficulty: Medium-Hard
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Caption */}
        <p
          ref={captionRef}
          className="relative z-10 font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mt-8 lg:mt-12"
        >
          3–4 integration problems per midterm on average.
        </p>
      </div>
    </section>
  );
}
