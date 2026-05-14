/**
 * LoopMessage iMessage Webhook
 *
 * LoopMessage POSTs inbound iMessages here.
 * We look up the artist by phone, ask Claude, reply via LoopMessage API.
 *
 * Netlify env vars needed:
 *   LOOPMESSAGE_API_KEY       — from dashboard.loopmessage.com → API → Settings
 *   LOOPMESSAGE_SECRET_KEY    — second auth key (if required by your plan)
 *   LOOPMESSAGE_SENDER_ID     — your sender phone/pool ID
 *   ANTHROPIC_API_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   VITE_SUPABASE_URL
 *
 * Webhook URL to paste in LoopMessage dashboard:
 *   https://<your-site>.netlify.app/.netlify/functions/loopmessage-webhook
 */
import type { Handler } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const LOOP_API_KEY    = process.env.LOOPMESSAGE_API_KEY    ?? ''
const LOOP_SECRET_KEY = process.env.LOOPMESSAGE_SECRET_KEY ?? ''
const LOOP_SENDER     = process.env.LOOPMESSAGE_SENDER_ID  ?? ''
const ANTHROPIC_KEY   = process.env.ANTHROPIC_API_KEY      ?? ''
const SUPABASE_URL    = process.env.VITE_SUPABASE_URL      ?? ''
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const LOOP_SEND_URL   = 'https://server.loopmessage.com/api/v1/message/send/'

const TONE_VOICE: Record<string, string> = {
  'Assistant Manager': 'Professional and proactive, like a dedicated assistant manager. Results-focused and warm.',
  'Your Boy':          'Casual, real, ride-or-die energy. Celebrate wins, keep it 100 percent.',
  'Label Rep':         'Polished and data-driven. Industry-savvy, focused on growth and positioning.',
  'Road Manager':      'No-nonsense, practical, logistical. Make things happen fast.',
  'Creative Partner':  'Inspired and collaborative. Push ideas further and match creative energy.',
}

// ─── LoopMessage inbound payload shape ───────────────────────────────────────
// LoopMessage POSTs webhooks with alert_type + message object
interface LoopInboundPayload {
  alert_type?: string          // "message_inbound" | "message_delivered" | "message_failed"
  recipient?:  string          // your sender number (who received the msg)
  sender?:     string          // the user's phone number
  text?:       string          // message body (top-level, some plans)
  message?: {
    sender?:   string
    recipient?: string
    text?:     string
    body?:     string
  }
}

