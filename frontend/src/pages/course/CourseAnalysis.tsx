import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Clock,
  Target,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Brain
} from 'lucide-react';
import { API_URL } from '../../lib/api';
import type { Chapter, Section, TechniqueStats, DetailedAnalysisResponse } from '../../types/analysis';
import { getTechniqueMetadata } from '../../data/techniqueMetadata';
import { getFrequencyLabel, getDifficultyColor, getDifficultyLabel } from '../../types/analysis';

// =============================================================================
// COMPONENT: TechniqueCard
// =============================================================================

interface TechniqueCardProps {
  technique: TechniqueStats;
  courseSlug: string;
}

function TechniqueCard({ technique, courseSlug }: TechniqueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const metadata = getTechniqueMetadata(technique.id);

  return (
    <div className="index-card p-4 hover:shadow-md transition-all">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-serif font-medium text-ink-black">
              {metadata.displayName}
            </h4>
            <span className="date-stamp text-[9px]">{technique.count} questions</span>
          </div>
          <p className="font-sans text-pencil-gray text-xs leading-relaxed">
            {metadata.description}
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-blueprint-navy hover:text-ink-black transition-colors"
        >
          <span className="font-condensed text-[10px] uppercase tracking-widest">
            {isExpanded ? 'Less' : 'Details'}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-pencil-gray/10">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-pencil-gray" />
          <span className="font-mono text-xs text-pencil-gray">{metadata.timeEstimate}</span>
        </div>
        <Link
          to={`/course/${courseSlug}/practice?technique=${technique.id}`}
          className="flex items-center gap-1 text-blueprint-navy hover:text-ink-black transition-colors ml-auto"
        >
          <Brain className="w-3.5 h-3.5" />
          <span className="font-condensed text-[10px] uppercase tracking-widest">Practice</span>
        </Link>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-pencil-gray/10 space-y-4 animate-in fade-in duration-200">
          {/* Common Traps */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-stamp-red" />
              <h5 className="font-condensed text-stamp-red text-[10px] uppercase tracking-widest">
                Common Traps
              </h5>
            </div>
            <ul className="space-y-1.5">
              {metadata.commonTraps.slice(0, 4).map((trap, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-stamp-red/60 text-[10px] mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="font-sans text-ink-black text-xs">{trap}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Study Strategies */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-blueprint-navy" />
              <h5 className="font-condensed text-blueprint-navy text-[10px] uppercase tracking-widest">
                Study Strategies
              </h5>
            </div>
            <ul className="space-y-1.5">
              {metadata.studyStrategies.slice(0, 4).map((strategy, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-mono text-blueprint-navy/60 text-[10px] mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="font-sans text-ink-black text-xs">{strategy}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sample Questions */}
          {technique.sampleQuestions.length > 0 && (
            <div>
              <h5 className="font-condensed text-pencil-gray text-[10px] uppercase tracking-widest mb-2">
                Sample Questions
              </h5>
              <div className="space-y-2">
                {technique.sampleQuestions.slice(0, 2).map((q, idx) => (
                  <div key={q.id} className="bg-paper-aged/50 p-2.5 rounded-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-pencil-gray text-[10px]">Q{idx + 1}</span>
                      <span className={`date-stamp text-[8px] ${getDifficultyColor(q.difficulty || 3)}`}>
                        {getDifficultyLabel(q.difficulty || 3)}
                      </span>
                      {q.points && (
                        <span className="font-mono text-pencil-gray/60 text-[10px]">{q.points} pts</span>
                      )}
                    </div>
                    <p className="font-serif text-ink-black text-xs line-clamp-2">
                      {q.question_text?.replace(/\\\w+/g, '').substring(0, 120)}...
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-sans text-pencil-gray/50 text-[10px]">
                        {q.semester} {q.year}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPONENT: SectionAccordion
// =============================================================================

interface SectionAccordionProps {
  section: Section;
  courseSlug: string;
  isExpanded: boolean;
  onToggle: () => void;
}

function SectionAccordion({ section, courseSlug, isExpanded, onToggle }: SectionAccordionProps) {
  const frequencyLabel = getFrequencyLabel(section.frequency);

  return (
    <div className="border-l-2 border-pencil-gray/20 ml-3 pl-4">
      {/* Section Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-3 group"
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-blueprint-navy text-sm">{section.sectionNum}</span>
          <div className="text-left">
            <h3 className="font-serif font-medium text-ink-black group-hover:text-blueprint-navy transition-colors">
              {section.name}
            </h3>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="font-sans text-pencil-gray text-xs">
                {section.totalQuestions} questions
              </span>
              <span className="font-sans text-pencil-gray/60 text-xs">
                Avg difficulty: {section.avgDifficulty.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-condensed text-[10px] uppercase tracking-wider ${
            section.frequency >= 0.6 ? 'text-blueprint-navy' : 'text-pencil-gray'
          }`}>
            {frequencyLabel}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-pencil-gray" />
          ) : (
            <ChevronRight className="w-5 h-5 text-pencil-gray" />
          )}
        </div>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="pb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Section Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-paper-aged/50 p-3 rounded-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3 h-3 text-pencil-gray" />
                <span className="font-condensed text-pencil-gray text-[9px] uppercase">Questions</span>
              </div>
              <p className="font-mono text-lg text-ink-black">{section.totalQuestions}</p>
            </div>
            <div className="bg-paper-aged/50 p-3 rounded-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-3 h-3 text-pencil-gray" />
                <span className="font-condensed text-pencil-gray text-[9px] uppercase">Avg Time</span>
              </div>
              <p className="font-mono text-lg text-ink-black">{section.avgTime}m</p>
            </div>
            <div className="bg-paper-aged/50 p-3 rounded-sm">
              <div className="flex items-center gap-1.5 mb-1">
                <BarChart3 className="w-3 h-3 text-pencil-gray" />
                <span className="font-condensed text-pencil-gray text-[9px] uppercase">Frequency</span>
              </div>
              <p className="font-mono text-lg text-ink-black">{Math.round(section.frequency * 100)}%</p>
            </div>
          </div>

          {/* Technique Cards */}
          <div className="space-y-3">
            {section.techniques.map((technique) => (
              <TechniqueCard
                key={technique.id}
                technique={technique}
                courseSlug={courseSlug}
              />
            ))}
          </div>

          {section.techniques.length === 0 && (
            <div className="text-center py-6 bg-paper-aged/30 rounded-sm">
              <p className="font-sans text-pencil-gray text-sm">
                No technique data available for this section yet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// COMPONENT: ChapterAccordion
// =============================================================================

interface ChapterAccordionProps {
  chapter: Chapter;
  courseSlug: string;
  expandedSection: string | null;
  onSectionToggle: (sectionId: string) => void;
}

function ChapterAccordion({ chapter, courseSlug, expandedSection, onSectionToggle }: ChapterAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const frequencyLabel = getFrequencyLabel(chapter.frequencyScore);

  return (
    <div className="index-card overflow-hidden">
      {/* Chapter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-paper-aged/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blueprint-navy flex items-center justify-center">
            <span className="font-mono text-paper-cream text-lg font-bold">{chapter.chapterNum}</span>
          </div>
          <div className="text-left">
            <h2 className="font-serif font-semibold text-ink-black text-xl">
              {chapter.name}
            </h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="font-sans text-pencil-gray text-sm">
                {chapter.totalQuestions} questions
              </span>
              <span className="font-sans text-pencil-gray/60 text-sm">
                {chapter.sections.length} sections
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={`font-condensed text-xs uppercase tracking-wider block ${
              chapter.frequencyScore >= 0.6 ? 'text-blueprint-navy' : 'text-pencil-gray'
            }`}>
              {frequencyLabel} Frequency
            </span>
            <span className="font-mono text-pencil-gray/60 text-xs">
              {Math.round(chapter.frequencyScore * 100)}% of exams
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-6 h-6 text-pencil-gray" />
          ) : (
            <ChevronRight className="w-6 h-6 text-pencil-gray" />
          )}
        </div>
      </button>

      {/* Chapter Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-pencil-gray/10 animate-in fade-in duration-200">
          <div className="pt-4 space-y-2">
            {chapter.sections.map((section) => (
              <SectionAccordion
                key={section.id}
                section={section}
                courseSlug={courseSlug}
                isExpanded={expandedSection === section.id}
                onToggle={() => onSectionToggle(section.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT: CourseAnalysis
// =============================================================================

export default function CourseAnalysis() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

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
        setChapters(data.chapters || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Analysis load error:', err);
        setIsLoading(false);
      }
    };
    load();
  }, [slug]);

  const handleSectionToggle = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  if (isLoading) {
    return (
      <div className="p-8 lg:p-12 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-pencil-gray/20 w-1/3"></div>
          <div className="h-32 bg-pencil-gray/20"></div>
          <div className="h-32 bg-pencil-gray/20"></div>
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
              Topic Analysis Locked
            </h2>
            <span className="exam-stamp-red text-[9px] bg-paper-cream">RESTRICTED</span>
          </div>
          <p className="font-sans text-pencil-gray mb-4 max-w-md mx-auto">
            Get detailed breakdowns for each topic including common question types, study strategies, and technique-specific guidance based on actual exam data.
          </p>
          <ul className="text-left max-w-sm mx-auto mb-8 space-y-2">
            <li className="flex items-center gap-2 font-sans text-sm text-pencil-gray">
              <ArrowRight className="w-4 h-4 text-blueprint-navy" />
              Technique-by-technique breakdown
            </li>
            <li className="flex items-center gap-2 font-sans text-sm text-pencil-gray">
              <ArrowRight className="w-4 h-4 text-blueprint-navy" />
              Common traps from real exams
            </li>
            <li className="flex items-center gap-2 font-sans text-sm text-pencil-gray">
              <ArrowRight className="w-4 h-4 text-blueprint-navy" />
              Curated study strategies
            </li>
          </ul>
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
    <div className="p-8 lg:p-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="font-serif font-semibold text-ink-black text-3xl lg:text-4xl">
            Topic Analysis
          </h1>
          <span className="exam-stamp-red bg-paper-cream text-[9px]">ANALYSIS COMPLETE</span>
        </div>
        <p className="font-sans text-pencil-gray max-w-2xl">
          Comprehensive breakdown of exam topics based on actual MTH240 midterms from 2015-2025.
          Expand each chapter to see section-level statistics and technique-specific guidance.
        </p>
      </div>

      {/* Chapters */}
      <div className="space-y-6">
        {chapters.map((chapter) => (
          <ChapterAccordion
            key={chapter.id}
            chapter={chapter}
            courseSlug={slug!}
            expandedSection={expandedSection}
            onSectionToggle={handleSectionToggle}
          />
        ))}
      </div>

      {chapters.length === 0 && (
        <div className="text-center py-16">
          <p className="font-sans text-pencil-gray">
            No analysis data available yet. Check back soon!
          </p>
        </div>
      )}

      {/* Study Tip */}
      <div className="mt-12 index-card p-6 bg-gradient-to-br from-paper-cream to-paper-aged border-l-4 border-l-blueprint-navy">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blueprint-navy flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-paper-cream" />
          </div>
          <div>
            <h3 className="font-serif font-semibold text-ink-black text-lg mb-2">
              Study Strategy
            </h3>
            <p className="font-sans text-pencil-gray text-sm leading-relaxed">
              Focus on high-frequency sections first (shown in navy blue). Click "Details" on any
              technique to see common traps students fall into and proven strategies from actual
              exam performance data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
