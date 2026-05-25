/**
 * Admin data API — returns full customer + usage data for the Dashwise panel.
 * Only accessible to emails in ADMIN_EMAILS. Uses service role key server-side.
 *
 * GET /.netlify/functions/admin-data
 * Authorization: Bearer <supabase_access_token>
 */
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL         ?? ''
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

export const handler: Handler = async (event) => {
  const cors = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: cors, body: '' }

  // ── Service-role client (bypasses RLS) ───────────────────────────────────────
  const db = createClient(SUPABASE_URL, SERVICE_KEY)

  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

  // Run all queries in parallel
  const [
    usersRes,
    prefsRes,
    profilesRes,
    convCountRes,
    todayConvRes,
    apiUsageRes,
    guestRes,
    dailyRes,
  ] = await Promise.all([
    // All auth users
    db.auth.admin.listUsers({ perPage: 1000 }),

    // Plan tiers + stripe info
    db.from('artist_preferences').select('user_id, plan_tier, bio, stripe_customer_id, created_at'),

    // Artist profiles (name + phone)
    db.from('artist_profiles').select('user_id, artist_name, phone_number, created_at'),

    // Total message count per user (all time)
    db.from('up_conversations')
      .select('user_id', { count: 'exact', head: false })
      .eq('role', 'user'),

    // Messages sent today
    db.from('up_conversations')
      .select('user_id', { count: 'exact', head: false })
      .eq('role', 'user')
      .gte('created_at', today),

    // API usage per user
    db.from('api_usage')
      .select('user_id, phone_number, input_tokens, output_tokens, cost_usd, created_at'),

    // Guest profiles (onboarding funnel)
    db.from('guest_profiles')
      .select('phone_number, artist_name, onboarding_step, message_count, created_at'),

    // Daily message counts for last 30 days
    db.rpc('admin_daily_messages', { since: thirtyDaysAgo }).maybeSingle(),
  ])

  // ── Aggregate per-user message counts ───────────────────────────────────────
  const msgByUser: Record<string, number> = {}
  for (const row of (convCountRes.data ?? [])) {
    msgByUser[row.user_id] = (msgByUser[row.user_id] ?? 0) + 1
  }

  const todayByUser: Record<string, number> = {}
  for (const row of (todayConvRes.data ?? [])) {
    todayByUser[row.user_id] = (todayByUser[row.user_id] ?? 0) + 1
  }

  // ── Aggregate API cost per user ──────────────────────────────────────────────
  const costByUser: Record<string, number> = {}
  const costByPhone: Record<string, number> = {}
  let totalCost = 0
  for (const row of (apiUsageRes.data ?? [])) {
    const c = Number(row.cost_usd)
    totalCost += c
    if (row.user_id) costByUser[row.user_id] = (costByUser[row.user_id] ?? 0) + c
    if (row.phone_number) costByPhone[row.phone_number] = (costByPhone[row.phone_number] ?? 0) + c
  }

  // ── Build profile lookups ────────────────────────────────────────────────────
  const prefsByUser: Record<string, { plan_tier: string; stripe_customer_id: string | null }> = {}
  for (const p of (prefsRes.data ?? [])) {
    prefsByUser[p.user_id] = { plan_tier: p.plan_tier ?? 'free', stripe_customer_id: p.stripe_customer_id ?? null }
  }

  const artistByUser: Record<string, { artist_name: string; phone_number: string | null }> = {}
  for (const p of (profilesRes.data ?? [])) {
    artistByUser[p.user_id] = { artist_name: p.artist_name ?? '', phone_number: p.phone_number ?? null }
  }

  // ── Compile users list ───────────────────────────────────────────────────────
  const users = (usersRes.data?.users ?? []).map(u => {
    const prefs  = prefsByUser[u.id]  ?? { plan_tier: 'free', stripe_customer_id: null }
    const artist = artistByUser[u.id] ?? { artist_name: '', phone_number: null }
    return {
      user_id:         u.id,
      email:           u.email ?? '',
      artist_name:     artist.artist_name,
      phone_number:    artist.phone_number,
      plan_tier:       prefs.plan_tier,
      has_stripe:      !!prefs.stripe_customer_id,
      messages_total:  msgByUser[u.id] ?? 0,
      messages_today:  todayByUser[u.id] ?? 0,
      api_cost_usd:    +(costByUser[u.id] ?? 0).toFixed(4),
      joined_at:       u.created_at,
      last_sign_in:    u.last_sign_in_at ?? null,
      confirmed:       !!u.confirmed_at,
    }
  }).sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime())

  // ── Guest funnel breakdown ───────────────────────────────────────────────────
  const funnelMap: Record<number, number> = {}
  for (const g of (guestRes.data ?? [])) {
    const s = g.onboarding_step ?? 0
    funnelMap[s] = (funnelMap[s] ?? 0) + 1
  }
  const guestFunnel = [0, 1, 2, 3, 4].map(step => ({ step, count: funnelMap[step] ?? 0 }))

  // ── Summary stats ────────────────────────────────────────────────────────────
  const totalUsers    = users.length
  const activeToday   = users.filter(u => u.messages_today > 0).length
  const totalMessages = users.reduce((s, u) => s + u.messages_total, 0)
  const planBreakdown = users.reduce((acc: Record<string, number>, u) => {
    acc[u.plan_tier] = (acc[u.plan_tier] ?? 0) + 1
    return acc
  }, {})

  return {
    statusCode: 200,
    headers: { ...cors, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      stats: {
        total_users:     totalUsers,
        active_today:    activeToday,
        total_messages:  totalMessages,
        total_cost_usd:  +totalCost.toFixed(4),
        guests_in_funnel: guestRes.data?.length ?? 0,
        plan_breakdown:  planBreakdown,
      },
      users,
      guest_funnel: guestFunnel,
      guests:       (guestRes.data ?? []).sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    }),
  }
}
