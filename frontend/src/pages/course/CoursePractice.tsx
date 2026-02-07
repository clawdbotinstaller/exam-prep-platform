import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Check, ArrowRight, AlertCircle, X, Filter } from 'lucide-react';
import { apiGet, apiPost } from '../../lib/api';
import { getTechniqueMetadata } from '../../data/techniqueMetadata';

interface Topic {
  id: string;
  name: string;
  questionCount: number;
}

export default function CoursePractice() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const techniqueParam = searchParams.get('technique');

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(techniqueParam);
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
  const [techniqueQuestionCount, setTechniqueQuestionCount] = useState<number | null>(null);

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

        // If technique param is present, fetch question count for that technique
        if (techniqueParam) {
          const analysisResp = await apiGet<{ chapters: any[] }>(`/api/courses/${slug}/analysis-detailed`);
          let count = 0;
          for (const chapter of analysisResp.chapters ?? []) {
            for (const section of chapter.sections ?? []) {
              for (const tech of section.techniques ?? []) {
                if (tech.id === techniqueParam) {
                  count = tech.count;
                  break;
                }
              }
            }
          }
          setTechniqueQuestionCount(count);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [slug, techniqueParam]);

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const clearTechniqueFilter = () => {
    setSelectedTechnique(null);
    setSearchParams({});
  };

  const estimatedQuestions = selectedTechnique
    ? Math.min(techniqueQuestionCount ?? 3, 5)
    : selectedTopics.length * 3;
  const cost = estimatedQuestions;
  const canAfford = userCredits >= cost;

  const handleStartPractice = async () => {
    if (!canAfford) return;
    try {
      const resp = await apiPost<{ questions: any[] }>('/api/questions/practice', {
        course_id: slug,
        topic_ids: selectedTopics.length > 0 ? selectedTopics : undefined,
        technique: selectedTechnique ?? undefined,
        count: estimatedQuestions,
      });
      sessionStorage.setItem('question_set', JSON.stringify(resp.questions ?? []));
      navigate(`/course/${slug}/question/1?i=0`);
    } catch (err) {
      console.error(err);
      navigate('/upgrade');
    }
  };

  const techniqueMetadata = selectedTechnique ? getTechniqueMetadata(selectedTechnique) : null;

  return (
    <div className="p-8 lg:p-12 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-serif font-semibold text-ink-black text-3xl mb-2">
          Practice Mode
        </h1>
        <p className="font-sans text-pencil-gray">
          {selectedTechnique
            ? `Practicing ${techniqueMetadata?.displayName ?? 'selected technique'}. Each question costs 1 credit.`
            : 'Select topics you want to practice. Each question costs 1 credit.'}
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

      {/* Technique Filter Banner */}
      {selectedTechnique && (
        <div className="mb-6 index-card p-4 bg-blueprint-navy/5 border-l-4 border-l-blueprint-navy">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-blueprint-navy" />
              <div>
                <p className="font-sans text-ink-black text-sm">
                  Filtered by: <span className="font-medium">{techniqueMetadata?.displayName}</span>
                </p>
                <p className="font-sans text-pencil-gray text-xs">
                  {techniqueQuestionCount ?? '?'} questions available
                </p>
              </div>
            </div>
            <button
              onClick={clearTechniqueFilter}
              className="flex items-center gap-1 text-pencil-gray hover:text-stamp-red transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="font-sans text-sm">Clear filter</span>
            </button>
          </div>
        </div>
      )}

      {/* Topic Selection (only show if no technique filter) */}
      {!selectedTechnique && (
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
      )}

      {/* Start Practice Card */}
      {(selectedTopics.length > 0 || selectedTechnique) && (
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
                disabled={!canAfford}
                className="btn-blueprint flex items-center gap-2 disabled:opacity-50"
              >
                Start Practice
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!selectedTechnique && selectedTopics.length === 0 && (
        <div className="text-center py-12 bg-paper-aged/30 rounded-sm">
          <p className="font-sans text-pencil-gray">
            Select at least one topic to start practicing
          </p>
        </div>
      )}
    </div>
  );
}
