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
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-serif font-bold text-gold mb-3 animate-[flicker_2s_ease-in-out_infinite]">
            ⚔️ Belmonts Code Arena ⚔️
          </h1>
          <p className="text-xl text-parchment font-serif italic">
            Enter the Arena. Prove Your Worth.
          </p>
          <p className="text-gray-400 mt-4">
            A medieval-themed competitive programming contest
          </p>
        </div>

        {/* Registration Form */}
        <div className="bg-dark-surface border border-stone rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Warrior Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-parchment mb-2"
              >
                Warrior Name <span className="text-blood-red">*</span>
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
                className="w-full px-4 py-2 bg-dark-bg border border-stone rounded focus:outline-none focus:border-gold text-parchment placeholder-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                3-20 characters, letters, numbers, and spaces only
              </p>
            </div>

            {/* Clan (Optional) */}
            <div>
              <label
                htmlFor="clan"
                className="block text-sm font-medium text-parchment mb-2"
              >
                Clan <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                id="clan"
                value={clan}
                onChange={(e) => setClan(e.target.value)}
                placeholder="Enter your clan..."
                maxLength={30}
                className="w-full px-4 py-2 bg-dark-bg border border-stone rounded focus:outline-none focus:border-gold text-parchment placeholder-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Represent your team or organization
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-600 rounded p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-gold hover:bg-gold-light text-dark-bg font-serif font-bold py-3 px-6 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? 'Entering Arena...' : 'Enter the Arena'}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>No authentication required. Just a name and you're ready to battle!</p>
        </div>
      </div>
    </div>
  )
}
