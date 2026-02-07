import { useRef, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Timer, BookCheck } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface StudyFlowProps {
  className?: string;
}

const steps = [
  {
    number: '01',
    title: 'Browse the archive',
    description: 'Explore 80+ real exam questions from the past 5 years. Filter by topic, difficulty, or exam type to find exactly what you need to practice.',
    icon: Target,
    math: 'Free',
  },
  {
    number: '02',
    title: 'Try it yourself first',
    description: 'Attempt the problem under exam conditions. Write out your full solution before checking the answer—this builds the pattern recognition you need.',
    icon: BookCheck,
    math: 'Practice',
  },
  {
    number: '03',
    title: 'Compare with step-by-step',
    description: 'View detailed worked solutions broken down by technique. Identify where you went wrong and learn the most efficient approach for next time.',
    icon: Timer,
    math: 'Learn',
  },
];

export default function StudyFlow({ className = '' }: StudyFlowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.querySelectorAll('.step-card');
      const statItems = statsRef.current?.querySelectorAll('.stat-item');

      // Title animation
      gsap.fromTo(
        titleRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 80%',
            end: 'top 55%',
            scrub: true,
          },
        }
      );

      // Cards animation
      if (cards && cards.length > 0) {
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { x: '-10vw', opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.6,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                end: 'top 50%',
                scrub: true,
              },
            }
          );
        });
      }

      // Stats animation
      if (statItems && statItems.length > 0) {
        statItems.forEach((stat, index) => {
          gsap.fromTo(
            stat,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              delay: index * 0.1,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: statsRef.current,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className={`py-20 lg:py-28 ${className}`}
      style={{ backgroundColor: '#F5F1E8' }}
    >
      {/* Graph paper background */}
      <div className="absolute inset-0 graph-paper" />

      <div className="px-8 lg:px-[8vw] relative z-10">
        {/* Title */}
        <div className="flex items-center gap-3 mb-12 lg:mb-16">
          <h2
            ref={titleRef}
            className="font-serif font-semibold text-ink-black text-3xl lg:text-4xl max-w-lg"
          >
            How to use <span className="font-serif italic text-blueprint-navy tracking-tight">arkive</span>
          </h2>
          <span className="date-stamp">Method</span>
        </div>

        {/* Ruler divider */}
        <div className="ruler-divider mb-12 max-w-md" />

        {/* Step cards */}
        <div ref={cardsRef} className="space-y-6 lg:space-y-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="step-card index-card p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10"
              >
                {/* Number circle */}
                <div className="flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 border-2 border-blueprint-navy flex items-center justify-center">
                  <span className="font-mono font-medium text-blueprint-navy text-lg lg:text-xl">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5 text-blueprint-navy" strokeWidth={1.5} />
                    <h3 className="font-serif font-semibold text-ink-black text-lg lg:text-xl">
                      {step.title}
                    </h3>
                  </div>
                  <p className="font-sans text-pencil-gray text-sm lg:text-base leading-relaxed max-w-xl">
                    {step.description}
                  </p>
                </div>

                {/* Math decoration */}
                <div className="flex-shrink-0 font-mono text-blueprint-navy/40 text-lg lg:text-xl">
                  {step.math}
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-12 lg:mt-16 pt-12 border-t border-pencil-gray/20">
          {[
            { value: '80+', label: 'Real exam questions' },
            { value: '5', label: 'Years covered' },
            { value: '8', label: 'Core topics' },
            { value: '100%', label: 'Free to browse' },
          ].map((stat) => (
            <div key={stat.label} className="stat-item text-center lg:text-left">
              <div className="font-mono font-medium text-blueprint-navy text-3xl lg:text-4xl mb-1">
                {stat.value}
              </div>
              <div className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
