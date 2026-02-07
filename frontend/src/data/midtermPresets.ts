/**
 * Preset configurations for midterm generation
 * Based on analysis of 33 questions from 5 exams (2015-2025)
 *
 * MIDTERM TOPIC COVERAGE (8 sections):
 * Chapter 3 - Techniques of Integration:
 *   3.1 Integration by Parts
 *   3.2 Trigonometric Integrals
 *   3.3 Trigonometric Substitution
 *   3.4 Integration of Rational Functions by Partial Fractions
 *   3.7 Improper Integrals
 * Chapter 4 - Differential Equations:
 *   4.1 Directly Integrable Differential Equations
 *   4.2 Separable Differential Equations
 *   4.5 First-order Linear Differential Equations
 */

import type { PresetConfig } from '../types/midterm';

/**
 * Built-in preset configurations
 * Each preset is optimized for a different study goal
 */
export const PRESETS: Record<string, PresetConfig> = {
  /**
   * Balanced Practice
   * Well-rounded mix covering all areas equally
   * Best for: Regular practice, maintaining skills across all topics
   */
  balanced: {
    id: 'balanced',
    name: 'Balanced Practice',
    description: 'Well-rounded mix covering all areas equally. Great for regular practice sessions.',
    icon: 'Scale',
    color: 'bg-blueprint-navy',
    weights: {
      recency: 40,      // Prioritize recent exams
      repetition: 30,   // Include questions that repeat across years
      coverage: 20,     // Ensure section coverage
      difficulty: 10,   // Slight preference for target difficulty
    },
    difficultyDistribution: {
      easy: 25,
      medium: 50,
      hard: 25,
    },
    filters: {
      includeSections: [],
      focusTechniques: [],
      excludeTechniques: [],
      minExamFrequency: 0,
    },
    questionCount: 7,
    targetDuration: 75,
    creditCost: 3,
  },

  /**
   * Cram Mode
   * Quick review focusing on recent material and high-frequency topics
   * Best for: Last-minute review before exam
   */
  cram: {
    id: 'cram',
    name: 'Cram Mode',
    description: 'Quick review focusing on recent material. Shorter, more manageable session.',
    icon: 'Zap',
    color: 'bg-yellow-500',
    weights: {
      recency: 60,      // Heavy weight on recent exams
      repetition: 10,   // Less focus on repetition
      coverage: 10,     // Minimal coverage requirement
      difficulty: 20,   // Balance difficulty for quick wins
    },
    difficultyDistribution: {
      easy: 40,
      medium: 40,
      hard: 20,
    },
    filters: {
      includeSections: [],
      focusTechniques: [],
      excludeTechniques: [],
      minExamFrequency: 0.1, // Only questions that appear on exams
    },
    questionCount: 5,
    targetDuration: 45,
    creditCost: 2,
  },

  /**
   * Weakness Drill
   * Target questions in sections you struggle with
   * Best for: Improving in weak areas
   */
  weakness: {
    id: 'weakness',
    name: 'Weakness Drill',
    description: 'Focus on sections where you need the most practice. More questions, deeper dive.',
    icon: 'Target',
    color: 'bg-stamp-red',
    weights: {
      recency: 10,      // Less focus on recency
      repetition: 20,   // Practice similar questions
      coverage: 10,     // Some coverage
      difficulty: 20,   // Match your level
    },
    difficultyDistribution: {
      easy: 20,
      medium: 50,
      hard: 30,
    },
    filters: {
      includeSections: [], // User will select weak sections
      focusTechniques: [],
      excludeTechniques: [],
      minExamFrequency: 0,
    },
    questionCount: 10,
    targetDuration: 90,
    creditCost: 3,
  },

  /**
   * Technique Mastery
   * Drill specific techniques until mastered
   * Best for: Mastering specific problem-solving methods
   */
  technique: {
    id: 'technique',
    name: 'Technique Mastery',
    description: 'Drill specific techniques until mastered. Choose the techniques you want to focus on.',
    icon: 'Hammer',
    color: 'bg-purple-500',
    weights: {
      recency: 15,      // Some recency
      repetition: 25,   // Practice makes perfect
      coverage: 5,      // Minimal coverage
      difficulty: 15,   // Gradual difficulty progression
    },
    difficultyDistribution: {
      easy: 30,
      medium: 50,
      hard: 20,
    },
    filters: {
      includeSections: [],
      focusTechniques: [], // User will select techniques
      excludeTechniques: [],
      minExamFrequency: 0,
    },
    questionCount: 8,
    targetDuration: 60,
    creditCost: 3,
  },

  /**
   * Exam Simulation
   * Matches real exam structure covering all 8 midterm topics
   * Best for: Realistic exam practice
   */
  exam: {
    id: 'exam',
    name: 'Exam Simulation',
    description: 'Covers all 8 midterm topics: Integration by Parts, Trig Integrals, Trig Substitution, Partial Fractions, Improper Integrals, and Differential Equations. Most realistic practice experience.',
    icon: 'ClipboardCheck',
    color: 'bg-green-600',
    weights: {
      recency: 10,      // Some recent questions
      repetition: 10,   // Some repeated patterns
      coverage: 40,     // Heavy coverage - all sections
      difficulty: 20,   // Match exam difficulty
    },
    difficultyDistribution: {
      easy: 20,
      medium: 50,
      hard: 30,
    },
    filters: {
      includeSections: [],
      focusTechniques: [],
      excludeTechniques: [],
      minExamFrequency: 0.05, // Questions that actually appear
    },
    questionCount: 7,
    targetDuration: 90,
    creditCost: 3,
  },

  /**
   * Comprehensive Review
   * Cover everything thoroughly
   * Best for: Deep learning, comprehensive understanding
   */
  comprehensive: {
    id: 'comprehensive',
    name: 'Comprehensive Review',
    description: 'Cover all topics thoroughly. Longer session for deep learning.',
    icon: 'BookOpen',
    color: 'bg-indigo-600',
    weights: {
      recency: 15,      // Balanced recency
      repetition: 15,   // Balanced repetition
      coverage: 50,     // Heavy coverage focus
      difficulty: 10,   // Some difficulty matching
    },
    difficultyDistribution: {
      easy: 25,
      medium: 50,
      hard: 25,
    },
    filters: {
      includeSections: [],
      focusTechniques: [],
      excludeTechniques: [],
      minExamFrequency: 0,
    },
    questionCount: 10,
    targetDuration: 120,
    creditCost: 4,
  },
};

