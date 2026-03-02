import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { useWarrior } from '../hooks/useWarrior'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useContest } from '../hooks/useContest'

export function ResultsPage() {
  const navigate = useNavigate()
  const { warrior, isRegistered, loading: warriorLoading } = useWarrior()
  const { leaderboard } = useLeaderboard()
  const { contest, isContestOver } = useContest()

  // Redirect to entry if not registered
  useEffect(() => {
    if (!warriorLoading && !isRegistered) {
      navigate('/')
    }
  }, [isRegistered, warriorLoading, navigate])

  // Show message if contest is still active
  if (!isContestOver) {
    return (
      <div 
        className="min-h-screen flex flex-col"
        style={{ background: '#0b0f14' }}
      >
        <Navbar warrior={warrior} />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span 
              className="text-6xl mb-6 block"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.4))'
              }}
            >
              ⏱️
            </span>
            <h2 
              className="text-4xl font-bold mb-4"
              style={{
                fontFamily: "'Cinzel', serif",
                color: '#d4af37',
                textShadow: '0 0 15px rgba(212, 175, 55, 0.3)'
              }}
            >
              Contest In Progress
            </h2>
            <p 
              className="text-lg mb-8"
              style={{ 
                color: 'rgba(243, 244, 246, 0.6)',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic'
              }}
            >
              Results will be revealed when the battle concludes.
            </p>
            <Link
              to="/arena"
              className="btn-primary inline-block"
            >
              ⚔️ Back to Arena
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const topThree = leaderboard.slice(0, 3)
  const currentWarriorEntry = leaderboard.find(
    (entry) => entry.warrior.id === warrior?.id
  )

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ background: '#0b0f14' }}
    >
      <Navbar warrior={warrior} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 
              className="text-6xl font-bold mb-4"
              style={{
                fontFamily: "'Cinzel', serif",
                color: '#d4af37',
                textShadow: '0 0 30px rgba(212, 175, 55, 0.5)',
                letterSpacing: '0.05em',
                animation: 'subtleFlicker 3s ease-in-out infinite'
              }}
            >
              ⚔️ BATTLE CONCLUDED ⚔️
            </h1>
            <p 
              className="text-2xl mb-3"
              style={{ 
                color: '#f5d27a',
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic'
              }}
            >
              {contest?.name}
            </p>
            <div className="divider-gold max-w-md mx-auto my-6" />
            <p 
              className="text-lg"
              style={{ color: 'rgba(243, 244, 246, 0.6)' }}
            >
              The warriors have been tested. Glory to the victors!
            </p>
          </div>

          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className="mb-16">
              <h2 
                className="text-3xl font-bold mb-10 text-center"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: '#d4af37',
                  textShadow: '0 0 15px rgba(212, 175, 55, 0.3)',
                  letterSpacing: '0.05em'
                }}
              >
                🏆 HALL OF CHAMPIONS 🏆
              </h2>
              <div className="flex items-end justify-center space-x-6">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div className="flex flex-col items-center">
                    <div 
                      className="text-5xl mb-4"
                      style={{
                        filter: 'drop-shadow(0 0 12px rgba(192, 192, 192, 0.6))'
                      }}
                    >
                      🥈
                    </div>
                    <div 
                      className="card-gothic p-6 w-52 text-center"
                      style={{
                        border: '2px solid #c0c0c0',
                        boxShadow: '0 0 20px rgba(192, 192, 192, 0.3), 0 8px 32px rgba(0, 0, 0, 0.6)',
                        animation: 'fadeIn 0.8s ease-out 0.2s backwards'
                      }}
                    >
                      <p 
                        className="text-2xl font-bold mb-1"
                        style={{ color: '#f3f4f6' }}
                      >
                        {topThree[1].warrior.name}
                      </p>
                      {topThree[1].warrior.clan && (
                        <p 
                          className="text-sm mb-3"
                          style={{ color: 'rgba(243, 244, 246, 0.5)' }}
                        >
                          {topThree[1].warrior.clan}
                        </p>
                      )}
                      <p 
                        className="text-3xl font-bold"
                        style={{
                          color: '#c0c0c0',
                          fontFamily: "'Cinzel', serif"
                        }}
                      >
                        {topThree[1].warrior.xp} XP
                      </p>
                      <p 
                        className="text-sm mt-2"
                        style={{ color: 'rgba(243, 244, 246, 0.5)' }}
                      >
                        {topThree[1].warrior.solved_count} solved
                      </p>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <div className="flex flex-col items-center">
                    <div 
                      className="text-6xl mb-4"
                      style={{
                        filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.8))',
                        animation: 'goldGlow 2s ease-in-out infinite'
                      }}
                    >
                      👑
                    </div>
                    <div 
                      className="card-gothic p-8 w-64 text-center transform scale-110"
                      style={{
                        border: '3px solid #d4af37',
                        boxShadow: '0 0 30px rgba(212, 175, 55, 0.5), 0 12px 48px rgba(0, 0, 0, 0.7)',
                        animation: 'fadeIn 0.8s ease-out backwards'
                      }}
                    >
                      <p 
                        className="text-3xl font-bold mb-2"
                        style={{
                          fontFamily: "'Cinzel', serif",
                          color: '#d4af37',
                          textShadow: '0 0 15px rgba(212, 175, 55, 0.5)'
                        }}
                      >
                        {topThree[0].warrior.name}
                      </p>
                      {topThree[0].warrior.clan && (
                        <p 
                          className="text-sm mb-4"
                          style={{ color: 'rgba(243, 244, 246, 0.6)' }}
                        >
                          {topThree[0].warrior.clan}
                        </p>
                      )}
                      <p 
                        className="text-5xl font-bold"
                        style={{
                          color: '#f5d27a',
                          fontFamily: "'Cinzel', serif",
                          textShadow: '0 0 20px rgba(212, 175, 55, 0.5)'
                        }}
                      >
                        {topThree[0].warrior.xp} XP
                      </p>
                      <p 
                        className="text-sm mt-2"
                        style={{ color: 'rgba(243, 244, 246, 0.5)' }}
                      >
                        {topThree[0].warrior.solved_count} solved
                      </p>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <div className="flex flex-col items-center">
                    <div 
                      className="text-5xl mb-4"
                      style={{
                        filter: 'drop-shadow(0 0 12px rgba(205, 127, 50, 0.6))'
                      }}
                    >
                      🥉
                    </div>
                    <div 
                      className="card-gothic p-6 w-52 text-center"
                      style={{
                        border: '2px solid #cd7f32',
                        boxShadow: '0 0 20px rgba(205, 127, 50, 0.3), 0 8px 32px rgba(0, 0, 0, 0.6)',
                        animation: 'fadeIn 0.8s ease-out 0.4s backwards'
                      }}
                    >
                      <p 
                        className="text-2xl font-bold mb-1"
                        style={{ color: '#f3f4f6' }}
                      >
                        {topThree[2].warrior.name}
                      </p>
                      {topThree[2].warrior.clan && (
                        <p 
                          className="text-sm mb-3"
                          style={{ color: 'rgba(243, 244, 246, 0.5)' }}
                        >
                          {topThree[2].warrior.clan}
                        </p>
                      )}
                      <p 
                        className="text-3xl font-bold"
                        style={{
                          color: '#cd7f32',
                          fontFamily: "'Cinzel', serif"
                        }}
                      >
                        {topThree[2].warrior.xp} XP
                      </p>
                      <p 
                        className="text-sm mt-2"
                        style={{ color: 'rgba(243, 244, 246, 0.5)' }}
                      >
                        {topThree[2].warrior.solved_count} solved
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Warrior Stats */}
          {currentWarriorEntry && (
            <div 
              className="card-gothic p-8 mb-10"
              style={{
                border: '2px solid rgba(212, 175, 55, 0.4)',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(17, 24, 39, 0.6) 100%)'
              }}
            >
              <h3 
                className="text-2xl font-bold mb-6 text-center"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: '#f5d27a',
                  textShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
                }}
              >
                YOUR PERFORMANCE
              </h3>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p 
                    className="text-sm mb-2 uppercase tracking-wider"
                    style={{ color: 'rgba(243, 244, 246, 0.5)' }}
                  >
                    Rank
                  </p>
                  <p 
                    className="text-4xl font-bold"
                    style={{
                      color: '#d4af37',
                      fontFamily: "'Cinzel', serif"
                    }}
                  >
                    #{currentWarriorEntry.rank}
                  </p>
                </div>
                <div>
                  <p 
                    className="text-sm mb-2 uppercase tracking-wider"
                    style={{ color: 'rgba(243, 244, 246, 0.5)' }}
                  >
                    Total XP
                  </p>
                  <p 
                    className="text-4xl font-bold"
                    style={{
                      color: '#d4af37',
                      fontFamily: "'Cinzel', serif"
                    }}
                  >
                    {currentWarriorEntry.warrior.xp}
                  </p>
                </div>
                <div>
                  <p 
                    className="text-sm mb-2 uppercase tracking-wider"
                    style={{ color: 'rgba(243, 244, 246, 0.5)' }}
                  >
                    Solved
                  </p>
                  <p 
                    className="text-4xl font-bold"
                    style={{
                      color: '#d4af37',
                      fontFamily: "'Cinzel', serif"
                    }}
                  >
                    {currentWarriorEntry.warrior.solved_count}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center space-x-6">
            <Link
              to="/leaderboard"
              className="btn-primary"
            >
              🏆 View Full Leaderboard
            </Link>
            <Link
              to="/arena"
              className="btn-secondary"
            >
              📜 Review Quests
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
