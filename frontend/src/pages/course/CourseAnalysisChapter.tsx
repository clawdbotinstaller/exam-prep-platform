import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Brain, Lock, ChevronRight, Target, Clock, BarChart3 } from 'lucide-react';
import { API_URL } from '../../lib/api';
import LatexRenderer from '../../components/LatexRenderer';
import { getTechniqueMetadata } from '../../data/techniqueMetadata';
import type { Chapter, DetailedAnalysisResponse } from '../../types/analysis';

export default function CourseAnalysisChapter() {
  const { slug, chapterId } = useParams<{ slug: string; chapterId: string }>();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${API_URL}/api/courses/${slug}/analysis-detailed`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('session')}` },
        });

        if (response.status === 402) {
          setHasAccess(false);
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          console.error('Failed to load analysis:', response.status);
          setIsLoading(false);
          return;
        }

        const data: DetailedAnalysisResponse = await response.json();
        setHasAccess(true);

        const foundChapter = data.chapters?.find((c) => c.id === chapterId);
        if (foundChapter) {
          setChapter(foundChapter);
          if (foundChapter.sections.length > 0) {
            setActiveSectionId(foundChapter.sections[0].id);
          }
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Analysis load error:', err);
        setIsLoading(false);
      }
    };
    load();
  }, [slug, chapterId]);

  const activeSection = chapter?.sections.find((s) => s.id === activeSectionId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-cream relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(var(--ink-black) 1px, transparent 1px), linear-gradient(90deg, var(--ink-black) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }} />
        <div className="relative z-10 p-8 lg:p-16 max-w-7xl mx-auto">
          <div className="h-4 w-48 bg-ink-black/10 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="h-96 bg-paper-aged/50 border border-ink-black/10" />
            <div className="lg:col-span-2 h-96 bg-paper-aged/50 border border-ink-black/10" />
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-paper-cream flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="border-2 border-blueprint-navy p-1">
            <div className="border border-blueprint-navy/30 p-8 text-center">
              <div className="font-mono text-xs text-blueprint-navy/50 uppercase tracking-widest mb-8">
                Drawing No. CHAPTER-RESTRICTED
              </div>
              <div className="w-20 h-20 border-2 border-stamp-red flex items-center justify-center mx-auto mb-6 rotate-3">
                <Lock className="w-10 h-10 text-stamp-red" strokeWidth={1.5} />
              </div>
              <h2 className="font-serif text-2xl text-ink-black mb-3">Chapter Restricted</h2>
              <p className="font-sans text-sm text-pencil-gray mb-8 leading-relaxed">
                Detailed section analysis and technique breakdowns require archive access.
              </p>
              <button onClick={() => navigate('/upgrade')} className="w-full bg-blueprint-navy text-paper-cream font-mono text-sm uppercase tracking-widest py-4 hover:bg-ink-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint-navy">
                Unlock Access
              </button>
            </div>
          </div>
          <div className="flex justify-between mt-2 font-mono text-xs text-blueprint-navy/40 uppercase">
            <span>Rev. A</span>
            <span>Sheet 1 of 1</span>
          </div>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-paper-cream p-8 lg:p-16">
        <div className="max-w-7xl mx-auto text-center py-16">
          <p className="font-serif text-xl text-ink-black mb-4">Chapter not found.</p>
          <Link to={`/course/${slug}/analysis`} className="inline-flex items-center gap-2 text-blueprint-navy hover:underline font-mono text-sm uppercase tracking-widest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint-navy">
            <ArrowLeft className="w-4 h-4" />
            Back to Analysis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-cream relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `linear-gradient(var(--ink-black) 1px, transparent 1px), linear-gradient(90deg, var(--ink-black) 1px, transparent 1px)`,
        backgroundSize: '24px 24px'
      }} />
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      <div className="relative z-10">
        <header className="p-6 lg:p-12 border-b border-ink-black/10">
          <div className="max-w-7xl mx-auto">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-6 font-mono text-xs uppercase tracking-widest text-pencil-gray">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="uppercase">{slug}</span>
              <span className="text-pencil-gray/40" aria-hidden="true">/</span>
              <Link to={`/course/${slug}/analysis`} className="hover:text-blueprint-navy transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint-navy">Analysis</Link>
              <span className="text-pencil-gray/40" aria-hidden="true">/</span>
              <span className="text-blueprint-navy" aria-current="page">Chapter {chapter.chapterNum}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="font-serif text-8xl lg:text-9xl text-ink-black/10 font-bold leading-none" aria-hidden="true">{chapter.chapterNum}</span>
                  <span className="font-mono text-xs uppercase tracking-widest text-pencil-gray -ml-8 mb-4">Ch. {chapter.chapterNum}</span>
                </div>
                <h1 className="font-serif text-4xl lg:text-5xl text-ink-black leading-tight -mt-4">{chapter.name}</h1>
                <p className="mt-4 font-sans text-pencil-gray max-w-lg">
                  {chapter.totalQuestions} questions across {chapter.sections.length} sections. Based on exam frequency analysis 2015–2025.
                </p>
              </div>

              {/* Stats row with flex-wrap for mobile */}
              <div className="flex flex-wrap items-center gap-4 lg:gap-8 font-mono text-xs text-pencil-gray">
                <div className="text-center min-w-[80px]">
                  <div className="text-2xl text-ink-black">{chapter.totalQuestions}</div>
                  <div className="text-xs uppercase tracking-widest mt-1">Questions</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-ink-black/10" aria-hidden="true" />
                <div className="text-center min-w-[80px]">
                  <div className="text-2xl text-ink-black">{chapter.sections.length}</div>
                  <div className="text-xs uppercase tracking-widest mt-1">Sections</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-ink-black/10" aria-hidden="true" />
                <div className="text-center min-w-[80px]">
                  <div className="text-2xl text-blueprint-navy">{Math.round(chapter.frequencyScore * 100)}%</div>
                  <div className="text-xs uppercase tracking-widest mt-1">Frequency</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-3">
                <div className="font-mono text-xs uppercase tracking-widest text-pencil-gray mb-4 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" aria-hidden="true" />
                  Select Section
                </div>
                {chapter.sections.map((section) => {
                  const isActive = section.id === activeSectionId;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSectionId(section.id)}
                      className={`w-full text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint-navy ${isActive ? 'lg:translate-x-2' : ''}`}
                      aria-pressed={isActive}
                      aria-label={`Section ${section.sectionNum}: ${section.name}`}
                    >
                      <div className={`relative bg-paper-aged border-2 transition-all duration-300 ${isActive ? 'border-blueprint-navy' : 'border-ink-black/10 hover:border-ink-black/30'}`}>
                        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors ${isActive ? 'bg-blueprint-navy' : 'bg-transparent'}`} aria-hidden="true" />
                        <div className="p-4 pl-5">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-baseline gap-2">
                              <span className="font-mono text-lg text-blueprint-navy font-medium">{section.sectionNum}</span>
                              <span className="font-serif text-base text-ink-black">{section.name}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-pencil-gray transition-transform ${isActive ? 'rotate-90' : ''}`} aria-hidden="true" />
                          </div>
                          <div className="flex items-center gap-4 font-mono text-xs text-pencil-gray uppercase tracking-wider">
                            <span>{section.totalQuestions} Qs</span>
                            <span className="text-pencil-gray/30" aria-hidden="true">|</span>
                            <span>Avg {section.avgDifficulty.toFixed(1)}/5</span>
                            <span className="text-pencil-gray/30" aria-hidden="true">|</span>
                            <span>{section.avgTime}min</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="lg:col-span-8">
                {activeSection ? (
                  <div className="bg-paper-aged border border-ink-black/20 relative">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-blueprint-navy" aria-hidden="true" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-blueprint-navy" aria-hidden="true" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-blueprint-navy" aria-hidden="true" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-blueprint-navy" aria-hidden="true" />

                    <div className="p-6 lg:p-10">
                      <div className="flex items-start justify-between mb-8 pb-6 border-b border-ink-black/10">
                        <div>
                          <div className="flex items-baseline gap-3 mb-2">
                            <span className="font-mono text-2xl text-blueprint-navy">{activeSection.sectionNum}</span>
                            <h2 className="font-serif text-3xl text-ink-black">{activeSection.name}</h2>
                          </div>
                          <p className="font-sans text-sm text-pencil-gray">Section analysis based on {activeSection.totalQuestions} exam questions</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blueprint-navy/5 border border-blueprint-navy/20">
                          <BarChart3 className="w-3.5 h-3.5 text-blueprint-navy" aria-hidden="true" />
                          <span className="font-mono text-xs uppercase tracking-widest text-blueprint-navy">{Math.round(activeSection.frequency * 100)}% Freq</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                        <div className="text-center p-4 border border-ink-black/10">
                          <Target className="w-5 h-5 text-pencil-gray mx-auto mb-2" aria-hidden="true" />
                          <div className="font-serif text-2xl text-ink-black">{activeSection.totalQuestions}</div>
                          <div className="font-mono text-xs uppercase tracking-widest text-pencil-gray mt-1">Questions</div>
                        </div>
                        <div className="text-center p-4 border border-ink-black/10">
                          <Clock className="w-5 h-5 text-pencil-gray mx-auto mb-2" aria-hidden="true" />
                          <div className="font-serif text-2xl text-ink-black">{activeSection.avgTime}<span className="text-base">m</span></div>
                          <div className="font-mono text-xs uppercase tracking-widest text-pencil-gray mt-1">Avg Time</div>
                        </div>
                        <div className="text-center p-4 border border-ink-black/10">
                          <BarChart3 className="w-5 h-5 text-pencil-gray mx-auto mb-2" aria-hidden="true" />
                          <div className="font-serif text-2xl text-ink-black">{activeSection.avgDifficulty.toFixed(1)}<span className="text-base">/5</span></div>
                          <div className="font-mono text-xs uppercase tracking-widest text-pencil-gray mt-1">Difficulty</div>
                        </div>
                      </div>

                      {activeSection.techniques && activeSection.techniques.length > 0 && (
                        <div className="mb-8">
                          <h3 className="font-mono text-xs uppercase tracking-widest text-pencil-gray mb-4 flex items-center gap-2">
                            <Brain className="w-3.5 h-3.5" aria-hidden="true" />
                            Key Techniques
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {activeSection.techniques.map((technique) => {
                              const metadata = getTechniqueMetadata(technique.id);
                              return (
                                <Link
                                  key={technique.id}
                                  to={`/course/${slug}/practice?technique=${technique.id}`}
                                  className="group flex items-center gap-2 px-4 py-2 bg-paper-cream border border-ink-black/10 hover:border-blueprint-navy hover:bg-blueprint-navy/5 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint-navy"
                                >
                                  <Brain className="w-3.5 h-3.5 text-pencil-gray group-hover:text-blueprint-navy" aria-hidden="true" />
                                  <span className="font-sans text-sm text-ink-black">{metadata?.displayName || technique.id}</span>
                                  <span className="font-mono text-xs text-pencil-gray/60">({technique.count})</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {activeSection.techniques && activeSection.techniques.length > 0 && (
                        <div className="mb-8">
                          <h3 className="font-mono text-xs uppercase tracking-widest text-pencil-gray mb-4 flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                            Sample Questions
                          </h3>
                          <div className="space-y-3">
                            {activeSection.techniques
                              .flatMap((t) => t.sampleQuestions || [])
                              .slice(0, 3)
                              .map((q, idx) => (
                                <Link
                                  key={q.id}
                                  to={`/course/${slug}/question/${q.id}`}
                                  className="block p-4 bg-paper-cream border border-ink-black/10 hover:border-blueprint-navy transition-all group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint-navy"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="font-mono text-xs uppercase tracking-widest text-blueprint-navy">Q{idx + 1}</span>
                                        <span className="font-mono text-xs text-pencil-gray/60">DIFFICULTY {q.difficulty}/5</span>
                                      </div>
                                      <div className="font-serif text-sm text-ink-black line-clamp-2 group-hover:text-blueprint-navy transition-colors">
                                        <LatexRenderer tex={q.question_text ?? ''} />
                                      </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-pencil-gray group-hover:text-blueprint-navy group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" aria-hidden="true" />
                                  </div>
                                </Link>
                              ))}
                          </div>
                        </div>
                      )}

                      <div className="pt-6 border-t border-ink-black/10">
                        <Link
                          to={`/course/${slug}/practice?section=${activeSectionId}`}
                          className="inline-flex items-center gap-3 bg-blueprint-navy text-paper-cream px-8 py-4 font-mono text-sm uppercase tracking-widest hover:bg-ink-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint-navy"
                        >
                          <Brain className="w-4 h-4" aria-hidden="true" />
                          Practice This Section
                          <ChevronRight className="w-4 h-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center bg-paper-aged/50 border border-ink-black/10 border-dashed">
                    <div className="text-center p-12">
                      <Target className="w-12 h-12 text-pencil-gray/30 mx-auto mb-4" aria-hidden="true" />
                      <p className="font-serif text-lg text-pencil-gray">Select a section to view analysis</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="p-6 lg:p-12 border-t border-ink-black/10">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest text-pencil-gray/60">
            <div className="flex items-center gap-4">
              <span>Drawing No. CHAPTER-{chapter.chapterNum}-{slug?.toUpperCase()}-2025</span>
              <span className="text-pencil-gray/30" aria-hidden="true">|</span>
              <span>Rev. B</span>
            </div>
            <div>Based on exam data 2015–2025</div>
          </div>
        </footer>
      </div>
    </div>
  );
}
