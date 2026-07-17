import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const handler: Handler = async (_event) => {
  try {
    const supabaseUrl  = process.env.VITE_SUPABASE_URL || ''
    const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseUrl || !serviceKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Supabase env vars not configured (VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)' }),
      }
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    // ── Pull auth users (email, created_at, last_sign_in_at, confirmed) ───────
    const { data: authData, error: authErr } = await admin.auth.admin.listUsers({ perPage: 1000 })
    if (authErr) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `auth.admin.listUsers failed: ${authErr.message}` }),
      }
    }
    const authUsers = authData?.users ?? []

    // ── Pull artist_preferences (artist_name, genre, plan_tier, onboarding_complete) ──
    const { data: profiles } = await admin
      .from('artist_preferences')
      .select('user_id, artist_name, genre, plan_tier, onboarding_complete, created_at')

    const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]))

    // ── Optional tables — exist only if migrations have been run ───────────────
    const [
      { data: tickets },
      { data: bugs },
      { data: modelUsage },
      { data: creators },
      { data: waitlist },
    ] = await Promise.all([
      admin.from('support_tickets').select('*').order('created_at', { ascending: false }),
      admin.from('bugs').select('*').order('created_at', { ascending: false }),
      admin.from('model_usage').select('*').order('created_at', { ascending: false }),
      admin.from('creators').select('*').order('created_at', { ascending: false }),
      admin.from('waitlist').select('*').order('created_at', { ascending: false }),
    ])

    const safeTickets   = tickets   ?? []
    const safeBugs      = bugs      ?? []
    const safeModelUsage = modelUsage ?? []
    const safeCreators  = creators  ?? []
    const safeWaitlist  = waitlist  ?? []

    // ── Build merged user rows ─────────────────────────────────────────────────
    const today = new Date().toDateString()
    const users = authUsers.map((u: any) => {
      const p = profileMap.get(u.id) ?? {}
      return {
        user_id:       u.id,
        email:         u.email ?? '',
        artist_name:   p.artist_name ?? '',
        genre:         p.genre ?? '',
        plan_tier:     p.plan_tier ?? 'free',
        onboarded:     p.onboarding_complete ?? false,
        confirmed:     !!u.email_confirmed_at,
        joined_at:     u.created_at ?? '',
        last_sign_in:  u.last_sign_in_at ?? null,
        // fields tracked separately (not in DB yet — default 0)
        streak:        0,
        referrals:     0,
        has_avatar:    false,
        releases:      0,
        up_messages:   0,
        messages_today:0,
        outreach_sent: 0,
        placements:    0,
        up_cost_usd:   0,
        tokens_in:     0,
        tokens_out:    0,
      }
    })

    // ── Stats ──────────────────────────────────────────────────────────────────
    const stats = {
      total_users:        users.length,
      paid_users:         users.filter(u => u.plan_tier !== 'free').length,
      active_today:       users.filter(u => u.last_sign_in && new Date(u.last_sign_in).toDateString() === today).length,
      total_releases:     0,
      total_outreach:     0,
      total_up_cost_usd:  0,
      open_tickets:       safeTickets.filter((t: any) => t.status === 'open').length,
      open_bugs:          safeBugs.filter((b: any)    => b.status === 'open').length,
      total_model_cost_usd: safeModelUsage.reduce((s: number, m: any) => s + (m.cost_usd || 0), 0),
      active_creators:    safeCreators.filter((c: any) => c.status === 'active').length,
      waitlist_count:     safeWaitlist.length,
      plan_breakdown: {
        free:   users.filter(u => u.plan_tier === 'free').length,
        pro:    users.filter(u => u.plan_tier === 'pro').length,
        growth: users.filter(u => u.plan_tier === 'growth').length,
      },
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats, users, tickets: safeTickets, bugs: safeBugs, model_usage: safeModelUsage, creators: safeCreators, waitlist: safeWaitlist }),
    }
  } catch (err: any) {
    console.error('admin-data error:', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err?.message ?? 'Internal server error' }),
    }
  }
}

export { handler }