export const handler: Handler = async (event) => {
  // LoopMessage sends POST for inbound messages
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }

  let payload: LoopInboundPayload
  try {
    payload = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  // Only act on inbound messages (ignore delivered/failed status alerts)
  const alertType = payload.alert_type ?? 'message_inbound'
  if (alertType !== 'message_inbound') {
    return { statusCode: 200, body: 'Ignored non-inbound alert' }
  }

  // Extract sender phone + message text (handle both payload shapes)
  const fromPhone  = payload.sender ?? payload.message?.sender ?? ''
  const inboundText = payload.text ?? payload.message?.text ?? payload.message?.body ?? ''

  if (!fromPhone || !inboundText) {
    console.log('[loopmessage] Missing sender or text:', JSON.stringify(payload))
    return { statusCode: 200, body: 'No sender/text' }
  }

  if (!LOOP_API_KEY || !ANTHROPIC_KEY) {
    console.log('[loopmessage] Not configured — LOOPMESSAGE_API_KEY or ANTHROPIC_API_KEY missing')
    return { statusCode: 200, body: 'Not configured' }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // ─── Look up artist by phone number ───────────────────────────────────────
  const normalizedPhone = normalizePhone(fromPhone)
  const { data: profile } = await supabase
    .from('artist_profiles')
    .select('user_id, artist_name, tone')
    .eq('phone_number', normalizedPhone)
    .single()

  if (!profile) {
    await sendLoopMessage(fromPhone, "Hey! I don't recognize this number. Log into your GrounduP account and add your phone number under Profile to connect with uP 🎵")
    return { statusCode: 200, body: 'Unknown number' }
  }

  const userId = profile.user_id

  // ─── Pull artist context ───────────────────────────────────────────────────
  const [releasesRes, eventsRes] = await Promise.all([
    supabase
      .from('releases')
      .select('title, type, release_date, checklist')
      .eq('user_id', userId)
      .order('release_date', { ascending: true })
      .limit(5),
    supabase
      .from('calendar_events')
      .select('title, event_type, event_date')
      .eq('user_id', userId)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date', { ascending: true })
      .limit(5),
  ])

  const releases = releasesRes.data ?? []
  const events   = eventsRes.data ?? []
  const voice    = TONE_VOICE[profile.tone ?? ''] ?? TONE_VOICE['Assistant Manager']

  const releaseSummary = releases.length > 0
    ? releases.map(r => {
        const cl   = r.checklist ?? []
        const done = cl.filter((t: { done: boolean }) => t.done).length
        return `"${r.title}" (${r.type}) — ${r.release_date} — ${done}/${cl.length} tasks done`
      }).join('; ')
    : 'No upcoming releases'

  const eventSummary = events.length > 0
    ? events.map(e => `${e.title} on ${e.event_date}`).join('; ')
    : 'No upcoming events'

  // SMS-optimized system prompt — short responses only
  const systemPrompt = `You are uP, the AI music career assistant for ${profile.artist_name} on GrounduP. ${voice}

Artist context:
- Releases: ${releaseSummary}
- Events: ${eventSummary}

IMPORTANT: You're replying via iMessage so keep every response to 1-3 short sentences max. Plain text only — no markdown, no bullet points with dashes (use commas or newlines instead). Be direct and actionable. Sign off with "— uP" only if it feels natural.`

  // ─── Pull recent conversation history for context ──────────────────────────
  const { data: history } = await supabase
    .from('up_conversations')
    .select('role, content')
    .eq('user_id', userId)
    .eq('channel', 'imessage')
    .order('created_at', { ascending: false })
    .limit(10)

  const priorMessages = (history ?? [])
    .reverse()
    .map(h => ({ role: h.role as 'user' | 'assistant', content: h.content }))

  // ─── Call Claude ───────────────────────────────────────────────────────────
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })
  let reply = ''
  try {
    const res = await anthropic.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 300,
      system:     systemPrompt,
      messages:   [...priorMessages, { role: 'user', content: inboundText }],
    })
    reply = res.content[0].type === 'text' ? res.content[0].text : "I'm on it — check the app for full details."
  } catch (err) {
    console.error('[loopmessage] Claude error:', err)
    reply = "Ran into something on my end — open the GrounduP app for now."
  }

  // ─── Send reply via LoopMessage ───────────────────────────────────────────
  await sendLoopMessage(fromPhone, reply)

  // ─── Log both sides to Supabase ───────────────────────────────────────────
  await supabase.from('up_conversations').insert([
    { user_id: userId, role: 'user',      content: inboundText, channel: 'imessage' },
    { user_id: userId, role: 'assistant', content: reply,       channel: 'imessage' },
  ])

  return { statusCode: 200, body: 'OK' }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

async function sendLoopMessage(to: string, text: string) {
  if (!LOOP_API_KEY) return
  try {
    const headers: Record<string, string> = {
      'Content-Type':  'application/json',
      'Authorization': LOOP_API_KEY,
    }
    if (LOOP_SECRET_KEY) headers['Secret-Key'] = LOOP_SECRET_KEY

    const body: Record<string, string> = { recipient: to, text }
    if (LOOP_SENDER) body.sender = LOOP_SENDER

    const res = await fetch(LOOP_SEND_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[loopmessage] Send error:', res.status, err)
    }
  } catch (err) {
    console.error('[loopmessage] Network error:', err)
  }
}
