# Belmonts Code Arena

A medieval-themed real-time competitive programming platform.

## Tech Stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Code Editor:** Monaco Editor
- **Backend:** Supabase (PostgreSQL + Realtime + Edge Functions)
- **Code Execution:** Judge0 API (via RapidAPI)
- **Deployment:** Vercel (frontend) + Supabase (backend)

## Features

- ⚔️ Medieval-themed dark UI with gold accents
- 🎯 No authentication required (warrior name + optional clan)
- 💻 Multi-language support (Python, C, C++, Java)
- ⏱️ Live contest timer with server-sync
- 🏆 Real-time leaderboard with Supabase Realtime
- 📊 XP-based scoring with bonuses and penalties
- 🔒 Secure code execution via Judge0 sandboxed containers

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- RapidAPI account with Judge0 access

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase URL and anon key.

3. **Set up Supabase:**
   - Create a new Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`
   - Enable Realtime on the `warriors` table
   - Deploy Edge Function:
     ```bash
     supabase functions deploy submit-code
     ```
   - Set secrets:
     ```bash
     supabase secrets set JUDGE0_API_KEY=your_rapidapi_key
     supabase secrets set JUDGE0_HOST=judge0-ce.p.rapidapi.com
     ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

### Deployment

**Frontend (Vercel):**
- Connect your GitHub repo to Vercel
- Framework preset: Vite
- Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Deploy

**Backend (Supabase):**
- Already deployed via `supabase functions deploy`

## Project Structure

```
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Route-level page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities, Supabase client, types
│   └── styles/           # Global styles
├── supabase/
│   ├── functions/        # Edge Functions (Deno runtime)
│   └── migrations/       # Database schema
└── public/               # Static assets
```

## Scoring System

**Base XP:**
- Easy: 100 XP
- Medium: 250 XP
- Hard: 500 XP

**Bonuses:**
- First solver: +50 XP
- Solve under 5 minutes: +30 XP

**Penalties:**
- Wrong submission: -5 XP per attempt

## Security & Anti-Cheat

- Server-side contest time validation
- Rate limiting (5 submissions per warrior per minute)
- Judge0 sandboxed execution (5s CPU limit, 256MB memory)
- Hidden test cases (only Edge Function can read)
- Row Level Security (RLS) on all database tables

## License

MIT
