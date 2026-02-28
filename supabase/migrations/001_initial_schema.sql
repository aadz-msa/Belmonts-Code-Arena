-- Belmonts Code Arena Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension (available by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CONTESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- WARRIORS TABLE (Users/Participants)
-- =====================================================
CREATE TABLE IF NOT EXISTS warriors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  clan TEXT,
  xp INTEGER DEFAULT 0,
  solved_count INTEGER DEFAULT 0,
  earliest_submission TIMESTAMPTZ,
  contest_id UUID REFERENCES contests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for leaderboard queries (sort by XP desc, then earliest submission asc)
CREATE INDEX IF NOT EXISTS idx_warriors_leaderboard 
ON warriors(xp DESC, earliest_submission ASC);

-- =====================================================
-- QUESTS TABLE (Problems/Challenges)
-- =====================================================
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')) NOT NULL,
  base_xp INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quests_contest 
ON quests(contest_id, sort_order);

-- =====================================================
-- TEST_CASES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_test_cases_quest 
ON test_cases(quest_id, sort_order);

-- =====================================================
-- SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warrior_id UUID REFERENCES warriors(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  contest_id UUID REFERENCES contests(id) ON DELETE CASCADE,
  language_id INTEGER NOT NULL,
  source_code TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  passed_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  xp_awarded INTEGER DEFAULT 0,
  execution_time NUMERIC,
  memory_used INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submissions_warrior_quest 
ON submissions(warrior_id, quest_id, status);

CREATE INDEX IF NOT EXISTS idx_submissions_contest 
ON submissions(contest_id, submitted_at);

CREATE INDEX IF NOT EXISTS idx_submissions_quest_status 
ON submissions(quest_id, status, submitted_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE warriors ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Contests: Read-only for anon users
CREATE POLICY "Allow anon to read contests" 
ON contests FOR SELECT 
TO anon 
USING (true);

-- Warriors: Allow insert (registration) and read for anon
CREATE POLICY "Allow anon to insert warriors" 
ON warriors FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow anon to read warriors" 
ON warriors FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow anon to update warriors" 
ON warriors FOR UPDATE 
TO anon 
USING (true);

-- Quests: Read-only for anon
CREATE POLICY "Allow anon to read quests" 
ON quests FOR SELECT 
TO anon 
USING (true);

-- Test Cases: Anon can only read non-hidden test cases
CREATE POLICY "Allow anon to read sample test cases" 
ON test_cases FOR SELECT 
TO anon 
USING (is_hidden = false);

-- Submissions: Anon can insert and read their own
CREATE POLICY "Allow anon to insert submissions" 
ON submissions FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow anon to read submissions" 
ON submissions FOR SELECT 
TO anon 
USING (true);

-- =====================================================
-- REALTIME SETUP
-- =====================================================

-- Enable Realtime on warriors table for leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE warriors;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if warrior already solved a quest
CREATE OR REPLACE FUNCTION has_solved_quest(warrior_uuid UUID, quest_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM submissions 
    WHERE warrior_id = warrior_uuid 
    AND quest_id = quest_uuid 
    AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to count wrong submissions for a warrior on a quest
CREATE OR REPLACE FUNCTION count_wrong_submissions(warrior_uuid UUID, quest_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM submissions 
    WHERE warrior_id = warrior_uuid 
    AND quest_id = quest_uuid 
    AND status != 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if warrior is first solver
CREATE OR REPLACE FUNCTION is_first_solver(quest_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM submissions 
    WHERE quest_id = quest_uuid 
    AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
