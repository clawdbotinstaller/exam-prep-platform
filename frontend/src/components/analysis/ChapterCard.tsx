import React from 'react';
import { TechnicalStamp } from './TechnicalStamp';

export interface Topic {
  id: string;
  name: string;
  slug: string;
}

export interface Chapter {
  id: string;
  number: string;
  title: string;
  questionCount: number;
  topics: Topic[];
  stamp?: 'CORE' | 'ADVANCED' | 'HIGH-YIELD';
}

export interface ChapterCardProps {
  chapter: Chapter;
  onClick: () => void;
}

/**
 * ChapterCard Component
 *
 * An index-card style chapter preview card displaying chapter information,
 * question count stats, mini topic icons/pills, and a difficulty stamp.
 * Clickable to navigate to the chapter detail page.
 *
 * @example
 * <ChapterCard
 *   chapter={{
 *     id: 'ch-1',
 *     number: '1',
 *     title: 'Limits and Continuity',
 *     questionCount: 12,
 *     topics: [
 *       { id: 't1', name: 'Limits', slug: 'limits' },
 *       { id: 't2', name: 'Continuity', slug: 'continuity' }
 *     ],
 *     stamp: 'CORE'
 *   }}
 *   onClick={() => navigate('/chapter/ch-1')}
 * />
 */
export const ChapterCard: React.FC<ChapterCardProps> = ({ chapter, onClick }) => {
  const { number, title, questionCount, topics, stamp } = chapter;

  // Limit displayed topics to avoid overflow (show max 3, then +N more)
  const displayedTopics = topics.slice(0, 3);
  const remainingTopicsCount = Math.max(0, topics.length - 3);

  return (
    <article
      className="chapter-card"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Chapter ${number}: ${title}`}
    >
      {/* Stamp positioned in top-right corner */}
      {stamp && (
        <TechnicalStamp
          variant={stamp}
          className="top-3 right-3"
        />
      )}

      {/* Chapter header with number and title */}
      <header className="chapter-card-header">
        <span className="chapter-number">Ch. {number}</span>
        <h3 className="chapter-title">{title}</h3>
      </header>

      {/* Question count badge */}
      <div className="chapter-stats">
        <span className="question-count-badge">
          <svg
            className="question-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          {questionCount} question{questionCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Topic pills */}
      {topics.length > 0 && (
        <div className="chapter-topics">
          {displayedTopics.map((topic) => (
            <span
              key={topic.id}
              className="topic-pill"
              title={topic.name}
            >
              {topic.name}
            </span>
          ))}
          {remainingTopicsCount > 0 && (
            <span className="topic-pill topic-pill-more">
              +{remainingTopicsCount}
            </span>
          )}
        </div>
      )}

      {/* Click hint */}
      <div className="chapter-card-footer">
        <span className="click-hint">
          Click to explore
          <svg
            className="arrow-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </div>
    </article>
  );
};

export default ChapterCard;
