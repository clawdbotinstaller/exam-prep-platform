import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Eye, Lightbulb, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../lib/api';
import ErrorApology from '../components/ErrorApology';

gsap.registerPlugin(ScrollTrigger);

interface QuestionSpotlightProps {
  className?: string;
}

interface FeaturedQuestion {
  id: string;
  question_text: string;
  solution_steps: string;
  topic_name: string;
  exam_year: number;
  exam_semester: string;
  exam_type: string;
  points: number;
  difficulty: number;
  estimated_time: number;
  section: string;
}

export default function QuestionSpotlight({ className = '' }: QuestionSpotlightProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const textBlockRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const mathContentRef = useRef<HTMLDivElement>(null);

  const [question, setQuestion] = useState<FeaturedQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  // Fetch featured question on mount
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_URL}/api/featured-question`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setQuestion(data.question);
      } catch (err) {
        console.error('Failed to load featured question:', err);
        setError(err instanceof Error ? err.message : 'Failed to load question');
        setQuestion(null);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || loading) return;

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
  }, [loading]);

  const formatExamLabel = () => {
    if (!question) return '';
    return `${question.exam_semester} ${question.exam_year} ${question.exam_type}`;
  };

  return (
    <section
      ref={sectionRef}
      id="spotlight"
      className={`section-pinned flex items-center bg-paper-cream ${className}`}
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

            {loading ? (
              <div className="flex items-center gap-2 py-4">
                <Loader2 className="w-5 h-5 animate-spin text-blueprint-navy" />
                <span className="font-sans text-pencil-gray text-sm">Loading...</span>
              </div>
            ) : error ? (
              <ErrorApology
                title="We're sorry, something went wrong"
                message="We couldn't load the featured question. This might be a temporary issue."
                errorDetails={error}
                onRetry={() => window.location.reload()}
              />
            ) : question ? (
              <>
                <h3 className="font-serif font-semibold text-ink-black text-2xl lg:text-3xl mb-2">
                  From {formatExamLabel()}
                </h3>

                <div className="flex items-center gap-2 mb-6">
                  <span className="topic-tag text-[10px]">{question.topic_name || 'Integration'}</span>
                  <span className="font-mono text-pencil-gray text-xs">{question.points} pts</span>
                </div>

                <p className="font-sans text-pencil-gray text-base leading-relaxed mb-8">
                  Try it under exam conditions. Then compare with the worked
                  solution to see the most efficient approach.
                </p>

                <button
                  className="btn-blueprint inline-flex items-center gap-2"
                  onClick={() => setShowSolution(!showSolution)}
                >
                  <Lightbulb className="w-4 h-4" strokeWidth={1.5} />
                  {showSolution ? 'Hide Solution' : 'View Solution'}
                </button>
              </>
            ) : null}
          </div>

          {/* Right math card */}
          <div
            ref={cardRef}
            className="index-card p-8 lg:p-12 lg:w-[52vw] lg:min-h-[72vh] flex flex-col justify-center"
          >
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blueprint-navy" />
              </div>
            ) : error ? (
              <ErrorApology
                title="We're sorry, something went wrong"
                message="We couldn't load the featured question. This might be a temporary issue."
                errorDetails={error}
              />
            ) : question ? (
              <>
                {/* Date stamp */}
                <div className="flex items-center justify-between mb-6">
                  <span className="date-stamp">Exam Problem</span>
                  <span className="font-condensed text-[10px] uppercase tracking-widest text-pencil-gray">
                    {question.points} Points
                  </span>
                </div>

                <div ref={mathContentRef} className="space-y-6">
                  <div className="math-line">
                    <p className="font-sans text-pencil-gray text-sm mb-4">
                      {question.question_text?.includes('$') ? 'Evaluate:' : question.question_text?.split('.')[0] + '.'}
                    </p>
                  </div>

                  <div className="math-line flex justify-center py-8">
                    <div
                      className="font-mono text-2xl lg:text-3xl text-ink-black text-center leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: question.question_text
                          ?.replace(/\\int/g, '∫')
                          ?.replace(/\\sin/g, 'sin')
                          ?.replace(/\\cos/g, 'cos')
                          ?.replace(/\\tan/g, 'tan')
                          ?.replace(/\\ln/g, 'ln')
                          ?.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<sup>$1</sup>&frasl;<sub>$2</sub>')
                          ?.replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
                          ?.replace(/_{([^}]+)}/g, '<sub>$1</sub>')
                          ?.replace(/\$([^$]+)\$/g, '$1')
                          || '∫ x² sin(2x) dx'
                      }}
                    />
                  </div>

                  {showSolution && (
                    <div className="math-line">
                      <div className="w-full h-px bg-pencil-gray/20 my-6" />
                      <div className="bg-paper-aged/50 p-4 rounded border-l-2 border-blueprint-navy">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-condensed text-[10px] uppercase tracking-widest text-blueprint-navy">
                            Step-by-Step Solution
                          </p>
                          <span className="font-condensed text-[10px] text-pencil-gray">
                            Step 1 of {question.solution_steps?.split(/\n|\\n/).filter((s: string) => s.trim()).length || 1}
                          </span>
                        </div>

                        {/* Parse solution steps */}
                        {(() => {
                          const steps = question.solution_steps
                            ?.split(/\n|\\n/)
                            .map((s: string) => s.trim())
                            .filter((s: string) => s.length > 0) || [];

                          // Show first step clearly
                          const firstStep = steps[0] || question.solution_steps || 'Solution not available';
                          const remainingSteps = steps.slice(1);

                          return (
                            <div className="space-y-3">
                              {/* First step - clearly visible */}
                              <div className="bg-paper-cream p-3 rounded border border-blueprint-navy/20">
                                <span className="font-mono text-blueprint-navy text-xs font-bold mr-2">Step 1:</span>
                                <p className="font-sans text-ink-black text-sm leading-relaxed inline">
                                  {firstStep.replace(/^Step \d+[:.]?\s*/, '')}
                                </p>
                              </div>

                              {/* Remaining steps - blurred */}
                              {remainingSteps.length > 0 && (
                                <div className="relative">
                                  <div className="blur-[3px] opacity-60 select-none space-y-2">
                                    {remainingSteps.slice(0, 2).map((step: string, idx: number) => (
                                      <div key={idx} className="bg-paper-cream/50 p-3 rounded">
                                        <span className="font-mono text-blueprint-navy/50 text-xs font-bold mr-2">
                                          Step {idx + 2}:
                                        </span>
                                        <p className="font-sans text-ink-black/50 text-sm leading-relaxed inline">
                                          {step.replace(/^Step \d+[:.]?\s*/, '').substring(0, 60)}...
                                        </p>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Overlay to encourage signup */}
                                  <div className="absolute inset-0 flex items-center justify-center bg-paper-cream/30 backdrop-blur-[1px]">
                                    <Link
                                      to="/signup"
                                      className="bg-blueprint-navy text-paper-cream px-4 py-2 rounded-sm font-condensed text-xs uppercase tracking-widest hover:bg-highlighter-yellow hover:text-blueprint-navy transition-colors shadow-lg"
                                    >
                                      Sign Up to See All Steps
                                    </Link>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  <div className="math-line">
                    <div className="w-full h-px bg-pencil-gray/20 my-6" />
                  </div>

                  <div className="math-line space-y-4">
                    <p className="font-sans text-pencil-gray text-sm">
                      {showSolution ? 'Key techniques used:' : 'You may use:'}
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
                        Time estimate: {question.estimated_time || 8}-{question.estimated_time ? question.estimated_time + 4 : 12} minutes
                      </span>
                      <span className="topic-tag text-[10px]">Section {question.section || '3.1'}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="font-sans text-pencil-gray">Failed to load question</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
