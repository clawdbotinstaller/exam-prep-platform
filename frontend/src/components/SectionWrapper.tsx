import { useRef, useLayoutEffect, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  className?: string;
  withGraphPaper?: boolean;
  withGridOverlay?: boolean;
  gridLines?: number;
}

export default function SectionWrapper({
  id,
  children,
  className = '',
  withGraphPaper = true,
  withGridOverlay = false,
  gridLines = 12,
}: SectionWrapperProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!withGridOverlay || !gridRef.current) return;

    const ctx = gsap.context(() => {
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
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [withGridOverlay]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative ${className}`}
    >
      {withGraphPaper && (
        <div className="absolute inset-0 graph-paper" />
      )}

      {withGridOverlay && (
        <div
          ref={gridRef}
          className="absolute left-1/2 -translate-x-1/2 w-[min(1100px,86vw)] h-full pointer-events-none z-[1]"
        >
          {Array.from({ length: gridLines }).map((_, i) => (
            <div
              key={i}
              className="grid-line absolute top-0 h-full w-px"
              style={{
                left: `${(i / (gridLines - 1)) * 100}%`,
                backgroundColor: 'rgba(61, 61, 61, 0.12)',
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </section>
  );
}
