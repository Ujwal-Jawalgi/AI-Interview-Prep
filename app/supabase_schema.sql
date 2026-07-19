-- ============================================================
-- InterviewAI — Supabase Postgres Schema
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Users ────────────────────────────────────────────────────
-- Mirrors Clerk user; clerk_id is the link between Clerk & Supabase
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id    TEXT UNIQUE NOT NULL,
  name        TEXT,
  email       TEXT UNIQUE NOT NULL,
  college     TEXT,
  branch      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Resumes ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS resumes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  file_url    TEXT,
  ats_score   INT CHECK (ats_score BETWEEN 0 AND 100),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Interviews ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  interview_type  TEXT CHECK (interview_type IN ('HR','Technical','Behavioral','Aptitude','Coding','System Design')),
  company         TEXT,
  difficulty      TEXT CHECK (difficulty IN ('Beginner','Intermediate','Advanced')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Questions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id    UUID REFERENCES interviews(id) ON DELETE CASCADE,
  question_text   TEXT,
  user_answer     TEXT,
  ai_feedback     TEXT
);

-- ── Scores ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id    UUID REFERENCES interviews(id) ON DELETE CASCADE,
  communication   INT CHECK (communication BETWEEN 0 AND 100),
  technical       INT CHECK (technical BETWEEN 0 AND 100),
  grammar         INT CHECK (grammar BETWEEN 0 AND 100),
  confidence      INT CHECK (confidence BETWEEN 0 AND 100),
  logical_thinking INT CHECK (logical_thinking BETWEEN 0 AND 100),
  problem_solving  INT CHECK (problem_solving BETWEEN 0 AND 100),
  final_score     INT CHECK (final_score BETWEEN 0 AND 100),
  feedback        TEXT
);

-- ── Progress ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  date            DATE DEFAULT CURRENT_DATE,
  practice_time   INT,  -- in minutes
  interview_score INT,
  resume_score    INT
);

-- ── Feedback Reports ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id        UUID REFERENCES interviews(id) ON DELETE CASCADE,
  executive_summary   TEXT,
  strengths           TEXT[],
  weaknesses          TEXT[],
  improvement_tips    TEXT[],
  recommended_topics  TEXT[],
  practice_questions  TEXT[],
  company_readiness   JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Career Recommendations ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS career_recommendations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  recommended_roles   TEXT[],
  suggested_skills    TEXT[],
  learning_resources  JSONB,
  readiness_summary   TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────
-- Enable RLS on all tables
ALTER TABLE users      ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews  ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress    ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own data
CREATE POLICY "Users: own data only" ON users
  FOR ALL USING (clerk_id = current_setting('app.clerk_id', true));

CREATE POLICY "Resumes: own data only" ON resumes
  FOR ALL USING (
    user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true) LIMIT 1)
  );

CREATE POLICY "Interviews: own data only" ON interviews
  FOR ALL USING (
    user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true) LIMIT 1)
  );

CREATE POLICY "Scores: own data only" ON scores
  FOR ALL USING (
    interview_id IN (
      SELECT id FROM interviews
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true) LIMIT 1)
    )
  );

CREATE POLICY "Progress: own data only" ON progress
  FOR ALL USING (
    user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true) LIMIT 1)
  );

CREATE POLICY "Career Recommendations: own data only" ON career_recommendations
  FOR ALL USING (
    user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true) LIMIT 1)
  );

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_clerk_id     ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id    ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id   ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_date      ON progress(date);
