# GrounduP Admin Dashboard — Backend Setup Guide

## Quick Start

You now have:
1. ✅ **Admin UI** — 5 tabs with full functionality (`src/pages/AdminDashboard.tsx`)
2. ✅ **SQL Schema** — Tables for bugs, model usage, creators (`ADMIN_SQL_SCHEMA.sql`)
3. ✅ **Netlify Function** — API endpoint (`netlify/functions/admin-data.ts`)

## Setup Steps

### 1. Create Supabase Tables

Go to your Supabase dashboard → SQL Editor → Run this:

```sql
-- Copy the entire contents of ADMIN_SQL_SCHEMA.sql and run it
-- Location: groundup-landing/ADMIN_SQL_SCHEMA.sql
```

This creates:
- `bugs` — issue tracking
- `model_usage` — AI model costs & token tracking
- `creators` — UGC influencer management

### 2. Add Service Role Key to Netlify

The backend function needs your Supabase **Service Role Key** (secret — not public).

**Get it:**
1. Supabase Dashboard → Settings → API → Service Role Key
2. Copy the key

**Add to Netlify:**
1. Netlify Dashboard → Your Site → Settings → Environment Variables
2. Add new variable:
   - **Key:** `SUPABASE_SERVICE_ROLE_KEY`
   - **Value:** (paste the service role key)

### 3. Set Admin Emails

Edit `netlify/functions/admin-data.ts`:

```typescript
const ADMIN_EMAILS = ['joseph@groundup.app', '1bstaragency@gmail.com']
```

Replace with emails that can access the admin panel.

### 4. Deploy to Netlify

```bash
cd groundup-landing
npm run build
# Netlify auto-deploys from git, OR:
netlify deploy
```

### 5. Test the Admin Dashboard

1. Go to `https://groundupapp.com/admin` (or your live URL)
2. Sign in with an email in `ADMIN_EMAILS`
3. Should load real data from Supabase

---

## What Each Backend Component Does

### admin-data.ts (Netlify Function)

**Endpoint:** `/.netlify/functions/admin-data`

**What it does:**
- Verifies user is authenticated (Supabase auth)
- Checks if email is in `ADMIN_EMAILS` allowlist
- Uses service role to bypass RLS and fetch all admin data
- Computes stats (total users, paid, active, bugs, costs, etc.)
- Returns JSON with users, tickets, bugs, model usage, creators

**Security:**
- Only authenticated Supabase users can call it
- Only admins (email allowlist) get data
- Service role key is server-side only (never exposed to client)

### Supabase Tables

#### bugs
```
id, user_id, title, description, severity, status, created_at, updated_at
```
- Severity: low | medium | high | critical
- Status: open | in_progress | resolved | closed
- RLS: Admins only (service role bypasses)

#### model_usage
```
id, user_id, model_name, tokens_input, tokens_output, cost_usd, created_at
```
- Tracks every AI model request
- Helps understand which models are expensive
- RLS: Admins only

#### creators
```
id, name, email, platform, followers, status, ref_code, referrals_count, created_at, updated_at
```
- Platform: TikTok, Instagram, YouTube, X / Twitter
- Followers: 10K, 50K, 250K, 1M+, etc.
- Status: pending | approved | active | rejected
- ref_code: Unique tracking code (groundupapp.com/r/{code})
- referrals_count: How many installs this creator drove
- RLS: Public can see (artists can find creators)

---

## Data Flow

```
User logs in at /admin
  ↓
AdminDashboard.tsx (frontend)
  ↓
Fetch /.netlify/functions/admin-data (with auth token)
  ↓
admin-data.ts verifies auth + admin email
  ↓
admin-data.ts queries Supabase (service role)
  ↓
Returns {stats, users, tickets, bugs, model_usage, creators}
  ↓
Frontend renders 5 tabs with live data
```

---

## Populating Data

Data flows in naturally as your app runs:

### bugs
- When users report issues in the app, create rows in this table
- Example: app crash → POST to `/api/bugs` → insert into table

### model_usage
- Track every AI call: log user_id, model, tokens, cost
- Example: After each Claude API call, log it

### creators
- Populate when creators apply via `/creators` form
- The CreatorOnboarding page should INSERT into this table

---

## Monitoring

Once deployed, the admin dashboard auto-updates with:
- **Users tab** — live artist counts, subscriptions, activity
- **Bugs tab** — reported issues (color-coded by severity)
- **Model Costs** — real-time AI spend per model & user
- **Creators tab** — influencer status, referral tracking
- **Tickets tab** — support issues

---

## Troubleshooting

### "Not authorized as admin"
- Check email is in `ADMIN_EMAILS` in `netlify/functions/admin-data.ts`
- Redeploy after editing

### "Failed to fetch data" error
- Service role key might be wrong or missing
- Check Netlify environment variables
- Check Supabase tables exist

### Empty tabs
- Tables are created but no data yet
- That's normal for new installations
- Data populates as the app runs and users interact

---

## Optional: Auto-populate Mock Data (for testing)

If you want to test with sample data before the app has real usage:

```sql
-- Insert test bug
INSERT INTO bugs (user_id, title, description, severity, status)
VALUES ('user-id-here', 'Test bug', 'Description', 'high', 'open');

-- Insert test model usage
INSERT INTO model_usage (user_id, model_name, tokens_input, tokens_output, cost_usd)
VALUES ('user-id-here', 'gpt-4-turbo', 50000, 20000, 2.50);

-- Insert test creator
INSERT INTO creators (name, email, platform, followers, status, ref_code)
VALUES ('Test Creator', 'creator@example.com', 'TikTok', '100K', 'active', 'test-creator-code');
```

---

## Files Modified/Created

- ✅ `src/pages/AdminDashboard.tsx` — UI (5 tabs, live data)
- ✅ `netlify/functions/admin-data.ts` — Backend API
- ✅ `ADMIN_SQL_SCHEMA.sql` — Database schema
- ✅ This guide

Deploy and you're live! 🚀
