-- Create missing topics table
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  frequency_score DECIMAL(3,2),
  avg_points DECIMAL(4,1),
  total_appearances INTEGER DEFAULT 0,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Create question_patterns table
CREATE TABLE IF NOT EXISTS question_patterns (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  name TEXT NOT NULL,
  techniques TEXT,
  canonical_form TEXT,
  appearance_count INTEGER DEFAULT 0,
  appearance_rate DECIMAL(3,2),
  first_seen_year INTEGER,
  last_seen_year INTEGER,
  example_question_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_topics_course ON topics(course_id);
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id);

-- Seed topics for Calculus 2
INSERT OR IGNORE INTO topics (id, course_id, name, slug, category, difficulty, total_appearances) VALUES
('integration_by_parts', 'calc2', 'Integration by Parts', 'integration-by-parts', 'integration', 3, 8),
('trig_integrals', 'calc2', 'Trigonometric Integrals', 'trig-integrals', 'integration', 3, 6),
('trig_substitution', 'calc2', 'Trigonometric Substitution', 'trig-substitution', 'integration', 4, 5),
('partial_fractions', 'calc2', 'Partial Fractions', 'partial-fractions', 'integration', 3, 4),
('improper_integrals', 'calc2', 'Improper Integrals', 'improper-integrals', 'integration', 4, 6),
('arc_length', 'calc2', 'Arc Length', 'arc-length', 'applications', 3, 3),
('surface_area', 'calc2', 'Surface Area', 'surface-area', 'applications', 4, 2),
('center_of_mass', 'calc2', 'Center of Mass', 'center-of-mass', 'applications', 4, 3),
('series_basics', 'calc2', 'Series Basics', 'series-basics', 'series', 2, 4),
('integral_test', 'calc2', 'Integral Test', 'integral-test', 'series', 3, 5),
('comparison_tests', 'calc2', 'Comparison Tests', 'comparison-tests', 'series', 3, 6),
('alternating_series', 'calc2', 'Alternating Series', 'alternating-series', 'series', 3, 5),
('ratio_root_tests', 'calc2', 'Ratio and Root Tests', 'ratio-root-tests', 'series', 3, 7),
('power_series', 'calc2', 'Power Series', 'power-series', 'series', 4, 6),
('taylor_series', 'calc2', 'Taylor Series', 'taylor-series', 'series', 4, 8);
