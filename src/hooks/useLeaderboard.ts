import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Warrior, LeaderboardEntry } from '../lib/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel>()
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    fetchLeaderboard()
    subscribeToUpdates()

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('warriors')
        .select('*')
        .order('xp', { ascending: false })
        .order('earliest_submission', { ascending: true, nullsFirst: false })
        .limit(100)

      if (error) throw error

      const entries: LeaderboardEntry[] = data.map((warrior, index) => ({
        rank: index + 1,
        warrior,
      }))

      setLeaderboard(entries)
    } catch (err) {
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToUpdates = () => {
    channelRef.current = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'warriors',
        },
        (payload) => {
          handleWarriorUpdate(payload.new as Warrior)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'warriors',
        },
        (payload) => {
          handleWarriorInsert(payload.new as Warrior)
        }
      )
      .subscribe()
  }

  const handleWarriorUpdate = (updatedWarrior: Warrior) => {
    // Debounce updates to avoid too many re-renders
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      setLeaderboard((prev) => {
        const updated = prev.map((entry) =>
          entry.warrior.id === updatedWarrior.id
            ? { ...entry, warrior: updatedWarrior }
            : entry
        )

        // Re-sort and re-rank
        return sortAndRank(updated.map((e) => e.warrior))
      })
    }, 200)
  }

  const handleWarriorInsert = (newWarrior: Warrior) => {
    setLeaderboard((prev) => {
      const warriors = [...prev.map((e) => e.warrior), newWarrior]
      return sortAndRank(warriors)
    })
  }

  const sortAndRank = (warriors: Warrior[]): LeaderboardEntry[] => {
    const sorted = [...warriors].sort((a, b) => {
      // Primary: XP descending
      if (b.xp !== a.xp) return b.xp - a.xp

      // Secondary: Earliest submission ascending (earlier is better)
      if (!a.earliest_submission && !b.earliest_submission) return 0
      if (!a.earliest_submission) return 1
      if (!b.earliest_submission) return -1

      return (
        new Date(a.earliest_submission).getTime() -
        new Date(b.earliest_submission).getTime()
      )
    })

    return sorted.map((warrior, index) => ({
      rank: index + 1,
      warrior,
    }))
  }

  return {
    leaderboard,
    loading,
    refresh: fetchLeaderboard,
  }
}
