import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, AlertTriangle } from 'lucide-react';
import { API_URL } from '../../lib/api';

interface AnalysisData {
  topicFrequency: { topicId: string; topic: string; percentage: number; points: number }[];
  difficultyDistribution: { level: string; percentage: number }[];
  highValueTopics: { topic: string; avgPoints: number; frequency: string }[];
  studyStrategy: string;
}

export default function CourseAnalysis() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/api/courses/${slug}/analysis`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('session')}` },
        });
        if (response.status === 402) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        setHasAccess(true);
        setAnalysis({
          topicFrequency: (data.analysis?.topic_distribution ?? []).map((t: any) => ({
            topicId: t.topic_id,
            topic: t.name,
            percentage: t.percentage,
            points: t.avg_points,
          })),
          difficultyDistribution: [
            { level: 'Easy', percentage: data.analysis?.difficulty_distribution?.easy ?? 0 },
            { level: 'Medium', percentage: data.analysis?.difficulty_distribution?.medium ?? 0 },
            { level: 'Hard', percentage: data.analysis?.difficulty_distribution?.hard ?? 0 },
          ],
          highValueTopics: (data.analysis?.high_value_topics ?? []).map((t: any) => ({
            topic: t.name,
            avgPoints: t.avg_points,
            frequency: t.frequency,
          })),
          studyStrategy: data.analysis?.study_strategy ?? 'Focus on the highest-frequency topics first.',
        });
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };
    load();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="p-8 lg:p-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-pencil-gray/20 w-1/3"></div>
          <div className="h-64 bg-pencil-gray/20"></div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="p-8 lg:p-12">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-16 h-16 bg-blueprint-navy/10 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-blueprint-navy" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <h2 className="font-serif font-semibold text-ink-black text-2xl">
              Analysis Locked
            </h2>
            <span className="exam-stamp-red text-[9px] bg-paper-cream">RESTRICTED</span>
          </div>
          <p className="font-sans text-pencil-gray mb-8 max-w-md mx-auto">
            See which topics eat up the most points on exams. Know exactly where to focus your time.
          </p>
          <button
            onClick={() => navigate('/upgrade')}
            className="btn-blueprint"
          >
            Unlock Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif font-semibold text-ink-black text-3xl mb-2">
            Exam Analysis
          </h1>
          <p className="font-sans text-pencil-gray">Based on 12 exams from 2022-2024</p>
        </div>
        <span className="exam-stamp-red bg-paper-cream">Analysis Complete</span>
      </div>

      <section className="mb-12">
        <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-6">
          Topic Frequency (click a topic)
        </h2>
        <div className="index-card p-6">
          <div className="space-y-4">
            {analysis?.topicFrequency.map((topic) => (
              <button
                key={topic.topicId}
                onClick={() => navigate(`/course/${slug}/analysis/${topic.topicId}`)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-ink-black text-sm">{topic.topic}</span>
                  <span className="font-mono text-blueprint-navy">{topic.percentage}%</span>
                </div>
                <div className="h-2 bg-pencil-gray/10 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm bg-blueprint-navy"
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
                <p className="font-sans text-pencil-gray/60 text-xs mt-1">
                  ~{topic.points} points per exam
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-6">
          Difficulty Distribution
        </h2>
        <div className="index-card p-6">
          <div className="space-y-4">
            {analysis?.difficultyDistribution.map((level) => (
              <div key={level.level}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-sans text-ink-black text-sm">{level.level}</span>
                  <span className="font-mono text-blueprint-navy">{level.percentage}%</span>
                </div>
                <div className="h-2 bg-pencil-gray/10 rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm bg-pencil-gray"
                    style={{ width: `${level.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-6">
          High-Value Topics
        </h2>
        <div className="index-card p-6">
          <div className="space-y-3">
            {analysis?.highValueTopics.map((topic) => (
              <div
                key={topic.topic}
                className="flex items-center justify-between py-2 border-b border-pencil-gray/10 last:border-0"
              >
                <span className="font-sans text-ink-black text-sm">{topic.topic}</span>
                <div className="flex items-center gap-6">
                  <span className="font-mono text-blueprint-navy">{topic.avgPoints} pts</span>
                  <span className="font-condensed text-pencil-gray text-xs uppercase">
                    {topic.frequency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-condensed text-pencil-gray text-xs uppercase tracking-widest mb-6">
          Study Strategy
        </h2>
        <div className="index-card p-6 border-l-4 border-l-blueprint-navy">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-5 h-5 text-blueprint-navy flex-shrink-0 mt-0.5" />
            <p className="font-sans text-ink-black leading-relaxed">{analysis?.studyStrategy}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
