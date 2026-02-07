import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, AlertCircle } from 'lucide-react';
import { apiGet, apiPost } from '../../lib/api';

interface Topic {
  id: string;
  name: string;
  questionCount: number;
}

export default function CoursePractice() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [userCredits, setUserCredits] = useState(0);
  const defaultTopics: Topic[] = [
    { id: 'integration', name: 'Integration by Parts', questionCount: 12 },
    { id: 'partials', name: 'Partial Fractions', questionCount: 8 },
    { id: 'series', name: 'Series Convergence Tests', questionCount: 15 },
    { id: 'power', name: 'Power Series', questionCount: 10 },
    { id: 'taylor', name: 'Taylor Series', questionCount: 9 },
    { id: 'volume', name: 'Volumes of Revolution', questionCount: 11 },
    { id: 'arc', name: 'Arc Length', questionCount: 6 },
    { id: 'parametric', name: 'Parametric Equations', questionCount: 8 },
  ];
  const [topics, setTopics] = useState<Topic[]>(defaultTopics);

  useEffect(() => {
    const load = async () => {
      try {
        const balance = await apiGet<{ credits: number }>('/api/credits/balance');
        setUserCredits(balance.credits);
        const resp = await apiGet<{ topics: any[] }>(`/api/courses/${slug}/topics`);
        const incoming = (resp.topics ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          questionCount: t.total_appearances ?? 0,
        }));
        if (incoming.length > 0) setTopics(incoming);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [slug]);

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const estimatedQuestions = selectedTopics.length * 3;
  const cost = estimatedQuestions;
  const canAfford = userCredits >= cost;

  const handleStartPractice = async () => {
    if (!canAfford || selectedTopics.length === 0) return;
    try {
      const resp = await apiPost<{ questions: any[] }>('/api/questions/practice', {
        course_id: slug,
        topic_ids: selectedTopics,
        count: estimatedQuestions,
      });
      sessionStorage.setItem('question_set', JSON.stringify(resp.questions ?? []));
      navigate(`/course/${slug}/question/1?i=0`);
    } catch (err) {
      console.error(err);
      navigate('/upgrade');
    }
  };

  return (
    <div className="p-8 lg:p-12">
      <div className="mb-8">
        <h1 className="font-serif font-semibold text-ink-black text-3xl mb-2">
          Practice Mode
        </h1>
        <p className="font-sans text-pencil-gray">
          Select topics you want to practice. Each question costs 1 credit.
        </p>
      </div>

      {userCredits < 3 && (
        <div className="mb-6 p-4 bg-stamp-red/10 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-stamp-red" />
          <p className="font-sans text-stamp-red text-sm">
            You only have {userCredits} credits left.{' '}
            <a href="/upgrade" className="underline">Buy more</a>
          </p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-4">
          Select Topics ({selectedTopics.length} selected)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {topics.map((topic) => {
            const isSelected = selectedTopics.includes(topic.id);
            return (
              <button
                key={topic.id}
                onClick={() => toggleTopic(topic.id)}
                className={`flex items-center justify-between p-4 text-left transition-all ${
                  isSelected
                    ? 'bg-blueprint-navy text-paper-cream'
                    : 'bg-paper-aged hover:bg-paper-aged/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 border flex items-center justify-center ${
                      isSelected ? 'border-paper-cream' : 'border-pencil-gray/30'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <span className="font-sans">{topic.name}</span>
                </div>
                <span
                  className={`font-mono text-xs ${
                    isSelected ? 'text-paper-cream/70' : 'text-pencil-gray'
                  }`}
                >
                  {topic.questionCount} available
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedTopics.length > 0 && (
        <div className="index-card p-6 sticky bottom-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <p className="font-sans text-pencil-gray text-sm mb-1">
                Estimated questions:{' '}
                <span className="font-mono text-ink-black">{estimatedQuestions}</span>
              </p>
              <p className="font-sans text-pencil-gray text-sm">
                Cost: <span className="font-mono text-ink-black">{cost} credits</span>
              </p>
            </div>

            <div className="flex items-center gap-4">
              {!canAfford && (
                <p className="font-sans text-stamp-red text-sm">
                  Need {cost - userCredits} more credits
                </p>
              )}
              <button
                onClick={handleStartPractice}
                disabled={!canAfford || selectedTopics.length === 0}
                className="btn-blueprint flex items-center gap-2 disabled:opacity-50"
              >
                Start Practice
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
