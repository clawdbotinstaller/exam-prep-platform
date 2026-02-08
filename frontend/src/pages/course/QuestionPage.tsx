import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { apiGet } from '../../lib/api';
import LatexRenderer from '../../components/LatexRenderer';

export default function QuestionPage() {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSolution, setShowSolution] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(Number(searchParams.get('i') ?? 0));
  const [isLoggedIn] = useState(() => !!localStorage.getItem('token'));

  useEffect(() => {
    const cached = sessionStorage.getItem('question_set');
    if (cached) {
      try {
        setQuestions(JSON.parse(cached));
        return;
      } catch {
        sessionStorage.removeItem('question_set');
      }
    }

    const loadSingle = async () => {
      if (!id) return;
      try {
        const resp = await apiGet<{ question: any }>(`/api/questions/${id}`);
        setQuestions([resp.question]);
      } catch (err) {
        console.error(err);
      }
    };
    loadSingle();
  }, [id]);

  const question = questions[currentIndex] ?? {};

  return (
    <div className="p-8 lg:p-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif font-semibold text-ink-black text-3xl mb-2">
            Question {id}
          </h1>
          <p className="font-sans text-pencil-gray">{question.source_exam_type ?? 'Exam'} {question.source_exam_year ?? ''}</p>
        </div>
        <span className="topic-tag">Integration</span>
      </div>

      <div className="index-card p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[10px] text-pencil-gray uppercase tracking-tighter">Source: {question.source_exam_type ?? 'Exam'} {question.source_exam_year ?? ''}</span>
          {question.pattern_id && (
            <span className="topic-tag text-[8px]">Pattern #{question.pattern_id.slice(-4)}</span>
          )}
        </div>
        <div className="font-serif text-ink-black text-lg mb-6">
          <LatexRenderer tex={question.question_text ?? question.text} />
        </div>
        <button className="btn-blueprint" onClick={() => setShowSolution(!showSolution)}>
          {showSolution ? 'Hide Solution' : 'Show Step-by-Step Solution'}
        </button>
        {showSolution && (
          <div className="mt-6 p-4 bg-paper-aged border-l-2 border-blueprint-navy">
            {(() => {
              const solutionText = question.solution_steps ?? question.solution ?? '';
              const steps = solutionText
                .split(/\n|\\n/)
                .map((s: string) => s.trim())
                .filter((s: string) => s.length > 0);

              // Show first 2 steps as preview
              const previewSteps = steps.slice(0, 2);
              const remainingCount = Math.max(0, steps.length - 2);

              return (
                <div className="space-y-4">
                  {/* Preview steps */}
                  {previewSteps.map((step: string, idx: number) => (
                    <div key={idx} className="bg-paper-cream p-3 rounded border border-blueprint-navy/20">
                      <span className="font-mono text-blueprint-navy text-xs font-bold mr-2">Step {idx + 1}:</span>
                      <div className="font-sans text-ink-black leading-relaxed inline">
                        <LatexRenderer tex={step.replace(/^Step \d+[:.]?\s*/, '')} />
                      </div>
                    </div>
                  ))}

                  {/* Locked remaining steps */}
                  {!isLoggedIn && remainingCount > 0 && (
                    <div className="relative mt-4">
                      {/* Blurred preview of remaining steps */}
                      <div className="blur-[3px] opacity-60 select-none space-y-2">
                        {steps.slice(2, 4).map((step: string, idx: number) => (
                          <div key={idx} className="bg-paper-cream/50 p-3 rounded">
                            <span className="font-mono text-blueprint-navy/50 text-xs font-bold mr-2">
                              Step {idx + 3}:
                            </span>
                            <p className="font-sans text-ink-black/50 text-sm leading-relaxed inline">
                              {step.replace(/^Step \d+[:.]?\s*/, '').substring(0, 60)}...
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Overlay with CTA */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-paper-cream/40 backdrop-blur-[2px] rounded">
                        <Lock className="w-6 h-6 text-blueprint-navy mb-2" strokeWidth={1.5} />
                        <p className="font-sans text-ink-black text-sm mb-3">
                          {remainingCount} more step{remainingCount > 1 ? 's' : ''} hidden
                        </p>
                        <Link
                          to="/signup"
                          className="bg-blueprint-navy text-paper-cream px-4 py-2 rounded-sm font-condensed text-xs uppercase tracking-widest hover:bg-highlighter-yellow hover:text-blueprint-navy transition-colors shadow-lg"
                        >
                          Sign Up to See Full Solution
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Show all steps if logged in */}
                  {isLoggedIn && steps.slice(2).map((step: string, idx: number) => (
                    <div key={idx} className="bg-paper-cream p-3 rounded border border-blueprint-navy/20">
                      <span className="font-mono text-blueprint-navy text-xs font-bold mr-2">Step {idx + 3}:</span>
                      <div className="font-sans text-ink-black leading-relaxed inline">
                        <LatexRenderer tex={step.replace(/^Step \d+[:.]?\s*/, '')} />
                      </div>
                    </div>
                  ))}

                  {steps.length === 0 && (
                    <p className="font-sans text-pencil-gray">Solution not available.</p>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          disabled={currentIndex === 0}
          onClick={() => {
            const nextIndex = Math.max(0, currentIndex - 1);
            setCurrentIndex(nextIndex);
            navigate(`/course/${slug}/question/${id}?i=${nextIndex}`);
          }}
          className="flex items-center gap-2 font-sans text-pencil-gray hover:text-ink-black disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          disabled={currentIndex >= questions.length - 1}
          onClick={() => {
            const nextIndex = Math.min(questions.length - 1, currentIndex + 1);
            setCurrentIndex(nextIndex);
            navigate(`/course/${slug}/question/${id}?i=${nextIndex}`);
          }}
          className="flex items-center gap-2 font-sans text-pencil-gray hover:text-ink-black disabled:opacity-30 transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
