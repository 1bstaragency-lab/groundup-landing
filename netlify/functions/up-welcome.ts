/**
 * Sends a welcome iMessage via LoopMessage when an artist connects their phone.
 * Called from the front-end after saving phone_number to artist_profiles.
 *
 * POST body: { phone: string, artistName: string, tone?: string }
 */
import type { Handler } from '@netlify/functions'

const LOOP_API_KEY    = process.env.LOOPMESSAGE_API_KEY    ?? ''
const LOOP_SECRET_KEY = process.env.LOOPMESSAGE_SECRET_KEY ?? ''
const LOOP_SENDER     = process.env.LOOPMESSAGE_SENDER_ID  ?? ''
const LOOP_SEND_URL   = 'https://server.loopmessage.com/api/v1/message/send/'

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

  if (!LOOP_API_KEY) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'LOOPMESSAGE_API_KEY not configured' }),
    }
  }

  const opener  = TONE_OPENERS[tone] ?? TONE_OPENERS['Assistant Manager']
  const name    = artistName.split('@')[0] // strip email if that's what came through
  const to      = normalizePhone(phone)

  const message =
    `Hey ${name} 👋 It's uP — your GrounduP AI.\n\n` +
    `${opener}\n\n` +
    `You can text me here anytime — I know your releases, your schedule, and your goals. Let's get to work.`

  try {
    const headers: Record<string, string> = {
      'Content-Type':  'application/json',
      'Authorization': LOOP_API_KEY,
    }
    if (LOOP_SECRET_KEY) headers['Secret-Key'] = LOOP_SECRET_KEY

    const sendBody: Record<string, string> = { recipient: to, text: message }
    if (LOOP_SENDER) sendBody.sender = LOOP_SENDER

    console.log('[up-welcome] Sending to LoopMessage:', {
      url:    LOOP_SEND_URL,
      to,
      hasSender:    !!LOOP_SENDER,
      senderValue:  LOOP_SENDER || '(not set)',
      hasApiKey:    !!LOOP_API_KEY,
      hasSecretKey: !!LOOP_SECRET_KEY,
    })

    const res = await fetch(LOOP_SEND_URL, {
      method:  'POST',
      headers,
      body:    JSON.stringify(sendBody),
    })

    const rawText = await res.text()
    let data: unknown
    try { data = JSON.parse(rawText) } catch { data = rawText }

    console.log('[up-welcome] LoopMessage response:', res.status, rawText)

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
