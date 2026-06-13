# GrounduP Admin Dashboard — Enhanced UI

## Overview
Your admin dashboard at `/admin` has been enhanced with comprehensive tabs for managing:
- **Users** — subscriptions, activity, messaging
- **Tickets** — support issues
- **Bugs** — bug reports with severity tracking
- **Model Costs** — AI model usage and billing
- **Creators** — UGC influencer onboarding & tracking

---

## Design System
All on-brand with your existing system:
- **Background:** `#0A0A0A` (near black)
- **Primary accent:** `#FFD700` (gold)
- **Text:** White with opacity variants
- **Borders:** Subtle white @ 8% opacity
- **Radius:** 12-14px

---

## New Data Types Added

### Bug Reporting
```typescript
interface Bug {
  id: string
  user_id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  updated_at: string
}
```
**Color coding:** Red (critical), Orange (high), Gold (medium), Green (low)

### Model Usage & Costs
```typescript
interface ModelUsage {
  id: string
  user_id: string
  model_name: string
  tokens_input: number
  tokens_output: number
  cost_usd: number
  created_at: string
}
```
**Shows:** Per-user model costs, token tracking, total spend

### UGC Creators
```typescript
interface Creator {
  id: string
  name: string
  email: string
  platform: string           // TikTok, Instagram, YouTube, etc.
  followers: string          // '10K', '100K', '1M+', etc.
  status: 'pending' | 'approved' | 'active' | 'rejected'
  ref_code: string          // Unique tracking code (groundupapp.com/r/{code})
  referrals_count: number
  created_at: string
}
```
**Status colors:** Gold (pending), Gold (approved), Green (active), Red (rejected)

---

## Key Metrics Cards
Dashboard header now shows:
- ✓ Total users
- ✓ Paid users
- ✓ Active today
- ✓ Total releases
- ✓ Outreach sent
- ✓ uP spend (artist AI manager costs)
- ✓ **Model costs** (new)
- ✓ **Open bugs** (new)
- ✓ Open tickets
- ✓ **Active creators** (new)

---

## Tab Features

### 1. Users Tab
- Search by email or artist name
- Sortable by all columns
- Shows: plan tier, messages, costs, outreach, placements, streak

### 2. Tickets Tab
- Support issues with category & status
- Badges for open tickets
- Searchable by email

### 3. Bugs Tab (NEW)
- Severity badges (red/orange/gold/green)
- Status tracking (open → in progress → resolved → closed)
- Color-coded for quick scanning
- User ID reference

### 4. Model Costs Tab (NEW)
- Real-time model usage tracking
- Token counts (input/output)
- Cost per request
- Timestamp tracking
- Helps track which models are expensive

### 5. Creators Tab (NEW)
- UGC influencer management
- Status workflow: pending → approved → active
- Platform tracking (TikTok, Instagram, YouTube, Twitter)
- Follower band tracking
- Unique ref codes for tracking installs
- Referral counts (how many installs they drove)

---

## Backend Integration Ready

The frontend is built and ready. To connect your Supabase:

1. **Update the admin-data function** to return the new `AdminData` shape with:
   - `bugs: Bug[]`
   - `model_usage: ModelUsage[]`
   - `creators: Creator[]`
   - Updated `stats` with `open_bugs` and `active_creators`

2. **Update Supabase schema** with tables for:
   ```sql
   CREATE TABLE bugs (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     title TEXT,
     description TEXT,
     severity VARCHAR(20),
     status VARCHAR(20),
     created_at TIMESTAMPTZ,
     updated_at TIMESTAMPTZ
   );

   CREATE TABLE model_usage (
     id UUID PRIMARY KEY,
     user_id UUID REFERENCES users(id),
     model_name VARCHAR(100),
     tokens_input INT,
     tokens_output INT,
     cost_usd DECIMAL(10, 6),
     created_at TIMESTAMPTZ
   );

   CREATE TABLE creators (
     id UUID PRIMARY KEY,
     name VARCHAR(255),
     email VARCHAR(255) UNIQUE,
     platform VARCHAR(50),
     followers VARCHAR(50),
     status VARCHAR(20),
     ref_code VARCHAR(100) UNIQUE,
     referrals_count INT DEFAULT 0,
     created_at TIMESTAMPTZ
   );
   ```

3. **Test at:** `https://groundupapp.com/admin` (or your live URL)

---

## Files Modified
- `src/pages/AdminDashboard.tsx` — Enhanced with new tabs and data types

## Next Steps
1. Set up the Supabase tables above
2. Update your admin-data backend function
3. Deploy to Netlify
4. Test the tabs with real data
