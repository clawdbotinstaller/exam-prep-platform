import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Loader2, Lightbulb } from 'lucide-react';
import { API_URL } from '../lib/api';
import ErrorApology from '../components/ErrorApology';
import LatexRenderer from '../components/LatexRenderer';

gsap.registerPlugin(ScrollTrigger);

interface TopicDeepDiveProps {
  className?: string;
}

interface QuickQuestion {
  id: string;
  question_text: string;
  solution_steps: string;
  estimated_time: number;
  topic_name: string;
}

interface ExamQuestion {
  id: string;
  question_text: string;
  source_points: number;
  difficulty: number;
  source_exam_year: number;
  source_exam_type: string;
  has_subparts: number;
  subparts_json: string | null;
}

export default function TopicDeepDive({ className = '' }: TopicDeepDiveProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgWordRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);

  const [quickQuestion, setQuickQuestion] = useState<QuickQuestion | null>(null);
  const [examQuestion, setExamQuestion] = useState<ExamQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuickSolution, setShowQuickSolution] = useState(false);

  // Fetch two real questions on mount
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Fetch a quick practice question (easy/medium)
        const quickRes = await fetch(`${API_URL}/api/featured-question`);
        if (quickRes.ok) {
          const quickData = await quickRes.json();
          setQuickQuestion(quickData.question);
        }

        // Fetch an exam question with subparts or higher difficulty
        const examRes = await fetch(`${API_URL}/api/featured-question`);
        if (examRes.ok) {
          const examData = await examRes.json();
          setExamQuestion(examData.question);
        }
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load questions');
        setQuickQuestion(null);
        setExamQuestion(null);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || loading) return;

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
  }, [loading]);

  const getDifficultyLabel = (diff: number) => {
    if (diff <= 2) return 'Easy';
    if (diff <= 3) return 'Medium';
    if (diff <= 4) return 'Medium-Hard';
    return 'Hard';
  };


  const parseSubparts = (json: string | null) => {
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  };

  return (
    <section
      ref={sectionRef}
      id="deep-dive"
      className={`section-pinned flex items-center bg-paper-cream ${className}`}
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

        {loading ? (
          <div className="relative z-10 flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blueprint-navy" />
          </div>
        ) : error ? (
          <div className="relative z-10">
            <ErrorApology
              title="We're sorry, something went wrong"
              message="We couldn't load the questions. This might be a temporary issue."
              errorDetails={error}
              onRetry={() => window.location.reload()}
            />
          </div>
        ) : (
          <>
            {/* Cards */}
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 lg:gap-8">
              {/* Left card - quick practice */}
              <div
                ref={leftCardRef}
                className="index-card p-6 lg:p-8 lg:w-[34vw] lg:h-[40vh] flex flex-col justify-center"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="topic-tag text-[10px]">Quick Practice</span>
                  <span className="date-stamp text-[9px]">{quickQuestion?.estimated_time || 2} min</span>
                </div>

                <p className="font-sans text-pencil-gray text-sm mb-4">
                  Evaluate:
                </p>

                <div className="font-mono text-xl lg:text-2xl text-ink-black text-center py-4">
                  <LatexRenderer tex={quickQuestion?.question_text || '∫ eˣ cos(x) dx'} />
                </div>

                {showQuickSolution && quickQuestion?.solution_steps && (
                  <div className="mt-4 p-3 bg-paper-aged/50 rounded border-l-2 border-blueprint-navy">
                    <p className="font-sans text-ink-black text-xs leading-relaxed">
                      {quickQuestion.solution_steps.slice(0, 100)}...
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between mt-4">
                  <p className="font-sans text-pencil-gray text-xs">
                    <span className="hand-highlight">Hint:</span> Apply integration by parts twice.
                  </p>
                  <button
                    onClick={() => setShowQuickSolution(!showQuickSolution)}
                    className="p-1 hover:bg-paper-aged rounded"
                  >
                    <Lightbulb className="w-4 h-4 text-blueprint-navy" />
                  </button>
                </div>
              </div>

              {/* Right card - exam problem */}
              <div
                ref={rightCardRef}
                className="index-card p-6 lg:p-10 lg:w-[46vw] lg:min-h-[64vh] flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="topic-tag text-[10px]">Exam Problem</span>
                  <div className="flex items-center gap-3">
                    <span className="date-stamp text-[9px]">
                      {examQuestion?.source_exam_type || 'Final'} {examQuestion?.source_exam_year || '2023'}
                    </span>
                    <span className="font-mono text-xs text-pencil-gray">{examQuestion?.source_points || 10} pts</span>
                  </div>
                </div>

                <p className="font-sans text-pencil-gray text-sm mb-4">
                  <LatexRenderer tex={examQuestion?.question_text || 'Consider the region bounded by y = √x, y = 0, and x = 4.'} />
                </p>

                {examQuestion?.has_subparts && examQuestion?.subparts_json ? (
                  <div className="space-y-4 font-sans text-ink-black text-sm">
                    {parseSubparts(examQuestion.subparts_json).map((sub: any, idx: number) => (
                      <p key={idx}>
                        ({sub.number.replace(/\D/g, '')}) {' '}
                        <LatexRenderer tex={sub.text} />
                        {' '}
                        <span className="font-mono text-pencil-gray text-xs">({sub.points} pts)</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 font-sans text-ink-black text-sm">
                    <p>(a) Find the area of the region. <span className="font-mono text-pencil-gray text-xs">(3 pts)</span></p>
                    <p>(b) Find the volume when rotated about the x-axis. <span className="font-mono text-pencil-gray text-xs">(4 pts)</span></p>
                    <p>(c) Find the volume when rotated about y = 2. <span className="font-mono text-pencil-gray text-xs">(3 pts)</span></p>
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-pencil-gray/20">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-pencil-gray/10 rounded-sm overflow-hidden">
                      <div
                        className="h-full rounded-sm"
                        style={{
                          width: `${(examQuestion?.difficulty || 3) / 5 * 100}%`,
                          backgroundColor: '#1E3A5F'
                        }}
                      />
                    </div>
                    <span className="font-condensed text-[10px] uppercase tracking-widest text-pencil-gray">
                      Difficulty: {getDifficultyLabel(examQuestion?.difficulty || 3)}
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
          </>
        )}
      </div>
    </section>
  );
}
