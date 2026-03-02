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
  }

  return (
    <nav className="glass-dark sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group"
            >
              <span 
                className="text-3xl transition-transform duration-300 group-hover:scale-110"
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))'
                }}
              >
                ⚔️
              </span>
              <h1 
                className="text-xl font-bold tracking-wide transition-colors duration-300 group-hover:text-[#f5d27a]"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: '#d4af37',
                  textShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
                }}
              >
                BELMONTS ARENA
              </h1>
            </Link>
          </div>

          {/* Navigation Links */}
          {warrior && (
            <div className="flex items-center space-x-8">
              <Link 
                to="/arena" 
                className={`relative py-2 font-medium text-sm uppercase tracking-wider transition-all duration-300 ${
                  isActive('/arena') 
                    ? 'text-[#f5d27a]' 
                    : 'text-[#f3f4f6] hover:text-[#d4af37]'
                }`}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.1em'
                }}
              >
                Arena
                {isActive('/arena') && (
                  <span 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                      boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)'
                    }}
                  />
                )}
                {!isActive('/arena') && (
                  <span 
                    className="absolute bottom-0 left-0 h-0.5 w-0 bg-[#d4af37] transition-all duration-300 group-hover:w-full"
                    style={{ 
                      boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)'
                    }}
                  />
                )}
              </Link>
              
              <Link
                to="/leaderboard"
                className={`relative py-2 font-medium text-sm uppercase tracking-wider transition-all duration-300 ${
                  isActive('/leaderboard') 
                    ? 'text-[#f5d27a]' 
                    : 'text-[#f3f4f6] hover:text-[#d4af37]'
                }`}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: '0.1em'
                }}
              >
                Leaderboard
                {isActive('/leaderboard') && (
                  <span 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                      background: 'linear-gradient(90deg, transparent, #d4af37, transparent)',
                      boxShadow: '0 0 8px rgba(212, 175, 55, 0.6)'
                    }}
                  />
                )}
              </Link>
            </div>
          )}

          {/* Right side: Timer + Warrior Info */}
          <div className="flex items-center space-x-4">
            {timeRemaining !== undefined && (
              <Timer timeRemaining={timeRemaining} />
            )}
            {warrior && (
              <div 
                className="flex items-center space-x-3 px-4 py-2 rounded"
                style={{
                  background: 'linear-gradient(135deg, #1a202c 0%, #111827 100%)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
                }}
              >
                <div className="text-right">
                  <p 
                    className="text-sm font-medium"
                    style={{ color: '#f3f4f6' }}
                  >
                    {warrior.name}
                  </p>
                  {warrior.clan && (
                    <p 
                      className="text-xs"
                      style={{ color: 'rgba(243, 244, 246, 0.5)' }}
                    >
                      {warrior.clan}
                    </p>
                  )}
                </div>
                <div 
                  className="text-right border-l pl-3"
                  style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}
                >
                  <p 
                    className="text-lg font-bold"
                    style={{ 
                      color: '#d4af37',
                      fontFamily: "'Cinzel', serif"
                    }}
                  >
                    {warrior.xp} XP
                  </p>
                  <p 
                    className="text-xs"
                    style={{ color: 'rgba(243, 244, 246, 0.5)' }}
                  >
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
