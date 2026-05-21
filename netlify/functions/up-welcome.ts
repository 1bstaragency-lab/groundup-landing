/**
 * Sends a welcome iMessage via Blooio when an artist connects their phone.
 * Called from the front-end after saving phone_number to artist_profiles.
 *
 * POST body: { phone: string, artistName: string, tone?: string }
 *
 * Netlify env vars:
 *   BLOOIO_API_KEY — from app.blooio.com dashboard
 */
import type { Handler } from '@netlify/functions'

const BLOOIO_API_KEY = process.env.BLOOIO_API_KEY ?? ''
const BLOOIO_URL     = 'https://backend.blooio.com/v1/api/messages'

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const TONE_OPENERS: Record<string, string> = {
  'Assistant Manager': "I'm here to help your releases reach new audiences and grow your career overall — from rollout strategy to playlist pitching and everything in between.",
  'Your Boy':          "I'm here to help you blow up — real talk. Releases, strategy, curators, content ideas — I got you on all of it.",
  'Label Rep':         "My job is to position your catalog for maximum reach and long-term growth — pitching, playlisting, and data-backed career strategy.",
  'Road Manager':      "I handle the details so you can focus on the music — rollout plans, deadlines, curator outreach, all of it.",
  'Creative Partner':  "I'm here to help your music find the audiences it deserves — creatively, strategically, and consistently.",
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  let body: { phone: string; artistName?: string; tone?: string }
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, headers: CORS, body: 'Invalid JSON' }
  }

  const { phone, artistName = 'Artist', tone = 'Assistant Manager' } = body
  if (!phone) return { statusCode: 400, headers: CORS, body: 'phone required' }

  if (!BLOOIO_API_KEY) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'BLOOIO_API_KEY not configured' }),
    }
  }

  const opener  = TONE_OPENERS[tone] ?? TONE_OPENERS['Assistant Manager']
  const name    = artistName.split('@')[0]
  const to      = normalizePhone(phone)

  const text =
    `Welcome to GrounduP, ${name}! 👋 I'm uP — your personal music career assistant.\n\n` +
    `${opener}\n\n` +
    `Save this number as "uP" in your contacts so you always know it's me. Text me here anytime — I'll check in regularly with tips, strategy, and motivation to keep you moving. Let's build.`

  try {
    console.log('[up-welcome] Sending via Blooio to:', to)

    // Send welcome text + push contact card in parallel so recipient sees
    // "uP" name & gold avatar right away instead of a raw number
    const [res] = await Promise.all([
      fetch(BLOOIO_URL, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${BLOOIO_API_KEY}`,
        },
        body: JSON.stringify({ to, text }),
      }),
      pushContactCard(),
    ])

    const rawText = await res.text()
    let data: unknown
    try { data = JSON.parse(rawText) } catch { data = rawText }

    console.log('[up-welcome] Blooio response:', res.status, rawText)

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: res.ok, status: res.status, data }),
    }
  } catch (err) {
    console.error('[up-welcome] fetch error:', err)
    return {
      statusCode: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: String(err) }),
    }
  }
}

/** Push the uP name to the Blooio number so recipients see "uP" instead of a
 *  raw number (Name & Photo Sharing). No avatar — Blooio needs JPEG but we
 *  serve PNG; name-only is reliable and is what triggers the display name. */
async function pushContactCard(): Promise<void> {
  const BASE = 'https://backend.blooio.com/v2/api'
  try {
    // List active numbers on the account
    const numsRes = await fetch(`${BASE}/me/numbers`, {
      headers: { Authorization: `Bearer ${BLOOIO_API_KEY}` },
    })
    if (!numsRes.ok) {
      console.warn('[up-contact-card] list numbers failed:', numsRes.status, await numsRes.text())
      return
    }
    const numsData = await numsRes.json() as { numbers?: Array<{ phone_number: string }> }
    const numbers  = (numsData.numbers ?? []).map(n => n.phone_number)
    if (numbers.length === 0) { console.warn('[up-contact-card] no numbers on account'); return }

    // Set name + sharing — no avatar to keep payload small and avoid JPEG requirement
    const cardBody = { first_name: 'uP', last_name: '', sharing: { enabled: true, audience: 1, name_format: 1 } }

    await Promise.all(numbers.map(async number => {
      const r    = await fetch(`${BASE}/me/numbers/${encodeURIComponent(number)}/contact-card`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${BLOOIO_API_KEY}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(cardBody),
      })
      const body = await r.text()
      console.log(`[up-contact-card] ${number} → ${r.status} ${body}`)
    }))
  } catch (err) {
    console.error('[up-contact-card] unexpected error:', err)
  }
}
