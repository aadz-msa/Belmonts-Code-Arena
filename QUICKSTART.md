# Quick Start Guide

Get Belmonts Code Arena running locally in under 10 minutes!

## Prerequisites

- Node.js 18+ and npm
- A code editor (VS Code recommended)

---

## 1. Install Dependencies

```bash
cd "Belmonts Code Arena"
npm install
```

This will install:
- React, React Router, TypeScript
- Vite (build tool)
- Tailwind CSS
- Monaco Editor
- Supabase client SDK

---

## 2. Set Up Supabase (Free Tier)

### Create Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up (free, no credit card required)
3. Click "New Project"
4. Name: `belmonts-arena`
5. Database password: (save this somewhere safe)
6. Region: Choose closest to you
7. Click "Create new project" (takes ~2 minutes)

### Run Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Open `supabase/migrations/001_initial_schema.sql` from your project
3. Copy entire contents, paste into SQL Editor
4. Click **Run** (bottom right)
5. You should see "Success. No rows returned"
6. Go to **Table Editor** — you should see 5 tables: contests, warriors, quests, test_cases, submissions

### Add Sample Data
1. Still in **SQL Editor**, create a new query
2. Open `supabase/migrations/002_seed_data.sql`
3. Copy and paste
4. Click **Run**
5. Go to **Table Editor** → `quests` — you should see 5 sample quests

### Enable Realtime
1. Go to **Database** → **Replication**
2. Find `warriors` table in the list
3. Click the toggle to enable it (should turn green)
4. Click "Save"

### Get API Keys
1. Go to **Settings** → **API**
2. Copy these two values:
   - **Project URL**: something like `https://abcdefgh.supabase.co`
   - **anon public** key: a long JWT token

---

## 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.example .env.local
```

Edit `.env.local` and paste your Supabase credentials:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 4. Get Judge0 API Key (Free Tier)

For now, we'll use a mock/testing approach. For production, follow these steps:

1. Go to [https://rapidapi.com/judge0-official/api/judge0-ce](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Sign up for free
3. Click "Subscribe to Test" → Choose **Basic** plan (free, 50 requests/day)
4. Copy your **X-RapidAPI-Key**

---

## 5. Deploy Edge Function (Optional for Local Dev)

**Note:** For local development, you can skip this step initially and just test the UI. For full submission flow, follow these steps:

### Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (via npm)
npm install -g supabase
```

### Login and Link

```bash
supabase login
supabase link --project-ref YOUR-PROJECT-REF
```

(Find project ref in Supabase dashboard → Settings → General → Reference ID)

### Set Secrets

```bash
supabase secrets set JUDGE0_API_KEY=your-rapidapi-key
supabase secrets set JUDGE0_HOST=judge0-ce.p.rapidapi.com
```

### Deploy

```bash
supabase functions deploy submit-code
```

---

## 6. Update Contest Times

For testing, set the contest to start now and end in 2 hours:

1. In Supabase dashboard, go to **Table Editor** → `contests`
2. Click on the contest row to edit
3. Update `start_time`: Set to current UTC time (e.g., `2026-02-28 14:00:00+00`)
4. Update `end_time`: Set to 2 hours from now (e.g., `2026-02-28 16:00:00+00`)
5. Ensure `is_active` is `true`
6. Click "Save"

**Tip:** Use [https://www.timeanddate.com/worldclock/converter.html](https://www.timeanddate.com/worldclock/converter.html) to convert your local time to UTC.

---

## 7. Run the App Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the medieval-themed entry page!

---

## 8. Test the Flow

### Register as a Warrior
1. Enter a warrior name (e.g., "TestWarrior")
2. Optionally enter a clan
3. Click "Enter the Arena"

### Select a Quest
1. You'll see 5 quests in the left panel
2. Click on "The Sum of Swords" (easiest quest)
3. The details will load on the left, code editor on the right

### Write & Submit Code

**Python Solution:**
```python
a, b = map(int, input().split())
print(a + b)
```

**C++ Solution:**
```cpp
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
```

1. Select your language from the dropdown
2. Write the solution
3. Click "Submit Solution"

**Note:** If you haven't deployed the Edge Function yet, you'll see an error. The UI and navigation will still work!

### Check Leaderboard
1. Click "Leaderboard" in the navbar
2. You should see your warrior with 0 XP (or 100 XP if submission worked)
3. Open another browser window and register a second warrior
4. Submit from one window
5. Watch the other window update in real-time! 🔥

---

## 9. Common Issues

### "Missing Supabase environment variables"
- Make sure `.env.local` exists and has the correct keys
- Restart the dev server (`Ctrl+C` then `npm run dev`)

### Tables not showing in Supabase
- Re-run the `001_initial_schema.sql` script
- Check the SQL Editor for error messages

### Realtime not working
- Verify Realtime is enabled on `warriors` table
- Check browser console for WebSocket errors
- Try refreshing the page

### Edge Function fails
- Check logs: `supabase functions logs submit-code`
- Verify secrets: `supabase secrets list`
- Make sure RapidAPI subscription is active

---

## 10. Next Steps

### Customize Quests
1. Go to Supabase **Table Editor** → `quests`
2. Click "Insert row" to add your own problems
3. Add test cases in the `test_cases` table

### Customize Theme
1. Edit `src/styles/index.css` to change colors
2. Modify the `@theme` section for different medieval aesthetics

### Deploy to Production
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full production deployment guide.

---

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy Edge Function
supabase functions deploy submit-code

# View Edge Function logs
supabase functions logs submit-code

# Run TypeScript type check
npm run lint
```

---

## Need Help?

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- Review [README.md](./README.md) for feature overview

Happy coding! ⚔️
