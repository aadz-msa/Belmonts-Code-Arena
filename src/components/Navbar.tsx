import { Link, useLocation } from 'react-router-dom'
import { Timer } from './Timer'
import type { Warrior } from '../lib/types'

interface NavbarProps {
  warrior?: Warrior | null
  timeRemaining?: number
  isContestActive?: boolean
}

export function Navbar({ warrior, timeRemaining, isContestActive }: NavbarProps) {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
      ? 'text-gold-light border-b-2 border-gold'
      : 'text-parchment hover:text-gold transition-colors'
  }

  return (
    <nav className="bg-dark-surface border-b border-stone shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">⚔️</span>
              <h1 className="text-xl font-serif font-bold text-gold">
                Belmonts Code Arena
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          {warrior && (
            <div className="flex items-center space-x-6">
              <Link to="/arena" className={`${isActive('/arena')} font-medium`}>
                Arena
              </Link>
              <Link
                to="/leaderboard"
                className={`${isActive('/leaderboard')} font-medium`}
              >
                Leaderboard
              </Link>
            </div>
          )}

          {/* Right side: Timer + Warrior Info */}
          <div className="flex items-center space-x-4">
            {timeRemaining !== undefined && (
              <Timer timeRemaining={timeRemaining} />
            )}
            {warrior && (
              <div className="flex items-center space-x-3 bg-shadow px-4 py-2 rounded-lg border border-stone">
                <div className="text-right">
                  <p className="text-sm font-medium text-parchment">
                    {warrior.name}
                  </p>
                  {warrior.clan && (
                    <p className="text-xs text-gray-400">{warrior.clan}</p>
                  )}
                </div>
                <div className="text-right border-l border-stone pl-3">
                  <p className="text-lg font-bold text-gold">{warrior.xp} XP</p>
                  <p className="text-xs text-gray-400">
                    {warrior.solved_count} solved
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
