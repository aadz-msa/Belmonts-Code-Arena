// Database types
export interface Database {
  public: {
    Tables: {
      contests: {
        Row: Contest
        Insert: Omit<Contest, 'id' | 'created_at'>
        Update: Partial<Omit<Contest, 'id' | 'created_at'>>
      }
      warriors: {
        Row: Warrior
        Insert: Omit<Warrior, 'id' | 'created_at' | 'xp' | 'solved_count'>
        Update: Partial<Omit<Warrior, 'id' | 'created_at'>>
      }
      quests: {
        Row: Quest
        Insert: Omit<Quest, 'id' | 'created_at'>
        Update: Partial<Omit<Quest, 'id' | 'created_at'>>
      }
      test_cases: {
        Row: TestCase
        Insert: Omit<TestCase, 'id'>
        Update: Partial<Omit<TestCase, 'id'>>
      }
      submissions: {
        Row: Submission
        Insert: Omit<Submission, 'id' | 'submitted_at'>
        Update: Partial<Omit<Submission, 'id' | 'submitted_at'>>
      }
    }
  }
}

// Entity types
export interface Contest {
  id: string
  name: string
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
}

export interface Warrior {
  id: string
  name: string
  clan: string | null
  xp: number
  solved_count: number
  earliest_submission: string | null
  contest_id: string | null
  created_at: string
}

export interface Quest {
  id: string
  contest_id: string | null
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  base_xp: number
  sort_order: number
  created_at: string
}

export interface TestCase {
  id: string
  quest_id: string
  input: string
  expected_output: string
  is_hidden: boolean
  sort_order: number
}

export interface Submission {
  id: string
  warrior_id: string
  quest_id: string
  contest_id: string
  language_id: number
  source_code: string
  status: SubmissionStatus
  passed_count: number
  total_count: number
  xp_awarded: number
  execution_time: number | null
  memory_used: number | null
  submitted_at: string
}

export type SubmissionStatus =
  | 'pending'
  | 'running'
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'compilation_error'
  | 'runtime_error'
  | 'error'

// Extended types with relations
export interface QuestWithTestCases extends Quest {
  test_cases: TestCase[]
}

export interface SubmissionWithDetails extends Submission {
  quest?: Quest
  warrior?: Warrior
}

// Frontend-specific types
export interface Language {
  id: number
  name: string
  extension: string
  monacoLanguage: string
  judge0Id: number
  template: string
}

export interface SubmissionResult {
  status: SubmissionStatus
  passed_count: number
  total_count: number
  xp_awarded: number
  execution_time?: number
  message?: string
  test_results?: TestResult[]
}

export interface TestResult {
  passed: boolean
  input: string
  expected: string
  actual: string
  execution_time?: number
}

// Leaderboard entry
export interface LeaderboardEntry {
  rank: number
  warrior: Warrior
}
