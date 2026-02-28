import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { QuestWithTestCases } from '../lib/types'

export function useQuests(contestId?: string) {
  const [quests, setQuests] = useState<QuestWithTestCases[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (contestId) {
      fetchQuests(contestId)
    }
  }, [contestId])

  const fetchQuests = async (cId: string) => {
    try {
      setLoading(true)
      setError(null)

      // Fetch quests with sample test cases only (is_hidden = false)
      const { data: questsData, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('contest_id', cId)
        .order('sort_order', { ascending: true })

      if (questsError) throw questsError

      // Fetch sample test cases for all quests
      const { data: testCasesData, error: testCasesError } = await supabase
        .from('test_cases')
        .select('*')
        .in(
          'quest_id',
          questsData.map((q) => q.id)
        )
        .eq('is_hidden', false)
        .order('sort_order', { ascending: true })

      if (testCasesError) throw testCasesError

      // Combine quests with their test cases
      const questsWithTestCases: QuestWithTestCases[] = questsData.map(
        (quest) => ({
          ...quest,
          test_cases: testCasesData.filter((tc) => tc.quest_id === quest.id),
        })
      )

      setQuests(questsWithTestCases)
    } catch (err) {
      console.error('Error fetching quests:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch quests')
    } finally {
      setLoading(false)
    }
  }

  return {
    quests,
    loading,
    error,
    refresh: () => contestId && fetchQuests(contestId),
  }
}
