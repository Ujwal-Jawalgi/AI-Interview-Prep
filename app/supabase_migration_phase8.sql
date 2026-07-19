-- ============================================================
-- Phase 8 Migration — Run this in Supabase Dashboard → SQL Editor
-- This is safe to run multiple times (idempotent)
-- ============================================================

-- Step 1: Fix interview_type constraint to allow 'System Design'
ALTER TABLE interviews DROP CONSTRAINT IF EXISTS interviews_interview_type_check;
ALTER TABLE interviews ADD CONSTRAINT interviews_interview_type_check
  CHECK (interview_type IN ('HR','Technical','Behavioral','Aptitude','Coding','System Design'));

-- Step 2: Add missing columns to scores table
ALTER TABLE scores ADD COLUMN IF NOT EXISTS logical_thinking INT CHECK (logical_thinking BETWEEN 0 AND 100);
ALTER TABLE scores ADD COLUMN IF NOT EXISTS problem_solving  INT CHECK (problem_solving  BETWEEN 0 AND 100);
ALTER TABLE scores ADD COLUMN IF NOT EXISTS feedback TEXT;

-- Step 3: Create feedback_reports table if it doesn't exist
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

-- Step 4: Enable RLS on feedback_reports
ALTER TABLE feedback_reports ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policy for feedback_reports
DROP POLICY IF EXISTS "Feedback Reports: own data only" ON feedback_reports;
CREATE POLICY "Feedback Reports: own data only" ON feedback_reports
  FOR ALL USING (
    interview_id IN (
      SELECT id FROM interviews
      WHERE user_id = (SELECT id FROM users WHERE clerk_id = current_setting('app.clerk_id', true) LIMIT 1)
    )
  );

-- Step 6: Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_reports_interview_id ON feedback_reports(interview_id);
CREATE INDEX IF NOT EXISTS idx_scores_interview_id ON scores(interview_id);
