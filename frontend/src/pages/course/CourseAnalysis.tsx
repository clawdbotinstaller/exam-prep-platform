import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowRight, BookOpen, Compass, Grid3X3, AlertCircle } from 'lucide-react';
import { API_URL } from '../../lib/api';
import type { Chapter, DetailedAnalysisResponse } from '../../types/analysis';

// Helper to determine stamp based on chapter frequency
const getChapterStamp = (frequency: number): 'CRITICAL' | 'CORE' | 'SUPPLEMENTAL' | undefined => {
  if (frequency >= 0.8) return 'CRITICAL';
  if (frequency >= 0.5) return 'CORE';
  return 'SUPPLEMENTAL';
};

// Get rotation for scattered effect
const getRotation = (index: number): string => {
  const rotations = ['-1deg', '0.5deg', '-0.5deg', '1deg', '0deg', '1.5deg'];
  return rotations[index % rotations.length];
};

// Get vertical offset for organic stacking
const getOffset = (index: number): number => {
  const offsets = [0, 8, -4, 12, -8, 4];
  return offsets[index % offsets.length];
};

// Check if user prefers reduced motion
const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export default function CourseAnalysis() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [hoveredChapter, setHoveredChapter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());
  }, []);

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
          setError('Failed to load analysis data. Please try again.');
          setIsLoading(false);
          return;
        }

        const data: DetailedAnalysisResponse = await response.json();
        setHasAccess(true);
        setChapters(data.chapters || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Analysis load error:', err);
        setError('An unexpected error occurred. Please try again later.');
        setIsLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleChapterClick = (chapterId: string) => {
    navigate(`/course/${slug}/analysis/chapter/${chapterId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-cream relative overflow-hidden">
        {/* Graph paper background */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `
            linear-gradient(var(--ink-black) 1px, transparent 1px),
            linear-gradient(90deg, var(--ink-black) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }} />

        <div className="relative z-10 p-8 lg:p-16 max-w-7xl mx-auto">
          {/* Skeleton header */}
          <div className="mb-16">
            <div className="h-4 w-32 bg-ink-black/10 mb-6" />
            <div className="h-16 w-96 bg-ink-black/10 mb-4" />
            <div className="h-6 w-64 bg-ink-black/10" />
          </div>

          {/* Skeleton cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-80 bg-paper-aged/50 border border-ink-black/10" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-paper-cream flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="border-2 border-stamp-red p-1">
            <div className="border border-stamp-red/30 p-8 text-center">
              <div className="font-mono text-xs text-stamp-red/50 uppercase tracking-widest mb-8">
                Error No. ANALYSIS-ERROR
              </div>

              <div className="w-20 h-20 border-2 border-stamp-red flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-stamp-red" strokeWidth={1.5} />
              </div>

              <h2 className="font-serif text-2xl text-ink-black mb-3">
                Analysis Error
              </h2>

              <p className="font-sans text-sm text-pencil-gray mb-8 leading-relaxed">
                {error}
              </p>

              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blueprint-navy text-paper-cream font-mono text-sm uppercase tracking-widest py-4 hover:bg-ink-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint-navy"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-paper-cream flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Technical drawing border */}
          <div className="border-2 border-blueprint-navy p-1">
            <div className="border border-blueprint-navy/30 p-8 text-center">
              {/* Drawing number */}
              <div className="font-mono text-xs text-blueprint-navy/50 uppercase tracking-widest mb-8">
                Drawing No. ANALYSIS-RESTRICTED
              </div>

              <div className="w-20 h-20 border-2 border-stamp-red flex items-center justify-center mx-auto mb-6 rotate-3">
                <Lock className="w-10 h-10 text-stamp-red" strokeWidth={1.5} />
              </div>

              <h2 className="font-serif text-2xl text-ink-black mb-3">
                Analysis Restricted
              </h2>

              <p className="font-sans text-sm text-pencil-gray mb-8 leading-relaxed">
                Topic frequency analysis and chapter breakdowns require archive access.
              </p>

              <div className="space-y-3 mb-8 text-left">
                {['Chapter frequency analysis', 'Section-level breakdowns', 'Technique correlation maps'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 font-mono text-xs text-pencil-gray">
                    <span className="text-stamp-red">—</span>
                    {item}
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/upgrade')}
                className="w-full bg-blueprint-navy text-paper-cream font-mono text-sm uppercase tracking-widest py-4 hover:bg-ink-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blueprint-navy"
              >
                Unlock Access
              </button>
            </div>
          </div>

          {/* Corner marks */}
          <div className="flex justify-between mt-2 font-mono text-xs text-blueprint-navy/40 uppercase">
            <span>Rev. A</span>
            <span>Sheet 1 of 1</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-paper-cream relative overflow-hidden">
      {/* Graph paper background with subtle texture */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `
          linear-gradient(var(--ink-black) 1px, transparent 1px),
          linear-gradient(90deg, var(--ink-black) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px'
      }} />

      {/* Paper grain overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      <style>{`
        .chapter-card {
          transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .chapter-card:focus-visible {
          outline: 2px solid #1E3A5F;
          outline-offset: 4px;
        }
        @media (prefers-reduced-motion: reduce) {
          .chapter-card {
            transition: none;
            transform: none !important;
          }
        }
      `}</style>

      <div className="relative z-10">
        {/* Header Section */}
        <header className="p-6 lg:p-12 border-b border-ink-black/10">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb / Path */}
            <div className="flex items-center gap-2 mb-6 font-mono text-xs uppercase tracking-widest text-pencil-gray">
              <BookOpen className="w-3.5 h-3.5" />
              <span className="uppercase">{slug}</span>
              <span className="text-pencil-gray/40">/</span>
              <span>Analysis</span>
            </div>

            {/* Main Title */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <h1 className="font-serif text-5xl lg:text-7xl text-ink-black leading-[0.9] tracking-tight">
                  Topic
                  <br />
                  <span className="text-blueprint-navy">Analysis</span>
                </h1>
                <p className="mt-4 font-sans text-pencil-gray max-w-lg leading-relaxed">
                  Frequency analysis of exam topics from 2015–2025.
                  Based on {chapters.reduce((acc, c) => acc + c.totalQuestions, 0)} questions across {chapters.length} chapters.
                </p>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-stamp-red" />
                  <span className="text-pencil-gray">Critical</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blueprint-navy" />
                  <span className="text-pencil-gray">Core</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-pencil-gray" />
                  <span className="text-pencil-gray">Supplemental</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Chapter Cards - Scattered Desk Layout */}
        <main className="p-6 lg:p-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
              {chapters.map((chapter, index) => {
                const stamp = getChapterStamp(chapter.frequencyScore);
                const rotation = reducedMotion ? '0deg' : getRotation(index);
                const offset = reducedMotion ? 0 : getOffset(index);
                const isHovered = hoveredChapter === chapter.id;

                return (
                  <div
                    key={chapter.id}
                    className="chapter-card relative group cursor-pointer"
                    style={{
                      transform: `rotate(${rotation}) translateY(${offset}px)`,
                    }}
                    onMouseEnter={() => setHoveredChapter(chapter.id)}
                    onMouseLeave={() => setHoveredChapter(null)}
                    onClick={() => handleChapterClick(chapter.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Chapter ${chapter.chapterNum}: ${chapter.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleChapterClick(chapter.id);
                      }
                    }}
                  >
                    {/* Shadow layer */}
                    <div
                      className="absolute inset-0 bg-ink-black/10 transition-all duration-300"
                      style={{
                        transform: isHovered ? 'translate(8px, 8px)' : 'translate(4px, 4px)',
                      }}
                    />

                    {/* Main card */}
                    <div
                      className="relative bg-paper-aged border border-ink-black/20 transition-all duration-300"
                      style={{
                        transform: isHovered ? 'translate(-4px, -4px)' : 'translate(0, 0)',
                      }}
                    >
                      {/* Technical border corners - standardized to 2px */}
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blueprint-navy" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blueprint-navy" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blueprint-navy" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blueprint-navy" />

                      <div className="p-6 lg:p-8">
                        {/* Top bar: Chapter number + Stamp */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-baseline gap-3">
                            <span className="font-serif text-6xl lg:text-7xl text-ink-black/10 font-bold leading-none">
                              {chapter.chapterNum}
                            </span>
                            <span className="font-mono text-xs uppercase tracking-widest text-pencil-gray">
                              Ch. {chapter.chapterNum}
                            </span>
                          </div>

                          {stamp && (
                            <div
                              className={`px-3 py-1.5 font-mono text-xs uppercase tracking-widest border-2 rotate-[-3deg] ${
                                stamp === 'CRITICAL'
                                  ? 'border-stamp-red text-stamp-red bg-stamp-red/5'
                                  : stamp === 'CORE'
                                  ? 'border-blueprint-navy text-blueprint-navy bg-blueprint-navy/5'
                                  : 'border-pencil-gray text-pencil-gray bg-pencil-gray/5'
                              }`}
                            >
                              {stamp}
                            </div>
                          )}
                        </div>

                        {/* Chapter title */}
                        <h2 className="font-serif text-2xl lg:text-3xl text-ink-black mb-4 leading-tight">
                          {chapter.name}
                        </h2>

                        {/* Stats row */}
                        <div className="flex items-center gap-6 mb-6 font-mono text-xs text-pencil-gray">
                          <div className="flex items-center gap-2">
                            <Grid3X3 className="w-3.5 h-3.5" />
                            <span>{chapter.totalQuestions} questions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Compass className="w-3.5 h-3.5" />
                            <span>{chapter.sections.length} sections</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-pencil-gray/40">Freq:</span>
                            <span>{Math.round(chapter.frequencyScore * 100)}%</span>
                          </div>
                        </div>

                        {/* Section preview */}
                        <div className="space-y-2">
                          {chapter.sections.slice(0, 3).map((section) => (
                            <div
                              key={section.id}
                              className="flex items-center justify-between py-2 border-b border-ink-black/5 last:border-0"
                            >
                              <span className="font-sans text-sm text-pencil-gray">
                                {section.sectionNum} {section.name}
                              </span>
                              <span className="font-mono text-xs text-pencil-gray/60">
                                {section.totalQuestions}
                              </span>
                            </div>
                          ))}
                          {chapter.sections.length > 3 && (
                            <div className="font-mono text-xs text-pencil-gray/40 uppercase tracking-widest pt-1">
                              +{chapter.sections.length - 3} more sections
                            </div>
                          )}
                        </div>

                        {/* Action hint */}
                        <div className="mt-6 pt-4 border-t border-ink-black/10 flex items-center justify-between">
                          <span className="font-mono text-xs uppercase tracking-widest text-pencil-gray/60">
                            Click to explore
                          </span>
                          <ArrowRight
                            className={`w-4 h-4 text-blueprint-navy transition-transform duration-300 ${
                              isHovered ? 'translate-x-1' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Footer note */}
        <footer className="p-6 lg:p-12 border-t border-ink-black/10">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest text-pencil-gray/60">
            <div className="flex items-center gap-4">
              <span>Drawing No. ANALYSIS-{slug?.toUpperCase()}-2025</span>
              <span className="text-pencil-gray/30">|</span>
              <span>Rev. B</span>
            </div>
            <div>
              Based on exam data 2015–2025
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
