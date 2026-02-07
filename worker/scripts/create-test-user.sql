-- Create a test user for beta testing
-- Email: test@example.com
-- Password: test123
-- 5 free credits, plan: free

-- Password hash for 'test123' (bcrypt with salt)
-- Generated hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

INSERT OR IGNORE INTO users (
  id,
  name,
  email,
  password_hash,
  credits,
  plan,
  monthly_credits,
  credits_reset_at,
  created_at,
  updated_at
) VALUES (
  'test-user-001',
  'Test User',
  'test@example.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  5,
  'free',
  5,
  strftime('%s', 'now') + 30 * 24 * 3600,
  datetime('now'),
  datetime('now')
);

-- Also create an unlimited test user
-- Email: unlimited@example.com
-- Password: test123

INSERT OR IGNORE INTO users (
  id,
  name,
  email,
  password_hash,
  credits,
  plan,
  monthly_credits,
  credits_reset_at,
  created_at,
  updated_at
) VALUES (
  'test-user-unlimited',
  'Test Unlimited User',
  'unlimited@example.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  999,
  'unlimited',
  999,
  strftime('%s', 'now') + 365 * 24 * 3600,
  datetime('now'),
  datetime('now')
);
