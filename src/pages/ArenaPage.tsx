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
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚔️</div>
          <p className="text-parchment text-xl">Loading Arena...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col">
      <Navbar warrior={warrior} timeRemaining={timeRemaining} isContestActive={isContestActive} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Quest List + Details */}
        <div className="w-1/3 border-r border-stone overflow-y-auto p-4 space-y-4">
          <h2 className="text-2xl font-serif font-bold text-gold mb-4">Quests</h2>

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
            <div className="mt-6 p-4 bg-dark-surface border border-stone rounded-lg">
              <h3 className="text-xl font-serif font-bold text-gold mb-3">
                {selectedQuest.title}
              </h3>
              <div className="prose prose-invert prose-sm max-w-none">
                <div
                  className="text-gray-300 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: selectedQuest.description }}
                />
              </div>

              {/* Sample Test Cases */}
              {selectedQuest.test_cases.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-parchment mb-2">
                    Sample Test Cases:
                  </h4>
                  <div className="space-y-2">
                    {selectedQuest.test_cases.map((tc, idx) => (
                      <div
                        key={tc.id}
                        className="bg-shadow p-3 rounded border border-stone text-xs"
                      >
                        <p className="text-gray-400 mb-1">Test Case {idx + 1}</p>
                        <div className="space-y-1">
                          <div>
                            <span className="text-gray-400">Input: </span>
                            <code className="text-parchment">{tc.input}</code>
                          </div>
                          <div>
                            <span className="text-gray-400">Expected Output: </span>
                            <code className="text-parchment">{tc.expected_output}</code>
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
        <div className="flex-1 flex flex-col p-4">
          {selectedQuest ? (
            <>
              <div className="flex-1 mb-4">
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
                className="w-full bg-gold hover:bg-gold-light text-dark-bg font-serif font-bold py-3 px-6 rounded transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 mb-4"
              >
                {submitting ? 'Submitting...' : isContestOver ? 'Contest Ended' : 'Submit Solution'}
              </button>

              {/* Result */}
              {result && <SubmissionResult result={result} onClose={() => setResult(null)} />}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-xl">Select a quest to start coding</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
