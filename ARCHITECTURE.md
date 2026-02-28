# Architecture Overview

## System Design

Belmonts Code Arena is a full-stack real-time competitive programming platform with a medieval theme.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  React (Vite) + Tailwind CSS + Monaco Editor               │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             │ REST API                       │ WebSocket (Realtime)
             │                                │
┌────────────▼────────────────────────────────▼───────────────┐
│                      SUPABASE                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database (Warriors, Quests, Submissions)│   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Realtime Engine (Leaderboard Updates)             │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Edge Functions (submit-code) - Deno Runtime       │   │
│  └────────────┬────────────────────────────────────────┘   │
└───────────────┼──────────────────────────────────────────────┘
                │
                │ HTTPS (RapidAPI)
                │
┌───────────────▼──────────────────────────────────────────────┐
│               JUDGE0 API (Code Execution)                   │
│  Sandboxed containers, multi-language support              │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### Frontend (React + TypeScript)

**Technology Stack:**
- **React 18**: Component-based UI
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type safety
- **Tailwind CSS v4**: Utility-first styling with custom medieval theme
- **React Router v6**: Client-side routing
- **Monaco Editor**: VSCode-powered code editor
- **@supabase/supabase-js**: Supabase client SDK

**Key Pages:**
1. **Entry Page** (`/`): Warrior registration (name + optional clan)
2. **Arena Page** (`/arena`): Quest list, code editor, submission flow
3. **Leaderboard Page** (`/leaderboard`): Real-time ranked list
4. **Results Page** (`/results`): Post-contest summary

**State Management:**
- Custom React hooks for data fetching and state
- LocalStorage for warrior session persistence
- Supabase Realtime subscriptions for leaderboard updates

**Code Organization:**
```
src/
├── components/     # Reusable UI components
├── pages/          # Route-level pages
├── hooks/          # Custom hooks (useWarrior, useContest, etc.)
├── lib/            # Utilities, Supabase client, types, constants
└── styles/         # Global CSS with Tailwind directives
```

---

### Backend (Supabase)

**Technology Stack:**
- **PostgreSQL**: Relational database
- **Row Level Security (RLS)**: Security policies for anon access
- **Realtime**: WebSocket-based live updates
- **Edge Functions**: Serverless functions (Deno runtime)

**Database Schema:**

```sql
contests
├── id (UUID)
├── name
├── start_time (TIMESTAMPTZ)
├── end_time (TIMESTAMPTZ)
└── is_active (BOOLEAN)

warriors
├── id (UUID)
├── name (UNIQUE)
├── clan (nullable)
├── xp (INTEGER)
├── solved_count (INTEGER)
├── earliest_submission (TIMESTAMPTZ)
└── contest_id (FK → contests)

quests
├── id (UUID)
├── contest_id (FK → contests)
├── title
├── description (Markdown)
├── difficulty (Easy/Medium/Hard)
├── base_xp (100/250/500)
└── sort_order

test_cases
├── id (UUID)
├── quest_id (FK → quests)
├── input
├── expected_output
├── is_hidden (BOOLEAN)
└── sort_order

submissions
├── id (UUID)
├── warrior_id (FK → warriors)
├── quest_id (FK → quests)
├── contest_id (FK → contests)
├── language_id (50/54/62/71)
├── source_code
├── status (accepted/wrong_answer/etc.)
├── passed_count
├── total_count
├── xp_awarded
├── execution_time
└── submitted_at (TIMESTAMPTZ)
```

**Indexes:**
- `warriors(xp DESC, earliest_submission ASC)` — leaderboard query optimization
- `submissions(warrior_id, quest_id, status)` — duplicate check
- `submissions(contest_id, submitted_at)` — contest submissions

**RLS Policies:**
- `anon` role can SELECT, INSERT on most tables
- Hidden test cases only visible via service_role (Edge Function)
- Warriors can update their own data

---

### Edge Function: `submit-code`

**Purpose:** Handle code submission, execute via Judge0, calculate XP, update database.

**Flow:**

```
1. Receive submission (warrior_id, quest_id, language_id, source_code)
2. Validate contest time (now between start_time and end_time)
3. Rate limit check (max 5 submissions per warrior per minute)
4. Fetch quest + ALL test cases (including hidden)
5. Submit batch to Judge0 API (base64-encoded)
6. Poll Judge0 for results (max 30s)
7. Evaluate: count passed test cases
8. Calculate XP if all passed:
   - Base XP (from quest difficulty)
   - +50 XP if first solver
   - +30 XP if solved within 5 minutes of contest start
   - -5 XP per prior wrong submission
9. Update warriors table (increment xp, solved_count)
10. Insert submission record
11. Return result to client
```

**Security Measures:**
- Contest time validation (server-side)
- Rate limiting (5 submissions/minute)
- Code size limit (50KB)
- Judge0 sandboxing (CPU 5s, memory 256MB)
- Service role key used for hidden test cases

**Error Handling:**
- Invalid contest time → 403
- Rate limit exceeded → 429
- Judge0 timeout → poll timeout fallback
- Database errors → rollback, return 500

---

### Judge0 Integration

**Language IDs:**
- C (GCC 9.2.0): 50
- C++ (GCC 9.2.0): 54
- Java (OpenJDK 13.0.1): 62
- Python (3.8.1): 71