/**
 * Get preset by ID
 */
export function getPreset(id: string): PresetConfig | undefined {
  return PRESETS[id];
}

/**
 * Get all presets as array
 */
export function getAllPresets(): PresetConfig[] {
  return Object.values(PRESETS);
}

/**
 * Get default preset
 */
export function getDefaultPreset(): PresetConfig {
  return PRESETS.balanced;
}

/**
 * Get credit cost for a preset
 */
export function getPresetCreditCost(presetId: string): number {
  return PRESETS[presetId]?.creditCost || 3;
}

/**
 * Preset metadata for display
 */
export const PRESET_METADATA: Record<string, { shortDescription: string; bestFor: string }> = {
  balanced: {
    shortDescription: 'Well-rounded practice across all topics',
    bestFor: 'Regular study sessions',
  },
  cram: {
    shortDescription: 'Quick review of recent material',
    bestFor: 'Last-minute exam prep',
  },
  weakness: {
    shortDescription: 'Target your weak areas',
    bestFor: 'Improving problem sections',
  },
  technique: {
    shortDescription: 'Master specific techniques',
    bestFor: 'Skill-building',
  },
  exam: {
    shortDescription: 'Realistic exam conditions',
    bestFor: 'Exam simulation',
  },
  comprehensive: {
    shortDescription: 'Thorough coverage of all topics',
    bestFor: 'Deep learning',
  },
};
