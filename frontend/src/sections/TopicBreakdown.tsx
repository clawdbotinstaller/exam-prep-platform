import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Loader2 } from 'lucide-react';
import { API_URL } from '../lib/api';

gsap.registerPlugin(ScrollTrigger);

interface TopicBreakdownProps {
  className?: string;
}

interface Topic {
  id: string;
  name: string;
  question_count: number;
  frequency_score?: number;
  percentage?: number;
}

export default function TopicBreakdown({ className = '' }: TopicBreakdownProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadRef = useRef<HTMLParagraphElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        // Use the public endpoint for topics
        const res = await fetch(`${API_URL}/api/courses/calc2/topics/public`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();

        // Sort by question count (frequency) and take top 5
        const sortedTopics = (data.topics || [])
          .sort((a: Topic, b: Topic) => (b.question_count || 0) - (a.question_count || 0))
          .slice(0, 5)
          .map((t: Topic) => ({
            ...t,
            percentage: Math.min(95, Math.max(30, (t.question_count || 0) * 3)),
          }));

        setTopics(sortedTopics);
      } catch (err) {
        console.error('Failed to load topics:', err);
        // Fallback to hardcoded topics
        setTopics([
          { id: '1', name: 'Integration by Parts', question_count: 8, percentage: 85 },
          { id: '2', name: 'Trigonometric Integrals', question_count: 6, percentage: 72 },
          { id: '3', name: 'Partial Fractions', question_count: 5, percentage: 68 },
          { id: '4', name: 'Differential Equations', question_count: 4, percentage: 64 },
          { id: '5', name: 'Improper Integrals', question_count: 3, percentage: 45 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || loading) return;

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
  }, [loading]);

  const getPercentage = (topic: Topic) => {
    // Calculate percentage based on question count relative to total
    const maxCount = Math.max(...topics.map(t => t.question_count || 0), 1);
    return Math.min(95, Math.max(25, Math.round((topic.question_count || 0) / maxCount * 100)));
  };

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
              We clustered similar problems across 5+ papers. Here&apos;s what repeats
              most, even when the numbers change.
            </p>
          </div>

          {/* Right content - Topic list */}
          <div ref={listRef} className="lg:w-[34vw] lg:max-w-md">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blueprint-navy" />
              </div>
            ) : (
              <div className="space-y-5">
                {topics.map((topic) => {
                  const percentage = getPercentage(topic);
                  return (
                    <div
                      key={topic.id}
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
                            {topic.question_count} questions
                          </span>
                        </div>
                        <div className="h-1.5 bg-pencil-gray/10 rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: percentage > 75 ? '#1E3A5F' : percentage > 60 ? '#3D3D3D' : '#6D6D6D',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Caption */}
            <p
              ref={captionRef}
              className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mt-8 text-right"
            >
              Pattern clusters, not identical wording. Frequency across midterms.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
