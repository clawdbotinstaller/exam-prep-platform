import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { poweredBy } from 'hono/powered-by';

// Type definitions for Cloudflare D1 binding
type Bindings = {
  DB: D1Database;
  ENVIRONMENT: string;
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use('*', logger());
app.use('*', poweredBy());
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://arkived.org', 'https://www.arkived.org'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check (API only)
app.get('/api/health', (c) => {
  return c.json({
    name: 'Arkived API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
    status: 'healthy',
  });
});

// Public topics list for landing page (no auth required) - only topics with questions
app.get('/api/topics', async (c) => {
  const topics = await c.env.DB.prepare(`
    SELECT t.*, COUNT(q.id) as question_count
    FROM topics t
    LEFT JOIN questions q ON t.id = q.topic_id
    WHERE t.course_id = 'calc2'
    GROUP BY t.id
    HAVING COUNT(q.id) > 0
    ORDER BY COUNT(q.id) DESC
  `).all();

  return c.json({ topics: topics.results ?? [] });
});

// Public questions for landing page (no auth required)
app.get('/api/questions/public', async (c) => {
  const limit = Number(c.req.query('limit') ?? 20);
  const courseId = c.req.query('course_id') || 'calc2';

  const results = await c.env.DB.prepare(`
    SELECT q.*, t.name as topic_name
    FROM questions q
    LEFT JOIN topics t ON q.topic_id = t.id
    WHERE q.course_id = ?
    ORDER BY q.source_exam_year DESC, q.difficulty ASC
    LIMIT ?
  `).bind(courseId, limit).all();

  return c.json({ questions: results.results ?? [] });
});

// Public topic detail for landing page (no auth required)
app.get('/api/topics/:topicId/public', async (c) => {
  const topicId = c.req.param('topicId');
  const db = c.env.DB;

  // Get topic info
  const topic = await db.prepare('SELECT * FROM topics WHERE id = ?').bind(topicId).first<any>();
  if (!topic) return c.json({ error: 'Topic not found' }, 404);

  // Get sample questions for this topic
  const questionsResult = await db.prepare(`
    SELECT q.*, e.year, e.semester, e.exam_type
    FROM questions q
    LEFT JOIN exams e ON q.exam_id = e.id
    WHERE q.topic_id = ?
    ORDER BY q.difficulty ASC
    LIMIT 5
  `).bind(topicId).all();

  // Get frequency stats
  const topicAppearances = await db.prepare('SELECT COUNT(*) as count FROM questions WHERE topic_id = ?').bind(topicId).first<{ count: number }>();

  // Get total unique exams count
  const totalExamsResult = await db.prepare('SELECT COUNT(DISTINCT exam_id) as count FROM questions WHERE course_id = ?').bind(topic.course_id).first<{ count: number }>();

  // Calculate average difficulty and points
  const stats = await db.prepare(`
    SELECT AVG(difficulty) as avg_difficulty, AVG(points) as avg_points
    FROM questions WHERE topic_id = ?
  `).bind(topicId).first<any>();

  return c.json({
    topic: {
      ...topic,
      appearances: topicAppearances?.count ?? 0,
      totalExams: totalExamsResult?.count ?? 5,
      avgDifficulty: Math.round(stats?.avg_difficulty ?? 3),
      avgPoints: Math.round(stats?.avg_points ?? 10),
    },
    questions: questionsResult.results ?? [],
    analysis: {
      frequency: topicAppearances?.count ?? 0,
      avgDifficulty: Math.round(stats?.avg_difficulty ?? 3),
      avgPoints: Math.round(stats?.avg_points ?? 10),
      studyTips: [
        `Focus on ${topic.name} patterns that appear across multiple exams.`,
        `Practice ${topicAppearances?.count ?? 0} available questions to master this topic.`,
      ],
    },
  });
});

const json = async <T>(c: any): Promise<T> => {
  try {
    return await c.req.json();
  } catch {
    return {} as T;
  }
};

const getAuthToken = (c: any): string | null => {
  const header = c.req.header('Authorization');
  if (!header) return null;
  const [type, token] = header.split(' ');
  if (type !== 'Bearer' || !token) return null;
  return token;
};

const nowTs = () => Math.floor(Date.now() / 1000);

const toHex = (bytes: Uint8Array) => Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex: string) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
};

const hashPassword = async (password: string, salt?: Uint8Array) => {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const saltBytes = salt ?? crypto.getRandomValues(new Uint8Array(16));
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: 100_000, hash: 'SHA-256' },
    baseKey,
    256
  );
  return { saltHex: toHex(saltBytes), hashHex: toHex(new Uint8Array(bits)) };
};

const verifyPassword = async (password: string, stored: string) => {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const { hashHex: computed } = await hashPassword(password, fromHex(saltHex));
  return computed === hashHex;
};

const ensureMonthlyCredits = async (db: D1Database, userId: string) => {
  const user = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first<any>();
  if (!user) return null;
  if (user.has_unlimited) return user;

  const resetAt = user.credits_reset_at ?? 0;
  if (resetAt && resetAt > nowTs()) return user;

  const nextReset = nowTs() + 30 * 24 * 3600;
  const monthlyCredits = 5;
  await db
    .prepare('UPDATE users SET credits = ?, credits_reset_at = ? WHERE id = ?')
    .bind(monthlyCredits, nextReset, userId)
    .run();

  return { ...user, credits: monthlyCredits, credits_reset_at: nextReset };
};

const requireAuth = async (c: any, next: any) => {
  const token = getAuthToken(c);
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  const session = await c.env.DB.prepare('SELECT * FROM sessions WHERE id = ?').bind(token).first<any>();
  if (!session) return c.json({ error: 'Unauthorized' }, 401);
  if (session.expires_at && session.expires_at < nowTs()) {
    return c.json({ error: 'Session expired' }, 401);
  }

  c.set('userId', session.user_id);
  await next();
};

// Initialize database endpoint (run once to create tables)
app.post('/init', async (c) => {
  try {
    const db = c.env.DB;

    const addColumn = async (table: string, columnDef: string) => {
      try {
        await db.exec(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
      } catch {
        // ignore if column exists
      }
    };

    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        credits INTEGER DEFAULT 5,
        credits_reset_at INTEGER,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create courses table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        exam_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS exams (
        id TEXT PRIMARY KEY,
        course_id TEXT NOT NULL,
        year INTEGER NOT NULL,
        semester TEXT,
        exam_type TEXT NOT NULL,
        total_points INTEGER,
        exam_date INTEGER,
        upload_date INTEGER,
        processed BOOLEAN DEFAULT FALSE,
        FOREIGN KEY (course_id) REFERENCES courses(id)
      )
    `);

    // Create topics table
    await db.exec(`
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
      )
    `);

    // Create questions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        exam_id TEXT,
        topic_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        pattern_id TEXT,
        techniques TEXT,
        question_text TEXT NOT NULL,
        solution_steps TEXT NOT NULL,
        answer TEXT NOT NULL,
        difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
        difficulty_reason TEXT,
        frequency_score DECIMAL(3,2),
        estimated_time INTEGER,
        source_exam_year INTEGER,
        source_exam_type TEXT,
        source_question_number INTEGER,
        source_points INTEGER,
        is_generated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE SET NULL
      )
    `);

    // Backfill columns for existing tables (safe on fresh DB)
    await addColumn('users', 'name TEXT');
    await addColumn('users', 'credits_reset_at INTEGER');
    await addColumn('users', 'stripe_customer_id TEXT');
    await addColumn('users', 'stripe_subscription_id TEXT');

    await addColumn('questions', 'exam_id TEXT');
    await addColumn('questions', 'pattern_id TEXT');
    await addColumn('questions', 'techniques TEXT');
    await addColumn('questions', 'difficulty_reason TEXT');
    await addColumn('questions', 'frequency_score DECIMAL(3,2)');

    // Additional columns from data schema (MTH240 questions)
    await addColumn('exams', 'difficulty_label TEXT');
    await addColumn('exams', 'course_code TEXT');
    await addColumn('questions', 'question_number TEXT');
    await addColumn('questions', 'section TEXT');
    await addColumn('questions', 'is_tricky INTEGER DEFAULT 0');
    await addColumn('questions', 'subparts_json TEXT');
    await addColumn('questions', 'canonical_form TEXT');
    await addColumn('questions', 'similar_to_exams TEXT');
    await addColumn('questions', 'source_type TEXT DEFAULT "exam_archive"');

    await db.exec(`
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
      )
    `);

    // Create credit_transactions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        stripe_payment_intent_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create contact_submissions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT,
        message TEXT NOT NULL,
        page_url TEXT,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'new'
      )
    `);

    // Create indexes
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_topics_course ON topics(course_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_questions_course ON questions(course_id)`);

    // Seed initial course data
    await db.exec(`
      INSERT OR IGNORE INTO courses (id, name, description, exam_count) VALUES
      ('calc2', 'Calculus 2', 'Integration techniques, series, parametric equations, and applications', 5)
    `);

    return c.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Seed MTH240 exam data (33 questions from 5 exams)
