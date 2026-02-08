import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { TechnicalStamp } from './TechnicalStamp';
import { API_URL } from '../../lib/api';
import type {
  Chapter,
  Section,
  TechniqueStats,
  SampleQuestion,
  AnalysisDetailedResponse,
  AnalysisError,
  LoadingState as LoadingStateType,
} from '../../types/analysis';
import './TopicAnalysisDisplay.css';

// ============================================================================
// Types
// ============================================================================

export interface TopicAnalysisDisplayProps {
  courseSlug?: string;
  onSectionClick?: (sectionId: string) => void;
  onTechniqueClick?: (techniqueId: string) => void;
  onQuestionClick?: (questionId: string) => void;
}

interface SectionWithChapter extends Section {
  chapterId: string;
  chapterName: string;
  chapterNum: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Determine stamp variant based on frequency and difficulty
 */
const getStampFromMetrics = (
  frequency: number,
  avgDifficulty: number
): 'CORE' | 'ADVANCED' | 'HIGH-YIELD' | undefined => {
  if (frequency >= 0.7 || avgDifficulty >= 4) return 'CORE';
  if (frequency >= 0.4 || avgDifficulty >= 3) return 'HIGH-YIELD';
  if (avgDifficulty >= 2) return 'ADVANCED';
  return undefined;
};

/**
 * Format frequency as percentage
 */
const formatFrequency = (frequency: number): string => {
  return `${Math.round(frequency * 100)}%`;
};

/**
 * Truncate text with ellipsis
 */
const truncateText = (text: string, maxLength: number = 150): string => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Render LaTeX content safely
 */
const renderLatex = (content: string): string => {
  // Basic LaTeX rendering - replace common patterns
  let rendered = content
    // Display math
    .replace(/\$\$(.+?)\$\$/g, '<span class="latex-display">$1</span>')
    // Inline math
    .replace(/\$(.+?)\$/g, '<span class="latex-inline">$1</span>')
    // Fractions
    .replace(/\\frac\{(.+?)\}\{(.+?)\}/g, '<span class="latex-frac"><sup>$1</sup>&frasl;<sub>$2</sub></span>')
    // Integrals
    .replace(/\\int/g, '<span class="latex-int">&int;</span>')
    // Limits
    .replace(/\\lim_/g, '<span class="latex-lim">lim</span>')
    // Infinity
    .replace(/\\infty/g, '<span class="latex-infty">&infin;</span>')
    // Square roots
    .replace(/\\sqrt\{(.+?)\}/g, '<span class="latex-sqrt">&radic;<span class="latex-sqrt-content">$1</span></span>')
    // Subscripts
    .replace(/_(\w)/g, '<sub>$1</sub>')
    // Superscripts
    .replace(/\^(\w)/g, '<sup>$1</sup>');

  return rendered;
};

// ============================================================================
// Sub-Components
// ============================================================================

/**
 * Loading State Component
 */
const LoadingState: React.FC = () => (
  <div className="topic-analysis-display loading">
    <div className="loading-container">
      <div className="loading-spinner" />
      <div className="loading-text">
        <span className="loading-label">Loading Analysis</span>
        <span className="loading-dots">
          <span className="dot">.</span>
          <span className="dot">.</span>
          <span className="dot">.</span>
        </span>
      </div>
      <p className="loading-subtext">Fetching chapter and section data</p>
    </div>
  </div>
);

/**
 * Error State Component
 */
const ErrorState: React.FC<{ error: AnalysisError; onRetry: () => void }> = ({
  error,
  onRetry,
}) => (
  <div className="topic-analysis-display error">
    <div className="error-container">
      <div className="error-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h2 className="error-title">Analysis Unavailable</h2>
      <p className="error-message">{error.message}</p>
      {error.retryable && (
        <button className="retry-button" onClick={onRetry}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389 5.5 5.5 0 019.2-2.466l.31.31h-2.433a.75.75 0 000 1.5h4.242a.75.75 0 00.75-.75z"
              clipRule="evenodd"
            />
          </svg>
          Try Again
        </button>
      )}
    </div>
  </div>
);

/**
 * Empty State Component
 */
const EmptyState: React.FC = () => (
  <div className="topic-analysis-display empty">
    <div className="empty-container">
      <div className="empty-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <h2 className="empty-title">No Analysis Data</h2>
      <p className="empty-message">
        This course doesn&apos;t have any topic analysis data available yet.
      </p>
    </div>
  </div>
);

/**
 * Question Preview Component
 */
const QuestionPreview: React.FC<{
  question: SampleQuestion;
  index: number;
  onClick?: (questionId: string) => void;
}> = ({ question, index, onClick }) => (
  <article
    className="question-preview index-card"
    onClick={() => onClick?.(question.id)}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(question.id);
      }
    }}
  >
    <header className="question-header">
      <span className="question-number date-stamp">Q{index + 1}</span>
      <span className={`exam-badge ${question.exam_type.toLowerCase().replace(' ', '-')}`}>
        {question.exam_type}
        {question.year && ` ${question.year}`}
      </span>
    </header>
    <div
      className="question-content"
      dangerouslySetInnerHTML={{
        __html: renderLatex(truncateText(question.question_text, 200)),
      }}
    />
  </article>
);

