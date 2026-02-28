import { TIMER_COLORS, TIMER_THRESHOLDS } from '../lib/constants'

interface TimerProps {
  timeRemaining: number
}

export function Timer({ timeRemaining }: TimerProps) {
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '00:00:00'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return [hours, minutes, secs]
      .map((val) => String(val).padStart(2, '0'))
      .join(':')
  }

  const getTimerColor = () => {
    if (timeRemaining <= 0) return 'text-gray-500'
    if (timeRemaining <= TIMER_THRESHOLDS.CRITICAL)
      return TIMER_COLORS.CRITICAL
    if (timeRemaining <= TIMER_THRESHOLDS.WARNING) return TIMER_COLORS.WARNING
    return TIMER_COLORS.NORMAL
  }

  const getTimerText = () => {
    if (timeRemaining <= 0) return 'Contest Ended'
    return formatTime(timeRemaining)
  }

  return (
    <div className="flex items-center space-x-2 bg-shadow px-4 py-2 rounded-lg border border-stone">
      <span className="text-xl">⏱️</span>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">
          Time Remaining
        </p>
        <p className={`text-lg font-mono font-bold ${getTimerColor()}`}>
          {getTimerText()}
        </p>
      </div>
    </div>
  )
}
