import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }),
  })
  const data = await res.json()
  return data.access_token ?? null
}

function makeRfc2822(to: string, subject: string, body: string, fromName: string): string {
  const msg = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `From: ${fromName}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    body,
  ].join('\r\n')
  return Buffer.from(msg).toString('base64url')
}

export const handler: Handler = async (event) => {
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  // Verify Supabase JWT from Authorization header
  const token = event.headers.authorization?.replace('Bearer ', '')
  if (!token) return { statusCode: 401, headers: CORS, body: 'Unauthorized' }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) return { statusCode: 401, headers: CORS, body: 'Invalid token' }

  let body: { to: string; subject: string; message: string }
  try { body = JSON.parse(event.body ?? '{}') } catch { return { statusCode: 400, headers: CORS, body: 'Invalid JSON' } }

  const { to, subject, message } = body
  if (!to || !subject || !message) return { statusCode: 400, headers: CORS, body: 'to, subject, message required' }

  // Load gmail refresh token from DB
  const { data: profile } = await supabase
    .from('artist_preferences')
    .select('gmail_refresh_token, artist_name')
    .eq('id', user.id)
    .single()

  if (!profile?.gmail_refresh_token) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Gmail not connected. Connect your Gmail account first.' }) }
  }

  const accessToken = await refreshAccessToken(profile.gmail_refresh_token)
  if (!accessToken) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: 'Failed to refresh Gmail token. Reconnect your Gmail.' }) }
  }

  const raw = makeRfc2822(to, subject, message, profile.artist_name ?? 'Artist via uP')

  const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  })

  const result = await gmailRes.json()

  if (!gmailRes.ok) {
    return { statusCode: 502, headers: CORS, body: JSON.stringify({ error: result.error?.message ?? 'Gmail send failed' }) }
  }

  return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, messageId: result.id }) }
}
