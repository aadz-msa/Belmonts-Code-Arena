import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWarrior } from '../hooks/useWarrior'
import { useContest } from '../hooks/useContest'

export function EntryPage() {
  const [name, setName] = useState('')
  const [clan, setClan] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { register, isRegistered, loading } = useWarrior()
  const { contest } = useContest()

  // Redirect if already registered
  useEffect(() => {
    if (isRegistered) {
      navigate('/arena')
    }
  }, [isRegistered, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    try {
      await register(name, clan || undefined, contest?.id)
      navigate('/arena')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register')
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cinematic Background with Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2400')`,
          filter: 'blur(3px) brightness(0.3)',
        }}
      />
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, 
            rgba(11, 15, 20, 0.95) 0%, 
            rgba(11, 15, 20, 0.7) 40%,
            rgba(11, 15, 20, 0.85) 100%)`
        }}
      />

      {/* Hero Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Crest/Logo Section with Gold Glow */}
          <div className="text-center mb-12 animate-[fadeIn_1s_ease-out]">
            <div className="inline-block mb-8 relative">
              <div 
                className="text-8xl mb-4"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(212, 175, 55, 0.6)) drop-shadow(0 0 60px rgba(212, 175, 55, 0.3))',
                  animation: 'subtleFlicker 3s ease-in-out infinite'
                }}
              >
                ⚔️
              </div>
            </div>
            
            <h1 
              className="text-6xl md:text-7xl font-bold mb-6"
              style={{
                fontFamily: "'Cinzel', serif",
                color: '#d4af37',
                textShadow: '0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3)',
                letterSpacing: '0.05em',
                animation: 'subtleFlicker 3s ease-in-out infinite'
              }}
            >
              BELMONTS
              <br />
              <span style={{ color: '#f5d27a' }}>CODE ARENA</span>
            </h1>
            
            <p 
              className="text-2xl md:text-3xl mb-4"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                color: '#f3f4f6',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)'
              }}
            >
              Enter the Arena. Prove Your Worth.
            </p>
            
            <div className="divider-gold max-w-xs mx-auto my-6" />
            
            <p className="text-base text-gray-400">
              A Royal Contest of Strategy, Skill, and Code
            </p>
          </div>

          {/* Registration Form - Gothic Card */}
          <div 
            className="card-gothic p-8 md:p-10 mb-6"
            style={{ animation: 'fadeIn 1s ease-out 0.3s backwards' }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Warrior Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-3"
                  style={{ 
                    color: '#f5d27a',
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem'
                  }}
                >
                  Warrior Name <span style={{ color: '#7f1d1d' }}>*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your warrior name..."
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9 ]+"
                  className="input-gothic w-full"
                />
                <p className="text-xs mt-2" style={{ color: 'rgba(243, 244, 246, 0.4)' }}>
                  3-20 characters, letters, numbers, and spaces only
                </p>
              </div>

              {/* Clan (Optional) */}
              <div>
                <label
                  htmlFor="clan"
                  className="block text-sm font-medium mb-3"
                  style={{ 
                    color: '#f5d27a',
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem'
                  }}
                >
                  Clan <span style={{ color: 'rgba(243, 244, 246, 0.4)' }}>(optional)</span>
                </label>
                <input
                  type="text"
                  id="clan"
                  value={clan}
                  onChange={(e) => setClan(e.target.value)}
                  placeholder="Represent your house..."
                  maxLength={30}
                  className="input-gothic w-full"
                />
                <p className="text-xs mt-2" style={{ color: 'rgba(243, 244, 246, 0.4)' }}>
                  Represent your team or organization
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  className="rounded p-4"
                  style={{
                    background: 'rgba(127, 29, 29, 0.2)',
                    border: '1px solid #7f1d1d'
                  }}
                >
                  <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="btn-primary w-full"
              >
                {loading ? 'Entering Arena...' : '⚔️ Enter the Arena ⚔️'}
              </button>
              
              {/* Learn More Button */}
              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                Learn More
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div 
            className="text-center text-sm"
            style={{ 
              color: 'rgba(243, 244, 246, 0.5)',
              animation: 'fadeIn 1s ease-out 0.6s backwards'
            }}
          >
            <p>No authentication required. Just a name and you're ready for glory.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
