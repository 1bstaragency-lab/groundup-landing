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
  'Assistant Manager': "I've got your releases, calendar, and rollout tasks all loaded up. Need a status check or a plan? Just text me.",
  'Your Boy':          "We bout to build something real. Anytime you need strategy, content ideas, or just to think through a move — I'm right here.",
  'Label Rep':         "I've reviewed your catalog and upcoming schedule. Ready to talk positioning, pitching, or next-level growth plays whenever you are.",
  'Road Manager':      "I've got your schedule locked in and I'm watching your rollout. Need something handled? Text me and it's done.",
  'Creative Partner':  "I've been thinking about your sound and where it's headed. Whenever you're ready to create, strategize, or just riff — I'm here for it.",
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
    `Hey ${name} 👋 It's uP — your GrounduP AI.\n\n` +
    `${opener}\n\n` +
    `You can text me here anytime — I know your releases, your schedule, and your goals. Let's get to work.`

  try {
    console.log('[up-welcome] Sending via Blooio to:', to)

    const res = await fetch(BLOOIO_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${BLOOIO_API_KEY}`,
      },
      body: JSON.stringify({ to, text }),
    })

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
