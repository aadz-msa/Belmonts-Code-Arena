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
      <div className="min-h-screen bg-dark-bg flex flex-col">
        <Navbar warrior={warrior} />

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl mb-4 block">⏱️</span>
            <h2 className="text-3xl font-serif font-bold text-gold mb-4">
              Contest In Progress
            </h2>
            <p className="text-gray-400 mb-6">
              Results will be available after the contest ends.
            </p>
            <Link
              to="/arena"
              className="inline-block bg-gold hover:bg-gold-light text-dark-bg font-serif font-bold py-3 px-6 rounded transition-all"
            >
              Back to Arena
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
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar warrior={warrior} />

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-serif font-bold text-gold mb-3 animate-[flicker_2s_ease-in-out_infinite]">
              ⚔️ Contest Complete ⚔️
            </h1>
            <p className="text-xl text-parchment">
              {contest?.name}
            </p>
            <p className="text-gray-400 mt-2">
              The battle has ended. Behold the champions!
            </p>
          </div>

          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-serif font-bold text-gold mb-6 text-center">
                🏆 Champions 🏆
              </h2>
              <div className="flex items-end justify-center space-x-4">
                {/* 2nd Place */}
                {topThree[1] && (
                  <div className="flex flex-col items-center">
                    <div className="text-4xl mb-2">🥈</div>
                    <div className="bg-dark-surface border-2 border-gray-400 rounded-lg p-6 w-48 text-center">
                      <p className="text-2xl font-bold text-parchment mb-1">
                        {topThree[1].warrior.name}
                      </p>
                      {topThree[1].warrior.clan && (
                        <p className="text-sm text-gray-400 mb-3">
                          {topThree[1].warrior.clan}
                        </p>
                      )}
                      <p className="text-3xl font-bold text-gold">
                        {topThree[1].warrior.xp} XP
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {topThree[1].warrior.solved_count} solved
                      </p>
                    </div>
                  </div>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <div className="flex flex-col items-center">
                    <div className="text-5xl mb-2">👑</div>
                    <div className="bg-dark-surface border-4 border-gold rounded-lg p-8 w-56 text-center shadow-2xl transform scale-110">
                      <p className="text-3xl font-serif font-bold text-gold mb-2">
                        {topThree[0].warrior.name}
                      </p>
                      {topThree[0].warrior.clan && (
                        <p className="text-sm text-gray-400 mb-4">
                          {topThree[0].warrior.clan}
                        </p>
                      )}
                      <p className="text-4xl font-bold text-gold-light">
                        {topThree[0].warrior.xp} XP
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        {topThree[0].warrior.solved_count} solved
                      </p>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <div className="flex flex-col items-center">
                    <div className="text-4xl mb-2">🥉</div>
                    <div className="bg-dark-surface border-2 border-orange-600 rounded-lg p-6 w-48 text-center">
                      <p className="text-2xl font-bold text-parchment mb-1">
                        {topThree[2].warrior.name}
                      </p>
                      {topThree[2].warrior.clan && (
                        <p className="text-sm text-gray-400 mb-3">
                          {topThree[2].warrior.clan}
                        </p>
                      )}
                      <p className="text-3xl font-bold text-gold">
                        {topThree[2].warrior.xp} XP
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
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
            <div className="bg-gold/10 border border-gold rounded-lg p-6 mb-8">
              <h3 className="text-xl font-serif font-bold text-gold mb-3 text-center">
                Your Performance
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Rank</p>
                  <p className="text-3xl font-bold text-gold">
                    #{currentWarriorEntry.rank}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total XP</p>
                  <p className="text-3xl font-bold text-gold">
                    {currentWarriorEntry.warrior.xp}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Solved</p>
                  <p className="text-3xl font-bold text-gold">
                    {currentWarriorEntry.warrior.solved_count}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Link
              to="/leaderboard"
              className="bg-gold hover:bg-gold-light text-dark-bg font-serif font-bold py-3 px-6 rounded transition-all"
            >
              View Full Leaderboard
            </Link>
            <Link
              to="/arena"
              className="bg-shadow hover:bg-stone text-parchment font-serif font-bold py-3 px-6 rounded border border-stone transition-all"
            >
              Review Quests
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
