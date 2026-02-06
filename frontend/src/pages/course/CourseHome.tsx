import { Link, useParams } from 'react-router-dom';
import { BarChart3, BookOpen, FileText, Zap } from 'lucide-react';

export default function CourseHome() {
  const { slug } = useParams<{ slug: string }>();

  const actions = [
    {
      title: 'Topic Analysis',
      description: 'See frequency, difficulty, and patterns by topic.',
      path: `/course/${slug}/analysis`,
      cost: '2 credits',
      icon: BarChart3,
    },
    {
      title: 'Practice Questions',
      description: 'Generate targeted questions from your weak topics.',
      path: `/course/${slug}/practice`,
      cost: '1 credit / question',
      icon: BookOpen,
    },
    {
      title: 'Archive by Topic',
      description: 'Practice real past exam questions by section.',
      path: `/course/${slug}/archive`,
      cost: '3 questions / 1 credit',
      icon: FileText,
    },
    {
      title: 'Practice Midterm',
      description: 'Easy, sample, or hard full-length practice midterms.',
      path: `/course/${slug}/archive`,
      cost: '3 credits',
      icon: Zap,
    },
  ];

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="font-serif font-semibold text-ink-black text-3xl">
            Calculus 2
          </h1>
          <span className="exam-stamp-red text-[9px] bg-paper-cream">VERIFIED SOURCE</span>
        </div>
        <p className="font-sans text-pencil-gray">
          12 real exams • 340 questions • The patterns your professor actually uses
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.title} to={action.path} className="index-card p-6 hover:shadow-index-hover">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-blueprint-navy/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-blueprint-navy" />
                </div>
                <span className="date-stamp">{action.cost}</span>
              </div>
              <h3 className="font-serif font-semibold text-ink-black text-xl mb-2">
                {action.title}
              </h3>
              <p className="font-sans text-pencil-gray text-sm">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