app.post('/api/admin/seed-mth240', async (c) => {
  try {
    const db = c.env.DB;

    // Insert exams
    await db.exec(`
      INSERT OR IGNORE INTO exams (id, course_id, course_code, year, semester, exam_type, total_points, exam_date, difficulty_label) VALUES
      ('2015_winter_midterm1', 'calc2', 'MTH240', 2015, 'Winter', 'Midterm 1', 50, 1422576000, 'medium'),
      ('2019_winter_midterm2', 'calc2', 'MTH240', 2019, 'Winter', 'Midterm 2', 50, 1553817600, 'hard'),
      ('2024_spring_midterm', 'calc2', 'MTH240', 2024, 'Spring', 'Midterm', 40, 1716768000, 'medium'),
      ('2025_winter_midterm', 'calc2', 'MTH240', 2025, 'Winter', 'Midterm', 60, 1739491200, 'medium'),
      ('2025_summer_midterm', 'calc2', 'MTH240', 2025, 'Summer', 'Midterm', 40, 1751088000, 'medium')
    `);

    // Insert sample questions (key ones - full set can be imported via SQL file)
    const questions = [
      {
        id: 'q_2015w_1', exam_id: '2015_winter_midterm1', q_num: '1',
        text: 'Evaluate $\\int \\tan^{5}(x) \\sec^{6}(x) dx$',
        solution: 'Step 1: Factor $\\sec^{2}(x)$ for substitution.\nStep 2: Convert $\\sec^{4}(x)$ to tangent using identity.\nStep 3: Substitute $u = \\tan(x)$.\nStep 4: Integrate polynomial.\nStep 5: Back-substitute: $\\frac{\\tan^{10}(x)}{10} + \\frac{\\tan^{8}(x)}{4} + \\frac{\\tan^{6}(x)}{6} + C$.',
        topic: 'trig_integrals', section: '3.2', tech: '["trig_identity","u_substitution","power_expansion"]',
        points: 7, diff: 3, tricky: 0, time: 7,
        canon: '\\int \\tan^{c1}(v1) \\sec^{c2}(v1) dv1', similar: '[]'
      },
      {
        id: 'q_2015w_3', exam_id: '2015_winter_midterm1', q_num: '3',
        text: 'Evaluate $\\int \\frac{e^{-\\sqrt{x}} \\sin(\\sqrt{x})}{\\sqrt{x}} dx$',
        solution: 'Step 1: Substitute $u = \\sqrt{x}$.\nStep 2: Transform to $2\\int e^{-u} \\sin(u) du$.\nStep 3: Integration by parts twice (cyclic).\nStep 4: Result: $-e^{-u}(\\sin(u) + \\cos(u)) + C$.\nStep 5: Back-substitute.',
        topic: 'integration_by_parts', section: '3.1', tech: '["u_substitution","integration_by_parts","cyclic_integration"]',
        points: 10, diff: 4, tricky: 0, time: 8,
        canon: '\\int \\frac{e^{-v1^{1/2}} \\sin(v1^{1/2})}{v1^{1/2}} dv1', similar: '["2025_winter_midterm"]'
      },
      {
        id: 'q_2015w_4', exam_id: '2015_winter_midterm1', q_num: '4',
        text: 'Evaluate $\\int_{0}^{1/4} \\frac{x^{2}}{\\sqrt{1-4x^{2}}} dx$',
        solution: 'Step 1: Rewrite as $\\sqrt{1-(2x)^{2}}$.\nStep 2: Substitute $2x = \\sin(\\theta)$.\nStep 3: Transform to $\\frac{1}{8}\\int_{0}^{\\pi/6} \\sin^{2}(\\theta) d\\theta$.\nStep 4: Power reduction.\nStep 5: Evaluate: $\\frac{\\pi}{96} - \\frac{\\sqrt{3}}{64}$.',
        topic: 'trig_substitution', section: '3.3', tech: '["trig_substitution","power_reduction","definite_integral_evaluation"]',
        points: 10, diff: 4, tricky: 0, time: 10,
        canon: '\\int_{c1}^{c2} \\frac{v1^{c3}}{\\sqrt{c4 - c5 v1^{c3}}} dv1', similar: '["2025_winter_midterm"]'
      },
      {
        id: 'q_2015w_6', exam_id: '2015_winter_midterm1', q_num: '6',
        text: 'Determine whether convergent or divergent: $\\int_{0}^{1} z^{2}\\ln(z) dz$. Find value if convergent.',
        solution: 'Step 1: Type II improper at $z=0$. Set up limit.\nStep 2: Integration by parts: $u=\\ln(z)$, $dv=z^{2}dz$.\nStep 3: Evaluate and take limit.\nStep 4: Converges to $-\\frac{1}{9}$.',
        topic: 'improper_integrals', section: '3.7', tech: '["improper_integral_limit","integration_by_parts","limit_evaluation"]',
        points: 10, diff: 4, tricky: 1, time: 10,
        canon: '\\int_{c1}^{c2} v1^{c3} \\ln(v1) dv1', similar: '["2025_winter_midterm"]'
      },
      {
        id: 'q_2025w_1', exam_id: '2025_winter_midterm', q_num: '1',
        text: 'Evaluate integrals involving $e^{\\sqrt{x}}\\cos(\\sqrt{x})$',
        solution: 'Subparts (a) and (b): Substitute u=√x, cyclic IBP twice. Result involves e^√x(sin√x + cos√x).',
        topic: 'integration_by_parts', section: '3.1', tech: '["u_substitution","integration_by_parts","cyclic_integration"]',
        points: 10, diff: 4, tricky: 0, time: 12,
        canon: '\\int \\frac{e^{v1^{1/2}}\\cos(v1^{1/2})}{v1^{1/2}} dv1', similar: '["2015_winter_midterm1"]'
      }
    ];

    for (const q of questions) {
      await db.prepare(`
        INSERT OR IGNORE INTO questions
        (id, exam_id, course_id, question_number, question_text, solution_steps, answer,
         topic_id, section, techniques, points, difficulty, is_tricky, estimated_time,
         canonical_form, similar_to_exams, source_type, source_exam_year, source_exam_type, source_points)
        VALUES (?, ?, 'calc2', ?, ?, ?, 'See solution',
                ?, ?, ?, ?, ?, ?, ?, ?, ?, 'exam_archive',
                (SELECT year FROM exams WHERE id = ?),
                (SELECT exam_type FROM exams WHERE id = ?), ?)
      `).bind(
        q.id, q.exam_id, q.q_num, q.text, q.solution,
        q.topic, q.section, q.tech, q.points, q.diff, q.tricky, q.time,
        q.canon, q.similar, q.exam_id, q.exam_id, q.points
      ).run();
    }

    return c.json({ success: true, message: 'MTH240 data seeded', count: questions.length });
  } catch (error) {
    console.error('Seed error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Create test users for beta testing
app.post('/api/admin/create-test-users', async (c) => {
  try {
    const db = c.env.DB;

    // Test user with free plan (5 credits)
    await db.prepare(`
      INSERT OR IGNORE INTO users
      (id, email, password_hash, credits, has_unlimited, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      'test-user-free',
      'test@example.com',
      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'test123'
      5,
      0
    ).run();

    // Test user with unlimited plan
    await db.prepare(`
      INSERT OR IGNORE INTO users
      (id, email, password_hash, credits, has_unlimited, unlimited_until, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `).bind(
      'test-user-unlimited',
      'unlimited@example.com',
      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'test123'
      999,
      1,
      Math.floor(Date.now() / 1000) + 365 * 24 * 3600
    ).run();

    return c.json({
      success: true,
      message: 'Test users created',
      users: [
        { email: 'test@example.com', password: 'test123', plan: 'free', credits: 5 },
        { email: 'unlimited@example.com', password: 'test123', plan: 'unlimited', credits: 999 }
      ]
    });
  } catch (error) {
    console.error('Create test users error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// Auth routes
app.post('/api/auth/register', async (c) => {
  const body = await json<{ name?: string; email?: string; password?: string }>(c);
  if (!body.email || !body.password) return c.json({ error: 'Missing fields' }, 400);

  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(body.email).first();
  if (existing) return c.json({ error: 'Email already registered' }, 409);

  const { saltHex, hashHex } = await hashPassword(body.password);

  const userId = crypto.randomUUID();
  const createdAt = nowTs();
  const creditsResetAt = nowTs() + 30 * 24 * 3600;

  await c.env.DB.prepare(
    'INSERT INTO users (id, email, password_hash, credits, has_unlimited, unlimited_until, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(userId, body.email, `${saltHex}:${hashHex}`, 5, 0, null, createdAt, createdAt)
    .run();

  const sessionId = crypto.randomUUID();
  await c.env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(sessionId, userId, nowTs() + 7 * 24 * 3600, nowTs())
    .run();

  return c.json({
    success: true,
    token: sessionId,
    user: { id: userId, email: body.email, credits: 5, has_unlimited: 0 },
  });
});

app.post('/api/auth/login', async (c) => {
  const body = await json<{ email?: string; password?: string }>(c);
  if (!body.email || !body.password) return c.json({ error: 'Missing fields' }, 400);

  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(body.email).first<any>();
  if (!user) return c.json({ error: 'Invalid credentials' }, 401);

  const valid = await verifyPassword(body.password, user.password_hash);
  if (!valid) return c.json({ error: 'Invalid credentials' }, 401);

  const sessionId = crypto.randomUUID();
  await c.env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(sessionId, user.id, nowTs() + 7 * 24 * 3600, nowTs())
    .run();

  return c.json({
    success: true,
    token: sessionId,
    user: { id: user.id, email: user.email, credits: user.credits, has_unlimited: user.has_unlimited },
  });
});

app.post('/api/auth/logout', requireAuth, async (c) => {
  const token = getAuthToken(c);
  if (token) {
    await c.env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(token).run();
  }
  return c.json({ success: true });
});

app.get('/api/auth/me', requireAuth, async (c) => {
  const userId = c.get('userId');
  const user = await ensureMonthlyCredits(c.env.DB, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      credits: user.credits,
      has_unlimited: user.has_unlimited,
      unlimited_until: user.unlimited_until,
      credits_reset_at: user.credits_reset_at,
    },
  });
});

// Credits
app.get('/api/credits/balance', requireAuth, async (c) => {
  const userId = c.get('userId');
  const user = await ensureMonthlyCredits(c.env.DB, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json({
    credits: user.credits,
    has_unlimited: user.has_unlimited,
    unlimited_until: user.unlimited_until,
    credits_reset_at: user.credits_reset_at
  });
});

app.post('/api/credits/purchase', requireAuth, async (c) => {
  const body = await json<{ plan?: 'starter' | 'unlimited' }>(c);
  if (!body.plan) return c.json({ error: 'Missing plan' }, 400);
  return c.json({ checkout_url: 'https://checkout.stripe.com/placeholder', session_id: 'cs_test' });
});

// Courses (public endpoint - no auth required for discovery)
app.get('/api/courses', async (c) => {
  const courses = await c.env.DB.prepare('SELECT * FROM courses WHERE is_active = 1').all();
  return c.json({ courses: courses.results ?? [] });
});

// Analysis (costs 2 credits) - Uses real DB-derived data
app.get('/api/courses/:id/analysis', requireAuth, async (c) => {
  const userId = c.get('userId');
  const courseId = c.req.param('id');
  const db = c.env.DB;
  const user = await ensureMonthlyCredits(db, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);

  if (!user.has_unlimited && user.credits < 2) {
    return c.json({ error: 'Insufficient credits', credits_needed: 2, credits_available: user.credits }, 402);
  }

  if (!user.has_unlimited) {
    await db.prepare('UPDATE users SET credits = credits - 2 WHERE id = ?').bind(userId).run();
    await db.prepare('INSERT INTO credit_transactions (id, user_id, amount, type, description, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, -2, 'analysis_view', 'Exam analysis', nowTs())
      .run();
  }

  try {
    // Get topic distribution from actual questions
    const topicDistributionResult = await db.prepare(`
      SELECT t.id as topic_id, t.name,
        COUNT(q.id) as count,
        AVG(q.points) as avg_points,
        AVG(q.difficulty) as avg_difficulty
      FROM topics t
      LEFT JOIN questions q ON t.id = q.topic_id
      WHERE t.course_id = ?
      GROUP BY t.id
      HAVING COUNT(q.id) > 0
      ORDER BY COUNT(q.id) DESC
    `).bind(courseId).all();

    const topicDistribution = (topicDistributionResult.results ?? []) as any[];
    const totalQuestions = topicDistribution.reduce((sum, t) => sum + t.count, 0);

    // Calculate percentages
    const topicDistributionWithPct = topicDistribution.map(t => ({
      topic_id: t.topic_id,
      name: t.name,
      count: t.count,
      percentage: totalQuestions > 0 ? Math.round((t.count / totalQuestions) * 100) : 0,
      avg_points: Math.round(t.avg_points ?? 10),
      avg_difficulty: Math.round(t.avg_difficulty ?? 3),
    }));

    // Get difficulty distribution from actual questions
    const difficultyResult = await db.prepare(`
      SELECT
        SUM(CASE WHEN difficulty <= 2 THEN 1 ELSE 0 END) as easy,
        SUM(CASE WHEN difficulty = 3 THEN 1 ELSE 0 END) as medium,
        SUM(CASE WHEN difficulty >= 4 THEN 1 ELSE 0 END) as hard,
        COUNT(*) as total
      FROM questions
      WHERE course_id = ?
    `).bind(courseId).first<any>();

    const total = difficultyResult?.total || 1;
    const difficultyDistribution = {
      easy: Math.round(((difficultyResult?.easy || 0) / total) * 100),
      medium: Math.round(((difficultyResult?.medium || 0) / total) * 100),
      hard: Math.round(((difficultyResult?.hard || 0) / total) * 100),
    };

    // Get high-value topics (high points + high frequency)
    const highValueTopics = topicDistributionWithPct
      .filter(t => t.avg_points >= 12 && t.count >= 3)
      .slice(0, 3)
      .map(t => ({
        topic_id: t.topic_id,
        name: t.name,
        avg_points: t.avg_points,
        frequency: t.count >= 5 ? 'Very Often' : t.count >= 3 ? 'Often' : 'Sometimes',
      }));

    // Calculate recommended study order (challenging topics first)
    const recommendedStudyOrder = topicDistributionWithPct
      .sort((a, b) => (b.avg_difficulty * b.count) - (a.avg_difficulty * a.count))
      .map(t => t.topic_id);

    // Generate study strategy based on actual data
    const hardestTopic = topicDistributionWithPct.sort((a, b) => b.avg_difficulty - a.avg_difficulty)[0];
    const mostFrequentTopic = topicDistributionWithPct.sort((a, b) => b.count - a.count)[0];
    const studyStrategy = `Focus on ${mostFrequentTopic?.name || 'key topics'} (${mostFrequentTopic?.count || 0} questions) and master ${hardestTopic?.name || 'challenging concepts'} (difficulty ${hardestTopic?.avg_difficulty || 3}/5).`;

    return c.json({
      credits_deducted: user.has_unlimited ? 0 : 2,
      analysis: {
        topic_distribution: topicDistributionWithPct.slice(0, 6),
        difficulty_distribution: difficultyDistribution,
        high_value_topics: highValueTopics.length > 0 ? highValueTopics : topicDistributionWithPct.slice(0, 2).map(t => ({
          topic_id: t.topic_id,
          name: t.name,
          avg_points: t.avg_points,
          frequency: 'Often',
        })),
        recommended_study_order: recommendedStudyOrder.slice(0, 5),
        study_strategy: studyStrategy,
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return c.json({ error: 'Failed to generate analysis', details: String(error) }, 500);
  }
});

// Detailed Analysis (unified topic analysis hub - costs 2 credits)
app.get('/api/courses/:id/analysis-detailed', requireAuth, async (c) => {
  const userId = c.get('userId');
  const courseId = c.req.param('id');
  const db = c.env.DB;

  const user = await ensureMonthlyCredits(db, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);

  // Check credits
  if (!user.has_unlimited && user.credits < 2) {
    return c.json({ error: 'Insufficient credits', credits_needed: 2, credits_available: user.credits }, 402);
  }

  // Deduct credits (idempotent check would need session tracking - simplified here)
  if (!user.has_unlimited) {
    await db.prepare('UPDATE users SET credits = credits - 2 WHERE id = ?').bind(userId).run();
    await db.prepare('INSERT INTO credit_transactions (id, user_id, amount, type, description, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, -2, 'analysis_detailed', 'Detailed topic analysis', nowTs())
      .run();
  }

  try {
    // Get total exam count for frequency calculation
    const examCountResult = await db.prepare('SELECT COUNT(*) as count FROM exams WHERE course_id = ?').bind(courseId).first<{ count: number }>();
    const totalExams = examCountResult?.count ?? 1;

    // Get all questions with their techniques and section data
    const questionsResult = await db.prepare(`
      SELECT q.id, q.section, q.techniques, q.difficulty, q.estimated_time, q.topic_id,
             e.year, e.semester, e.exam_type, q.question_text, q.points
      FROM questions q
      LEFT JOIN exams e ON q.exam_id = e.id
      WHERE q.course_id = ?
    `).bind(courseId).all();

    const questions = (questionsResult.results ?? []) as any[];

    // Section to chapter mapping - MIDTERM TOPICS ONLY (can be expanded later)
    // Based on OpenStax Calculus Vol 2: Ch 3 (3.1-3.4, 3.7) + Ch 4 (4.1, 4.2, 4.5)
    // Excludes: 3.5, 3.6, 4.3, 4.4, and all of Ch 5-7
    const sectionToChapter: Record<string, { chapterId: string; chapterNum: string; chapterName: string; sectionName: string }> = {
      '3.1': { chapterId: 'integration', chapterNum: '3', chapterName: 'Integration', sectionName: 'Integration by Parts' },
      '3.2': { chapterId: 'integration', chapterNum: '3', chapterName: 'Integration', sectionName: 'Trigonometric Integrals' },
      '3.3': { chapterId: 'integration', chapterNum: '3', chapterName: 'Integration', sectionName: 'Trigonometric Substitution' },
      '3.4': { chapterId: 'integration', chapterNum: '3', chapterName: 'Integration', sectionName: 'Partial Fractions' },
      '3.7': { chapterId: 'integration', chapterNum: '3', chapterName: 'Integration', sectionName: 'Improper Integrals' },
      '4.1': { chapterId: 'differential_equations', chapterNum: '4', chapterName: 'Differential Equations', sectionName: 'Directly Integrable DEs' },
      '4.2': { chapterId: 'differential_equations', chapterNum: '4', chapterName: 'Differential Equations', sectionName: 'Separable DEs' },
      '4.5': { chapterId: 'differential_equations', chapterNum: '4', chapterName: 'Differential Equations', sectionName: 'First-Order Linear DEs' },
    };

    // Build nested structure
    const chaptersMap = new Map<string, any>();
    const sectionsMap = new Map<string, any>();
    const techniquesMap = new Map<string, any>();

    for (const q of questions) {
      const section = q.section;
      if (!section || !sectionToChapter[section]) continue;

      const sectionMeta = sectionToChapter[section];
      const chapterId = sectionMeta.chapterId;

      // Initialize chapter
      if (!chaptersMap.has(chapterId)) {
        chaptersMap.set(chapterId, {
          id: chapterId,
          name: sectionMeta.chapterName,
          chapterNum: sectionMeta.chapterNum,
          totalQuestions: 0,
          frequencyScore: 0,
          sections: [],
          sectionIds: new Set(),
        });
      }
      const chapter = chaptersMap.get(chapterId);
      chapter.totalQuestions++;
      chapter.sectionIds.add(section);

      // Initialize section
      const sectionKey = `${chapterId}_${section}`;
      if (!sectionsMap.has(sectionKey)) {
        const newSection = {
          id: sectionMeta.sectionName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, ''),
          name: sectionMeta.sectionName,
          sectionNum: section,
          totalQuestions: 0,
          avgDifficulty: 0,
          avgTime: 0,
          frequency: 0,
          techniques: [],
          techniqueIds: new Set(),
          difficultySum: 0,
          timeSum: 0,
          examIds: new Set(),
        };
        sectionsMap.set(sectionKey, newSection);
        chapter.sections.push(newSection);
      }
      const sectionData = sectionsMap.get(sectionKey);
      sectionData.totalQuestions++;
      sectionData.difficultySum += q.difficulty ?? 3;
      sectionData.timeSum += q.estimated_time ?? 8;
      if (q.year) sectionData.examIds.add(`${q.year}_${q.semester}_${q.exam_type}`);

      // Parse techniques
      let techniques: string[] = [];
      try {
        if (q.techniques) {
          techniques = JSON.parse(q.techniques);
        }
      } catch {
        // Skip malformed techniques
      }

      for (const techId of techniques) {
        const techKey = `${sectionKey}_${techId}`;
        if (!techniquesMap.has(techKey)) {
          const newTech = {
            id: techId,
            count: 0,
            sampleQuestions: [],
          };
          techniquesMap.set(techKey, newTech);
          sectionData.techniques.push(newTech);
          sectionData.techniqueIds.add(techId);
        }
        const techData = techniquesMap.get(techKey);
        techData.count++;

        // Add sample question (max 3 per technique)
        if (techData.sampleQuestions.length < 3) {
          techData.sampleQuestions.push({
            id: q.id,
            question_text: q.question_text,
            difficulty: q.difficulty,
            points: q.points,
            year: q.year,
            semester: q.semester,
            exam_type: q.exam_type,
          });
        }
      }
    }

    // Calculate averages and frequencies
    for (const chapter of chaptersMap.values()) {
      for (const section of chapter.sections) {
        section.avgDifficulty = section.totalQuestions > 0
          ? Math.round((section.difficultySum / section.totalQuestions) * 10) / 10
          : 0;
        section.avgTime = section.totalQuestions > 0
          ? Math.round(section.timeSum / section.totalQuestions)
          : 0;
        section.frequency = Math.min(1, section.examIds.size / totalExams);

        // Clean up temp fields
        delete section.difficultySum;
        delete section.timeSum;
        delete section.examIds;
        delete section.techniqueIds;
      }

      // Calculate chapter frequency as average of section frequencies
      const sectionFreqs = chapter.sections.map((s: any) => s.frequency);
      chapter.frequencyScore = sectionFreqs.length > 0
        ? Math.round((sectionFreqs.reduce((a: number, b: number) => a + b, 0) / sectionFreqs.length) * 100) / 100
        : 0;

      delete chapter.sectionIds;
    }

    // Convert Maps to arrays and sort
    const chapters = Array.from(chaptersMap.values()).sort((a, b) =>
      parseInt(a.chapterNum) - parseInt(b.chapterNum)
    );

    for (const chapter of chapters) {
      chapter.sections.sort((a: any, b: any) =>
        parseFloat(a.sectionNum) - parseFloat(b.sectionNum)
      );
    }

    return c.json({
      credits_deducted: user.has_unlimited ? 0 : 2,
      chapters: chapters,
    });
  } catch (error) {
    console.error('Detailed analysis error:', error);
    return c.json({ error: 'Failed to generate analysis', details: String(error) }, 500);
  }
});

// Public topics list (no auth) - MUST be before /api/courses/:id/topics
// Only returns topics that have questions
app.get('/api/courses/:id/topics/public', async (c) => {
  const courseId = c.req.param('id');
  const topics = await c.env.DB.prepare(`
    SELECT t.*, COUNT(q.id) as question_count
    FROM topics t
    LEFT JOIN questions q ON t.id = q.topic_id
    WHERE t.course_id = ?
    GROUP BY t.id
    HAVING COUNT(q.id) > 0
    ORDER BY COUNT(q.id) DESC
  `).bind(courseId).all();

  return c.json({ topics: topics.results ?? [] });
});

// Topics (auth required)
app.get('/api/courses/:id/topics', requireAuth, async (c) => {
  const courseId = c.req.param('id');
  const topics = await c.env.DB.prepare('SELECT * FROM topics WHERE course_id = ?').bind(courseId).all();
  return c.json({ topics: topics.results ?? [] });
});

// Topic detail with full CODEX-compliant analysis (study briefing)
app.get('/api/courses/:courseId/topics/:topicId', requireAuth, async (c) => {
  const courseId = c.req.param('courseId');
  const topicId = c.req.param('topicId');
  const db = c.env.DB;

  // Get topic info
  const topic = await db.prepare('SELECT * FROM topics WHERE id = ? AND course_id = ?').bind(topicId, courseId).first<any>();
  if (!topic) return c.json({ error: 'Topic not found' }, 404);

  // Get all questions for this topic with exam metadata
  const questionsResult = await db.prepare(`
    SELECT q.*, e.year, e.semester, e.exam_type, e.id as exam_id
    FROM questions q
    LEFT JOIN exams e ON q.exam_id = e.id
    WHERE q.topic_id = ?
    ORDER BY q.difficulty DESC, e.year DESC
  `).bind(topicId).all();

  const questions = (questionsResult.results ?? []) as any[];

  // Get total exam count for frequency calculation
  const examCountResult = await db.prepare('SELECT COUNT(*) as count FROM exams WHERE course_id = ?').bind(courseId).first<{ count: number }>();
  const totalExams = examCountResult?.count ?? 1;

  // Compute stats
  const appearanceCount = questions.length;
  const appearanceRate = appearanceCount / totalExams;
  const lastSeenYear = questions.length > 0 ? Math.max(...questions.map(q => q.year || 2020)) : 2020;
  const currentYear = new Date().getFullYear();
  const recencyScore = lastSeenYear >= currentYear - 1 ? 1.0 : lastSeenYear >= currentYear - 3 ? 0.7 : 0.4;

  // Difficulty distribution
  const difficultyDistribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  questions.forEach(q => {
    const diff = Math.round(q.difficulty || 3);
    difficultyDistribution[diff.toString()] = (difficultyDistribution[diff.toString()] || 0) + 1;
  });

  // Average stats
  const avgDifficulty = questions.length > 0 ? questions.reduce((sum, q) => sum + (q.difficulty || 3), 0) / questions.length : 3;
  const avgPoints = questions.length > 0 ? questions.reduce((sum, q) => sum + (q.points || 10), 0) / questions.length : 10;
  const avgTime = questions.length > 0 ? questions.reduce((sum, q) => sum + (q.estimated_time || 8), 0) / questions.length : 8;

  // Parse techniques and count frequency
  const techniqueCounts: Record<string, number> = {};
  questions.forEach(q => {
    try {
      const techniques = JSON.parse(q.techniques || '[]');
      techniques.forEach((tech: string) => {
        techniqueCounts[tech] = (techniqueCounts[tech] || 0) + 1;
      });
    } catch {
      // Skip malformed techniques
    }
  });

  const techniques = Object.entries(techniqueCounts)
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);

  // Detect patterns using regex on question text
  const patterns = detectPatterns(questions, totalExams);

  // Generate question types based on patterns
  const questionTypes = generateQuestionTypes(topicId, patterns);

  // Get 2-3 representative examples
  const examples = questions.slice(0, 3).map(q => ({
    id: q.id,
    question_text: q.question_text,
    difficulty: q.difficulty,
    points: q.points,
    exam: {
      year: q.year,
      semester: q.semester,
      type: q.exam_type,
    },
  }));

  // Get static content for topic
  const staticContent = getTopicStaticContent(topicId);

  // Cross-topic links (topics that co-appear on same exams)
  const crossTopicLinks = await getCrossTopicLinks(db, courseId, topicId, questions);

  // Practice recommendation
  const practiceRecommendation = {
    target_questions: Math.min(appearanceCount, 6) || 6,
    focus: patterns.slice(0, 2).map(p => p.name),
    estimated_time_total: Math.round((avgTime || 8) * Math.min(appearanceCount, 6)),
  };

  return c.json({
    topic: {
      id: topicId,
      name: topic.name,
      section: topic.section || '',
      course_id: courseId,
      category: topic.category || 'Topic',
      description: staticContent.description || topic.description || `${topic.name} techniques and applications.`,
    },
    stats: {
      appearance_count: appearanceCount,
      appearance_rate: Math.round(appearanceRate * 100) / 100,
      last_seen_year: lastSeenYear,
      recency_score: recencyScore,
      avg_difficulty: Math.round(avgDifficulty * 10) / 10,
      difficulty_distribution: difficultyDistribution,
      avg_points: Math.round(avgPoints * 10) / 10,
      avg_time_minutes: Math.round(avgTime),
    },
    patterns,
    question_types: questionTypes,
    techniques,
    pitfalls: staticContent.pitfalls || ['Common errors in this topic'],
    examples,
    cross_topic_links: crossTopicLinks,
    study_strategy: staticContent.study_strategy || ['Practice regularly', 'Review solutions', 'Time yourself'],
    practice_recommendation: practiceRecommendation,
    confidence_checklist: staticContent.confidence_checklist || ['Can solve basic problems', 'Can handle variations'],
  });
});

// Helper function to detect patterns in questions
function detectPatterns(questions: any[], totalExams: number): Array<{
  pattern_id: string;
  name: string;
  canonical_form: string;
  appearance_count: number;
  appearance_rate: number;
  example_question_ids: string[];
}> {
  const patterns: Array<{
    pattern_id: string;
    name: string;
    canonical_form: string;
    regex: RegExp;
    count: number;
    examples: string[];
  }> = [
    {
      pattern_id: 'cyclic_ibp_exp_trig',
      name: 'Cyclic IBP with exp/trig',
      canonical_form: '∫ e^{ax} sin(bx) dx or ∫ e^{ax} cos(bx) dx',
      regex: /e\^\{?[^}]*\}?.*\\sin|e\^\{?[^}]*\}?.*\\cos|\\sin.*e\^|\\cos.*e\^/i,
      count: 0,
      examples: [],
    },
    {
      pattern_id: 'ibp_log_polynomial',
      name: 'IBP with logarithmic',
      canonical_form: '∫ x^n ln(x) dx',
      regex: /\\ln|log.*x\^|x\^.*\\ln/i,
      count: 0,
      examples: [],
    },
    {
      pattern_id: 'inverse_trig',
      name: 'Inverse trigonometric',
      canonical_form: '∫ involving arctan, arcsin, arccos',
      regex: /\\arctan|\\arcsin|\\arccos|\\tan\^\{-1\}|\\sin\^\{-1\}|\\cos\^\{-1\}/i,
      count: 0,
      examples: [],
    },
    {
      pattern_id: 'trig_identity',
      name: 'Trigonometric identity',
      canonical_form: 'sin²(x), cos²(x), tan²(x) using identities',
      regex: /sin\^2|cos\^2|tan\^2|sin²|cos²|tan²/i,
      count: 0,
      examples: [],
    },
    {
      pattern_id: 'partial_fractions',
      name: 'Partial fraction decomposition',
      canonical_form: '∫ P(x)/Q(x) dx with factoring',
      regex: /frac\{[^}]+\}\{[^}]+\}|partial fraction|decompose/i,
      count: 0,
      examples: [],
    },
  ];

  questions.forEach(q => {
    const text = q.question_text || '';
    patterns.forEach(p => {
      if (p.regex.test(text) && p.examples.length < 2) {
        p.count++;
        p.examples.push(q.id);
      }
    });
  });

  return patterns
    .filter(p => p.count > 0)
    .map(p => ({
      pattern_id: p.pattern_id,
      name: p.name,
      canonical_form: p.canonical_form,
      appearance_count: p.count,
      appearance_rate: Math.round((p.count / totalExams) * 100) / 100,
      example_question_ids: p.examples,
    }))
    .sort((a, b) => b.appearance_count - a.appearance_count)
    .slice(0, 5);
}

// Helper function to generate question types based on patterns
function generateQuestionTypes(topicId: string, patterns: any[]): string[] {
  const typeMap: Record<string, string[]> = {
    'integration_by_parts': [
      'Evaluate ∫ x^n e^{ax} dx using IBP',
      'Evaluate ∫ e^{ax} sin(bx) dx (cyclic IBP)',
      'Evaluate ∫ x^n ln(x) dx with u = ln(x)',
    ],
    'trig_integrals': [
      'Evaluate ∫ sin^n(x) cos^m(x) dx',
      'Evaluate ∫ tan^n(x) sec^m(x) dx',
      'Use trig identities to simplify and integrate',
    ],
    'trig_substitution': [
      'Evaluate ∫ involving √(a² - x²) using x = a sin(θ)',
      'Evaluate ∫ involving √(a² + x²) using x = a tan(θ)',
      'Evaluate ∫ involving √(x² - a²) using x = a sec(θ)',
    ],
    'partial_fractions': [
      'Decompose and integrate rational function P(x)/Q(x)',
      'Evaluate ∫ with repeated linear factors',
      'Evaluate ∫ with irreducible quadratic factors',
    ],
    'improper_integrals': [
      'Evaluate integral with infinite bound',
      'Evaluate integral with discontinuity',
      'Determine convergence using comparison test',
    ],
    'sequences': [
      'Find limit of sequence a_n',
      'Determine if sequence is monotonic',
      'Find recursive formula',
    ],
    'series_convergence': [
      'Determine convergence using ratio test',
      'Determine convergence using root test',
      'Apply comparison test for convergence',
    ],
    'power_series': [
      'Find radius of convergence',
      'Find interval of convergence',
      'Represent function as power series',
    ],
    'taylor_series': [
      'Find Taylor series expansion',
      'Estimate using Taylor polynomial',
      'Find Maclaurin series',
    ],
  };

  const defaults = [
    'Evaluate the integral using appropriate technique',
    'Simplify and solve step by step',
    'Apply the fundamental approach for this topic',
  ];

  return typeMap[topicId] || patterns.map(p => p.name) || defaults;
}

// Helper function to get static content for a topic
function getTopicStaticContent(topicId: string): {
  description: string;
  pitfalls: string[];
  study_strategy: string[];
  confidence_checklist: string[];
} {
  const contentMap: Record<string, {
    description: string;
    pitfalls: string[];
    study_strategy: string[];
    confidence_checklist: string[];
  }> = {
    'integration_by_parts': {
      description: 'Integration by Parts (IBP) is used when integrating products of functions. Master choosing u and dv using the LIATE rule, and recognize cyclic patterns that require solving for the original integral.',
      pitfalls: [
        'Incorrect u/dv choice leads to harder algebra instead of simplification',
        'Missing the cyclic pattern and not solving for the original integral',
        'Sign errors when applying the IBP formula repeatedly',
        'Forgetting to include the constant of integration',
      ],
      study_strategy: [
        'Master LIATE rule for choosing u: Logs, Inverse trig, Algebraic, Trig, Exponentials',
        'Practice cyclic IBP until you can solve in 2-3 passes without algebra errors',
        'Start with standard forms: x^n e^x, x^n ln(x), e^x sin(x) before variations',
        'Time yourself: aim for 8-12 minutes per problem',
      ],
      confidence_checklist: [
        'Can identify IBP applicability in ≤10 seconds',
        'Can apply LIATE rule correctly without hesitation',
        'Can solve cyclic IBP (exp/trig) without algebra errors',
        'Average time per problem ≤ 10 minutes',
        'Can handle variations with substitution first',
      ],
    },
    'trig_integrals': {
      description: 'Trigonometric integrals involve integrating powers of sine, cosine, tangent, and secant. Key techniques include using identities, u-substitution, and reduction formulas.',
      pitfalls: [
        'Choosing wrong identity for the power combination',
        'Missing u-substitution opportunity with sin/cos pairs',
        'Incorrect handling of odd/even powers',
        'Forgetting to convert tan/sec to sin/cos when stuck',
      ],
      study_strategy: [
        'Memorize key identities: sin² + cos² = 1, 1 + tan² = sec²',
        'Learn the pattern: odd power → save one factor, even power → use identity',
        'Practice converting between tan/sec and sin/cos forms',
        'Master the standard integrals: ∫ tan(x), ∫ sec(x), ∫ sec³(x)',
      ],
      confidence_checklist: [
        'Can identify which identity to use in ≤5 seconds',
        'Can handle both odd and even power combinations',
        'Know when to convert tan/sec to sin/cos',
        'Have memorized standard trig integrals',
        'Can complete problem in 8-12 minutes',
      ],
    },
    'trig_substitution': {
      description: 'Trigonometric substitution handles integrals containing √(a²-x²), √(a²+x²), or √(x²-a²). The key is recognizing the form and applying the correct substitution.',
      pitfalls: [
        'Using wrong substitution for the radical form',
        'Algebra errors when simplifying after substitution',
        'Forgetting to convert back to original variable',
        'Not completing the square when necessary',
      ],
      study_strategy: [
        'Memorize the three forms: √(a²-x²)→x=a sin θ, √(a²+x²)→x=a tan θ, √(x²-a²)→x=a sec θ',
        'Practice drawing the reference triangle for each substitution',
        'Master simplifying √(expression)² = |expression| handling',
        'Learn when completing the square is needed first',
      ],
      confidence_checklist: [
        'Can identify which substitution to use immediately',
        'Can draw reference triangle quickly',
        'Can handle dx conversion without errors',
        'Remember to convert back to original variable',
        'Can handle completing the square when needed',
      ],
    },
    'partial_fractions': {
      description: 'Partial fraction decomposition breaks complex rational functions into simpler fractions that can be integrated directly. Essential for rational functions where denominator degree > numerator degree.',
      pitfalls: [
        'Not ensuring proper rational function (degree check) first',
        'Algebra errors in solving for coefficients',
        'Missing repeated factor cases',
        'Incorrect handling of irreducible quadratics',
      ],
      study_strategy: [
        'Always check: if deg(num) ≥ deg(den), do long division first',
        'Master factoring denominator completely',
        'Learn the pattern for repeated linear factors: A/(x-a) + B/(x-a)² + ...',
        'Practice cover-up method for simple linear factors',
      ],
      confidence_checklist: [
        'Remember to check degree and do long division if needed',
        'Can factor denominators completely',
        'Can set up partial fraction form correctly',
        'Can solve for coefficients efficiently',
        'Can handle repeated and irreducible cases',
      ],
    },
    'improper_integrals': {
      description: 'Improper integrals involve infinite limits of integration or integrands with infinite discontinuities. Understanding convergence tests is crucial for determining if the integral exists.',
      pitfalls: [
        'Treating infinite limit like finite - not using limits',
        'Missing discontinuity within integration interval',
        'Wrong comparison function for convergence tests',
        'Forgetting p-test: ∫₁^∞ 1/x^p converges iff p > 1',
      ],
      study_strategy: [
        'Always rewrite as limit first: ∞ becomes lim(t→∞)',
        'Split integral at discontinuities before evaluating',
        'Master p-test for comparison: know when 1/x^p converges',
        'Practice direct comparison vs limit comparison test',
      ],
      confidence_checklist: [
        'Always rewrite improper integrals using limits',
        'Can identify and split at discontinuities',
        'Have p-test memorized forward and backward',
        'Can choose appropriate comparison functions',
        'Know when integral diverges vs converges',
      ],
    },
    'sequences': {
      description: 'Sequences are ordered lists of numbers defined by explicit or recursive formulas. Key skills include finding limits, determining monotonicity, and identifying boundedness.',
      pitfalls: [
        'Confusing sequence limit with series sum',
        'Not checking both monotonicity and boundedness',
        'Algebra errors in recursive calculations',
        "Forgetting L'Hopital requires differentiable functions",
      ],
      study_strategy: [
        "Master limit techniques: L'Hopital, squeeze theorem, continuity",
        'Learn to prove monotonicity: a_{n+1} - a_n or a_{n+1}/a_n',
        'Practice finding closed forms for recursive sequences',
        'Know the theorem: bounded + monotonic → convergent',
      ],
      confidence_checklist: [
        'Can compute sequence limits reliably',
        'Can prove monotonicity using difference or ratio',
        'Can identify boundedness',
        'Know when to apply monotone convergence theorem',
        'Can work with recursive definitions',
      ],
    },
    'series_convergence': {
      description: 'Series convergence tests determine whether infinite sums have finite values. Each test has specific conditions where it works best - choosing the right test is the key skill.',
      pitfalls: [
        'Wrong test choice for the series form',
        'Forgetting to check lim a_n = 0 (divergence test) first',
        'Algebra errors in ratio/root test limits',
        'Confusing absolute vs conditional convergence',
      ],
      study_strategy: [
        'Always start with divergence test: if lim a_n ≠ 0, diverges',
        'Learn test selection: geometric → ratio → root → comparison → integral',
        'Master when to use alternating series test',
        'Practice determining absolute vs conditional convergence',
      ],
      confidence_checklist: [
        'Always apply divergence test first',
        'Can choose appropriate convergence test',
        'Can apply ratio and root tests accurately',
        'Understand comparison test logic',
        'Can determine absolute vs conditional convergence',
      ],
    },
    'power_series': {
      description: 'Power series represent functions as infinite polynomials. Finding radius and interval of convergence is essential, along with representing functions as power series.',
      pitfalls: [
        'Not checking endpoints for interval of convergence',
        'Algebra errors in ratio test for radius',
        'Forgetting |x-a| < R form for center a',
        'Wrong manipulation of known series',
      ],
      study_strategy: [
        'Master ratio test for radius: lim |a_{n+1}/a_n| = L, R = 1/L',
        'Always test endpoints separately in original series',
        'Memorize key series: 1/(1-x), e^x, sin(x), cos(x), ln(1+x)',
        'Learn differentiation and integration of power series term by term',
      ],
      confidence_checklist: [
        'Can find radius using ratio test reliably',
        'Always remember to test endpoints',
        'Have standard power series memorized',
        'Can manipulate known series (substitution, differentiation)',
        'Can represent functions as power series',
      ],
    },
    'taylor_series': {
      description: 'Taylor series approximate functions using polynomials centered at a point. Maclaurin series are Taylor series centered at 0. Essential for approximation and estimation.',
      pitfalls: [
        'Sign errors in alternating Taylor terms',
        'Wrong factorial in denominator',
        'Not computing derivatives correctly at center',
        'Forgetting remainder term for error estimation',
      ],
      study_strategy: [
        'Master Taylor formula: f(a) + f\'(a)(x-a) + f\'\'(a)(x-a)²/2! + ...',
        'Memorize Maclaurin series for e^x, sin(x), cos(x), 1/(1-x)',
        'Practice computing derivatives at center point',
        'Learn Lagrange error bound for remainder estimation',
      ],
      confidence_checklist: [
        'Can write Taylor series formula from memory',
        'Have Maclaurin series memorized',
        'Can compute derivatives at center accurately',
        'Can find Taylor polynomial of specified degree',
        'Can estimate error using remainder term',
      ],
    },
  };

  return contentMap[topicId] || {
    description: `Study guide for ${topicId}.`,
    pitfalls: ['Practice common error patterns', 'Check your algebra carefully'],
    study_strategy: ['Review fundamental concepts', 'Practice with past exam questions'],
    confidence_checklist: ['Can solve basic problems', 'Can handle exam-level difficulty'],
  };
}

// Helper function to get cross-topic links
async function getCrossTopicLinks(db: any, courseId: string, topicId: string, questions: any[]): Promise<Array<{ topic_id: string; coappear_rate: number }>> {
  if (questions.length === 0) return [];

  // Get exam IDs where this topic appears
  const examIds = [...new Set(questions.map(q => q.exam_id).filter(Boolean))];
  if (examIds.length === 0) return [];

  // Find other topics that appear on the same exams
  const placeholders = examIds.map(() => '?').join(',');
  const coappearing = await db.prepare(`
    SELECT q.topic_id, COUNT(DISTINCT q.exam_id) as coappear_count
    FROM questions q
    WHERE q.exam_id IN (${placeholders})
    AND q.topic_id != ?
    AND q.topic_id IS NOT NULL
    GROUP BY q.topic_id
  `).bind(...examIds, topicId).all();

  const results = (coappearing.results ?? []) as any[];
  return results
    .map(r => ({
      topic_id: r.topic_id,
      coappear_rate: Math.round((r.coappear_count / examIds.length) * 100) / 100,
    }))
    .sort((a, b) => b.coappear_rate - a.coappear_rate)
    .slice(0, 5);
}

// Question bundle (3 questions for 1 credit)
app.post('/api/questions/bundle', requireAuth, async (c) => {
  const body = await json<{ course_id?: string; topic_id?: string; count?: number }>(c);
  const count = body.count ?? 3;
  if (!body.course_id) return c.json({ error: 'Missing course_id' }, 400);

  const userId = c.get('userId');
  const user = await ensureMonthlyCredits(c.env.DB, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);

  if (!user.has_unlimited && user.credits < 1) {
    return c.json({ error: 'Insufficient credits', credits_needed: 1, credits_available: user.credits }, 402);
  }

  if (!user.has_unlimited) {
    await c.env.DB.prepare('UPDATE users SET credits = credits - 1 WHERE id = ?').bind(userId).run();
    await c.env.DB.prepare('INSERT INTO credit_transactions (id, user_id, amount, type, description, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, -1, 'question_view', 'Topic bundle', nowTs())
      .run();
  }

  const query = body.topic_id
    ? 'SELECT q.*, t.name as topic_name FROM questions q LEFT JOIN topics t ON q.topic_id = t.id WHERE q.course_id = ? AND q.topic_id = ? LIMIT ?'
    : 'SELECT q.*, t.name as topic_name FROM questions q LEFT JOIN topics t ON q.topic_id = t.id WHERE q.course_id = ? LIMIT ?';
  const stmt = body.topic_id
    ? c.env.DB.prepare(query).bind(body.course_id, body.topic_id, count)
    : c.env.DB.prepare(query).bind(body.course_id, count);
  const results = await stmt.all();

  return c.json({ questions: results.results ?? [] });
});

// Practice questions (1 credit per question)
app.post('/api/questions/practice', requireAuth, async (c) => {
  const body = await json<{ course_id?: string; topic_ids?: string[]; technique?: string; count?: number }>(c);
  const count = body.count ?? 3;
  if (!body.course_id) return c.json({ error: 'Missing course_id' }, 400);

  const userId = c.get('userId');
  const user = await ensureMonthlyCredits(c.env.DB, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);

  if (!user.has_unlimited && user.credits < count) {
    return c.json({ error: 'Insufficient credits', credits_needed: count, credits_available: user.credits }, 402);
  }

  if (!user.has_unlimited) {
    await c.env.DB.prepare('UPDATE users SET credits = credits - ? WHERE id = ?').bind(count, userId).run();
    await c.env.DB.prepare('INSERT INTO credit_transactions (id, user_id, amount, type, description, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, -count, 'question_view', 'Practice questions', nowTs())
      .run();
  }

  let results;

  // Technique filtering - filter questions where techniques JSON array contains the technique
  if (body.technique) {
    const stmt = c.env.DB.prepare(`
      SELECT q.*, t.name as topic_name
      FROM questions q
      LEFT JOIN topics t ON q.topic_id = t.id
      WHERE q.course_id = ? AND q.techniques LIKE ?
      ORDER BY RANDOM()
      LIMIT ?
    `).bind(body.course_id, `%"${body.technique}"%`, count);
    results = await stmt.all();
  }
  else if (body.topic_ids && body.topic_ids.length > 0) {
    const placeholders = body.topic_ids.map(() => '?').join(',');
    const stmt = c.env.DB.prepare(
      `SELECT q.*, t.name as topic_name FROM questions q LEFT JOIN topics t ON q.topic_id = t.id WHERE q.course_id = ? AND q.topic_id IN (${placeholders}) ORDER BY RANDOM() LIMIT ?`
    ).bind(body.course_id, ...body.topic_ids, count);
    results = await stmt.all();
  } else {
    results = await c.env.DB.prepare('SELECT q.*, t.name as topic_name FROM questions q LEFT JOIN topics t ON q.topic_id = t.id WHERE q.course_id = ? ORDER BY RANDOM() LIMIT ?')
      .bind(body.course_id, count)
      .all();
  }

  return c.json({ questions: results.results ?? [] });
});

// Questions list (browse)
app.get('/api/questions', requireAuth, async (c) => {
  const courseId = c.req.query('course_id');
  const topicId = c.req.query('topic_id');
  const limit = Number(c.req.query('limit') ?? 20);
  if (!courseId) return c.json({ error: 'Missing course_id' }, 400);

  const query = topicId
    ? 'SELECT q.*, t.name as topic_name FROM questions q LEFT JOIN topics t ON q.topic_id = t.id WHERE q.course_id = ? AND q.topic_id = ? LIMIT ?'
    : 'SELECT q.*, t.name as topic_name FROM questions q LEFT JOIN topics t ON q.topic_id = t.id WHERE q.course_id = ? LIMIT ?';
  const stmt = topicId
    ? c.env.DB.prepare(query).bind(courseId, topicId, limit)
    : c.env.DB.prepare(query).bind(courseId, limit);
  const results = await stmt.all();
  return c.json({ questions: results.results ?? [] });
});

// Single question
app.get('/api/questions/:id', requireAuth, async (c) => {
  const q = await c.env.DB.prepare('SELECT q.*, t.name as topic_name FROM questions q LEFT JOIN topics t ON q.topic_id = t.id WHERE q.id = ?')
    .bind(c.req.param('id'))
    .first();
  if (!q) return c.json({ error: 'Not found' }, 404);
  return c.json({ question: q });
});

// Midterm presets configuration
app.get('/api/midterm/presets', async (c) => {
  return c.json({
    presets: [
      {
        id: 'quick',
        name: 'Quick Practice',
        description: '5-6 questions, shorter time limits. Good for a quick study session.',
        creditCost: 2,
        questionCount: 6,
        estimatedTime: 30,
        difficultyDistribution: { easy: 50, medium: 40, hard: 10 },
        color: 'emerald'
      },
      {
        id: 'sample',
        name: 'Sample Exam',
        description: 'Matches real exam patterns from your professor\'s past exams.',
        creditCost: 3,
        questionCount: 8,
        estimatedTime: 50,
        difficultyDistribution: { easy: 25, medium: 50, hard: 25 },
        color: 'blue'
      },
      {
        id: 'hard',
        name: 'Challenge Mode',
        description: '7-8 harder questions with traps. For when you want to stress-test your knowledge.',
        creditCost: 3,
        questionCount: 8,
        estimatedTime: 60,
        difficultyDistribution: { easy: 10, medium: 40, hard: 50 },
        color: 'amber'
      },
      {
        id: 'custom',
        name: 'Custom Mix',
        description: 'Choose your sections and difficulty.',
        creditCost: 4,
        questionCount: 8,
        estimatedTime: 50,
        difficultyDistribution: { easy: 20, medium: 50, hard: 30 },
        color: 'purple',
        customizable: true
      }
    ]
  });
});

// Practice midterm with configurable weights
app.post('/api/midterm/generate', requireAuth, async (c) => {
  const body = await json<any>(c);
  const courseId = body.course_id || 'calc2';

  // Support both old difficulty param and new config param
  const config = body.config;
  const creditCost = config?.creditCost || (body.difficulty === 'easy' ? 2 : body.difficulty === 'hard' ? 3 : 3);
  const questionCount = config?.questionCount || (body.difficulty === 'easy' ? 6 : body.difficulty === 'hard' ? 10 : 8);

  const userId = c.get('userId');
  const user = await ensureMonthlyCredits(c.env.DB, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);
  if (!user.has_unlimited && user.credits < creditCost) {
    return c.json({ error: 'Insufficient credits', credits_needed: creditCost, credits_available: user.credits }, 402);
  }

  // Deduct credits
  if (!user.has_unlimited) {
    await c.env.DB.prepare('UPDATE users SET credits = credits - ? WHERE id = ?').bind(creditCost, userId).run();
    await c.env.DB.prepare('INSERT INTO credit_transactions (id, user_id, amount, type, description, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, -creditCost, 'midterm', config?.name || `Midterm ${body.difficulty || 'custom'}`, nowTs())
      .run();
  }

  // Build difficulty range from distribution
  let minDifficulty = 1, maxDifficulty = 5;
  if (config?.difficultyDistribution) {
    const { easy, medium, hard } = config.difficultyDistribution;
    // Weighted selection based on distribution
    const rand = Math.random() * 100;
    if (rand < easy) { minDifficulty = 1; maxDifficulty = 2; }
    else if (rand < easy + medium) { minDifficulty = 3; maxDifficulty = 3; }
    else { minDifficulty = 4; maxDifficulty = 5; }
  } else if (body.difficulty) {
    if (body.difficulty === 'easy') { minDifficulty = 1; maxDifficulty = 3; }
    else if (body.difficulty === 'hard') { minDifficulty = 4; maxDifficulty = 5; }
    else { minDifficulty = 2; maxDifficulty = 4; }
  }

  // Fetch questions with weighted selection
  // Support section-based filtering if sections array provided in config
  let query = 'SELECT q.*, t.name as topic_name FROM questions q LEFT JOIN topics t ON q.topic_id = t.id WHERE q.course_id = ? AND q.difficulty >= ? AND q.difficulty <= ?';
  const queryParams: any[] = [courseId, minDifficulty, maxDifficulty];

  // Add section filtering if specified
  if (config?.sections && config.sections.length > 0) {
    const sectionPlaceholders = config.sections.map(() => '?').join(',');
    query += ` AND q.section IN (${sectionPlaceholders})`;
    queryParams.push(...config.sections);
  }

  query += ' ORDER BY RANDOM()';

  const allQuestions = await c.env.DB
    .prepare(query)
    .bind(...queryParams)
    .all();

  // Apply weighted scoring if config provided
  let selectedQuestions = (allQuestions.results || []) as any[];

  if (config?.weights) {
    // Calculate scores based on weights
    const scored = selectedQuestions.map(q => {
      let score = 0;
      const year = q.source_exam_year || 2015;

      // Recency score (0-100)
      if (year >= 2024) score += config.weights.recency * 1.0;
      else if (year >= 2020) score += config.weights.recency * 0.5;
      else score += config.weights.recency * 0.25;

      // Repetition score - questions with canonical forms that appear similar
      if (q.canonical_form && q.canonical_form.length > 10) {
        score += config.weights.repetition * 0.7;
      }

      // Coverage score - will be handled by section guarantee
      score += config.weights.coverage * 0.5;

      // Difficulty score - how close to target
      const diffDiff = Math.abs(q.difficulty - (minDifficulty + maxDifficulty) / 2);
      score += config.weights.difficulty * (1 - diffDiff / 5);

      return { ...q, _score: score };
    });

    // Sort by score and select top questions
    scored.sort((a, b) => b._score - a._score);
    selectedQuestions = scored.slice(0, questionCount);
  } else {
    // Simple limit without scoring
    selectedQuestions = selectedQuestions.slice(0, questionCount);
  }

  // Generate midterm ID
  const midtermId = crypto.randomUUID();

  // Save to user_midterms if table exists (optional persistence)
  try {
    await c.env.DB.prepare(
      'INSERT INTO user_midterms (id, user_id, template_type, question_ids, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(
      midtermId,
      userId,
      config?.id || body.difficulty || 'custom',
      JSON.stringify(selectedQuestions.map(q => q.id)),
      'in_progress',
      nowTs()
    ).run();
  } catch {
    // Table might not exist yet, continue without saving
  }

  return c.json({
    midterm_id: midtermId,
    questions: selectedQuestions,
    config: config || { id: body.difficulty || 'custom', name: body.difficulty || 'Custom' },
    credits_remaining: user.has_unlimited ? null : user.credits - creditCost,
  });
});

// Public featured question (no auth required)
app.get('/api/featured-question', async (c) => {
  const question = await c.env.DB.prepare(`
    SELECT q.*, t.name as topic_name, e.year as exam_year, e.semester as exam_semester, e.exam_type
    FROM questions q
    LEFT JOIN topics t ON q.topic_id = t.id
    LEFT JOIN exams e ON q.exam_id = e.id
    WHERE q.difficulty >= 3 AND q.difficulty <= 4
    ORDER BY RANDOM()
    LIMIT 1
  `).first();

  if (!question) return c.json({ error: 'No questions available' }, 404);
  return c.json({ question });
});

// Public contact form submission (no auth required)
app.post('/api/contact', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, subject, message, errorDetails } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return c.json({ error: 'Name, email, and message are required' }, 400);
    }

    // Generate unique ID
    const id = crypto.randomUUID();
    const pageUrl = c.req.header('Referer') || '';
    const userAgent = c.req.header('User-Agent') || '';

    // Insert into database
    await c.env.DB.prepare(`
      INSERT INTO contact_submissions (id, name, email, subject, message, page_url, user_agent, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'new')
    `).bind(
      id,
      name,
      email,
      subject || 'No subject',
      message + (errorDetails ? `\n\nError Details: ${errorDetails}` : ''),
      pageUrl,
      userAgent
    ).run();

    return c.json({
      success: true,
      message: 'Your message has been sent. We\'ll get back to you soon.'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return c.json({ error: 'Failed to send message. Please try again.' }, 500);
  }
});

// Get exams for a course
app.get('/api/courses/:id/exams', requireAuth, async (c) => {
  const courseId = c.req.param('id');
  const exams = await c.env.DB.prepare(`
    SELECT e.*, COUNT(q.id) as question_count
    FROM exams e
    LEFT JOIN questions q ON e.id = q.exam_id
    WHERE e.course_id = ?
    GROUP BY e.id
    ORDER BY e.year DESC, e.exam_type ASC
  `).bind(courseId).all();

  return c.json({ exams: exams.results ?? [] });
});

// Get questions by exam
app.get('/api/exams/:examId/questions', requireAuth, async (c) => {
  const examId = c.req.param('examId');
  const questions = await c.env.DB.prepare(`
    SELECT q.*, t.name as topic_name
    FROM questions q
    LEFT JOIN topics t ON q.topic_id = t.id
    WHERE q.exam_id = ?
    ORDER BY q.question_number ASC
  `).bind(examId).all();

  return c.json({ questions: questions.results ?? [] });
});

// Get exam stats for course home
app.get('/api/courses/:id/stats', requireAuth, async (c) => {
  const courseId = c.req.param('id');

  const examCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM exams WHERE course_id = ?
  `).bind(courseId).first<{ count: number }>();

  const questionCount = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM questions WHERE course_id = ?
  `).bind(courseId).first<{ count: number }>();

  return c.json({
    exams: examCount?.count ?? 0,
    questions: questionCount?.count ?? 0,
  });
});

// Get questions for a course
app.get('/api/courses/:id/questions', requireAuth, async (c) => {
  const courseId = c.req.param('id');
  const limit = Number(c.req.query('limit') ?? 50);

  const results = await c.env.DB.prepare(
    'SELECT q.*, t.name as topic_name FROM questions q LEFT JOIN topics t ON q.topic_id = t.id WHERE q.course_id = ? LIMIT ?'
  ).bind(courseId, limit).all();

  return c.json({ questions: results.results ?? [] });
});

// Static file serving - serve frontend for all non-API routes
app.get('*', async (c) => {
  const path = c.req.path;

  // Don't serve static files for API routes
  if (path.startsWith('/api/')) {
    return c.json({ error: 'Not Found' }, 404);
  }

  try {
    // Try to serve the requested file from ASSETS
    const assetResponse = await c.env.ASSETS.fetch(c.req.raw);

    if (assetResponse.status === 200) {
      return assetResponse;
    }

    // If file not found, serve index.html for SPA routing
    const indexResponse = await c.env.ASSETS.fetch(new Request('/index.html'));
    return indexResponse;
  } catch (error) {
    console.error('Static file serving error:', error);
    return c.json({ error: 'Not Found' }, 404);
  }
});

// Error handler
app.onError((err, c) => {
  console.error('Application error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
