/**
 * Track a referral when a new user signs up.
 * Called from the front-end immediately after successful signUp.
 *
 * POST body: { referredUserId: string, referralCode: string }
 */
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL          ?? ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY  ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  let body: { referredUserId?: string; referralCode?: string }
  try { body = JSON.parse(event.body ?? '{}') }
  catch { return { statusCode: 400, headers: CORS, body: 'Invalid JSON' } }

  const { referredUserId, referralCode } = body
  if (!referredUserId || !referralCode) {
    return { statusCode: 400, headers: CORS, body: 'referredUserId + referralCode required' }
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return { statusCode: 500, headers: CORS, body: 'Supabase not configured' }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // Look up referrer by code (case-insensitive)
  const { data: referrer } = await supabase
    .from('artist_preferences')
    .select('user_id')
    .ilike('referral_code', referralCode.trim())
    .maybeSingle()

  if (!referrer) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'invalid_code' }),
    }
  }

  // Can't self-refer
  if (referrer.user_id === referredUserId) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'self_referral' }),
    }
  }

  // Insert referral record (unique constraint prevents dupes on referred_user_id)
  const { error } = await supabase.from('referrals').insert({
    referrer_user_id: referrer.user_id,
    referred_user_id: referredUserId,
    referral_code:    referralCode.toUpperCase(),
    status:           'signed_up',
    points_awarded:   500,
  })

  if (error) {
    console.error('[track-referral] insert error:', error)
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: error.message }),
    }
  }

  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, pointsAwarded: 500 }),
  }
}
