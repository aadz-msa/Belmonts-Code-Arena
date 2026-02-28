import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import type { Contest } from '../lib/types'

export function useContest() {
  const [contest, setContest] = useState<Contest | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isContestActive, setIsContestActive] = useState(false)
  const [isContestOver, setIsContestOver] = useState(false)
  const [loading, setLoading] = useState(true)
  const [serverTimeOffset, setServerTimeOffset] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    fetchContest()

    // Handle visibility change (tab sleep)
    const handleVisibilityChange = () => {
      if (!document.hidden && contest) {
        calculateTimeRemaining(contest)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchContest = async () => {
    try {
      // Fetch active contest and server time
      const { data, error } = await supabase
        .from('contests')
        .select('*, server_time:created_at')
        .eq('is_active', true)
        .single()

      if (error) throw error

      // Calculate server-client time offset
      const clientTime = Date.now()
      const serverTime = new Date().getTime() // Approximation; ideally use a DB function
      const offset = serverTime - clientTime
      setServerTimeOffset(offset)

      setContest(data)
      calculateTimeRemaining(data)
      startTimer(data)
    } catch (err) {
      console.error('Error fetching contest:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculateTimeRemaining = (contestData: Contest) => {
    const now = Date.now() + serverTimeOffset
    const startTime = new Date(contestData.start_time).getTime()
    const endTime = new Date(contestData.end_time).getTime()

    const hasStarted = now >= startTime
    const hasEnded = now >= endTime

    setIsContestActive(hasStarted && !hasEnded)
    setIsContestOver(hasEnded)

    if (hasEnded) {
      setTimeRemaining(0)
    } else if (!hasStarted) {
      // Contest hasn't started yet
      setTimeRemaining(Math.floor((startTime - now) / 1000))
    } else {
      // Contest is active
      setTimeRemaining(Math.floor((endTime - now) / 1000))
    }
  }

  const startTimer = (contestData: Contest) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      calculateTimeRemaining(contestData)
    }, 1000)
  }

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '00:00:00'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [hours, minutes, secs]
      .map((val) => String(val).padStart(2, '0'))
      .join(':')
  }

  return {
    contest,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isContestActive,
    isContestOver,
    loading,
  }
}
