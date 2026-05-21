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
    `Text me here anytime — I'll check in regularly with tips, strategy, and motivation to keep you moving. Let's build.\n\n` +
    `👆 Tap to save me as a contact: https://groundupapp.com/up.vcf`

  try {
    console.log('[up-welcome] Sending via Blooio to:', to)

    // Send welcome text, then immediately follow up with the VCF contact card
    // so the recipient can tap once to save "uP" as a contact
    const res = await fetch(BLOOIO_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${BLOOIO_API_KEY}` },
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

