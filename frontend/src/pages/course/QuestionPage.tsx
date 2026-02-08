import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiGet } from '../../lib/api';
import LatexRenderer, { LatexDisplay } from '../../components/LatexRenderer';

export default function QuestionPage() {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSolution, setShowSolution] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(Number(searchParams.get('i') ?? 0));

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
            <div className="font-sans text-ink-black leading-relaxed whitespace-pre-line">
              <LatexDisplay tex={question.solution_steps ?? question.solution ?? 'Solution not available.'} />
            </div>
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
