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

    // Handle missing tables gracefully - return empty arrays if tables don't exist yet
    const safeUsers = users || []
    const safeTickets = tickets || []
    const safeBugs = bugs || []
    const safeModelUsage = modelUsage || []
    const safeCreators = creators || []

    // Compute stats
    const stats = {
      total_users: safeUsers.length,
      paid_users: safeUsers.filter((u: any) => u.subscription_tier !== 'free').length,
      active_today: safeUsers.filter((u: any) => {
        const lastSignIn = new Date(u.last_sign_in || '')
        return lastSignIn.toDateString() === new Date().toDateString()
      }).length,
      total_releases: safeUsers.reduce((sum, u: any) => sum + (u.releases || 0), 0),
      total_outreach: safeUsers.reduce((sum, u: any) => sum + (u.outreach_sent || 0), 0),
      total_up_cost_usd: safeUsers.reduce((sum, u: any) => sum + (u.up_cost_usd || 0), 0),
      open_tickets: safeTickets.filter((t: any) => t.status === 'open').length,
      open_bugs: safeBugs.filter((b: any) => b.status === 'open').length,
      total_model_cost_usd: safeModelUsage.reduce((sum, m: any) => sum + (m.cost_usd || 0), 0),
      active_creators: safeCreators.filter((c: any) => c.status === 'active').length,
      plan_breakdown: {
        solo: safeUsers.filter((u: any) => u.subscription_tier === 'solo').length,
        weekly: safeUsers.filter((u: any) => u.subscription_tier === 'weekly').length,
        monthly: safeUsers.filter((u: any) => u.subscription_tier === 'monthly').length,
        strategic: safeUsers.filter((u: any) => u.subscription_tier === 'strategic').length,
      },
    }

    const response = {
      stats,
      users: safeUsers,
      tickets: safeTickets,
      bugs: safeBugs,
      model_usage: safeModelUsage,
      creators: safeCreators,
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
