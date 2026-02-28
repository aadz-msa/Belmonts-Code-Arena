// Supabase Edge Function: submit-code
// Handles code submission, Judge0 execution, and XP calculation

import { createClient } from 'npm:@supabase/supabase-js@2'

// Types
interface SubmissionRequest {
  warrior_id: string
  quest_id: string
  contest_id: string
  language_id: number
  source_code: string
}

interface TestCase {
  id: string
  input: string
  expected_output: string
}

interface Judge0Submission {
  source_code: string
  language_id: number
  stdin: string
  expected_output: string
  cpu_time_limit: number
  memory_limit: number
}

interface Judge0Result {
  status: {
    id: number
    description: string
  }
  stdout: string | null
  stderr: string | null
  compile_output: string | null
  time: string | null
  memory: number | null
}

// Constants
const MAX_CODE_SIZE = 50 * 1024 // 50KB
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_SUBMISSIONS_PER_MINUTE = 5
const JUDGE0_CPU_LIMIT = 5
const JUDGE0_MEMORY_LIMIT = 256000
const POLL_INTERVAL = 2000 // 2 seconds
const MAX_POLL_ATTEMPTS = 15 // 30 seconds total

// Helper: Base64 encode
function base64Encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
}

// Helper: Base64 decode
function base64Decode(str: string): string {
  return decodeURIComponent(escape(atob(str)))
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Judge0 configuration
    const judge0ApiKey = Deno.env.get('JUDGE0_API_KEY')
    const judge0Host = Deno.env.get('JUDGE0_HOST') || 'judge0-ce.p.rapidapi.com'
    const judge0BaseUrl = `https://${judge0Host}`

    if (!judge0ApiKey) {
      throw new Error('Judge0 API key not configured')
    }

    // Parse request body
    const body: SubmissionRequest = await req.json()
    const { warrior_id, quest_id, contest_id, language_id, source_code } = body

    console.log('Received submission:', { warrior_id, quest_id, language_id })

    // Validation
    if (!warrior_id || !quest_id || !contest_id || !language_id || !source_code) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (source_code.length > MAX_CODE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'Code exceeds maximum size of 50KB' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 1: Validate contest time
    const { data: contest, error: contestError } = await supabase
      .from('contests')
      .select('start_time, end_time')
      .eq('id', contest_id)
      .single()

    if (contestError || !contest) {
      return new Response(
        JSON.stringify({ error: 'Contest not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date()
    const startTime = new Date(contest.start_time)
    const endTime = new Date(contest.end_time)

    if (now < startTime) {
      return new Response(
        JSON.stringify({ error: 'Contest has not started yet' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (now > endTime) {
      return new Response(
        JSON.stringify({ error: 'Contest has ended' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 2: Rate limiting
    const oneMinuteAgo = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString()
    const { count } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('warrior_id', warrior_id)
      .gte('submitted_at', oneMinuteAgo)

    if (count && count >= MAX_SUBMISSIONS_PER_MINUTE) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before submitting again.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Step 3: Fetch quest details
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('*, test_cases(*)')
      .eq('id', quest_id)
      .single()

    if (questError || !quest) {
      return new Response(
        JSON.stringify({ error: 'Quest not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const testCases: TestCase[] = quest.test_cases

    if (!testCases || testCases.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No test cases found for this quest' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Running ${testCases.length} test cases`)

    // Step 4: Submit to Judge0 batch API
    const judge0Submissions: Judge0Submission[] = testCases.map((tc) => ({
      source_code: base64Encode(source_code),
      language_id,
      stdin: base64Encode(tc.input),
      expected_output: base64Encode(tc.expected_output),
      cpu_time_limit: JUDGE0_CPU_LIMIT,
      memory_limit: JUDGE0_MEMORY_LIMIT,
    }))

    const batchResponse = await fetch(`${judge0BaseUrl}/submissions/batch?base64_encoded=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': judge0ApiKey,
        'X-RapidAPI-Host': judge0Host,
      },
      body: JSON.stringify({ submissions: judge0Submissions }),
    })

    if (!batchResponse.ok) {
      const errorText = await batchResponse.text()
      console.error('Judge0 batch submission failed:', errorText)
      throw new Error('Failed to submit to Judge0')
    }

    const batchData = await batchResponse.json()
    const tokens = batchData.map((item: any) => item.token).join(',')

    console.log('Judge0 tokens:', tokens)

    // Step 5: Poll Judge0 for results
    let results: Judge0Result[] = []
    let pollAttempts = 0

    while (pollAttempts < MAX_POLL_ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL))
      pollAttempts++

      const pollResponse = await fetch(
        `${judge0BaseUrl}/submissions/batch?tokens=${tokens}&base64_encoded=true`,
        {
          headers: {
            'X-RapidAPI-Key': judge0ApiKey,
            'X-RapidAPI-Host': judge0Host,
          },
        }
      )

      if (!pollResponse.ok) {
        console.error('Judge0 poll failed')
        continue
      }

      const pollData = await pollResponse.json()
      results = pollData.submissions

      // Check if all submissions are complete (status.id >= 3)
      const allComplete = results.every((r: Judge0Result) => r.status.id >= 3)

      if (allComplete) {
        console.log('All submissions complete')
        break
      }
    }

    if (results.length === 0) {
      throw new Error('Failed to get results from Judge0')
    }

    // Step 6: Evaluate results
    let passedCount = 0
    let totalCount = testCases.length
    let overallStatus = 'accepted'
    let executionTime = 0

    for (const result of results) {
      if (result.status.id === 3) {
        // Accepted
        passedCount++
      } else if (result.status.id === 4) {
        overallStatus = 'wrong_answer'
      } else if (result.status.id === 5) {
        overallStatus = 'time_limit_exceeded'
      } else if (result.status.id === 6) {
        overallStatus = 'compilation_error'
      } else if (result.status.id >= 7 && result.status.id <= 12) {
        overallStatus = 'runtime_error'
      }

      if (result.time) {
        executionTime += parseFloat(result.time)
      }
    }

    const allPassed = passedCount === totalCount

    console.log(`Results: ${passedCount}/${totalCount} passed, status: ${overallStatus}`)

    // Step 7: Calculate XP (only if accepted)
    let xpAwarded = 0

    if (allPassed) {
      overallStatus = 'accepted'

      // Check if already solved
      const { count: solvedCount } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('warrior_id', warrior_id)
        .eq('quest_id', quest_id)
        .eq('status', 'accepted')

      if (solvedCount === 0) {
        // Not solved yet, award XP
        xpAwarded = quest.base_xp

        // First solver bonus
        const { count: firstSolverCount } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('quest_id', quest_id)
          .eq('status', 'accepted')

        if (firstSolverCount === 0) {
          xpAwarded += 50 // First solver bonus
          console.log('First solver bonus: +50 XP')
        }

        // Speed bonus (under 5 minutes from contest start)
        const timeSinceStart = now.getTime() - startTime.getTime()
        if (timeSinceStart < 5 * 60 * 1000) {
          xpAwarded += 30
          console.log('Speed bonus: +30 XP')
        }

        // Wrong submission penalty
        const { count: wrongCount } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('warrior_id', warrior_id)
          .eq('quest_id', quest_id)
          .neq('status', 'accepted')

        if (wrongCount && wrongCount > 0) {
          const penalty = wrongCount * 5
          xpAwarded = Math.max(0, xpAwarded - penalty)
          console.log(`Wrong submission penalty: -${penalty} XP`)
        }

        console.log(`Total XP awarded: ${xpAwarded}`)

        // Update warrior
        const { error: updateError } = await supabase.rpc('update_warrior_xp', {
          w_id: warrior_id,
          xp_delta: xpAwarded,
        })

        if (updateError) {
          console.error('Failed to update warrior XP:', updateError)
        }

        // Manual update as fallback
        await supabase
          .from('warriors')
          .update({
            xp: supabase.raw(`xp + ${xpAwarded}`),
            solved_count: supabase.raw('solved_count + 1'),
            earliest_submission: supabase.raw(`COALESCE(earliest_submission, now())`),
          })
          .eq('id', warrior_id)
      }
    }

    // Step 8: Insert submission record
    const { error: insertError } = await supabase.from('submissions').insert({
      warrior_id,
      quest_id,
      contest_id,
      language_id,
      source_code,
      status: overallStatus,
      passed_count: passedCount,
      total_count: totalCount,
      xp_awarded: xpAwarded,
      execution_time: executionTime / totalCount, // Average
    })

    if (insertError) {
      console.error('Failed to insert submission:', insertError)
    }

    // Step 9: Return result
    const response = {
      status: overallStatus,
      passed_count: passedCount,
      total_count: totalCount,
      xp_awarded: xpAwarded,
      execution_time: executionTime / totalCount,
      message:
        overallStatus === 'accepted'
          ? `Congratulations! All test cases passed. +${xpAwarded} XP`
          : `${passedCount}/${totalCount} test cases passed.`,
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in submit-code function:', error)

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
