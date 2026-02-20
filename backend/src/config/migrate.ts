import { pool } from './database';

const migrations = [
  `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'professor',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  `,
  `
  DO $$ BEGIN
    ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'professor';
  EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
  `,
  `
  CREATE TABLE IF NOT EXISTS turmas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_turmas_user_id ON turmas(user_id);
  CREATE UNIQUE INDEX IF NOT EXISTS idx_turmas_slug ON turmas(slug);
  `,
  `
  CREATE TABLE IF NOT EXISTS blocos (
    id SERIAL PRIMARY KEY,
    turma_id INTEGER NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_blocos_turma_id ON blocos(turma_id);
  `,
  `
  CREATE TABLE IF NOT EXISTS materiais (
    id SERIAL PRIMARY KEY,
    bloco_id INTEGER NOT NULL REFERENCES blocos(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('video', 'reading', 'exercise', 'test', 'other')),
    url VARCHAR(2048) NOT NULL,
    instruction TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_materiais_bloco_id ON materiais(bloco_id);
  `,
  `
  CREATE TABLE IF NOT EXISTS matriculas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    turma_id INTEGER NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, turma_id)
  );
  CREATE INDEX IF NOT EXISTS idx_matriculas_turma_id ON matriculas(turma_id);
  CREATE INDEX IF NOT EXISTS idx_matriculas_user_id ON matriculas(user_id);
  `,
  `
  DO $$ BEGIN
    ALTER TABLE turmas ADD COLUMN description TEXT;
  EXCEPTION WHEN duplicate_column THEN NULL;
  END $$;
  `,
  `
  CREATE TABLE IF NOT EXISTS login_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    logged_at TIMESTAMPTZ DEFAULT NOW(),
    ip VARCHAR(45)
  );
  CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_login_logs_logged_at ON login_logs(logged_at);
  `,
  `
  DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'turmas' AND column_name = 'link_token') THEN
      ALTER TABLE turmas ADD COLUMN link_token VARCHAR(64);
    END IF;
  END $$;
  UPDATE turmas SET link_token = replace(gen_random_uuid()::text, '-', '') WHERE link_token IS NULL;
  ALTER TABLE turmas ALTER COLUMN link_token SET NOT NULL;
  CREATE UNIQUE INDEX IF NOT EXISTS idx_turmas_link_token ON turmas(link_token);
  `,
];

async function run(): Promise<void> {
  const client = await pool.connect();
  try {
    for (let i = 0; i < migrations.length; i++) {
      await client.query(migrations[i]);
      console.log(`Migration ${i + 1}/${migrations.length} applied.`);
    }
    console.log('Migrations completed.');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
