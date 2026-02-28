import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { useWarrior } from '../hooks/useWarrior'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useContest } from '../hooks/useContest'
import { STORAGE_KEYS } from '../lib/constants'

export function LeaderboardPage() {
  const navigate = useNavigate()
  const { warrior, isRegistered, loading: warriorLoading } = useWarrior()
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard()
  const { timeRemaining, isContestActive } = useContest()

  // Redirect to entry if not registered
  useEffect(() => {
    if (!warriorLoading && !isRegistered) {
      navigate('/')
    }
  }, [isRegistered, warriorLoading, navigate])

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '👑'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return null
    }
  }

  const isCurrentWarrior = (warriorId: string) => {
    return warrior?.id === warriorId
  }

  if (warriorLoading || leaderboardLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚔️</div>
          <p className="text-parchment text-xl">Loading Leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar warrior={warrior} timeRemaining={timeRemaining} isContestActive={isContestActive} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-gold mb-2">
              🏆 Leaderboard 🏆
            </h1>
            <p className="text-gray-400">
              Battle for glory! Top warriors ranked by XP and speed.
            </p>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-dark-surface border border-stone rounded-lg overflow-hidden shadow-2xl">
            <table className="w-full">
              <thead className="bg-shadow border-b border-stone">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-serif font-bold text-gold">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-serif font-bold text-gold">
                    Warrior
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-serif font-bold text-gold">
                    Clan
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-serif font-bold text-gold">
                    XP
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-serif font-bold text-gold">
                    Solved
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      No warriors yet. Be the first to solve a quest!
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry) => (
                    <tr
                      key={entry.warrior.id}
                      className={`border-b border-stone transition-all ${
                        isCurrentWarrior(entry.warrior.id)
                          ? 'bg-gold/10 border-gold'
                          : 'hover:bg-shadow'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getRankEmoji(entry.rank) && (
                            <span className="text-2xl">{getRankEmoji(entry.rank)}</span>
                          )}
                          <span
                            className={`text-lg font-bold ${
                              entry.rank <= 3 ? 'text-gold' : 'text-parchment'
                            }`}
                          >
                            #{entry.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-medium ${
                            isCurrentWarrior(entry.warrior.id)
                              ? 'text-gold-light font-bold'
                              : 'text-parchment'
                          }`}
                        >
                          {entry.warrior.name}
                          {isCurrentWarrior(entry.warrior.id) && (
                            <span className="ml-2 text-xs text-gold">(You)</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {entry.warrior.clan || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-gold font-bold text-lg">
                          {entry.warrior.xp}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-parchment font-medium">
                          {entry.warrior.solved_count}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Note */}
          <div className="mt-6 text-center text-sm text-gray-400">
            <p>🔥 Real-time updates • Sorted by XP then earliest submission</p>
          </div>
        </div>
      </div>
    </div>
  )
}
