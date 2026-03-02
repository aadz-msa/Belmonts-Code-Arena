import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { CodeEditor } from '../components/CodeEditor'
import { QuestCard } from '../components/QuestCard'
import { SubmissionResult } from '../components/SubmissionResult'
import { useWarrior } from '../hooks/useWarrior'
import { useContest } from '../hooks/useContest'
import { useQuests } from '../hooks/useQuests'
import { supabase } from '../lib/supabase'
import { LANGUAGES, STORAGE_KEYS, API_ENDPOINTS } from '../lib/constants'
import type { Language, QuestWithTestCases, SubmissionResult as SubmissionResultType, Submission } from '../lib/types'

export function ArenaPage() {
  const navigate = useNavigate()
  const { warrior, isRegistered, loading: warriorLoading, refreshWarrior } = useWarrior()
  const { contest, timeRemaining, isContestActive, isContestOver } = useContest()
  const { quests, loading: questsLoading } = useQuests(contest?.id)

  const [selectedQuest, setSelectedQuest] = useState<QuestWithTestCases | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0])
  const [code, setCode] = useState<string>(LANGUAGES[0].template)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmissionResultType | null>(null)
  const [solvedQuests, setSolvedQuests] = useState<Set<string>>(new Set())
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([])

  // Redirect to entry if not registered
  useEffect(() => {
    if (!warriorLoading && !isRegistered) {
      navigate('/')
    }
  }, [isRegistered, warriorLoading, navigate])

  // Select first quest by default
  useEffect(() => {
    if (quests.length > 0 && !selectedQuest) {
      setSelectedQuest(quests[0])
    }
  }, [quests, selectedQuest])

  // Load code from localStorage for selected quest + language
  useEffect(() => {
    if (selectedQuest) {
      const cacheKey = `${STORAGE_KEYS.CODE_CACHE}_${selectedQuest.id}_${selectedLanguage.name}`
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        setCode(cached)
      } else {
        setCode(selectedLanguage.template)
      }
    }
  }, [selectedQuest, selectedLanguage])

  // Fetch solved quests
  useEffect(() => {
    if (warrior) {
      fetchSolvedQuests()
      fetchRecentSubmissions()
    }
  }, [warrior])

  const fetchSolvedQuests = async () => {
    if (!warrior) return

    const { data } = await supabase
      .from('submissions')
      .select('quest_id')
      .eq('warrior_id', warrior.id)
      .eq('status', 'accepted')

    if (data) {
      setSolvedQuests(new Set(data.map((s) => s.quest_id)))
    }
  }

  const fetchRecentSubmissions = async () => {
    if (!warrior) return

    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('warrior_id', warrior.id)
      .order('submitted_at', { ascending: false })
      .limit(10)

    if (data) {
      setRecentSubmissions(data)
    }
  }

  const handleLanguageChange = (lang: Language) => {
    // Save current code before switching
    if (selectedQuest) {
      const cacheKey = `${STORAGE_KEYS.CODE_CACHE}_${selectedQuest.id}_${selectedLanguage.name}`
      localStorage.setItem(cacheKey, code)
    }

    setSelectedLanguage(lang)
  }

  const handleCodeChange = (newCode: string) => {
    setCode(newCode)

    // Auto-save to localStorage
    if (selectedQuest) {
      const cacheKey = `${STORAGE_KEYS.CODE_CACHE}_${selectedQuest.id}_${selectedLanguage.name}`
      localStorage.setItem(cacheKey, newCode)
    }
  }

  const handleSubmit = async () => {
    if (!warrior || !selectedQuest || !contest) return

    setSubmitting(true)
    setResult(null)

    try {
      const { data, error } = await supabase.functions.invoke(API_ENDPOINTS.SUBMIT_CODE, {
        body: {
          warrior_id: warrior.id,
          quest_id: selectedQuest.id,
          contest_id: contest.id,
          language_id: selectedLanguage.judge0Id,
          source_code: code,
        },
      })

      if (error) throw error

      setResult(data)

      // Refresh warrior data and solved quests
      await refreshWarrior()
      await fetchSolvedQuests()
      await fetchRecentSubmissions()
    } catch (err) {
      console.error('Submission error:', err)
      setResult({
        status: 'error',
        passed_count: 0,
        total_count: 0,
        xp_awarded: 0,
        message: err instanceof Error ? err.message : 'Failed to submit code',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (warriorLoading || questsLoading) {
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
            Loading Arena...
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

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Quest List + Details */}
        <div 
          className="w-1/3 overflow-y-auto p-6 space-y-4"
          style={{
            background: 'linear-gradient(180deg, #111827 0%, #0b0f14 100%)',
            borderRight: '1px solid rgba(212, 175, 55, 0.2)',
            boxShadow: 'inset -1px 0 0 rgba(212, 175, 55, 0.1)'
          }}
        >
          <h2 
            className="text-3xl font-bold mb-6"
            style={{
              fontFamily: "'Cinzel', serif",
              color: '#d4af37',
              textShadow: '0 0 15px rgba(212, 175, 55, 0.3)',
              letterSpacing: '0.05em'
            }}
          >
            ⚔️ QUESTS
          </h2>

          {quests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              isSelected={selectedQuest?.id === quest.id}
              onSelect={() => setSelectedQuest(quest)}
              isSolved={solvedQuests.has(quest.id)}
            />
          ))}

          {/* Quest Details */}
          {selectedQuest && (
            <div 
              className="mt-6 p-6 rounded-lg card-gothic"
            >
              <h3 
                className="text-2xl font-bold mb-4"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: '#f5d27a',
                  textShadow: '0 0 10px rgba(212, 175, 55, 0.3)'
                }}
              >
                {selectedQuest.title}
              </h3>
              <div className="prose prose-invert prose-sm max-w-none">
                <div
                  className="whitespace-pre-wrap"
                  style={{ color: 'rgba(243, 244, 246, 0.9)' }}
                  dangerouslySetInnerHTML={{ __html: selectedQuest.description }}
                />
              </div>

              {/* Sample Test Cases */}
              {selectedQuest.test_cases.length > 0 && (
                <div className="mt-6">
                  <div className="divider-gold my-4" />
                  <h4 
                    className="text-sm font-bold mb-3 uppercase tracking-wider"
                    style={{ 
                      color: '#f5d27a',
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.1em'
                    }}
                  >
                    Sample Test Cases
                  </h4>
                  <div className="space-y-3">
                    {selectedQuest.test_cases.map((tc, idx) => (
                      <div
                        key={tc.id}
                        className="p-4 rounded text-xs"
                        style={{
                          background: 'rgba(17, 24, 39, 0.6)',
                          border: '1px solid rgba(212, 175, 55, 0.15)'
                        }}
                      >
                        <p 
                          className="mb-2 font-semibold"
                          style={{ color: 'rgba(243, 244, 246, 0.6)' }}
                        >
                          Test Case {idx + 1}
                        </p>
                        <div className="space-y-2">
                          <div>
                            <span style={{ color: 'rgba(243, 244, 246, 0.5)' }}>Input: </span>
                            <code 
                              className="font-mono"
                              style={{ color: '#f3f4f6' }}
                            >
                              {tc.input}
                            </code>
                          </div>
                          <div>
                            <span style={{ color: 'rgba(243, 244, 246, 0.5)' }}>Expected: </span>
                            <code 
                              className="font-mono"
                              style={{ color: '#f3f4f6' }}
                            >
                              {tc.expected_output}
                            </code>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel: Code Editor + Submit */}
        <div className="flex-1 flex flex-col p-6">
          {selectedQuest ? (
            <>
              <div className="flex-1 mb-6">
                <CodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  language={selectedLanguage}
                  onLanguageChange={handleLanguageChange}
                  disabled={submitting || isContestOver}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !code.trim() || isContestOver}
                className="w-full btn-primary py-4 text-base mb-4"
              >
                {submitting ? '⚔️ Submitting...' : isContestOver ? 'Contest Ended' : '⚔️ Submit Solution ⚔️'}
              </button>

              {/* Result */}
              {result && <SubmissionResult result={result} onClose={() => setResult(null)} />}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div 
                  className="text-6xl mb-4"
                  style={{
                    filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))',
                    opacity: 0.3
                  }}
                >
                  📜
                </div>
                <p 
                  className="text-xl"
                  style={{ 
                    color: 'rgba(243, 244, 246, 0.4)',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic'
                  }}
                >
                  Select a quest to begin your journey
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
