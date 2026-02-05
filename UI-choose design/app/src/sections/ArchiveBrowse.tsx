import { useRef, useLayoutEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, FileText } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ArchiveBrowseProps {
  className?: string;
}

const filters = ['All', 'Integration', 'Series', 'DiffEq', 'AppProblems'];

const examCards = [
  { id: 1, year: '2023A', type: 'Midterm', topic: 'Integration', problem: '∫ x² ln(x) dx', date: 'MAR 15 2023' },
  { id: 2, year: '2022', type: 'Final', topic: 'Series', problem: '∑ ((-1)ⁿ / n²)', date: 'DEC 12 2022' },
  { id: 3, year: '2024B', type: 'Midterm', topic: 'DiffEq', problem: 'dy/dx = y² cos(x)', date: 'FEB 28 2024' },
  { id: 4, year: '2023B', type: 'Midterm', topic: 'Integration', problem: '∫ eˣ sin(x) dx', date: 'APR 05 2023' },
  { id: 5, year: '2022', type: 'Midterm', topic: 'AppProblems', problem: 'Volume of revolution', date: 'OCT 20 2022' },
  { id: 6, year: '2024A', type: 'Final', topic: 'Series', problem: 'Ratio test convergence', date: 'MAY 08 2024' },
];

export default function ArchiveBrowse({ className = '' }: ArchiveBrowseProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredCards = activeFilter === 'All' 
    ? examCards 
    : examCards.filter(card => card.topic === activeFilter);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const cardElements = cardsRef.current?.querySelectorAll('.exam-card');

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
      // Title + chips
      scrollTl.fromTo(
        titleRef.current,
        { x: '-30vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0
      );

      // Cards stagger
      if (cardElements && cardElements.length > 0) {
        scrollTl.fromTo(
          cardElements,
          { y: '100vh', rotate: -3, opacity: 0 },
          {
            y: 0,
            rotate: 0,
            opacity: 1,
            stagger: 0.03,
            ease: 'power2.out',
          },
          0.05
        );
      }

      // Preview card
      scrollTl.fromTo(
        previewRef.current,
        { x: '60vw', opacity: 0 },
        { x: 0, opacity: 1, ease: 'power2.out' },
        0.1
      );

      // EXIT (70% - 100%)
      if (cardElements && cardElements.length > 0) {
        scrollTl.fromTo(
          cardElements,
          { x: 0, opacity: 1 },
          { x: '-18vw', opacity: 0, ease: 'power2.in' },
          0.7
        );
      }

      scrollTl.fromTo(
        previewRef.current,
        { x: 0, opacity: 1 },
        { x: '45vw', opacity: 0, ease: 'power2.in' },
        0.7
      );

      scrollTl.fromTo(
        titleRef.current,
        { y: 0, opacity: 1 },
        { y: '-10vh', opacity: 0.2, ease: 'power2.in' },
        0.7
      );
    }, section);

    return () => ctx.revert();
  }, [filteredCards]);

  return (
    <section
      ref={sectionRef}
      id="archive"
      className={`section-pinned flex items-center ${className}`}
      style={{ backgroundColor: '#F5F1E8' }}
    >
      {/* Graph paper background */}
      <div className="absolute inset-0 graph-paper" />

      <div className="w-full px-8 lg:px-[8vw] py-20 relative z-10">
        {/* Title and filters */}
        <div ref={titleRef} className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-serif font-semibold text-ink-black text-2xl lg:text-3xl">
              Browse the Archive
            </h2>
            <span className="date-stamp">80+ Papers</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`font-condensed text-[11px] uppercase tracking-widest px-3 py-1.5 border transition-all ${
                  activeFilter === filter
                    ? 'bg-blueprint-navy text-paper-cream border-blueprint-navy'
                    : 'bg-transparent text-pencil-gray border-pencil-gray/30 hover:border-blueprint-navy hover:text-blueprint-navy'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Cards grid */}
          <div
            ref={cardsRef}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 lg:w-[52vw]"
          >
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="exam-card index-card p-4 lg:p-5 hover:shadow-index-hover transition-all cursor-pointer group"
              >
                {/* Date stamp */}
                <div className="flex items-center justify-between mb-3">
                  <span className="date-stamp text-[9px]">{card.date}</span>
                  <FileText className="w-4 h-4 text-pencil-gray group-hover:text-blueprint-navy transition-colors" strokeWidth={1.5} />
                </div>
                
                {/* Card content */}
                <div className="mb-3">
                  <span className="font-condensed text-[10px] uppercase tracking-widest text-pencil-gray">
                    {card.type} {card.year}
                  </span>
                </div>
                
                <div className="font-mono text-sm text-ink-black mb-4 min-h-[40px]">
                  {card.problem}
                </div>
                
                <div className="topic-tag">
                  {card.topic}
                </div>
              </div>
            ))}
          </div>

          {/* Preview card */}
          <div
            ref={previewRef}
            className="index-card p-6 lg:p-8 lg:w-[28vw] lg:min-h-[56vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-condensed text-[10px] uppercase tracking-widest text-pencil-gray">
                Preview
              </span>
              <div className="topic-tag">Integration</div>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <p className="font-sans text-pencil-gray text-sm mb-4">
                Evaluate using integration by parts:
              </p>
              <div className="font-mono text-xl lg:text-2xl text-ink-black mb-6">
                ∫ x² eˣ dx
              </div>
              <div className="w-full h-px bg-pencil-gray/20 mb-6" />
              <p className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest">
                6 points • Midterm 2023A
              </p>
            </div>
            
            <button className="w-full py-3 bg-blueprint-navy/10 text-blueprint-navy font-condensed text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blueprint-navy hover:text-paper-cream transition-colors">
              Open
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
