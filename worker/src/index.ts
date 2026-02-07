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

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Arkived API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
    status: 'healthy',
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
  if (user.plan === 'unlimited') return user;

  const resetAt = user.credits_reset_at ?? 0;
  if (resetAt && resetAt > nowTs()) return user;

  const nextReset = nowTs() + 30 * 24 * 3600;
  const monthlyCredits = user.monthly_credits ?? (user.plan === 'starter' ? 15 : 5);
  await db
    .prepare('UPDATE users SET credits = ?, credits_reset_at = ? WHERE id = ?')
    .bind(monthlyCredits, nextReset, userId)
    .run();

  await db
    .prepare('INSERT INTO credit_transactions (id, user_id, amount, type, description, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(crypto.randomUUID(), userId, monthlyCredits, 'monthly_refresh', 'Monthly credit refresh', nowTs())
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
        plan TEXT DEFAULT 'free',
        monthly_credits INTEGER DEFAULT 5,
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
    await addColumn('users', 'plan TEXT DEFAULT \"free\"');
    await addColumn('users', 'monthly_credits INTEGER DEFAULT 5');
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
    'INSERT INTO users (id, name, email, password_hash, credits, plan, monthly_credits, credits_reset_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(userId, body.name ?? null, body.email, `${saltHex}:${hashHex}`, 5, 'free', 5, creditsResetAt, createdAt, createdAt)
    .run();

  const sessionId = crypto.randomUUID();
  await c.env.DB.prepare('INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .bind(sessionId, userId, nowTs() + 7 * 24 * 3600, nowTs())
    .run();

  return c.json({
    success: true,
    token: sessionId,
    user: { id: userId, email: body.email, name: body.name, credits: 5, plan: 'free' },
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
    user: { id: user.id, email: user.email, name: user.name, credits: user.credits, plan: user.plan },
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
      name: user.name,
      credits: user.credits,
      plan: user.plan,
      credits_reset_at: user.credits_reset_at,
    },
  });
});

// Credits
app.get('/api/credits/balance', requireAuth, async (c) => {
  const userId = c.get('userId');
  const user = await ensureMonthlyCredits(c.env.DB, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);
  return c.json({ credits: user.credits, plan: user.plan, credits_reset_at: user.credits_reset_at });
});

app.post('/api/credits/purchase', requireAuth, async (c) => {
  const body = await json<{ plan?: 'starter' | 'unlimited' }>(c);
  if (!body.plan) return c.json({ error: 'Missing plan' }, 400);
  return c.json({ checkout_url: 'https://checkout.stripe.com/placeholder', session_id: 'cs_test' });
});

// Courses
app.get('/api/courses', requireAuth, async (c) => {
  const courses = await c.env.DB.prepare('SELECT * FROM courses WHERE is_active = 1').all();
  return c.json({ courses: courses.results ?? [] });
});

// Analysis (costs 2 credits)
app.get('/api/courses/:id/analysis', requireAuth, async (c) => {
  const userId = c.get('userId');
  const user = await ensureMonthlyCredits(c.env.DB, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);

  if (user.plan !== 'unlimited' && user.credits < 2) {
    return c.json({ error: 'Insufficient credits', credits_needed: 2, credits_available: user.credits }, 402);
  }

  if (user.plan !== 'unlimited') {
    await c.env.DB.prepare('UPDATE users SET credits = credits - 2 WHERE id = ?').bind(userId).run();
    await c.env.DB.prepare('INSERT INTO credit_transactions (id, user_id, amount, type, description, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(crypto.randomUUID(), userId, -2, 'analysis_view', 'Exam analysis', nowTs())
      .run();
  }

  return c.json({
    credits_deducted: user.plan === 'unlimited' ? 0 : 2,
    analysis: {
      topic_distribution: [
        { topic_id: 'series', name: 'Sequences & Series', count: 5, percentage: 32, avg_points: 15 },
        { topic_id: 'integration', name: 'Integration Techniques', count: 4, percentage: 28, avg_points: 12 },
      ],
      difficulty_distribution: { easy: 30, medium: 45, hard: 25 },
      high_value_topics: [{ topic_id: 'series', name: 'Series Convergence Tests', avg_points: 15, frequency: 'Often' }],
      recommended_study_order: ['series', 'integration'],
      study_strategy: 'Focus on series convergence and integration techniques first.',
    },
  });
});

// Detailed Analysis (unified topic analysis hub - costs 2 credits)
app.get('/api/courses/:id/analysis-detailed', requireAuth, async (c) => {
  const userId = c.get('userId');
  const courseId = c.req.param('id');
  const db = c.env.DB;

  const user = await ensureMonthlyCredits(db, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);

  // Check credits
  if (user.plan !== 'unlimited' && user.credits < 2) {
    return c.json({ error: 'Insufficient credits', credits_needed: 2, credits_available: user.credits }, 402);
  }

  // Deduct credits (idempotent check would need session tracking - simplified here)
  if (user.plan !== 'unlimited') {
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

    // Section to chapter mapping
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
      credits_deducted: user.plan === 'unlimited' ? 0 : 2,
      chapters: chapters,
    });
  } catch (error) {
    console.error('Detailed analysis error:', error);
    return c.json({ error: 'Failed to generate analysis', details: String(error) }, 500);
  }
});

// Topics
app.get('/api/courses/:id/topics', requireAuth, async (c) => {
  const courseId = c.req.param('id');
  const topics = await c.env.DB.prepare('SELECT * FROM topics WHERE course_id = ?').bind(courseId).all();
  return c.json({ topics: topics.results ?? [] });
});

