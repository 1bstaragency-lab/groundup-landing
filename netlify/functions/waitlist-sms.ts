/**
 * Fires immediately after a user joins the waitlist.
 * Sends a branded welcome iMessage via Blooio.
 *
 * Env: BLOOIO_API_KEY
 */
import type { Handler } from '@netlify/functions'

const BLOOIO_KEY = process.env.BLOOIO_API_KEY ?? ''
const BLOOIO_URL = 'https://backend.blooio.com/v1/api/messages'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function sendBlooio(to: string, text: string): Promise<{ ok: boolean; demo?: boolean }> {
  if (!BLOOIO_KEY) {
    console.log(`[demo] Would send to ${to}: ${text.slice(0, 80)}...`)
    return { ok: true, demo: true }
  }

  const res = await fetch(BLOOIO_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${BLOOIO_KEY}` },
    body: JSON.stringify({ to, text }),
  })
  if (!res.ok) console.error('[waitlist-sms] Blooio send error', res.status, await res.text())
  return { ok: res.ok }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  let body: { phone?: string; name?: string }
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, headers: CORS, body: 'Invalid JSON' }
  }

  const { phone, name } = body
  if (!phone) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'phone required' }) }

  // Normalize to E.164 (US default)
  const e164 = phone.replace(/\D/g, '').replace(/^1?(\d{10})$/, '+1$1')

  const artistName = name ? name.split(' ')[0] : 'Artist'

  const message =
    `Hey ${artistName} 👋 You're officially on the GrounduP waitlist.\n\n` +
    `We're building the Artist OS — rollout planning, curator outreach, streaming analytics, and team tools all in one place.\n\n` +
    `We'll text you the moment your early access is ready. Keep building. 🎵\n\n` +
    `— uP Team | groundupapp.com`

  try {
    const result = await sendBlooio(e164, message)
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ ok: result.ok, demo: result.demo ?? false }),
    }
  } catch (err) {
    console.error('[waitlist-sms] Blooio error:', err)
    return {
      statusCode: 200, // Don't fail the signup flow if the message fails
      headers: CORS,
      body: JSON.stringify({ ok: false, error: String(err) }),
    }
  }
}