**Batch Submission:**
```json
POST /submissions/batch?base64_encoded=true
{
  "submissions": [
    {
      "source_code": "base64(code)",
      "language_id": 71,
      "stdin": "base64(input)",
      "expected_output": "base64(output)",
      "cpu_time_limit": 5,
      "memory_limit": 256000
    },
    ...
  ]
}
```

**Polling:**
```
GET /submissions/batch?tokens=token1,token2&base64_encoded=true
```

**Status Codes:**
- 1: In Queue
- 2: Processing
- 3: Accepted
- 4: Wrong Answer
- 5: Time Limit Exceeded
- 6: Compilation Error
- 7-12: Runtime Errors

---

## Data Flow: Code Submission

```
1. User writes code in Monaco Editor
2. Clicks "Submit Solution"
3. Frontend calls supabase.functions.invoke('submit-code')
4. Edge Function validates + fetches test cases
5. Edge Function submits to Judge0 batch API
6. Edge Function polls Judge0 every 2s (max 30s)
7. Judge0 executes code in sandboxed Docker containers
8. Edge Function evaluates results, calculates XP
9. Edge Function updates warriors table (triggers Realtime update)
10. Edge Function inserts submission record
11. Edge Function returns result to frontend
12. Frontend displays SubmissionResult component
13. Leaderboard updates in real-time (via Realtime subscription)
```

---

## Real-Time Leaderboard

**Mechanism:** Supabase Realtime (PostgreSQL logical replication)

**Setup:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE warriors;
```

**Client Subscription:**
```ts
supabase.channel('leaderboard-changes')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'warriors'
  }, (payload) => {
    // Update local state
  })
  .subscribe()
```

**Optimization:**
- Debounce updates (200ms) to avoid excessive re-renders
- Sort and rank on client-side
- Limit to top 100 warriors

---

## Security Considerations

### Frontend Security
- Environment variables prefixed with `VITE_` are public (anon key is designed to be public)
- No service_role key exposed to client
- LocalStorage UUID for session (not cryptographically secure, but acceptable for time-boxed contests)

### Backend Security
- RLS policies enforce anon role permissions
- Edge Function uses service_role for privileged operations
- Contest time validated server-side
- Rate limiting prevents spam
- Judge0 sandboxing prevents malicious code execution

### Potential Attack Vectors
1. **Duplicate warrior registration** — Mitigated by unique constraint on name
2. **Rate limit bypass** — Tracked by warrior_id and submitted_at timestamp
3. **Code injection** — Judge0 sandboxing prevents file system access, network access
4. **XP manipulation** — All XP calculations server-side, client cannot modify
5. **Hidden test case leak** — RLS ensures anon can only see is_hidden=false

---

## Scalability

**Current Capacity:**
- **Frontend (Vercel)**: Handles 10,000+ concurrent users on free tier
- **Supabase Free Tier**: 500MB database, 2GB bandwidth, 500K Realtime messages/month
- **Judge0 RapidAPI Free Tier**: ~100 submissions/day

**For 50 participants:**
- Expected submissions: ~500-1000 during a 2-hour contest
- Database size: <10MB
- Realtime messages: <5000
- **Verdict: Supabase free tier + RapidAPI basic tier sufficient**

**For 200+ participants:**
- Upgrade to Supabase Pro ($25/month)
- Upgrade to Judge0 Pro tier ($50/month) or self-host
- Add connection pooling (pgBouncer) for database
- Consider CDN for static assets (Vercel handles this)

---

## Deployment Environments

**Development:**
```
Frontend: http://localhost:3000 (Vite dev server)
Backend: Supabase local development (supabase start)
Edge Function: supabase functions serve submit-code
```

**Production:**
```
Frontend: https://belmonts-code-arena.vercel.app
Backend: https://your-project.supabase.co
Edge Function: https://your-project.supabase.co/functions/v1/submit-code
Judge0: https://judge0-ce.p.rapidapi.com
```

---

## Monitoring & Observability

**Recommended Tools:**
- **Vercel Analytics**: Frontend performance, page views
- **Supabase Dashboard**: Database queries, Edge Function logs
- **RapidAPI Dashboard**: Judge0 API usage, rate limits
- **Sentry (optional)**: Error tracking

**Key Metrics:**
- Submission success rate
- Average Judge0 execution time
- Leaderboard update latency
- Warrior registration rate
- Database query performance

---

## Future Enhancements

1. **Authentication** — Add optional OAuth for persistent accounts
2. **Team competitions** — Clan-based scoring and team leaderboards
3. **Practice mode** — Access quests after contest ends
4. **Editorial solutions** — Show optimal solutions post-contest
5. **Custom test cases** — Allow warriors to test with custom inputs
6. **Plagiarism detection** — Compare code similarity across submissions
7. **Mobile app** — React Native version
8. **AI hints** — Optional AI-powered hints for stuck warriors

---

## References

- **Supabase Docs**: https://supabase.com/docs
- **Judge0 Docs**: https://ce.judge0.com
- **Monaco Editor**: https://microsoft.github.io/monaco-editor/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Router**: https://reactrouter.com/

---

## License

MIT License - see LICENSE file for details.
