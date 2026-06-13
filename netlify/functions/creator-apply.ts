import { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { name, email, platform, followers, handle, notes } = body

    if (!name?.trim() || !email?.trim() || !platform?.trim()) {
      return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Name, email, and platform are required.' }) }
    }

    const adminSupabase = createClient(
      process.env.VITE_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      { auth: { persistSession: false } }
    )

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14)
    const rand = Math.random().toString(36).slice(2, 6)
    const ref_code = `${slug}-${rand}`

    const { data, error } = await adminSupabase
      .from('creators')
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        platform,
        followers: followers || null,
        handle: handle?.trim() || null,
        notes: notes?.trim() || null,
        ref_code,
        status: 'pending',
      })
      .select('ref_code')
      .single()

    if (error) {
      if (error.code === '23505') {
        return { statusCode: 409, headers: cors, body: JSON.stringify({ error: 'This email has already applied. Check your inbox for updates.' }) }
      }
      console.error('creator-apply insert error:', error)
      return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Failed to submit application. Please try again.' }) }
    }

    return {
      statusCode: 200,
      headers: cors,
      body: JSON.stringify({ ref_code: data.ref_code }),
    }
  } catch (e) {
    console.error('creator-apply error:', e)
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}

export { handler }
