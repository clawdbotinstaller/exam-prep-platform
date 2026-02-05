import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, Lightbulb } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface QuestionSpotlightProps {
  className?: string;
}

export default function QuestionSpotlight({ className = '' }: QuestionSpotlightProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mathContentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const mathLines = mathContentRef.current?.querySelectorAll('.math-line');

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=140%',
          pin: true,
          scrub: 0.6,
        },
      });

      // ENTRANCE (0% - 30%)
      // Left text block
      scrollTl.fromTo(
        textBlockRef.current,
        { x: '-40vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      // Math card
      scrollTl.fromTo(
        cardRef.current,
        { x: '70vw', rotate: 2, opacity: 0 },
        { x: 0, rotate: 0, opacity: 1, ease: 'power2.out' },
        0.08
      );

      // Math lines inside card
      if (mathLines && mathLines.length > 0) {
        scrollTl.fromTo(
          mathLines,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.02, ease: 'power2.out' },
          0.18
        );
      }

      // EXIT (70% - 100%)
      scrollTl.fromTo(
        cardRef.current,
        { y: 0, rotate: 0, opacity: 1 },
        { y: '-40vh', rotate: -3, opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        textBlockRef.current,
        { x: 0, opacity: 1 },
        { x: '-20vw', opacity: 0, ease: 'power2.in' },
        0.7
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="spotlight"
      className={`section-pinned flex items-center ${className}`}
      style={{ backgroundColor: '#F5F1E8' }}
    >
      {/* Graph paper background */}
      <div className="absolute inset-0 graph-paper" />

      <div className="w-full px-8 lg:px-[8vw] relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 lg:gap-12">
          {/* Left text block */}
          <div ref={textBlockRef} className="lg:max-w-sm lg:pt-8">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-blueprint-navy" strokeWidth={1.5} />
              <span className="font-condensed text-blueprint-navy text-[11px] uppercase tracking-widest">
                Featured Problem
              </span>
            </div>
            
            <h3 className="font-serif font-semibold text-ink-black text-2xl lg:text-3xl mb-2">
              From Midterm 2023A
            </h3>
            
            <div className="flex items-center gap-2 mb-6">
              <span className="topic-tag text-[10px]">Integration</span>
              <span className="font-mono text-pencil-gray text-xs">6 pts</span>
            </div>
            
            <p className="font-sans text-pencil-gray text-base leading-relaxed mb-8">
              Try it under exam conditions. Then compare with the worked
              solution to see the most efficient approach.
            </p>
            
            <button className="btn-blueprint inline-flex items-center gap-2">
              <Lightbulb className="w-4 h-4" strokeWidth={1.5} />
              View Solution
            </button>
          </div>

          {/* Right math card */}
          <div
            ref={cardRef}
            className="index-card p-8 lg:p-12 lg:w-[52vw] lg:min-h-[72vh] flex flex-col justify-center"
          >
            {/* Date stamp */}
            <div className="flex items-center justify-between mb-6">
              <span className="date-stamp">Exam Problem</span>
              <span className="font-condensed text-[10px] uppercase tracking-widest text-pencil-gray">
                6 Points
              </span>
            </div>

            <div ref={mathContentRef} className="space-y-6">
              <div className="math-line">
                <p className="font-sans text-pencil-gray text-sm mb-4">
                  Evaluate the integral:
                </p>
              </div>

              <div className="math-line flex justify-center py-8">
                <div className="font-mono text-3xl lg:text-4xl text-ink-black">
                  ∫ x² sin(2x) dx
                </div>
              </div>

              <div className="math-line">
                <div className="w-full h-px bg-pencil-gray/20 my-6" />
              </div>

              <div className="math-line space-y-4">
                <p className="font-sans text-pencil-gray text-sm">
                  Show all steps clearly. You may use:
                </p>
                <ul className="font-mono text-sm text-ink-black space-y-2 pl-4">
                  <li className="math-line">• Integration by parts formula</li>
                  <li className="math-line">• Standard trigonometric identities</li>
                  <li className="math-line">• Tabular method (optional)</li>
                </ul>
              </div>

              <div className="math-line mt-8 pt-6 border-t border-pencil-gray/20">
                <div className="flex items-center justify-between">
                  <span className="font-condensed text-[10px] uppercase tracking-widest text-pencil-gray">
                    Time estimate: 8-12 minutes
                  </span>
                  <span className="topic-tag text-[10px]">Integration by Parts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
