import type { Handler } from '@netlify/functions'

const BB_URL = process.env.BLUEBUBBLES_SERVER_URL   // e.g. https://messages.yourdomain.com
const BB_PASS = process.env.BLUEBUBBLES_PASSWORD     // set in BlueBubbles server settings

export const handler: Handler = async (event) => {
  const origin = event.headers.origin ?? '*'
  const CORS = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  if (!BB_URL || !BB_PASS) {
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({ ok: false, demo: true, message: 'BlueBubbles not configured — add BLUEBUBBLES_SERVER_URL and BLUEBUBBLES_PASSWORD' }),
    }
  }

  let body: { phone: string; message: string }
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, headers: CORS, body: 'Invalid JSON' }
  }

  const { phone, message } = body
  if (!phone || !message) return { statusCode: 400, headers: CORS, body: 'phone and message required' }

  // Normalize phone to E.164
  const e164 = phone.replace(/\D/g, '').replace(/^1?(\d{10})$/, '+1$1')

  try {
    const res = await fetch(`${BB_URL}/api/v1/message/text?password=${encodeURIComponent(BB_PASS)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatGuid: `iMessage;-;${e164}`,
        tempGuid: crypto.randomUUID(),
        message,
        method: 'private-api',
      }),
    })

    const data = await res.json()
    return {
      statusCode: res.ok ? 200 : 502,
      headers: CORS,
      body: JSON.stringify({ ok: res.ok, data }),
    }
  } catch (err) {
    return {
      statusCode: 502,
      headers: CORS,
      body: JSON.stringify({ ok: false, error: String(err) }),
    }
  }
}