/**
 * Technique Card Component
 */
const TechniqueCard: React.FC<{
  technique: TechniqueStats;
  onClick?: (techniqueId: string) => void;
  onQuestionClick?: (questionId: string) => void;
}> = ({ technique, onClick, onQuestionClick }) => {
  return (
    <article
      className="technique-card index-card"
      onClick={() => onClick?.(technique.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(technique.id);
        }
      }}
    >
      <header className="technique-header">
        <h4 className="technique-name">{technique.id.replace(/_/g, ' ')}</h4>
        <div className="technique-stats">
          <span className="technique-count" title="Dedicated questions">
            {technique.count}
          </span>
        </div>
      </header>

      {technique.sampleQuestions && technique.sampleQuestions.length > 0 && (
        <div className="technique-questions">
          <h5 className="questions-label">Sample Questions</h5>
          <div className="questions-list">
            {technique.sampleQuestions.map((question, idx) => (
              <QuestionPreview
                key={question.id}
                question={question}
                index={idx}
                onClick={onQuestionClick}
              />
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

/**
 * Section Card Component
 */
const SectionCard: React.FC<{
  section: SectionWithChapter;
  isExpanded: boolean;
  onToggle: () => void;
  onTechniqueClick?: (techniqueId: string) => void;
  onQuestionClick?: (questionId: string) => void;
}> = ({
  section,
  isExpanded,
  onToggle,
  onTechniqueClick,
  onQuestionClick,
}) => {
  const stamp = getStampFromMetrics(section.frequency, section.avgDifficulty);

  return (
    <article
      className={`section-card index-card ${isExpanded ? 'expanded' : ''}`}
      data-section-num={section.sectionNum}
    >
      <header className="section-header" onClick={onToggle}>
        <div className="section-title-row">
          <div className="section-title-group">
            <span className="section-number date-stamp">{section.sectionNum}</span>
            <h3 className="section-name">{section.name}</h3>
          </div>
          {stamp && (
            <TechnicalStamp variant={stamp} className="section-stamp" />
          )}
        </div>

        <div className="section-meta">
          <span className="meta-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0V11a1.5 1.5 0 01-1.5-1.5A.75.75 0 018.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {section.totalQuestions} questions
          </span>
          <span className="meta-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clipRule="evenodd"
              />
            </svg>
            {section.avgTime} min avg
          </span>
          <span className="meta-item">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.75 10.818v-2.819A3.486 3.486 0 0112.055 6a3.493 3.493 0 012.319.852l.659-.658a.75.75 0 011.06 1.06l-.658.659A3.493 3.493 0 0116.5 10.5c0 .779-.255 1.499-.687 2.081a.75.75 0 01-1.237-.883A1.994 1.994 0 0015 10.5c0-.48-.169-.922-.447-1.27l-1.303 1.303a.75.75 0 01-1.5 0v-2.795zM6 10.5a3.493 3.493 0 011.687-2.999.75.75 0 10-.874-1.218A4.993 4.993 0 004.5 10.5c0 1.38.56 2.63 1.463 3.537a.75.75 0 101.06-1.06A3.486 3.486 0 016 10.5z" />
              <path d="M10.875 10.875a.75.75 0 000 1.5h.005a.75.75 0 00.745-.75.75.75 0 00-.75-.75z" />
            </svg>
            {formatFrequency(section.frequency)} frequency
          </span>
        </div>

        <button
          className="expand-button"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={isExpanded ? 'rotated' : ''}
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </header>

      {isExpanded && (
        <div className="section-content">
          {section.techniques.length > 0 ? (
            <div className="techniques-grid">
              {section.techniques.map((technique) => (
                <TechniqueCard
                  key={technique.id}
                  technique={technique}
                  onClick={onTechniqueClick}
                  onQuestionClick={onQuestionClick}
                />
              ))}
            </div>
          ) : (
            <div className="no-techniques">
              <p>No techniques recorded for this section.</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
};

/**
 * Chapter Section Component
 */
const ChapterSection: React.FC<{
  chapter: Chapter;
  expandedSections: Set<string>;
  onToggleSection: (sectionId: string) => void;
  onTechniqueClick?: (techniqueId: string) => void;
  onQuestionClick?: (questionId: string) => void;
}> = ({
  chapter,
  expandedSections,
  onToggleSection,
  onTechniqueClick,
  onQuestionClick,
}) => {
  const stamp = useMemo(() => {
    if (chapter.frequencyScore >= 70) return 'CORE';
    if (chapter.frequencyScore >= 40) return 'HIGH-YIELD';
    if (chapter.frequencyScore >= 20) return 'ADVANCED';
    return undefined;
  }, [chapter.frequencyScore]);

  return (
    <section className="chapter-section" data-chapter-num={chapter.chapterNum}>
      <header className="chapter-header">
        <div className="chapter-title-group">
          <span className="chapter-number date-stamp">Ch. {chapter.chapterNum}</span>
          <h2 className="chapter-name">{chapter.name}</h2>
        </div>
        <div className="chapter-meta">
          <span className="chapter-stat">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0V11a1.5 1.5 0 01-1.5-1.5A.75.75 0 018.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {chapter.totalQuestions} questions
          </span>
          <span className="chapter-stat">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.879a1.5 1.5 0 00-.44-1.06L10.939 5.44A1.5 1.5 0 009.879 5H7v13.5A1.5 1.5 0 005.5 20h-2A1.5 1.5 0 002 18.5v-15A1.5 1.5 0 013.5 2h2A1.5 1.5 0 017 3.5z" />
              <path d="M9.5 6.5v-3a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5z" />
            </svg>
            {chapter.sections.length} sections
          </span>
          {stamp && (
            <TechnicalStamp variant={stamp} className="chapter-stamp" />
          )}
        </div>
      </header>

      <div className="sections-list">
        {chapter.sections.map((section) => (
          <SectionCard
            key={section.id}
            section={{
              ...section,
              chapterId: chapter.id,
              chapterName: chapter.name,
              chapterNum: chapter.chapterNum,
            }}
            isExpanded={expandedSections.has(section.id)}
            onToggle={() => onToggleSection(section.id)}
            onTechniqueClick={onTechniqueClick}
            onQuestionClick={onQuestionClick}
          />
        ))}
      </div>
    </section>
  );
};

// ============================================================================
// Main Component
// ============================================================================

/**
 * TopicAnalysisDisplay Component
 *
 * A visually striking topic analysis display with the engineering library aesthetic.
 * Features 9 sections with proper LaTeX rendering, responsive layout, loading and error states.
 *
 * @example
 * <TopicAnalysisDisplay courseSlug="mth240" />
 */
export const TopicAnalysisDisplay: React.FC<TopicAnalysisDisplayProps> = ({
  courseSlug: propCourseSlug,
  onSectionClick,
  onTechniqueClick,
  onQuestionClick,
}) => {
  const { slug: urlSlug } = useParams<{ slug: string }>();

  const courseSlug = propCourseSlug || urlSlug;

  const [data, setData] = useState<AnalysisDetailedResponse | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingStateType>('idle');
  const [error, setError] = useState<AnalysisError | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Fetch data from API
  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!courseSlug) {
        setError({
          type: 'not_found',
          message: 'Course slug is required',
          retryable: false,
        });
        setLoadingState('error');
        return;
      }

      setLoadingState('loading');
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/courses/${courseSlug}/analysis-detailed`);

        if (response.status === 402) {
          setError({
            type: 'payment_required',
            message: 'Premium access required to view detailed analysis',
            retryable: false,
          });
          setLoadingState('error');
          return;
        }

        if (response.status === 404) {
          setError({
            type: 'not_found',
            message: `Course "${courseSlug}" not found`,
            retryable: false,
          });
          setLoadingState('error');
          return;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch analysis: ${response.statusText}`);
        }

        const analysisData: AnalysisDetailedResponse = await response.json();
        setData(analysisData);
        setLoadingState('success');

        // Auto-expand first section of each chapter
        const initialExpanded = new Set<string>();
        analysisData.chapters.forEach((chapter) => {
          if (chapter.sections.length > 0) {
            initialExpanded.add(chapter.sections[0].id);
          }
        });
        setExpandedSections(initialExpanded);
      } catch (err) {
        setError({
          type: 'network_error',
          message: err instanceof Error ? err.message : 'Failed to load analysis data',
          retryable: true,
        });
        setLoadingState('error');
      }
    };

    fetchAnalysisData();
  }, [courseSlug]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
        onSectionClick?.(sectionId);
      }
      return next;
    });
  };

  // Handle retry
  const handleRetry = () => {
    setLoadingState('idle');
    setError(null);
    // Trigger useEffect by updating a dependency
    window.location.reload();
  };

  // Render loading state
  if (loadingState === 'loading') {
    return <LoadingState />;
  }

  // Render error state
  if (loadingState === 'error' && error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  // Render empty state
  if (!data || data.chapters.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="topic-analysis-display">
      <header className="analysis-header">
        <div className="header-content">
          <h1 className="analysis-title">Topic Analysis</h1>
          <p className="analysis-subtitle">
            Detailed breakdown of exam topics, techniques, and question patterns
          </p>
          <div className="analysis-stats">
            <div className="stat-item">
              <span className="stat-value">{data.chapters.length}</span>
              <span className="stat-label">Chapters</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {data.chapters.reduce((acc, ch) => acc + ch.sections.length, 0)}
              </span>
              <span className="stat-label">Sections</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {data.chapters.reduce(
                  (acc, ch) =>
                    acc +
                    ch.sections.reduce(
                      (secAcc, sec) => secAcc + sec.techniques.length,
                      0
                    ),
                  0
                )}
              </span>
              <span className="stat-label">Techniques</span>
            </div>
          </div>
        </div>
      </header>

      <main className="analysis-content">
        <div className="chapters-container">
          {data.chapters.map((chapter) => (
            <ChapterSection
              key={chapter.id}
              chapter={chapter}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
              onTechniqueClick={onTechniqueClick}
              onQuestionClick={onQuestionClick}
            />
          ))}
        </div>
      </main>

      <footer className="analysis-footer">
        <p className="footer-note">
          Data based on past exam analysis. Click any section to explore techniques
          and sample questions.
        </p>
      </footer>
    </div>
  );
};

export default TopicAnalysisDisplay;
