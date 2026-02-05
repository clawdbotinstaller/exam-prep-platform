import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface TopicBreakdownProps {
  className?: string;
}

const topics = [
  { name: 'Integration Techniques', percentage: 85 },
  { name: 'Sequences & Series', percentage: 72 },
  { name: 'Differential Equations', percentage: 68 },
  { name: 'Applications (Area/Volume)', percentage: 64 },
  { name: 'Parametric / Polar', percentage: 45 },
];

export default function TopicBreakdown({ className = '' }: TopicBreakdownProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const listItems = listRef.current?.querySelectorAll('.topic-item');
      const ticks = listRef.current?.querySelectorAll('.topic-tick');

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
      // Headline
      scrollTl.fromTo(
        headlineRef.current,
        { x: '-60vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      // Subheadline
      scrollTl.fromTo(
        subheadRef.current,
        { y: '20vh', opacity: 0 },
        { y: 0, opacity: 1, ease: 'power2.out' },
        0.12
      );

      // Ruler divider
      scrollTl.fromTo(
        rulerRef.current,
        { scaleX: 0, transformOrigin: 'left' },
        { scaleX: 1, ease: 'power2.out' },
        0.15
      );

      // List items
      if (listItems && listItems.length > 0) {
        scrollTl.fromTo(
          listItems,
          { x: '50vw', opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.02, ease: 'power2.out' },
          0.08
        );
      }

      // Ticks
      if (ticks && ticks.length > 0) {
        scrollTl.fromTo(
          ticks,
          { scaleX: 0, transformOrigin: 'left' },
          { scaleX: 1, stagger: 0.02, ease: 'power2.out' },
          0.18
        );
      }

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        headlineRef.current,
        { y: 0, opacity: 1 },
        { y: '-25vh', opacity: 0, ease: 'power2.in' },
        0.7
      );

      if (listItems && listItems.length > 0) {
        scrollTl.fromTo(
          listItems,
          { x: 0, opacity: 1 },
          { x: '18vw', opacity: 0, ease: 'power2.in' },
          0.7
        );
      }

      scrollTl.fromTo(
        subheadRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.75
      );

      scrollTl.fromTo(
        captionRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.75
      );

      scrollTl.fromTo(
        rulerRef.current,
        { opacity: 1 },
        { opacity: 0, ease: 'power2.in' },
        0.7
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="topics"
      className={`section-pinned flex items-center ${className}`}
      style={{ backgroundColor: '#F5F1E8' }}
    >
      {/* Graph paper background */}
      <div className="absolute inset-0 graph-paper" />

      <div className="w-full px-8 lg:px-[8vw] relative z-10">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-0">
          {/* Left content */}
          <div className="lg:max-w-md">
            {/* Date stamp */}
            <div className="mb-4">
              <span className="date-stamp">Analysis</span>
            </div>

            {/* Headline */}
            <div ref={headlineRef} className="mb-6">
              <h2 className="font-serif font-semibold text-ink-black text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-none">
                Actually
              </h2>
              <h2 className="font-serif font-semibold text-blueprint-navy text-5xl sm:text-6xl lg:text-7xl xl:text-8xl tracking-tight leading-none hand-highlight">
                Tested
              </h2>
            </div>

            {/* Ruler divider */}
            <div ref={rulerRef} className="ruler-divider mb-6 max-w-xs" />

            {/* Subheadline */}
            <p
              ref={subheadRef}
              className="font-sans text-pencil-gray text-base lg:text-lg leading-relaxed max-w-sm"
            >
              We analyzed 80+ papers. Here's what shows up most.
            </p>
          </div>

          {/* Right content - Topic list */}
          <div ref={listRef} className="lg:w-[34vw] lg:max-w-md">
            <div className="space-y-5">
              {topics.map((topic) => (
                <div
                  key={topic.name}
                  className="topic-item flex items-center gap-4"
                >
                  <div 
                    className="topic-tick w-3 h-3 flex-shrink-0"
                    style={{ 
                      backgroundColor: '#1E3A5F',
                      transform: 'rotate(45deg)'
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-serif font-medium text-ink-black text-sm lg:text-base">
                        {topic.name}
                      </span>
                      <span className="font-mono text-blueprint-navy text-sm">
                        {topic.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-pencil-gray/10 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm"
                        style={{
                          width: `${topic.percentage}%`,
                          backgroundColor: topic.percentage > 75 ? '#1E3A5F' : topic.percentage > 60 ? '#3D3D3D' : '#6D6D6D',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Caption */}
            <p
              ref={captionRef}
              className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mt-8 text-right"
            >
              Percentages reflect occurrence across midterms & finals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
