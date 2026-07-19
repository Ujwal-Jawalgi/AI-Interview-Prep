-- ============================================================
-- Phase 10 — Progress Tracking: Test Data Seed Script
-- Run this in Supabase SQL Editor to populate fake progress
-- data across 7 days so charts render immediately.
--
-- HOW TO USE:
--   1. Replace 'YOUR_USER_UUID_HERE' with your actual user ID
--      from the `users` table (NOT your Clerk ID).
--      Run: SELECT id, email FROM users LIMIT 5;
--   2. Paste this entire script into Supabase SQL Editor → Run
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Auto-detect the first user (change the email filter if needed)
  SELECT id INTO v_user_id FROM users ORDER BY created_at LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found. Please sign up first.';
  END IF;

  RAISE NOTICE 'Seeding progress for user: %', v_user_id;

  -- Delete any existing progress rows for this user (clean slate)
  DELETE FROM progress WHERE user_id = v_user_id;

  -- Insert 10 days of fake progress data
  INSERT INTO progress (user_id, date, practice_time, interview_score, resume_score)
  VALUES
    (v_user_id, CURRENT_DATE - INTERVAL '9 days', 20, 55, 60),
    (v_user_id, CURRENT_DATE - INTERVAL '8 days', 15, 62, NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '7 days', 25, 68, 65),
    (v_user_id, CURRENT_DATE - INTERVAL '6 days', 10, NULL, 72),
    (v_user_id, CURRENT_DATE - INTERVAL '5 days', 30, 71, NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '4 days', 20, 74, 75),
    (v_user_id, CURRENT_DATE - INTERVAL '3 days', 15, 78, NULL),
    (v_user_id, CURRENT_DATE - INTERVAL '2 days', 25, 82, 80),
    (v_user_id, CURRENT_DATE - INTERVAL '1 day',  30, 85, NULL),
    (v_user_id, CURRENT_DATE,                     15, 88, 83);

  RAISE NOTICE 'Progress data seeded successfully!';
END $$;

-- ============================================================
-- Also seed fake scores for skill radar + distribution charts
-- (creates fake interview + score records)
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
  v_interview_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM users ORDER BY created_at LIMIT 1;
  IF v_user_id IS NULL THEN RETURN; END IF;

  -- Only seed if the user has no scored interviews yet
  IF EXISTS (
    SELECT 1 FROM scores s
    JOIN interviews i ON i.id = s.interview_id
    WHERE i.user_id = v_user_id
    LIMIT 1
  ) THEN
    RAISE NOTICE 'Scores already exist — skipping interview seed.';
    RETURN;
  END IF;

  -- Interview 1: Technical, Medium
  INSERT INTO interviews (user_id, interview_type, difficulty, created_at)
  VALUES (v_user_id, 'Technical', 'Medium', NOW() - INTERVAL '7 days')
  RETURNING id INTO v_interview_id;

  INSERT INTO scores (interview_id, communication, technical, grammar, confidence, logical_thinking, problem_solving, final_score, feedback)
  VALUES (v_interview_id, 65, 58, 70, 62, 55, 60, 62, 'Good start. Technical depth needs improvement.');

  -- Interview 2: HR, Easy
  INSERT INTO interviews (user_id, interview_type, difficulty, created_at)
  VALUES (v_user_id, 'HR', 'Easy', NOW() - INTERVAL '5 days')
  RETURNING id INTO v_interview_id;

  INSERT INTO scores (interview_id, communication, technical, grammar, confidence, logical_thinking, problem_solving, final_score, feedback)
  VALUES (v_interview_id, 75, 68, 80, 72, 65, 65, 71, 'Strong communication. Work on confidence under pressure.');

  -- Interview 3: Behavioral, Hard
  INSERT INTO interviews (user_id, interview_type, difficulty, created_at)
  VALUES (v_user_id, 'Behavioral', 'Hard', NOW() - INTERVAL '2 days')
  RETURNING id INTO v_interview_id;

  INSERT INTO scores (interview_id, communication, technical, grammar, confidence, logical_thinking, problem_solving, final_score, feedback)
  VALUES (v_interview_id, 82, 75, 88, 80, 78, 76, 80, 'Excellent behavioral answers. Keep this consistency.');

  RAISE NOTICE 'Fake interview scores seeded successfully!';
END $$;
