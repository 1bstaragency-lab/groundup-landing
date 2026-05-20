/**
 * Set the "uP" iMessage contact card (Name & Photo) on the account's Blooio
 * number(s) — this is what makes recipients' phones show "Maybe: uP" and lets
 * them save uP as a contact with the gold-orb avatar.
 *
 * Uses Blooio v2: PUT /me/numbers/{number}/contact-card
 *
 *   GET  → lists the account's numbers (diagnostic)
 *   POST → sets the uP contact card on every active number
 *          body (optional): { number?: string } to target one number
 *
 * Env: BLOOIO_API_KEY
 */
import type { Handler } from '@netlify/functions'

const BLOOIO_KEY = process.env.BLOOIO_API_KEY ?? ''
const BASE       = 'https://backend.blooio.com/v2/api'
const AVATAR_URL = 'https://groundupapp.com/up-avatar.png'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

async function listNumbers(): Promise<Array<{ phone_number: string; is_active: boolean }>> {
  const res = await fetch(`${BASE}/me/numbers`, {
    headers: { Authorization: `Bearer ${BLOOIO_KEY}` },
  })
  if (!res.ok) {
    console.error('[up-contact-card] list numbers failed', res.status, await res.text())
    return []
  }
  const data = await res.json() as { numbers?: Array<{ phone_number: string; is_active: boolean }> }
  return data.numbers ?? []
}

async function avatarBase64(): Promise<string | null> {
  try {
    const res = await fetch(AVATAR_URL)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    return buf.toString('base64')
  } catch {
    return null
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (!BLOOIO_KEY) {
    return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'BLOOIO_API_KEY not set' }) }
  }

  // GET → list numbers
  if (event.httpMethod === 'GET') {
    const numbers = await listNumbers()
    return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, numbers }) }
  }

  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  let body: { number?: string } = {}
  try { body = JSON.parse(event.body ?? '{}') } catch { /* noop */ }

  const avatar = await avatarBase64()
  if (!avatar) {
    return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'could not load avatar' }) }
  }

  // Which numbers to update
  let targets: string[]
  if (body.number) {
    targets = [body.number]
  } else {
    targets = (await listNumbers()).map(n => n.phone_number)
  }
  if (targets.length === 0) {
    return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'no numbers on account' }) }
  }

  const cardBody = {
    first_name: 'uP',
    last_name:  '',
    avatar,                          // base64 PNG
    sharing: {
      enabled:     true,
      audience:    1,                // 1 = Always Ask (shows "Maybe: uP" to new contacts)
      name_format: 1,                // 1 = First name only
    },
  }

  const results: Array<{ number: string; ok: boolean; status: number; msg?: string }> = []
  for (const number of targets) {
    try {
      const res = await fetch(`${BASE}/me/numbers/${encodeURIComponent(number)}/contact-card`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${BLOOIO_KEY}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(cardBody),
      })
      const txt = await res.text()
      results.push({ number, ok: res.ok, status: res.status, msg: res.ok ? undefined : txt })
      console.log(`[up-contact-card] ${number} → ${res.status} ${res.ok ? 'OK' : txt}`)
    } catch (err) {
      results.push({ number, ok: false, status: 0, msg: String(err) })
    }
  }

  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: results.some(r => r.ok), results }),
  }
}
