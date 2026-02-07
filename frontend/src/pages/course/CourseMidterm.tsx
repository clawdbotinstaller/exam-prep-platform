import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Timer, Lightbulb, EyeOff, CheckCircle } from 'lucide-react';
import { apiPost } from '../../lib/api';

interface Question {
  id: string;
  question_text: string;
  solution_steps: string;
  answer?: string;
  topic_name?: string;
  points?: number;
  difficulty?: number;
  question_number?: string;
}

export default function CourseMidterm() {
  const { slug, difficulty } = useParams<{ slug: string; difficulty: string }>();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [timeElapsed, setTimeElapsed] = useState(0);

  const totalQuestions = questions.length || (difficulty === 'easy' ? 6 : difficulty === 'hard' ? 10 : 8);

  // Load questions on mount
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

    const load = async () => {
      try {
        const resp = await apiPost<{ questions: Question[] }>('/api/midterm/generate', {
          course_id: slug,
          difficulty,
        });
        setQuestions(resp.questions ?? []);
        sessionStorage.setItem('question_set', JSON.stringify(resp.questions ?? []));
      } catch (err) {
        console.error(err);
      }
    };
    if (slug && difficulty) load();
  }, [slug, difficulty]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const current = questions[currentQuestion - 1];

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion(prev => prev + 1);
      setShowSolution(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(prev => prev - 1);
      setShowSolution(false);
    }
  };

  const markCompleted = () => {
    setCompleted(prev => new Set([...prev, currentQuestion]));
    setShowSolution(true);
  };

  const formatMathText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\\int/g, '∫')
      .replace(/\\sin/g, 'sin')
      .replace(/\\cos/g, 'cos')
      .replace(/\\tan/g, 'tan')
      .replace(/\\ln/g, 'ln')
      .replace(/\\sqrt\{([^}]+)\}/g, '√$1')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<sup>$1</sup>&frasl;<sub>$2</sub>')
      .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
      .replace(/_{([^}]+)}/g, '<sub>$1</sub>')
      .replace(/\$([^$]+)\$/g, '$1');
  };

  const getDifficultyColor = (diff?: number) => {
    if (!diff) return 'bg-pencil-gray';
    if (diff <= 2) return 'bg-green-500';
    if (diff <= 3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="p-8 lg:p-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-serif font-semibold text-ink-black text-3xl capitalize">
              {difficulty} Midterm
            </h1>
            {completed.has(currentQuestion) && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </div>
          <p className="font-sans text-pencil-gray">
            {totalQuestions} questions • Question {currentQuestion} of {totalQuestions}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-pencil-gray bg-paper-aged px-3 py-1.5 rounded">
            <Timer className="w-4 h-4" />
            <span className="font-mono text-sm">{formatTime(timeElapsed)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-1 mb-6">
        {Array.from({ length: totalQuestions }, (_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentQuestion(i + 1);
              setShowSolution(false);
            }}
            className={`flex-1 h-2 rounded-sm transition-all ${
              i + 1 === currentQuestion
                ? 'bg-blueprint-navy'
                : completed.has(i + 1)
                ? 'bg-green-400'
                : 'bg-pencil-gray/20'
            }`}
          />
        ))}
      </div>

      {/* Question Card */}
      <div className="index-card p-6 lg:p-8 mb-6">
        {/* Question Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-pencil-gray/10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-pencil-gray">
              Q{current?.question_number || currentQuestion}
            </span>
            {current?.topic_name && (
              <span className="topic-tag text-[10px]">{current.topic_name}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {current?.points && (
              <span className="font-mono text-xs text-pencil-gray">{current.points} pts</span>
            )}
            {current?.difficulty && (
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${getDifficultyColor(current.difficulty)}`} />
                <span className="font-condensed text-[10px] uppercase text-pencil-gray">
                  Difficulty {current.difficulty}/5
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-8">
          <p
            className="font-serif text-ink-black text-lg leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: formatMathText(current?.question_text || 'Question loading...')
            }}
          />
        </div>

        {/* Solution Section */}
        {showSolution && current?.solution_steps && (
          <div className="bg-paper-aged/50 border-l-4 border-blueprint-navy p-6 mb-6">
            <h3 className="font-condensed text-blueprint-navy text-xs uppercase tracking-widest mb-4">
              Solution
            </h3>
            <div
              className="font-sans text-ink-black text-sm leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{
                __html: formatMathText(current.solution_steps)
              }}
            />
            {current.answer && (
              <div className="mt-4 pt-4 border-t border-pencil-gray/20">
                <span className="font-condensed text-[10px] uppercase tracking-widest text-pencil-gray">
                  Answer: {' '}
                </span>
                <span
                  className="font-mono text-ink-black"
                  dangerouslySetInnerHTML={{ __html: formatMathText(current.answer) }}
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {!showSolution ? (
            <>
              <button
                onClick={markCompleted}
                className="btn-blueprint flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Completed
              </button>
              <button
                onClick={() => setShowSolution(true)}
                className="flex items-center gap-2 font-sans text-pencil-gray hover:text-blueprint-navy transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                Show Solution
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowSolution(false)}
              className="flex items-center gap-2 font-sans text-pencil-gray hover:text-blueprint-navy transition-colors"
            >
              <EyeOff className="w-4 h-4" />
              Hide Solution
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          disabled={currentQuestion === 1}
          onClick={handlePrevious}
          className="flex items-center gap-2 font-sans text-pencil-gray hover:text-ink-black disabled:opacity-30 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        <button
          className="font-sans text-pencil-gray hover:text-ink-black"
          onClick={() => {
            if (confirm('Exit midterm? Your progress will be saved.')) {
              navigate(`/course/${slug}/archive`);
            }
          }}
        >
          Exit Midterm
        </button>

        <button
          disabled={currentQuestion >= totalQuestions}
          onClick={handleNext}
          className="flex items-center gap-2 font-sans text-pencil-gray hover:text-ink-black disabled:opacity-30 transition-colors"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Completion Summary */}
      {completed.size > 0 && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
          <p className="font-sans text-green-800 text-sm">
            Progress: {completed.size} of {totalQuestions} questions completed
          </p>
        </div>
      )}
    </div>
  );
}
