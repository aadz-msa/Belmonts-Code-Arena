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
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0b0f14' }}
      >
        <div className="text-center">
          <div 
            className="animate-spin text-6xl mb-4"
            style={{
              filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.5))'
            }}
          >
            ⚔️
          </div>
          <p 
            className="text-xl"
            style={{ 
              color: '#f3f4f6',
              fontFamily: "'Cinzel', serif"
            }}
          >
            Loading Leaderboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: '#0b0f14' }}
    >
      <Navbar warrior={warrior} timeRemaining={timeRemaining} isContestActive={isContestActive} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div 
              className="text-6xl mb-4"
              style={{
                filter: 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.5))'
              }}
            >
              🏆
            </div>
            <h1 
              className="text-5xl font-bold mb-3"
              style={{
                fontFamily: "'Cinzel', serif",
                color: '#d4af37',
                textShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                letterSpacing: '0.05em'
              }}
            >
              HALL OF GLORY
            </h1>
            <p 
              className="text-lg"
              style={{ 
                color: 'rgba(243, 244, 246, 0.6)',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic'
              }}
            >
              The mightiest warriors ranked by skill and valor
            </p>
          </div>

          {/* Leaderboard Table */}
          <div 
            className="card-gothic overflow-hidden"
            style={{ animation: 'fadeIn 0.6s ease-out' }}
          >
            <table className="w-full table-gothic">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left">
                    Warrior
                  </th>
                  <th className="px-6 py-4 text-left">
                    Clan
                  </th>
                  <th className="px-6 py-4 text-right">
                    XP
                  </th>
                  <th className="px-6 py-4 text-right">
                    Solved
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={5} 
                      className="px-6 py-12 text-center"
                      style={{ color: 'rgba(243, 244, 246, 0.4)' }}
                    >
                      <div className="text-4xl mb-3" style={{ opacity: 0.3 }}>🎯</div>
                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '1.125rem' }}>
                        No warriors yet. Be the first to solve a quest!
                      </p>
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry) => (
                    <tr
                      key={entry.warrior.id}
                      className="transition-all duration-200"
                      style={{
                        background: isCurrentWarrior(entry.warrior.id)
                          ? 'rgba(212, 175, 55, 0.08)'
                          : 'transparent',
                        borderBottom: isCurrentWarrior(entry.warrior.id)
                          ? '1px solid rgba(212, 175, 55, 0.3)'
                          : '1px solid rgba(45, 55, 72, 0.5)'
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {getRankEmoji(entry.rank) && (
                            <span 
                              className="text-3xl"
                              style={{
                                filter: entry.rank === 1 
                                  ? 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.6))' 
                                  : 'none'
                              }}
                            >
                              {getRankEmoji(entry.rank)}
                            </span>
                          )}
                          <span
                            className="text-xl font-bold"
                            style={{
                              color: entry.rank <= 3 ? '#d4af37' : '#f3f4f6',
                              fontFamily: "'Cinzel', serif",
                              textShadow: entry.rank === 1 ? '0 0 10px rgba(212, 175, 55, 0.4)' : 'none'
                            }}
                          >
                            #{entry.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="font-semibold text-base"
                          style={{
                            color: isCurrentWarrior(entry.warrior.id)
                              ? '#f5d27a'
                              : '#f3f4f6',
                            fontWeight: isCurrentWarrior(entry.warrior.id) ? 700 : 600
                          }}
                        >
                          {entry.warrior.name}
                          {isCurrentWarrior(entry.warrior.id) && (
                            <span 
                              className="ml-2 text-xs px-2 py-0.5 rounded"
                              style={{ 
                                color: '#d4af37',
                                background: 'rgba(212, 175, 55, 0.15)',
                                border: '1px solid rgba(212, 175, 55, 0.3)'
                              }}
                            >
                              YOU
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="text-sm"
                          style={{ color: 'rgba(243, 244, 246, 0.5)' }}
                        >
                          {entry.warrior.clan || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span 
                          className="text-xl font-bold"
                          style={{
                            color: '#d4af37',
                            fontFamily: "'Cinzel', serif"
                          }}
                        >
                          {entry.warrior.xp}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span 
                          className="text-base font-semibold"
                          style={{ color: '#f3f4f6' }}
                        >
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
          <div 
            className="mt-8 text-center text-sm"
            style={{ color: 'rgba(243, 244, 246, 0.5)' }}
          >
            <p>
              <span style={{ color: '#d4af37' }}>✨</span>
              {' '}Real-time updates • Ranked by XP and submission time{' '}
              <span style={{ color: '#d4af37' }}>✨</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
