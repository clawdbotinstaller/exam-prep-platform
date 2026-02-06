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
  origin: ['http://localhost:5173', 'https://testament.app'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Testament API',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT,
    status: 'healthy',
  });
});

// Initialize database endpoint (run once to create tables)
app.post('/init', async (c) => {
  try {
    const db = c.env.DB;

    // Create users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        credits INTEGER DEFAULT 5,
        has_unlimited BOOLEAN DEFAULT FALSE,
        unlimited_until TIMESTAMP,
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
        topic_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        question_text TEXT NOT NULL,
        solution_steps TEXT NOT NULL,
        answer TEXT NOT NULL,
        difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
        estimated_time INTEGER,
        source_exam_year INTEGER,
        source_exam_type TEXT,
        source_question_number INTEGER,
        source_points INTEGER,
        is_generated BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
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
      ('calc2', 'Calculus 2', 'Integration techniques, series, parametric equations, and applications', 4)
    `);

    return c.json({ success: true, message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Database initialization error:', error);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// API routes will be added here
// - Authentication
// - User management
// - Questions
// - Credits/ Payments
// - Analytics

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
