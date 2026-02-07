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
    title: 'Recognize the pattern',
    description: 'Browse 80+ real exam questions from the past 5 years. Filter by topic to find problems that match what you\'re struggling with.',
    icon: Target,
    math: 'Recognize',
  },
  {
    number: '02',
    title: 'Practice under exam conditions',
    description: 'Attempt the problem before checking the answer. Write out your full solution—this builds the muscle memory you need for test day.',
    icon: BookCheck,
    math: 'Practice',
  },
  {
    number: '03',
    title: 'Learn from worked solutions',
    description: 'View detailed step-by-step solutions broken down by technique. Identify where you went wrong and learn the efficient approach.',
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
            How it works
          </h2>
          <span className="date-stamp">Method</span>
        </div>

        {/* Ruler divider */}
        <div className="ruler-divider mb-12 max-w-md" />

        {/* Bento grid steps */}
        <div ref={cardsRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLarge = index === 0;
            return (
              <div
                key={step.number}
                className={`step-card index-card p-6 lg:p-8 flex flex-col justify-between group hover:shadow-lg transition-all duration-300 ${
                  isLarge ? 'lg:col-span-2 lg:row-span-1' : ''
                }`}
              >
                {/* Top row: Number and Icon */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-blueprint-navy/30 text-sm">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 bg-blueprint-navy/5 flex items-center justify-center group-hover:bg-blueprint-navy group-hover:text-paper-cream transition-colors">
                      <Icon className="w-5 h-5 text-blueprint-navy group-hover:text-paper-cream transition-colors" strokeWidth={1.5} />
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-pencil-gray/50 border border-pencil-gray/20 px-2 py-1">
                    {step.math}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-serif font-semibold text-ink-black text-lg lg:text-xl mb-3 group-hover:text-blueprint-navy transition-colors">
                    {step.title}
                  </h3>
                  <p className="font-sans text-pencil-gray text-sm leading-relaxed">
                    {step.description}
                  </p>
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
