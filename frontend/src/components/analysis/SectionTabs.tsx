import React from 'react';

export interface Section {
  id: string;
  number: string;
  title: string;
  questionCount: number;
}

export interface SectionTabsProps {
  sections: Section[];
  activeSectionId: string;
  onSectionChange: (sectionId: string) => void;
}

/**
 * SectionTabs Component
 *
 * Vertical tab navigation for sections within a chapter.
 * Displays section number, title, and optional question count.
 *
 * Responsive behavior:
 * - Desktop (> 768px): Vertical tabs on the left side, fixed width
 * - Tablet/Mobile (<= 768px): Horizontal scrollable tabs at top
 */
export const SectionTabs: React.FC<SectionTabsProps> = ({
  sections,
  activeSectionId,
  onSectionChange,
}) => {
  const handleClick = (sectionId: string) => {
    onSectionChange(sectionId);
  };

  const handleKeyDown = (event: React.KeyboardEvent, sectionId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSectionChange(sectionId);
    }
  };

  return (
    <nav
      className="section-tabs"
      role="tablist"
      aria-label="Section navigation"
    >
      {sections.map((section) => {
        const isActive = section.id === activeSectionId;

        return (
          <button
            key={section.id}
            className={`section-tab ${isActive ? 'active' : ''}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`section-panel-${section.id}`}
            id={`section-tab-${section.id}`}
            onClick={() => handleClick(section.id)}
            onKeyDown={(e) => handleKeyDown(e, section.id)}
            tabIndex={isActive ? 0 : -1}
          >
            <span className="section-tab__number">{section.number}</span>
            <span className="section-tab__title">{section.title}</span>
            {section.questionCount > 0 && (
              <span className="section-tab__count">
                {section.questionCount} question
                {section.questionCount !== 1 ? 's' : ''}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default SectionTabs;
