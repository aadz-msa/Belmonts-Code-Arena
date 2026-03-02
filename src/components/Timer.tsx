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

  const isCritical = timeRemaining > 0 && timeRemaining <= TIMER_THRESHOLDS.CRITICAL
  const isWarning = timeRemaining > TIMER_THRESHOLDS.CRITICAL && timeRemaining <= TIMER_THRESHOLDS.WARNING

  const getTimerText = () => {
    if (timeRemaining <= 0) return 'Contest Ended'
    return formatTime(timeRemaining)
  }

  return (
    <div 
      className="flex items-center space-x-3 px-4 py-2 rounded"
      style={{
        background: 'linear-gradient(135deg, #1a202c 0%, #111827 100%)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
      }}
    >
      <span 
        className="text-2xl"
        style={{
          filter: isCritical 
            ? 'drop-shadow(0 0 6px rgba(127, 29, 29, 0.8))' 
            : 'drop-shadow(0 0 4px rgba(212, 175, 55, 0.4))'
        }}
      >
        {isCritical ? '⏰' : '⏱️'}
      </span>
      <div>
        <p 
          className="text-xs uppercase tracking-wider mb-0.5"
          style={{ 
            color: 'rgba(243, 244, 246, 0.5)',
            fontFamily: "'Inter', sans-serif",
            letterSpacing: '0.1em'
          }}
        >
          Time Remaining
        </p>
        <p 
          className="text-lg font-mono font-bold"
          style={{
            color: isCritical ? '#7f1d1d' : isWarning ? '#d97706' : '#d4af37',
            textShadow: isCritical 
              ? '0 0 8px rgba(127, 29, 29, 0.5)' 
              : '0 0 4px rgba(212, 175, 55, 0.3)',
            animation: isCritical ? 'pulseRed 1.5s ease-in-out infinite' : 'none'
          }}
        >
          {getTimerText()}
        </p>
      </div>
    </div>
  )
}
