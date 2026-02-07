import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  FileText,
  Loader2,
  Calendar,
  ChevronRight,
  Target,
  Brain,
  Clock,
  Award,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { apiGet } from '../../lib/api';

interface Exam {
  id: string;
  year: number;
  semester: string;
  exam_type: string;
  total_points: number;
  question_count: number;
  difficulty_label?: string;
}

interface CourseStats {
  exams: number;
  questions: number;
}

interface StudyAction {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
  badge?: string;
  color: 'navy' | 'yellow' | 'cream' | 'accent';
  features: string[];
}

export default function CourseHome() {
  const { slug } = useParams<{ slug: string }>();
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExams, setShowExams] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsResp, examsResp] = await Promise.all([
          apiGet<CourseStats>(`/api/courses/${slug}/stats`),
          apiGet<{ exams: Exam[] }>(`/api/courses/${slug}/exams`)
        ]);
        setStats(statsResp);
        setExams(examsResp.exams || []);
      } catch (err) {
        console.error('Failed to load course data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [slug]);

  const studyActions: StudyAction[] = [
    {
      id: 'analysis',
      title: 'Topic Analysis',
      description: 'Deep breakdown of what actually appears on exams. Frequency patterns, question types, and hidden traps.',
      path: `/course/${slug}/analysis`,
      icon: BarChart3,
      badge: '2 credits',
      color: 'navy',
      features: ['Frequency breakdown', 'Question patterns', 'Common traps', 'Study strategies']
    },
    {
      id: 'practice',
      title: 'Practice Questions',
      description: 'Targeted practice on your weak topics. Each question costs 1 credit.',
      path: `/course/${slug}/practice`,
      icon: Brain,
      badge: '1 credit / Q',
      color: 'yellow',
      features: ['Topic targeting', 'Progress tracking', 'Hint system', 'Step-by-step solutions']
    },
    {
      id: 'archive',
      title: 'Exam Archive',
      description: 'Browse real past exam questions by section, or generate a practice midterm.',
      path: `/course/${slug}/archive`,
      icon: FileText,
      badge: '3 Q / 1 credit',
      color: 'cream',
      features: ['Browse by section', 'Real exam questions', 'Practice midterms', 'Difficulty filtering']
    },
    {
      id: 'midterm',
      title: 'Practice Midterm',
      description: 'Full-length practice exams that match the style and difficulty of real midterms.',
      path: `/course/${slug}/archive`,
      icon: Target,
      badge: '3 credits',
      color: 'accent',
      features: ['Easy / Sample / Hard modes', 'Timed simulation', 'Real question mix', 'Performance analysis']
    }
  ];

  const formatExamLabel = (exam: Exam) => {
    return `${exam.semester} ${exam.year} ${exam.exam_type}`;
  };

  const getDifficultyBadge = (label?: string) => {
    switch (label) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'hard': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="font-serif font-semibold text-ink-black text-4xl lg:text-5xl">
            Calculus 2
          </h1>
          <span className="exam-stamp-red text-[9px] bg-paper-cream">VERIFIED SOURCE</span>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-pencil-gray" />
            <span className="font-sans text-pencil-gray text-sm">Loading course data...</span>
          </div>
        ) : stats ? (
          <div className="flex flex-wrap items-center gap-6 font-sans text-pencil-gray">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blueprint-navy" />
              {stats.exams} real exams
            </span>
            <span className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blueprint-navy" />
              {stats.questions} questions
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blueprint-navy" />
              Pattern-mapped
            </span>
          </div>
        ) : null}
      </div>

      {/* Study Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {studyActions.map((action) => {
          const Icon = action.icon;
          const colorClasses = {
            navy: 'bg-blueprint-navy text-paper-cream hover:bg-blueprint-navy/90',
            yellow: 'bg-highlighter-yellow text-blueprint-navy hover:bg-highlighter-yellow/90',
            cream: 'bg-paper-aged text-ink-black hover:bg-paper-cream',
            accent: 'bg-stamp-red text-paper-cream hover:bg-stamp-red/90'
          };

          return (
            <Link
              key={action.id}
              to={action.path}
              className="group relative"
            >
              <div className={`index-card p-6 h-full transition-all duration-300 hover:shadow-index-hover hover:-translate-y-1 ${action.color === 'cream' ? '' : ''}`}>
                {/* Top Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 flex items-center justify-center ${colorClasses[action.color]} transition-transform group-hover:scale-105`}>
                    <Icon className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  {action.badge && (
                    <span className="date-stamp">{action.badge}</span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="font-serif font-semibold text-ink-black text-xl mb-2 group-hover:text-blueprint-navy transition-colors">
                  {action.title}
                </h3>
                <p className="font-sans text-pencil-gray text-sm mb-4 leading-relaxed">
                  {action.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {action.features.map((feature) => (
                    <span
                      key={feature}
                      className="font-condensed text-[10px] uppercase tracking-wider text-pencil-gray bg-paper-aged px-2 py-1"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5 text-blueprint-navy" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Available Exams Section */}
      <div className="mb-12">
        <button
          onClick={() => setShowExams(!showExams)}
          className="flex items-center gap-3 mb-6 group"
        >
          <div className="w-10 h-10 bg-paper-aged flex items-center justify-center group-hover:bg-blueprint-navy/10 transition-colors">
            <Calendar className="w-5 h-5 text-blueprint-navy" />
          </div>
          <div className="text-left">
            <h2 className="font-serif font-semibold text-ink-black text-xl group-hover:text-blueprint-navy transition-colors">
              Available Exams
            </h2>
            <p className="font-sans text-pencil-gray text-xs">Click to browse questions by exam</p>
          </div>
          <ChevronRight className={`w-5 h-5 text-pencil-gray transition-transform ml-auto ${showExams ? 'rotate-90' : ''}`} />
        </button>

        {showExams && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {loading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-blueprint-navy" />
              </div>
            ) : exams.length > 0 ? (
              exams.map((exam) => (
                <Link
                  key={exam.id}
                  to={`/course/${slug}/archive?exam=${exam.id}`}
                  className="index-card p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="font-serif text-ink-black font-medium group-hover:text-blueprint-navy transition-colors">
                      {formatExamLabel(exam)}
                    </span>
                    {exam.difficulty_label && (
                      <span className={`text-[10px] px-2 py-0.5 border rounded ${getDifficultyBadge(exam.difficulty_label)}`}>
                        {exam.difficulty_label}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-pencil-gray">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {exam.question_count} questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {exam.total_points} points
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-paper-aged/50">
                <p className="font-sans text-pencil-gray">No exams available yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Study Tips Section */}
      <div className="index-card p-6 bg-gradient-to-br from-paper-cream to-paper-aged">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-highlighter-yellow flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-blueprint-navy" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-ink-black text-lg mb-2">
              Study Tip: Start with Topic Analysis
            </h3>
            <p className="font-sans text-pencil-gray text-sm leading-relaxed mb-3">
              Before diving into practice questions, use the Topic Analysis to understand which topics
              appear most frequently and carry the most points. Focus your time on high-frequency,
              high-value topics first.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1 text-blueprint-navy">
                <Clock className="w-3 h-3" />
                Saves 30% study time
              </span>
              <span className="flex items-center gap-1 text-blueprint-navy">
                <Target className="w-3 h-3" />
                Higher exam scores
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
