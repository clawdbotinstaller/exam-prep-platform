/**
 * TypeScript interfaces for the Unified Topic Analysis Hub
 * Used across CourseAnalysis page, TechniqueCard component, and API responses
 */

// Question type used in sample questions
export interface Question {
  id: string;
  question_text: string;
  difficulty: number;
  points: number;
  year: number;
  semester: string;
  exam_type: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface DetailedAnalysisResponse {
  credits_deducted: number;
  chapters: Chapter[];
}

// ============================================================================
// Chapter & Section Types (from API)
// ============================================================================

export interface Chapter {
  id: string;           // "integration" | "differential_equations"
  name: string;         // "Integration" | "Differential Equations"
  chapterNum: string;   // "3" | "4"
  totalQuestions: number;
  frequencyScore: number;  // 0-1, calculated from section frequencies
  sections: Section[];
}

export interface Section {
  id: string;           // "integration_by_parts" | "trig_integrals" etc
  name: string;         // "Integration by Parts" | "Trigonometric Integrals" etc
  sectionNum: string;   // "3.1" | "3.2" | "4.1" etc
  totalQuestions: number;
  avgDifficulty: number;   // 1-5 scale
  avgTime: number;         // in minutes
  frequency: number;       // 0-1, sectionCount / totalExamsInCourse
  techniques: TechniqueStats[];
}

export interface TechniqueStats {
  id: string;              // technique identifier from DB
  count: number;           // how many questions use this technique
  sampleQuestions: Question[];  // max 3 per technique
}

// ============================================================================
// Technique Metadata Types (curated content)
// ============================================================================

export interface TechniqueMetadata {
  id: string;
  displayName: string;
  description: string;
  commonTraps: string[];      // 3-5 specific traps from actual exam analysis
  studyStrategies: string[];  // 3-5 actionable strategies
  prerequisites: string[];    // technique IDs that should be learned first
  difficultyIndicators: string[];  // signs this technique will be hard
  timeEstimate: string;       // e.g., "8-12 minutes"
  sectionId: string;          // which section this belongs to
}

// ============================================================================
// Chapter/Section Metadata (for UI organization)
// ============================================================================

export interface ChapterMetadata {
  id: string;
  name: string;
  chapterNum: string;
  description: string;
  sectionIds: string[];  // ordered list of section IDs
}

export interface SectionMetadata {
  id: string;
  name: string;
  sectionNum: string;
  description: string;
  techniqueIds: string[];  // techniques in this section
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface TechniqueCardProps {
  techniqueId: string;
  stats: TechniqueStats;
  sectionNum: string;
  courseSlug: string;
}

export interface TopicSectionProps {
  section: Section;
  chapterId: string;
  courseSlug: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export interface ChapterAccordionProps {
  chapter: Chapter;
  courseSlug: string;
  expandedSection: string | null;
  onSectionToggle: (sectionId: string) => void;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface FrequencyBucket {
  label: 'Very High' | 'High' | 'Medium' | 'Low';
  minScore: number;
  colorClass: string;
}

export const FREQUENCY_BUCKETS: FrequencyBucket[] = [
  { label: 'Very High', minScore: 0.8, colorClass: 'text-blueprint-navy' },
  { label: 'High', minScore: 0.6, colorClass: 'text-blueprint-navy/80' },
  { label: 'Medium', minScore: 0.4, colorClass: 'text-pencil-gray' },
  { label: 'Low', minScore: 0, colorClass: 'text-pencil-gray/60' },
];

export function getFrequencyLabel(score: number): string {
  for (const bucket of FREQUENCY_BUCKETS) {
    if (score >= bucket.minScore) return bucket.label;
  }
  return 'Low';
}

export function getDifficultyColor(diff: number): string {
  if (diff <= 2) return 'border-green-500 text-green-600';
  if (diff <= 3) return 'border-yellow-500 text-yellow-600';
  return 'border-stamp-red text-stamp-red';
}

export function getDifficultyLabel(diff: number): string {
  if (diff <= 2) return 'Easy';
  if (diff <= 3) return 'Medium';
  return 'Hard';
}
