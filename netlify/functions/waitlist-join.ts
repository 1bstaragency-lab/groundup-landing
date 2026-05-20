/**
 * Public waitlist signup — used by the TikTok ad funnel landing page.
 *
 * POST body: { phone: string, source?: string }
 *
 * Writes to public.app_waitlist (phone unique). Returns a position number
 * the user sees as their spot on the list, calculated as:
 *   base offset (200) + current waitlist count + small jitter (0-15)
 * so the first signup sees something like #214, the 50th sees #259, etc.
 *
 * Repeat submissions return the previously-assigned position (stable).
 *
 * Also fires a one-shot Blooio iMessage with the web-app link when configured.
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

  let position: number | null = null
  let isNew = false

  if (SUPABASE_URL && SUPABASE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    // If they're already on the list, return their existing position
    const { data: existing } = await supabase
      .from('app_waitlist')
      .select('position')
      .eq('phone', phone)
      .maybeSingle()

    if (existing) {
      position = existing.position as number
    } else {
      isNew = true
      // Compute new position: base + count + jitter
      const { count } = await supabase
        .from('app_waitlist')
        .select('*', { count: 'exact', head: true })
      const base = 200
      const jitter = Math.floor(Math.random() * 16) // 0–15
      position = base + (count ?? 0) + jitter

      const { error } = await supabase.from('app_waitlist').insert({
        phone,
        source:   body.source ?? 'tiktok_funnel',
        position,
      })
      if (error) {
        console.error('[waitlist-join] insert error:', error)
        // If it failed due to unique constraint race, re-read
        const { data: retry } = await supabase
          .from('app_waitlist').select('position').eq('phone', phone).maybeSingle()
        if (retry?.position) position = retry.position as number
      }
    }
  }

  // Fire welcome iMessage (only on first signup so we don't spam re-visits)
  if (BLOOIO_KEY && isNew) {
    const text =
      `Yo 👋 You're #${position} on the GrounduP launch list — we'll text you the moment the iOS app drops.\n\n` +
      `Don't want to wait? Try it on web right now: https://groundupapp.com/signup\n\n` +
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
    body: JSON.stringify({ ok: true, position }),
  }
}
