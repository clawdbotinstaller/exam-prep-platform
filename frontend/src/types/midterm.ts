/**
 * TypeScript interfaces for the configurable midterm generation system
 */

/** Weight factors for question selection (0-100) */
export interface WeightFactors {
  /** Prioritize recent exam questions (2024-2025) */
  recency: number;
  /** Reward questions appearing in multiple exams */
  repetition: number;
  /** Ensure balanced section coverage */
  coverage: number;
  /** Match target difficulty distribution */
  difficulty: number;
}

/** Target difficulty distribution (percentages, should sum to 100) */
export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

/** Topic/technique filters */
export interface TopicFilters {
  /** Specific sections to include (empty = all) */
  includeSections: string[];
  /** Specific techniques to focus on (empty = all) */
  focusTechniques: string[];
  /** Techniques to exclude */
  excludeTechniques: string[];
  /** Minimum appearance rate on past exams (0-1) */
  minExamFrequency: number;
}

/** Complete midterm weighting configuration */
export interface MidtermWeightingConfig {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Description of what this config does */
  description: string;
  /** Core weight factors (0-100 each) */
  weights: WeightFactors;
  /** Target difficulty distribution */
  difficultyDistribution: DifficultyDistribution;
  /** Topic and technique filters */
  filters: TopicFilters;
  /** Number of questions to generate */
  questionCount: number;
  /** Target duration in minutes */
  targetDuration: number;
  /** Credit cost to generate */
  creditCost: number;
}

/** Preset configuration with UI metadata */
export interface PresetConfig extends MidtermWeightingConfig {
  /** Lucide icon name */
  icon: string;
  /** Tailwind CSS color class */
  color: string;
}

/** Midterm generation response from API */
export interface GeneratedMidterm {
  midtermId: string;
  type: string;
  questions: MidtermQuestion[];
  stats: MidtermStats;
  creditsRemaining: number | null;
}

/** Question in a generated midterm */
export interface MidtermQuestion {
  id: string;
  question_text: string;
  solution_steps: string;
  answer?: string;
  difficulty: number;
  estimated_time: number;
  topic_id: string;
  topic_name?: string;
  techniques: string;
  source_exam_year: number;
  source_points: number;
  section?: string;
}

/** Statistics for a generated midterm */
export interface MidtermStats {
  totalQuestions: number;
  totalPoints: number;
  estimatedTimeMinutes: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  sectionCoverage: Record<string, boolean>;
  creditCost: number;
}

/** Midterm preview response (no credits deducted) */
export interface MidtermPreview {
  type: string;
  stats: MidtermStats;
  creditCost: number;
}

/** Saved custom configuration in localStorage */
export interface SavedMidtermConfig extends MidtermWeightingConfig {
  /** When this config was saved */
  savedAt: string;
}

/** User's midterm session from database */
export interface MidtermSession {
  id: string;
  userId: string;
  templateType: string;
  questionIds: string[];
  answers?: Record<string, string>;
  currentQuestionIndex: number;
  timeSpentSeconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  score?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/** Request body for generating midterm */
export interface GenerateMidtermRequest {
  course_id: string;
  config: MidtermWeightingConfig;
}

/** Request body for saving progress */
export interface SaveProgressRequest {
  current_question_index?: number;
  answers?: Record<string, string>;
  time_spent_seconds?: number;
}

/** Required sections for coverage guarantee */
export const REQUIRED_SECTIONS = [
  '3.1', // Integration by Parts
  '3.2', // Trigonometric Integrals
  '3.3', // Trigonometric Substitution
  '3.4', // Partial Fractions
  '3.7', // Improper Integrals
  '4.2', // Separable DEs
  '4.5', // First-Order Linear DEs
];

/** Section names for display */
export const SECTION_NAMES: Record<string, string> = {
  '3.1': 'Integration by Parts',
  '3.2': 'Trigonometric Integrals',
  '3.3': 'Trigonometric Substitution',
  '3.4': 'Partial Fractions',
  '3.7': 'Improper Integrals',
  '4.1': 'Directly Integrable DEs',
  '4.2': 'Separable DEs',
  '4.5': 'First-Order Linear DEs',
};

/** Map topic_id to section number */
export function getSectionFromTopic(topicId: string): string | null {
  const sectionMap: Record<string, string> = {
    integration_by_parts: '3.1',
    trig_integrals: '3.2',
    trig_substitution: '3.3',
    partial_fractions: '3.4',
    improper_integrals: '3.7',
    directly_integrable_de: '4.1',
    separable_de: '4.2',
    first_order_linear_de: '4.5',
  };
  return sectionMap[topicId] || null;
}
