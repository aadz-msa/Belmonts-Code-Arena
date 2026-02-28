import type { Language } from './types'

// Judge0 Language IDs
export const JUDGE0_LANGUAGE_IDS = {
  C: 50,
  CPP: 54,
  JAVA: 62,
  PYTHON: 71,
} as const

// Supported languages
export const LANGUAGES: Language[] = [
  {
    id: 1,
    name: 'Python',
    extension: 'py',
    monacoLanguage: 'python',
    judge0Id: JUDGE0_LANGUAGE_IDS.PYTHON,
    template: `# Write your solution here
def solve():
    pass

if __name__ == "__main__":
    solve()
`,
  },
  {
    id: 2,
    name: 'C',
    extension: 'c',
    monacoLanguage: 'c',
    judge0Id: JUDGE0_LANGUAGE_IDS.C,
    template: `#include <stdio.h>

int main() {
    // Write your solution here
    
    return 0;
}
`,
  },
  {
    id: 3,
    name: 'C++',
    extension: 'cpp',
    monacoLanguage: 'cpp',
    judge0Id: JUDGE0_LANGUAGE_IDS.CPP,
    template: `#include <iostream>
using namespace std;

int main() {
    // Write your solution here
    
    return 0;
}
`,
  },
  {
    id: 4,
    name: 'Java',
    extension: 'java',
    monacoLanguage: 'java',
    judge0Id: JUDGE0_LANGUAGE_IDS.JAVA,
    template: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Write your solution here
        
    }
}
`,
  },
]

// XP Values
export const XP_VALUES = {
  Easy: 100,
  Medium: 250,
  Hard: 500,
} as const

// Bonus XP
export const BONUS_XP = {
  FIRST_SOLVER: 50,
  SPEED_BONUS: 30, // Complete within 5 minutes
  WRONG_PENALTY: -5, // Per wrong submission
} as const

// Time constants
export const SPEED_BONUS_THRESHOLD = 5 * 60 * 1000 // 5 minutes in milliseconds

// Rate limiting
export const RATE_LIMIT = {
  MAX_SUBMISSIONS_PER_MINUTE: 5,
  MAX_CODE_SIZE_BYTES: 50 * 1024, // 50KB
} as const

// Judge0 execution limits
export const JUDGE0_LIMITS = {
  CPU_TIME_LIMIT: 5, // seconds
  MEMORY_LIMIT: 256000, // KB (256MB)
} as const

// Contest timer colors
export const TIMER_COLORS = {
  NORMAL: 'text-gold',
  WARNING: 'text-orange-400',
  CRITICAL: 'text-blood-red animate-[pulse-glow_1.5s_ease-in-out_infinite]',
} as const

export const TIMER_THRESHOLDS = {
  WARNING: 5 * 60, // 5 minutes
  CRITICAL: 1 * 60, // 1 minute
} as const

// Local storage keys
export const STORAGE_KEYS = {
  WARRIOR_ID: 'belmonts_warrior_id',
  WARRIOR_NAME: 'belmonts_warrior_name',
  WARRIOR_CLAN: 'belmonts_warrior_clan',
  SELECTED_LANGUAGE: 'belmonts_selected_language',
  CODE_CACHE: 'belmonts_code_cache', // Store per-quest, per-language
} as const

// Status colors for submissions
export const STATUS_COLORS = {
  accepted: 'text-green-400',
  wrong_answer: 'text-red-400',
  time_limit_exceeded: 'text-orange-400',
  compilation_error: 'text-yellow-400',
  runtime_error: 'text-red-300',
  pending: 'text-gray-400',
  running: 'text-blue-400',
  error: 'text-red-500',
} as const

// Difficulty colors
export const DIFFICULTY_COLORS = {
  Easy: 'bg-green-600 text-white',
  Medium: 'bg-orange-600 text-white',
  Hard: 'bg-red-600 text-white',
} as const

// API endpoints
export const API_ENDPOINTS = {
  SUBMIT_CODE: 'submit-code',
} as const
