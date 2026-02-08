import React from 'react';

export type ExamTypeFilterValue = 'ALL' | 'MIDTERM' | 'FINAL';

export interface ExamTypeFilterProps {
  value: ExamTypeFilterValue;
  onChange: (value: ExamTypeFilterValue) => void;
}

interface FilterOption {
  value: ExamTypeFilterValue;
  label: string;
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'ALL', label: 'All Exams' },
  { value: 'MIDTERM', label: 'Midterm' },
  { value: 'FINAL', label: 'Final' },
];

/**
 * ExamTypeFilter Component
 *
 * A segmented control for filtering content by exam type.
 * Displays three options: All Exams, Midterm, and Final.
 *
 * Design:
 * - Uses the engineering design library aesthetic with blueprint-navy and paper-cream
 * - Active state: filled navy background with cream text
 * - Inactive state: transparent background with navy border and text
 * - Font: condensed uppercase with wide tracking
 *
 * @example
 * <ExamTypeFilter value="ALL" onChange={(value) => console.log(value)} />
 * <ExamTypeFilter value="MIDTERM" onChange={handleFilterChange} />
 */
export const ExamTypeFilter: React.FC<ExamTypeFilterProps> = ({
  value,
  onChange,
}) => {
  const handleClick = (filterValue: ExamTypeFilterValue) => {
    onChange(filterValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent, filterValue: ExamTypeFilterValue) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onChange(filterValue);
    }
  };

  return (
    <div
      className="exam-type-filter"
      role="group"
      aria-label="Filter by exam type"
    >
      {FILTER_OPTIONS.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            className={`exam-type-filter__button ${isActive ? 'active' : ''}`}
            onClick={() => handleClick(option.value)}
            onKeyDown={(e) => handleKeyDown(e, option.value)}
            aria-pressed={isActive}
            aria-label={`Filter by ${option.label}`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default ExamTypeFilter;
