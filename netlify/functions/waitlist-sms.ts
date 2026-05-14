/**
 * Fires immediately after a user joins the waitlist.
 * Sends a branded welcome iMessage via BlueBubbles.
 */
import type { Handler } from '@netlify/functions'

const BB_URL  = process.env.BLUEBUBBLES_SERVER_URL
const BB_PASS = process.env.BLUEBUBBLES_PASSWORD

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function sendBlueBubbles(phone: string, message: string): Promise<{ ok: boolean; demo?: boolean }> {
  if (!BB_URL || !BB_PASS) {
    console.log(`[demo] Would send to ${phone}: ${message.slice(0, 80)}...`)
    return { ok: true, demo: true }
  }

  const e164 = phone.replace(/\D/g, '').replace(/^1?(\d{10})$/, '+1$1')

  const res = await fetch(
    `${BB_URL}/api/v1/message/text?password=${encodeURIComponent(BB_PASS)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatGuid: `iMessage;-;${e164}`,
        tempGuid: crypto.randomUUID(),
        message,
        method: 'private-api',
      }),
    },
  )

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

  const artistName = name ? name.split(' ')[0] : 'Artist'

  const message =
    `Hey ${artistName} 👋 You're officially on the GrounduP waitlist.\n\n` +
    `We're building the Artist OS — rollout planning, curator outreach, streaming analytics, and team tools all in one place.\n\n` +
    `We'll text you the moment your early access is ready. Keep building. 🎵\n\n` +
    `— uP Team | groundupapp.com`

  try {
    const result = await sendBlueBubbles(phone, message)
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ ok: result.ok, demo: result.demo ?? false }),
    }
  } catch (err) {
    console.error('BlueBubbles error:', err)
    return {
      statusCode: 200, // Don't fail the signup flow if SMS fails
      headers: CORS,
      body: JSON.stringify({ ok: false, error: String(err) }),
    }
  }
}
