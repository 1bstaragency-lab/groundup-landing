import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['joseph@groundup.app', '1bstaragency@gmail.com']

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const authHeader = event.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) }

    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.VITE_SUPABASE_ANON_KEY || '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { statusCode: 401, body: JSON.stringify({ error: 'Session expired' }) }
    if (!ADMIN_EMAILS.includes(user.email || '')) return { statusCode: 403, body: JSON.stringify({ error: 'Not authorized' }) }

    const body = JSON.parse(event.body || '{}')
    const { creator_id, status } = body

    const VALID = ['pending', 'approved', 'active', 'rejected']
    if (!creator_id || !VALID.includes(status)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) }
    }

    const adminSupabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false } }
    )

    const { error } = await adminSupabase
      .from('creators')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', creator_id)

    if (error) return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update creator' }) }

    return { statusCode: 200, body: JSON.stringify({ success: true }) }
  } catch (e) {
    console.error('admin-update-creator error:', e)
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}

export { handler }
