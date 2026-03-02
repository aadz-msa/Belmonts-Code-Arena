import { STATUS_COLORS } from '../lib/constants'
import type { SubmissionResult as SubmissionResultType } from '../lib/types'

interface SubmissionResultProps {
  result: SubmissionResultType
  onClose?: () => void
}

export function SubmissionResult({ result, onClose }: SubmissionResultProps) {
  const getStatusEmoji = () => {
    switch (result.status) {
      case 'accepted':
        return '🏆'
      case 'wrong_answer':
        return '❌'
      case 'time_limit_exceeded':
        return '⏱️'
      case 'compilation_error':
        return '🔨'
      case 'runtime_error':
        return '💥'
      default:
        return '⚠️'
    }
  }

  const getStatusText = () => {
    switch (result.status) {
      case 'accepted':
        return 'Accepted'
      case 'wrong_answer':
        return 'Wrong Answer'
      case 'time_limit_exceeded':
        return 'Time Limit Exceeded'
      case 'compilation_error':
        return 'Compilation Error'
      case 'runtime_error':
        return 'Runtime Error'
      default:
        return 'Error'
    }
  }

  const isAccepted = result.status === 'accepted'

  return (
    <div
      className="rounded-lg p-6"
      style={{
        background: isAccepted
          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(17, 24, 39, 0.8) 100%)'
          : 'linear-gradient(135deg, rgba(127, 29, 29, 0.15) 0%, rgba(17, 24, 39, 0.8) 100%)',
        border: isAccepted
          ? '2px solid rgba(16, 185, 129, 0.5)'
          : '2px solid rgba(127, 29, 29, 0.5)',
        boxShadow: isAccepted
          ? '0 0 20px rgba(16, 185, 129, 0.2), 0 8px 32px rgba(0, 0, 0, 0.6)'
          : '0 0 20px rgba(127, 29, 29, 0.2), 0 8px 32px rgba(0, 0, 0, 0.6)',
        animation: 'fadeIn 0.4s ease-out'
      }}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span 
            className="text-5xl"
            style={{
              filter: isAccepted
                ? 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.6))'
                : 'drop-shadow(0 0 12px rgba(127, 29, 29, 0.6))'
            }}
          >
            {getStatusEmoji()}
          </span>
          <div>
            <h3
              className="text-3xl font-bold"
              style={{
                fontFamily: "'Cinzel', serif",
                color: isAccepted ? '#10b981' : '#ef4444',
                textShadow: isAccepted
                  ? '0 0 10px rgba(16, 185, 129, 0.4)'
                  : '0 0 10px rgba(239, 68, 68, 0.4)'
              }}
            >
              {getStatusText()}
            </h3>
            <p 
              className="text-sm mt-1"
              style={{ color: 'rgba(243, 244, 246, 0.6)' }}
            >
              {result.passed_count} / {result.total_count} test cases passed
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-3xl font-bold transition-colors duration-200"
            style={{ 
              color: 'rgba(243, 244, 246, 0.5)',
              lineHeight: 1
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#d4af37'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(243, 244, 246, 0.5)'}
          >
            ×
          </button>
        )}
      </div>

      {/* XP Award for accepted submissions */}
      {isAccepted && result.xp_awarded > 0 && (
        <div className="bg-gold/10 border border-gold rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-parchment font-medium">XP Awarded:</span>
            <span className="text-2xl font-bold text-gold">
              +{result.xp_awarded} XP
            </span>
          </div>
        </div>
      )}

      {/* Message */}
      {result.message && (
        <div className="bg-shadow rounded p-3 mb-4">
          <p className="text-sm text-gray-300">{result.message}</p>
        </div>
      )}

      {/* Execution time */}
      {result.execution_time !== undefined && (
        <div className="text-sm text-gray-400">
          Execution time: {result.execution_time.toFixed(3)}s
        </div>
      )}

      {/* Test results details (for debugging) */}
      {result.test_results && result.test_results.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-gold hover:text-gold-light">
            View test case details
          </summary>
          <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
            {result.test_results.map((test, idx) => (
              <div
                key={idx}
                className={`p-3 rounded border ${
                  test.passed
                    ? 'bg-green-900/10 border-green-700'
                    : 'bg-red-900/10 border-red-700'
                }`}
              >
                <p className="text-xs text-gray-400 mb-1">Test Case {idx + 1}</p>
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-gray-400">Input: </span>
                    <code className="text-parchment">{test.input || '(empty)'}</code>
                  </div>
                  <div>
                    <span className="text-gray-400">Expected: </span>
                    <code className="text-parchment">{test.expected}</code>
                  </div>
                  {!test.passed && (
                    <div>
                      <span className="text-gray-400">Your output: </span>
                      <code className="text-red-400">{test.actual || '(empty)'}</code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
