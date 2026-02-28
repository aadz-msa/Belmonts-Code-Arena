-- Sample Seed Data for Belmonts Code Arena
-- Run this after creating the schema

-- Insert a sample contest (adjust times as needed)
INSERT INTO contests (name, start_time, end_time, is_active) VALUES
(
  'Medieval Code Quest - March 2026',
  '2026-03-01 10:00:00+00',  -- Start time (UTC)
  '2026-03-01 14:00:00+00',  -- End time (UTC, 4 hours later)
  true
);

-- Get the contest ID (you'll need this for the next inserts)
-- In practice, you'd use RETURNING id or fetch it
-- For this example, we'll use a variable

DO $$
DECLARE
  contest_uuid UUID;
BEGIN
  -- Get the contest ID we just inserted
  SELECT id INTO contest_uuid FROM contests WHERE name = 'Medieval Code Quest - March 2026';

  -- =====================================================
  -- EASY QUESTS
  -- =====================================================
  
  -- Quest 1: Sum of Two Numbers
  INSERT INTO quests (contest_id, title, description, difficulty, base_xp, sort_order) VALUES
  (
    contest_uuid,
    'The Sum of Swords',
    E'## The Sum of Swords\n\nA blacksmith has forged swords of varying lengths. Given two sword lengths, calculate their total length.\n\n**Input:** Two integers `a` and `b` on a single line, space-separated.\n\n**Output:** A single integer representing the sum.\n\n**Constraints:**\n- `-1000 ≤ a, b ≤ 1000`',
    'Easy',
    100,
    1
  ) RETURNING id INTO contest_uuid; -- Reusing variable for quest_id

  -- Test cases for Quest 1
  INSERT INTO test_cases (quest_id, input, expected_output, is_hidden, sort_order) VALUES
  (contest_uuid, '5 3', '8', false, 1),
  (contest_uuid, '-10 15', '5', false, 2),
  (contest_uuid, '0 0', '0', true, 3),
  (contest_uuid, '1000 -1000', '0', true, 4),
  (contest_uuid, '999 999', '1998', true, 5);

  -- Quest 2: Count Vowels
  SELECT id INTO contest_uuid FROM contests WHERE name = 'Medieval Code Quest - March 2026';
  
  INSERT INTO quests (contest_id, title, description, difficulty, base_xp, sort_order) VALUES
  (
    contest_uuid,
    'Count the Chants',
    E'## Count the Chants\n\nThe monks chant ancient verses. Count how many vowels (a, e, i, o, u) appear in their chant.\n\n**Input:** A single line containing a string (only lowercase letters and spaces).\n\n**Output:** A single integer representing the count of vowels.\n\n**Constraints:**\n- `1 ≤ length ≤ 1000`',
    'Easy',
    100,
    2
  ) RETURNING id INTO contest_uuid;

  INSERT INTO test_cases (quest_id, input, expected_output, is_hidden, sort_order) VALUES
  (contest_uuid, 'hello world', '3', false, 1),
  (contest_uuid, 'aeiou', '5', false, 2),
  (contest_uuid, 'bcdfg', '0', true, 3),
  (contest_uuid, 'the quick brown fox', '5', true, 4);

  -- =====================================================
  -- MEDIUM QUESTS
  -- =====================================================

  -- Quest 3: Fibonacci
  SELECT id INTO contest_uuid FROM contests WHERE name = 'Medieval Code Quest - March 2026';
  
  INSERT INTO quests (contest_id, title, description, difficulty, base_xp, sort_order) VALUES
  (
    contest_uuid,
    'The Fibonacci Scrolls',
    E'## The Fibonacci Scrolls\n\nAn ancient scroll contains the Fibonacci sequence. Given `n`, find the nth Fibonacci number (0-indexed).\n\n**Input:** A single integer `n`.\n\n**Output:** A single integer representing the nth Fibonacci number.\n\n**Constraints:**\n- `0 ≤ n ≤ 30`\n- F(0) = 0, F(1) = 1',
    'Medium',
    250,
    3
  ) RETURNING id INTO contest_uuid;

  INSERT INTO test_cases (quest_id, input, expected_output, is_hidden, sort_order) VALUES
  (contest_uuid, '5', '5', false, 1),
  (contest_uuid, '10', '55', false, 2),
  (contest_uuid, '0', '0', true, 3),
  (contest_uuid, '15', '610', true, 4),
  (contest_uuid, '20', '6765', true, 5);

  -- Quest 4: Palindrome Check
  SELECT id INTO contest_uuid FROM contests WHERE name = 'Medieval Code Quest - March 2026';
  
  INSERT INTO quests (contest_id, title, description, difficulty, base_xp, sort_order) VALUES
  (
    contest_uuid,
    'The Mirror Shield',
    E'## The Mirror Shield\n\nA shield has inscriptions that read the same forwards and backwards. Check if a given string is a palindrome (ignore spaces and case).\n\n**Input:** A single line containing a string.\n\n**Output:** `YES` if palindrome, `NO` otherwise.\n\n**Constraints:**\n- `1 ≤ length ≤ 1000`',
    'Medium',
    250,
    4
  ) RETURNING id INTO contest_uuid;

  INSERT INTO test_cases (quest_id, input, expected_output, is_hidden, sort_order) VALUES
  (contest_uuid, 'racecar', 'YES', false, 1),
  (contest_uuid, 'hello', 'NO', false, 2),
  (contest_uuid, 'A man a plan a canal Panama', 'YES', true, 3),
  (contest_uuid, 'abcd', 'NO', true, 4);

  -- =====================================================
  -- HARD QUESTS
  -- =====================================================

  -- Quest 5: Longest Increasing Subsequence
  SELECT id INTO contest_uuid FROM contests WHERE name = 'Medieval Code Quest - March 2026';
  
  INSERT INTO quests (contest_id, title, description, difficulty, base_xp, sort_order) VALUES
  (
    contest_uuid,
    'The Tower of Ages',
    E'## The Tower of Ages\n\nThe castle tower has stones of varying heights. Find the length of the longest increasing subsequence.\n\n**Input:** First line contains `n`, the number of stones. Second line contains `n` space-separated integers.\n\n**Output:** A single integer representing the length of the longest increasing subsequence.\n\n**Constraints:**\n- `1 ≤ n ≤ 1000`\n- `1 ≤ stone_height ≤ 10^9`',
    'Hard',
    500,
    5
  ) RETURNING id INTO contest_uuid;

  INSERT INTO test_cases (quest_id, input, expected_output, is_hidden, sort_order) VALUES
  (contest_uuid, E'6\n10 9 2 5 3 7', '3', false, 1),
  (contest_uuid, E'5\n1 2 3 4 5', '5', false, 2),
  (contest_uuid, E'5\n5 4 3 2 1', '1', true, 3),
  (contest_uuid, E'8\n0 8 4 12 2 10 6 14', '4', true, 4);

END $$;
