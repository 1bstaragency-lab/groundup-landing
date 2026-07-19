/**
 * Approve a waitlist entry — creates a real Supabase auth user for them and
 * sends Supabase's built-in invite email ("set your password to finish
 * signing up"), which lands them on /reset-password to choose one.
 *
 * POST body: { waitlist_id: string }
 *
 * Required Netlify env vars:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL         ?? ''
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  let body: { waitlist_id?: string }
  try { body = JSON.parse(event.body ?? '{}') }
  catch { return { statusCode: 400, headers: CORS, body: 'Invalid JSON' } }

  const { waitlist_id } = body
  if (!waitlist_id) return { statusCode: 400, headers: CORS, body: 'waitlist_id required' }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Supabase not configured on the server.' }),
    }
  }

  const admin = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })

  const { data: entry, error: fetchErr } = await admin
    .from('waitlist')
    .select('*')
    .eq('id', waitlist_id)
    .maybeSingle()

  if (fetchErr || !entry) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Waitlist entry not found.' }),
    }
  }

  if (entry.status === 'approved') {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Already approved.' }),
    }
  }

  const { data: inviteData, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(entry.email, {
    redirectTo: 'https://groundupapp.com/reset-password',
    data: { artist_name: entry.artist_name ?? undefined },
  })

  if (inviteErr) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: inviteErr.message }),
    }
  }

  const userId = inviteData.user?.id ?? null

  if (userId) {
    await admin.from('artist_preferences').upsert({
      user_id:     userId,
      artist_name: entry.artist_name ?? 'Artist',
      plan_tier:   'free',
      onboarding_complete: false,
    }, { onConflict: 'user_id' })
  }

  await admin.from('waitlist').update({
    status:            'approved',
    approved_at:       new Date().toISOString(),
    approved_user_id:  userId,
  }).eq('id', waitlist_id)

  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, user_id: userId }),
  }
}
