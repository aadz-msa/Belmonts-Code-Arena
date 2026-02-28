# Deployment Guide

## Prerequisites

1. **Node.js 18+** and npm installed
2. **Supabase account** (https://supabase.com)
3. **RapidAPI account** with Judge0 API access (https://rapidapi.com/judge0-official/api/judge0-ce)
4. **Vercel account** (https://vercel.com) for frontend deployment

---

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose organization, name your project (e.g., "belmonts-code-arena")
4. Set a strong database password
5. Choose a region close to your users
6. Wait for project initialization (~2 minutes)

### 1.2 Run Database Migrations

1. Navigate to **SQL Editor** in Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and click "Run"
4. Verify all tables are created (check **Table Editor**)
5. Run `supabase/migrations/002_seed_data.sql` to add sample quests

### 1.3 Enable Realtime

1. Go to **Database** → **Replication**
2. Find the `warriors` table
3. Toggle "Enable Realtime" to ON
4. Save changes

### 1.4 Get API Credentials

1. Go to **Settings** → **API**
2. Copy **Project URL** (e.g., `https://your-project.supabase.co`)
3. Copy **anon public** key (safe to expose client-side)
4. Keep **service_role** key secure (never expose to client)

---

## Step 2: Judge0 API Setup

### 2.1 Get RapidAPI Key

1. Go to https://rapidapi.com/judge0-official/api/judge0-ce
2. Sign up / Log in
3. Subscribe to a plan:
   - **Free tier**: ~100 submissions/day (good for testing)
   - **Basic tier**: ~500 submissions/day ($10/month)
   - **Pro tier**: Unlimited ($50/month, recommended for contests)
4. Copy your **X-RapidAPI-Key** from the "Code Snippets" section

### 2.2 Test Judge0 (Optional)

You can test the API using curl:

```bash
curl -X POST "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false" \
  -H "Content-Type: application/json" \
  -H "X-RapidAPI-Key: YOUR_KEY" \
  -H "X-RapidAPI-Host: judge0-ce.p.rapidapi.com" \
  -d '{
    "source_code": "print(\"Hello World\")",
    "language_id": 71,
    "stdin": ""
  }'
```

---

## Step 3: Deploy Supabase Edge Function

### 3.1 Install Supabase CLI

```bash
# macOS / Linux
brew install supabase/tap/supabase

# Windows (via Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Or via npm (cross-platform)
npm install -g supabase
```

### 3.2 Login and Link Project

```bash
# Login to Supabase
supabase login

# Link to your project (get ref from project settings)
supabase link --project-ref your-project-ref
```

### 3.3 Set Secrets

```bash
supabase secrets set JUDGE0_API_KEY=your_rapidapi_key
supabase secrets set JUDGE0_HOST=judge0-ce.p.rapidapi.com
```

### 3.4 Deploy Edge Function

```bash
cd "Belmonts Code Arena"
supabase functions deploy submit-code
```

Verify deployment in Supabase Dashboard → **Edge Functions**.

---

## Step 4: Frontend Deployment (Vercel)

### 4.1 Create `.env.local`

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4.2 Test Locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000 to test the app.

### 4.3 Deploy to Vercel

#### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts:
# - Link to existing project or create new
# - Framework preset: Vite
# - Build command: npm run build
# - Output directory: dist
```

#### Option B: Vercel Dashboard

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

### 4.4 Verify Deployment

Once deployed, test:
1. Enter a warrior name
2. Select a quest
3. Submit code
4. Check leaderboard updates in real-time

---

## Step 5: Configure Contest Times

Update the contest start/end times in Supabase:

1. Go to **Table Editor** → `contests`
2. Edit the contest row
3. Set `start_time` and `end_time` in UTC (e.g., `2026-03-01 10:00:00+00`)
4. Set `is_active` to `true`
5. Save

---

## Step 6: Add More Quests (Optional)

To add custom quests:

1. Go to **Table Editor** → `quests`
2. Insert new row:
   - `title`: Problem title
   - `description`: Markdown-formatted problem statement
   - `difficulty`: Easy / Medium / Hard
   - `base_xp`: 100 / 250 / 500
   - `contest_id`: Your contest UUID
3. Go to `test_cases` table
4. Add test cases for the quest:
   - `quest_id`: The quest UUID
   - `input`: Test input
   - `expected_output`: Expected output
   - `is_hidden`: `true` for hidden test cases, `false` for sample test cases

---

## Troubleshooting

### Edge Function Fails

- Check logs: `supabase functions logs submit-code`
- Verify secrets are set: `supabase secrets list`
- Test locally: `supabase functions serve submit-code`

### Frontend Can't Connect to Supabase

- Verify `.env.local` has correct URL and anon key
- Check browser console for CORS errors
- Ensure RLS policies are enabled (see schema SQL)

### Judge0 Returns Errors

- Check your RapidAPI subscription status
- Verify API key in Edge Function secrets
- Test Judge0 API directly with curl (see Step 2.2)

### Leaderboard Not Updating

- Verify Realtime is enabled on `warriors` table
- Check browser console for WebSocket errors
- Ensure publication includes warriors: `ALTER PUBLICATION supabase_realtime ADD TABLE warriors;`

---

## Production Checklist

- [ ] Database schema deployed
- [ ] Seed data added
- [ ] RLS policies enabled
- [ ] Realtime enabled on warriors table
- [ ] Edge Function deployed
- [ ] Edge Function secrets configured
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in Vercel
- [ ] Contest times configured
- [ ] Test full submission flow
- [ ] Test leaderboard real-time updates
- [ ] Monitor Judge0 API usage
- [ ] Set up error monitoring (e.g., Sentry)

---

## Scaling Considerations

For contests with 100+ participants:

1. **Upgrade Supabase to Pro** ($25/month) for better performance
2. **Upgrade Judge0 to Pro tier** for higher rate limits
3. **Add database indexes** (already included in schema)
4. **Enable Vercel Analytics** to monitor frontend performance
5. **Consider self-hosting Judge0** for complete control

---

## Support

- Supabase Docs: https://supabase.com/docs
- Judge0 Docs: https://ce.judge0.com
- Vercel Docs: https://vercel.com/docs
- Monaco Editor: https://microsoft.github.io/monaco-editor/

For issues, check the README.md or open an issue on GitHub.
