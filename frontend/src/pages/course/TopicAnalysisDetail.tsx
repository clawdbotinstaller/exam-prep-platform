import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, BookOpen, Lightbulb, Target, Clock, BarChart3, ChevronRight } from 'lucide-react';
import { API_URL } from '../../lib/api';
import LatexRenderer from '../../components/LatexRenderer';

interface SampleQuestion {
  id: string;
  question_text: string;
  difficulty: number;
  points: number;
  year: number;
  semester: string;
  exam_type: string;
}

interface TopicData {
  id: string;
  name: string;
  category: string;
  appearances: number;
  totalExams: number;
  avgDifficulty: number;
  avgPoints: number;
  frequency_score: number;
  description?: string;
}

interface AnalysisData {
  frequencyScore: number;
  questionCount: number;
  commonDifficulties: string[];
  studyTips: string[];
}

export default function TopicAnalysisDetail() {
  const { slug, topicId } = useParams<{ slug: string; topicId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [sampleQuestions, setSampleQuestions] = useState<SampleQuestion[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/topics/${topicId}/public`);

        if (!response.ok) {
          setError('load');
          setLoading(false);
          return;
        }

        const data = await response.json();
        setTopic(data.topic);
        setSampleQuestions(data.questions ?? []);
        setAnalysis(data.analysis);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('load');
        setLoading(false);
      }
    };
    load();
  }, [slug, topicId]);

  const getDifficultyColor = (diff: number) => {
    if (diff <= 2) return 'border-green-500 text-green-600';
    if (diff <= 3) return 'border-yellow-500 text-yellow-600';
    return 'border-stamp-red text-stamp-red';
  };

  const getDifficultyLabel = (diff: number) => {
    if (diff <= 2) return 'Easy';
    if (diff <= 3) return 'Medium';
    return 'Hard';
  };

  const getFrequencyLabel = (score: number) => {
    if (score >= 0.8) return 'Very High';
    if (score >= 0.6) return 'High';
    if (score >= 0.4) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <div className="p-8 lg:p-12">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-pencil-gray/20 w-32"></div>
          <div className="h-8 bg-pencil-gray/20 w-2/3"></div>
          <div className="h-64 bg-pencil-gray/20 mt-8"></div>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="p-8 lg:p-12">
        <div className="text-center py-16">
          <p className="font-sans text-pencil-gray">Failed to load topic details.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-blueprint-navy hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const frequencyPercentage = Math.round((topic.appearances / Math.max(topic.totalExams, 1)) * 100);

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Link
        to={`/course/${slug}/analysis`}
        className="inline-flex items-center gap-2 text-pencil-gray hover:text-ink-black mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-sans text-sm">Back to Analysis</span>
      </Link>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="date-stamp">{topic.category}</span>
          <span className={`date-stamp ${getDifficultyColor(topic.avgDifficulty)}`}>
            {getDifficultyLabel(topic.avgDifficulty)}
          </span>
        </div>
        <h1 className="font-serif font-semibold text-ink-black text-3xl lg:text-4xl mb-3">
          {topic.name}
        </h1>
        <p className="font-sans text-pencil-gray">
          Appears on {topic.appearances} of {topic.totalExams} exams ({frequencyPercentage}% frequency)
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="index-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-blueprint-navy" />
            <span className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest">Frequency</span>
          </div>
          <p className="font-mono text-2xl text-ink-black">{getFrequencyLabel(topic.frequency_score)}</p>
          <p className="font-sans text-pencil-gray/60 text-xs mt-1">{frequencyPercentage}% of exams</p>
        </div>

        <div className="index-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blueprint-navy" />
            <span className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest">Avg Points</span>
          </div>
          <p className="font-mono text-2xl text-ink-black">{topic.avgPoints}</p>
          <p className="font-sans text-pencil-gray/60 text-xs mt-1">points per question</p>
        </div>

        <div className="index-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-blueprint-navy" />
            <span className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest">Questions</span>
          </div>
          <p className="font-mono text-2xl text-ink-black">{topic.appearances}</p>
          <p className="font-sans text-pencil-gray/60 text-xs mt-1">in archive</p>
        </div>

        <div className="index-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blueprint-navy" />
            <span className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest">Time Target</span>
          </div>
          <p className="font-mono text-2xl text-ink-black">8-12</p>
          <p className="font-sans text-pencil-gray/60 text-xs mt-1">minutes per problem</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Common Difficulties */}
        <div className="index-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-stamp-red/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-stamp-red" />
            </div>
            <h2 className="font-condensed text-ink-black text-xs uppercase tracking-widest">
              Common Traps & Difficulties
            </h2>
          </div>
          <ul className="space-y-3">
            {analysis?.commonDifficulties.map((difficulty, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="font-mono text-stamp-red text-xs mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                <span className="font-sans text-ink-black text-sm">{difficulty}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Study Tips */}
        <div className="index-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-blueprint-navy/10 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-blueprint-navy" />
            </div>
            <h2 className="font-condensed text-ink-black text-xs uppercase tracking-widest">
              Study Strategy
            </h2>
          </div>
          <ul className="space-y-3">
            {analysis?.studyTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="font-mono text-blueprint-navy text-xs mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                <span className="font-sans text-ink-black text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sample Questions */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest">
            Sample Questions from Past Exams
          </h2>
          <Link
            to={`/course/${slug}/practice?topic=${topicId}`}
            className="text-blueprint-navy hover:text-ink-black text-sm font-sans flex items-center gap-1 transition-colors"
          >
            Practice this topic
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {sampleQuestions.map((question, idx) => (
            <div key={question.id} className="index-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-pencil-gray text-xs">Q{idx + 1}</span>
                  <span className={`date-stamp text-[9px] ${getDifficultyColor(question.difficulty)}`}>
                    {getDifficultyLabel(question.difficulty)}
                  </span>
                  <span className="font-mono text-pencil-gray/60 text-xs">
                    {question.points} pts
                  </span>
                </div>
                <span className="font-sans text-pencil-gray/50 text-xs">
                  {question.semester} {question.year}
                </span>
              </div>
              <div className="font-serif text-ink-black text-sm leading-relaxed line-clamp-2">
                <LatexRenderer tex={question.question_text} />
              </div>
            </div>
          ))}
        </div>

        {sampleQuestions.length === 0 && (
          <div className="index-card p-8 text-center">
            <p className="font-sans text-pencil-gray">No sample questions available for this topic yet.</p>
          </div>
        )}
      </div>

      {/* CTA Card */}
      <div className="index-card p-8 bg-blueprint-navy text-paper-cream">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="font-serif font-semibold text-xl mb-2">
              Ready to practice {topic.name}?
            </h3>
            <p className="font-sans text-paper-cream/70 text-sm">
              Generate a focused practice set with {topic.appearances} questions from this topic.
            </p>
          </div>
          <button
            onClick={() => navigate(`/course/${slug}/practice`)}
            className="flex-shrink-0 bg-highlighter-yellow text-blueprint-navy font-condensed text-xs uppercase tracking-widest px-6 py-3 hover:bg-paper-cream transition-colors"
          >
            Start Practice Session
          </button>
        </div>
      </div>
    </div>
  );
}
