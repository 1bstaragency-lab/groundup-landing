/**
 * Public waitlist signup — used by the TikTok ad funnel landing page.
 *
 * POST body: { phone: string, source?: string }
 *
 * Writes to the `waitlist` table and (if Blooio is configured) sends a
 * short welcome iMessage with the web-app link so users get a touchpoint
 * before they ever install.
 *
 * Env vars:
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   BLOOIO_API_KEY (optional — disables welcome text if absent)
 */
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL          ?? ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY  ?? ''
const BLOOIO_KEY   = process.env.BLOOIO_API_KEY             ?? ''
const BLOOIO_URL   = 'https://backend.blooio.com/v1/api/messages'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  // US 10-digit gets +1 prefix; otherwise assume user included country code
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  let body: { phone?: string; source?: string }
  try { body = JSON.parse(event.body ?? '{}') }
  catch { return { statusCode: 400, headers: CORS, body: 'Invalid JSON' } }

  const phone = normalizePhone(body.phone ?? '')
  if (!phone || phone.length < 8) {
    return {
      statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'invalid_phone' }),
    }
  }

  // Persist
  if (SUPABASE_URL && SUPABASE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { error } = await supabase.from('waitlist').upsert({
      phone,
      platform: body.source ?? 'tiktok_funnel',
    }, { onConflict: 'phone' })
    if (error) console.error('[waitlist-join] upsert error:', error)
  }

  // Tease iMessage (best-effort)
  if (BLOOIO_KEY) {
    const text =
      `Yo 👋 You're on the GrounduP launch list — we'll text you the moment the iOS app drops.\n\n` +
      `In the meantime, try it on web: https://groundupapp.com/signup\n\n` +
      `— uP`
    try {
      await fetch(BLOOIO_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${BLOOIO_KEY}` },
        body:    JSON.stringify({ to: phone, text }),
      })
    } catch (err) {
      console.warn('[waitlist-join] Blooio send failed:', err)
    }
  }

  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true }),
  }
}
