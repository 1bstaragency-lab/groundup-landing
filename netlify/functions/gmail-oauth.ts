/**
 * Handles the Google OAuth callback for Gmail access.
 * Flow: user clicks Connect Gmail → redirect to Google → Google redirects here
 * → exchange code for tokens → save refresh_token to Supabase → redirect to dashboard
 */
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

export const handler: Handler = async (event) => {
  // Derive redirect URI from the incoming request so it works on any domain
  // (production, deploy preview, custom domain) without extra env var config
  const host = event.headers['x-forwarded-host'] ?? event.headers['host'] ?? 'lively-torrone-79490f.netlify.app'
  const REDIRECT_URI = `https://${host}/.netlify/functions/gmail-oauth`
  const APP_URL = `https://${host}`
  const params = event.queryStringParameters ?? {}

  // ── Step 1: Initiate OAuth (called with ?init=1&user_id=xxx&return_to=yyy) ─
  if (params.init === '1') {
    const userId   = params.user_id
    const returnTo = params.return_to ?? '/dashboard/influencers'
    if (!userId) return { statusCode: 400, body: 'user_id required' }

    // Encode both userId and returnTo in state (base64 JSON)
    const statePayload = Buffer.from(JSON.stringify({ uid: userId, ret: returnTo })).toString('base64')

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id',     GOOGLE_CLIENT_ID)
    url.searchParams.set('redirect_uri',  REDIRECT_URI)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope',         'https://www.googleapis.com/auth/gmail.send email profile')
    url.searchParams.set('access_type',   'offline')
    url.searchParams.set('prompt',        'consent')
    url.searchParams.set('state',         statePayload)

    return { statusCode: 302, headers: { Location: url.toString() }, body: '' }
  }

  // ── Step 2: Handle callback from Google ───────────────────────────────────
  const { code, state: rawState, error } = params

  // Decode state — support both new base64-JSON and legacy plain userId
  let userId   = ''
  let returnTo = '/dashboard/influencers'
  if (rawState) {
    try {
      const parsed = JSON.parse(Buffer.from(rawState, 'base64').toString('utf8'))
      userId   = parsed.uid  ?? rawState
      returnTo = parsed.ret  ?? returnTo
    } catch {
      userId = rawState
    }
  }

  if (error) {
    return { statusCode: 302, headers: { Location: `${APP_URL}${returnTo}?gmail_error=${encodeURIComponent(error)}` }, body: '' }
  }

  if (!code || !userId) {
    return { statusCode: 400, body: 'Missing code or state' }
  }

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  })

  const tokens = await tokenRes.json()

  if (!tokens.refresh_token) {
    return {
      statusCode: 302,
      headers: { Location: `${APP_URL}/dashboard?gmail_error=no_refresh_token` },
      body: '',
    }
  }

  // Save refresh token to Supabase
  await supabase
    .from('artist_preferences')
    .update({ gmail_refresh_token: tokens.refresh_token })
    .eq('id', userId)

  return {
    statusCode: 302,
    headers: { Location: `${APP_URL}${returnTo}?gmail_connected=1` },
    body: '',
  }
}
