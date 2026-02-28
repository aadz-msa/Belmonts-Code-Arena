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
      className={`rounded-lg border p-6 ${
        isAccepted
          ? 'bg-green-900/20 border-green-600'
          : 'bg-red-900/20 border-red-600'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">{getStatusEmoji()}</span>
          <div>
            <h3
              className={`text-2xl font-serif font-bold ${
                STATUS_COLORS[result.status]
              }`}
            >
              {getStatusText()}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              {result.passed_count} / {result.total_count} test cases passed
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-parchment text-2xl"
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