// Topic detail with analysis
app.get('/api/courses/:courseId/topics/:topicId', requireAuth, async (c) => {
  const courseId = c.req.param('courseId');
  const topicId = c.req.param('topicId');
  const db = c.env.DB;

  // Get topic info
  const topic = await db.prepare('SELECT * FROM topics WHERE id = ? AND course_id = ?').bind(topicId, courseId).first<any>();
  if (!topic) return c.json({ error: 'Topic not found' }, 404);

  // Get sample questions for this topic
  const questionsResult = await db.prepare(`
    SELECT q.*, e.year, e.semester, e.exam_type
    FROM questions q
    LEFT JOIN exams e ON q.exam_id = e.id
    WHERE q.topic_id = ?
    ORDER BY q.difficulty DESC
    LIMIT 5
  `).bind(topicId).all();

  // Get frequency stats
  const examCount = await db.prepare('SELECT COUNT(*) as count FROM exams WHERE course_id = ?').bind(courseId).first<{ count: number }>();
  const topicAppearances = await db.prepare('SELECT COUNT(*) as count FROM questions WHERE topic_id = ?').bind(topicId).first<{ count: number }>();

  // Calculate average difficulty and points
  const stats = await db.prepare(`
    SELECT AVG(difficulty) as avg_difficulty, AVG(points) as avg_points
    FROM questions WHERE topic_id = ?
  `).bind(topicId).first<any>();

  return c.json({
    topic: {
      ...topic,
      appearances: topicAppearances?.count ?? 0,
      totalExams: examCount?.count ?? 0,
      avgDifficulty: Math.round(stats?.avg_difficulty ?? 3),
      avgPoints: Math.round(stats?.avg_points ?? 10),
    },
    sampleQuestions: questionsResult.results ?? [],
    analysis: {
      frequencyScore: topic.frequency_score ?? 0.5,
      questionCount: topicAppearances?.count ?? 0,
      commonDifficulties: ['Recognizing the correct approach', 'Algebraic simplification', 'Sign errors in integration'],
      studyTips: [
        `Practice ${topicAppearances?.count ?? 0}+ questions from past exams`,
        'Focus on the setup - most errors happen in the first step',
        'Time yourself: aim for 8-12 minutes per question',
      ],
    },
  });
});

// Question bundle (3 questions for 1 credit)
app.post('/api/questions/bundle', requireAuth, async (c) => {
  const body = await json<{ course_id?: string; topic_id?: string; count?: number }>(c);
  const count = body.count ?? 3;
  if (!body.course_id) return c.json({ error: 'Missing course_id' }, 400);

  const userId = c.get('userId');
  const user = await ensureMonthlyCredits(c.env.DB, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);

  if (user.plan !== 'unlimited' && user.credits < 1) {
    return c.json({ error: 'Insufficient credits', credits_needed: 1, credits_available: user.credits }, 402);
  }

  if (user.plan !== 'unlimited') {
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

  if (user.plan !== 'unlimited' && user.credits < count) {
    return c.json({ error: 'Insufficient credits', credits_needed: count, credits_available: user.credits }, 402);
  }

  if (user.plan !== 'unlimited') {
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

// Practice midterm with configurable weights
app.post('/api/midterm/generate', requireAuth, async (c) => {
  const body = await json<{
    course_id?: string;
    difficulty?: 'easy' | 'sample' | 'hard';
    config?: {
      id: string;
      name: string;
      weights: { recency: number; repetition: number; coverage: number; difficulty: number };
      difficultyDistribution: { easy: number; medium: number; hard: number };
      questionCount: number;
      creditCost: number;
    };
  }>(c);

  if (!body.course_id) return c.json({ error: 'Missing course_id' }, 400);

  // Support both old difficulty param and new config param
  const config = body.config;
  const creditCost = config?.creditCost || (body.difficulty === 'easy' ? 2 : body.difficulty === 'hard' ? 3 : 3);
  const questionCount = config?.questionCount || (body.difficulty === 'easy' ? 6 : body.difficulty === 'hard' ? 10 : 8);

  const userId = c.get('userId');
  const user = await ensureMonthlyCredits(c.env.DB, userId);
  if (!user) return c.json({ error: 'Not found' }, 404);
  if (user.plan !== 'unlimited' && user.credits < creditCost) {
    return c.json({ error: 'Insufficient credits', credits_needed: creditCost, credits_available: user.credits }, 402);
  }

  // Deduct credits
  if (user.plan !== 'unlimited') {
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
  const allQuestions = await c.env.DB
    .prepare('SELECT q.*, t.name as topic_name FROM questions q LEFT JOIN topics t ON q.topic_id = t.id WHERE q.course_id = ? AND q.difficulty >= ? AND q.difficulty <= ? ORDER BY RANDOM()')
    .bind(body.course_id, minDifficulty, maxDifficulty)
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
    credits_remaining: user.plan === 'unlimited' ? null : user.credits - creditCost,
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

// Public topics list (no auth)
app.get('/api/courses/:id/topics/public', async (c) => {
  const courseId = c.req.param('id');
  const topics = await c.env.DB.prepare(`
    SELECT t.*, COUNT(q.id) as question_count
    FROM topics t
    LEFT JOIN questions q ON t.id = q.topic_id
    WHERE t.course_id = ?
    GROUP BY t.id
    ORDER BY t.frequency_score DESC
  `).bind(courseId).all();

  return c.json({ topics: topics.results ?? [] });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Application error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
