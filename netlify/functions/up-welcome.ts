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
    `Text me here anytime — and I'll be checking in regularly with career tips, strategy suggestions, and motivation to keep you moving forward. Let's build.`

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

/** Push the uP name + gold avatar to the Blooio number so recipients see
 *  "uP" as the contact name instead of a raw phone number. Idempotent — safe
 *  to call on every welcome since Blooio just overwrites with the same values. */
async function pushContactCard(): Promise<void> {
  const BASE       = 'https://backend.blooio.com/v2/api'
  const AVATAR_URL = 'https://groundupapp.com/up-avatar.png'

  try {
    // Fetch + base64-encode the avatar
    const imgRes = await fetch(AVATAR_URL)
    if (!imgRes.ok) { console.warn('[up-contact-card] avatar fetch failed:', imgRes.status); return }
    const buf    = Buffer.from(await imgRes.arrayBuffer())
    const avatar = buf.toString('base64')

    // Get the account's active numbers
    const numsRes = await fetch(`${BASE}/me/numbers`, {
      headers: { Authorization: `Bearer ${BLOOIO_API_KEY}` },
    })
    if (!numsRes.ok) { console.warn('[up-contact-card] list numbers failed:', numsRes.status); return }
    const numsData = await numsRes.json() as { numbers?: Array<{ phone_number: string; is_active: boolean }> }
    const numbers  = (numsData.numbers ?? []).map(n => n.phone_number)

    const cardBody = {
      first_name: 'uP',
      last_name:  '',
      avatar,
      sharing: { enabled: true, audience: 1, name_format: 1 },
    }

    await Promise.all(numbers.map(number =>
      fetch(`${BASE}/me/numbers/${encodeURIComponent(number)}/contact-card`, {
        method:  'PUT',
        headers: { Authorization: `Bearer ${BLOOIO_API_KEY}`, 'Content-Type': 'application/json' },
        body:    JSON.stringify(cardBody),
      }).then(r => console.log(`[up-contact-card] ${number} → ${r.status}`))
        .catch(e => console.error(`[up-contact-card] ${number} error:`, e))
    ))
  } catch (err) {
    // Non-fatal — welcome text was already sent
    console.error('[up-contact-card] unexpected error:', err)
  }
}
