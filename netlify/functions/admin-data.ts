import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

// Admin email allowlist — add your admin emails here
const ADMIN_EMAILS = ['joseph@groundup.app', '1bstaragency@gmail.com']

const handler: Handler = async (event) => {
  try {
    // For development: allow without auth. In production, uncomment the auth checks below.
    // Get the Bearer token from the request
    const authHeader = event.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')

    // Optional: uncomment to require authentication
    // if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }

    // Create service role client for admin queries (bypasses RLS)
    // This uses the service role key which has full access to all data
    const adminSupabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false } }
    )

    // Optional: uncomment to verify user is authenticated and in admin allowlist
    /*
    if (token) {
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL || '',
        process.env.VITE_SUPABASE_ANON_KEY || '',
        { global: { headers: { Authorization: `Bearer ${token}` } } }
      )
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user || !ADMIN_EMAILS.includes(user.email || '')) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Not authorized as admin' }) }
      }
    }
    */

    // Fetch all admin data in parallel
    const [
      { data: users, error: usersErr },
      { data: tickets, error: ticketsErr },
      { data: bugs, error: bugsErr },
      { data: modelUsage, error: modelErr },
      { data: creators, error: creatorsErr },
    ] = await Promise.all([
      adminSupabase.from('users').select('*').order('created_at', { ascending: false }),
      adminSupabase.from('support_tickets').select('*').order('created_at', { ascending: false }),
      adminSupabase.from('bugs').select('*').order('created_at', { ascending: false }),
      adminSupabase.from('model_usage').select('*').order('created_at', { ascending: false }),
      adminSupabase.from('creators').select('*').order('created_at', { ascending: false }),
    ])

    if (usersErr || ticketsErr || bugsErr || modelErr || creatorsErr) {
      console.error({ usersErr, ticketsErr, bugsErr, modelErr, creatorsErr })
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch data' }) }
    }

    // Compute stats
    const stats = {
      total_users: users?.length || 0,
      paid_users: users?.filter(u => u.subscription_tier !== 'free').length || 0,
      active_today: users?.filter(u => {
        const lastSignIn = new Date(u.last_sign_in || '')
        return lastSignIn.toDateString() === new Date().toDateString()
      }).length || 0,
      total_releases: users?.reduce((sum, u) => sum + (u.releases || 0), 0) || 0,
      total_outreach: users?.reduce((sum, u) => sum + (u.outreach_sent || 0), 0) || 0,
      total_up_cost_usd: users?.reduce((sum, u) => sum + (u.up_cost_usd || 0), 0) || 0,
      open_tickets: tickets?.filter(t => t.status === 'open').length || 0,
      open_bugs: bugs?.filter(b => b.status === 'open').length || 0,
      total_model_cost_usd: modelUsage?.reduce((sum, m) => sum + (m.cost_usd || 0), 0) || 0,
      active_creators: creators?.filter(c => c.status === 'active').length || 0,
      plan_breakdown: {
        solo: users?.filter(u => u.subscription_tier === 'solo').length || 0,
        weekly: users?.filter(u => u.subscription_tier === 'weekly').length || 0,
        monthly: users?.filter(u => u.subscription_tier === 'monthly').length || 0,
        strategic: users?.filter(u => u.subscription_tier === 'strategic').length || 0,
      },
    }

    const response = {
      stats,
      users: users || [],
      tickets: tickets || [],
      bugs: bugs || [],
      model_usage: modelUsage || [],
      creators: creators || [],
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    }
  } catch (error) {
    console.error('Admin data error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}

export { handler }
