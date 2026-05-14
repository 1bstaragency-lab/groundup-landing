/**
 * Blooio iMessage Inbound Webhook
 *
 * Blooio POSTs inbound iMessages here.
 * We look up the artist by phone, ask Claude, reply via Blooio API.
 *
 * Netlify env vars needed:
 *   BLOOIO_API_KEY         — from app.blooio.com
 *   BLOOIO_WEBHOOK_SECRET  — signing secret Blooio provides when you create the webhook
 *   ANTHROPIC_API_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 *   VITE_SUPABASE_URL
 *
 * Webhook URL to paste in Blooio dashboard:
 *   https://<your-site>.netlify.app/.netlify/functions/blooio-webhook
 */
import type { Handler } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const BLOOIO_API_KEY        = process.env.BLOOIO_API_KEY            ?? ''
const BLOOIO_WEBHOOK_SECRET = process.env.BLOOIO_WEBHOOK_SECRET     ?? ''
const ANTHROPIC_KEY         = process.env.ANTHROPIC_API_KEY          ?? ''
const SUPABASE_URL          = process.env.VITE_SUPABASE_URL          ?? ''
// Service role bypasses RLS; fall back to anon key if not set
const SUPABASE_KEY          = process.env.SUPABASE_SERVICE_ROLE_KEY  ??
                              process.env.VITE_SUPABASE_ANON_KEY     ?? ''

const BLOOIO_URL = 'https://backend.blooio.com/v1/api/messages'

const TONE_VOICE: Record<string, string> = {
  'Assistant Manager': 'Professional and proactive, like a dedicated assistant manager. Results-focused and warm.',
  'Your Boy':          'Casual, real, ride-or-die energy. Celebrate wins, keep it 100 percent.',
  'Label Rep':         'Polished and data-driven. Industry-savvy, focused on growth and positioning.',
  'Road Manager':      'No-nonsense, practical, logistical. Make things happen fast.',
  'Creative Partner':  'Inspired and collaborative. Push ideas further and match creative energy.',
}

// Blooio inbound payload — adjust field names if their docs differ
interface BlooioInbound {
  from?:    string   // sender phone number
  to?:      string   // your number
  text?:    string   // message body
  message?: string   // alternate field name
  body?:    string   // alternate field name
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }

  // ─── Log all headers so we can identify Blooio's signing header ──────────
  const safeHeaders = Object.fromEntries(
    Object.entries(event.headers).filter(([k]) => !k.toLowerCase().includes('cookie'))
  )
  console.log('[blooio-webhook] Headers:', JSON.stringify(safeHeaders))

  // ─── Verify signing secret (warn only — don't block while we confirm header name) ──
  if (BLOOIO_WEBHOOK_SECRET) {
    const sigHeader =
      event.headers['x-blooio-signature'] ??
      event.headers['x-blooio-secret']    ??
      event.headers['x-webhook-secret']   ??
      event.headers['x-signing-secret']   ??
      event.headers['x-secret']           ??
      event.headers['authorization']       ?? ''

    const provided = sigHeader.replace(/^Bearer\s+/i, '')

    if (provided !== BLOOIO_WEBHOOK_SECRET) {
      console.warn('[blooio-webhook] Signature mismatch — continuing anyway to diagnose. Header checked:', sigHeader || '(none matched)')
      // NOTE: switch back to 401 once we confirm the correct header name
    }
  }

  let payload: BlooioInbound
  try {
    payload = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  console.log('[blooio-webhook] Inbound payload:', JSON.stringify(payload))

  // Handle nested payload shapes Blooio might send
  const anyPayload = payload as Record<string, unknown>
  const fromPhone   = (payload.from ?? (anyPayload.sender as string) ?? '') as string
  const inboundText = (payload.text ?? payload.message ?? payload.body ?? (anyPayload.content as string) ?? '') as string

  if (!fromPhone || !inboundText) {
    console.log('[blooio-webhook] Missing from/text — ignoring')
    return { statusCode: 200, body: 'No sender/text' }
  }

  if (!BLOOIO_API_KEY || !ANTHROPIC_KEY) {
    console.log('[blooio-webhook] Missing API keys')
    return { statusCode: 200, body: 'Not configured' }
  }

  console.log('[blooio-webhook] Supabase config — URL set:', !!SUPABASE_URL, '| Key set:', !!SUPABASE_KEY, '| Key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : process.env.VITE_SUPABASE_ANON_KEY ? 'anon' : 'MISSING')

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // ─── Look up artist by phone ───────────────────────────────────────────────
  const normalizedPhone = normalizePhone(fromPhone)
  console.log('[blooio-webhook] Looking up phone:', normalizedPhone)

  const { data: profile, error: profileError } = await supabase
    .from('artist_profiles')
    .select('user_id, artist_name, tone, phone_number')
    .eq('phone_number', normalizedPhone)
    .single()

  console.log('[blooio-webhook] Profile lookup result:', JSON.stringify({ profile, error: profileError?.message }))

  if (!profile) {
    // Try a broader search to diagnose format issues
    const { data: allPhones } = await supabase
      .from('artist_profiles')
      .select('phone_number')
      .not('phone_number', 'is', null)
      .limit(10)
    console.log('[blooio-webhook] All stored phones for comparison:', JSON.stringify(allPhones))

    await sendBlooio(fromPhone, "Hey! I don't recognize this number. Log into your GrounduP account and connect your phone under Profile to chat with uP 🎵")
    return { statusCode: 200, body: 'Unknown number' }
  }

  const userId = profile.user_id

  // ─── Pull artist context ───────────────────────────────────────────────────
  const [releasesRes, eventsRes] = await Promise.all([
    supabase.from('releases').select('title, type, release_date, checklist').eq('user_id', userId).order('release_date', { ascending: true }).limit(5),
    supabase.from('calendar_events').select('title, event_type, event_date').eq('user_id', userId).gte('event_date', new Date().toISOString().split('T')[0]).order('event_date', { ascending: true }).limit(5),
  ])

  const releases = releasesRes.data ?? []
  const events   = eventsRes.data ?? []
  const voice    = TONE_VOICE[profile.tone ?? ''] ?? TONE_VOICE['Assistant Manager']

  const releaseSummary = releases.length > 0
    ? releases.map(r => {
        const cl = r.checklist ?? []
        const done = cl.filter((t: { done: boolean }) => t.done).length
        return `"${r.title}" (${r.type}) — ${r.release_date} — ${done}/${cl.length} tasks done`
      }).join('; ')
    : 'No upcoming releases'

  const eventSummary = events.length > 0
    ? events.map(e => `${e.title} on ${e.event_date}`).join('; ')
    : 'No upcoming events'

  const systemPrompt = `You are uP, the AI music career assistant for ${profile.artist_name} on GrounduP. ${voice}

Artist context:
- Releases: ${releaseSummary}
- Events: ${eventSummary}

IMPORTANT: Replying via iMessage — keep every response to 1-3 short sentences max. Plain text only, no markdown. Be direct and actionable. Sign off with "— uP" only if it feels natural.

TASK EXTRACTION: If you identify any action items for the artist, append them at the VERY END (auto-stripped, not seen by artist):
<up_tasks>["Task 1 (5-10 words)", "Task 2"]</up_tasks>
Only if genuinely actionable. Omit entirely if no tasks.`

  // ─── Pull recent iMessage conversation history ─────────────────────────────
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
    console.error('[blooio-webhook] Claude error:', err)
    reply = "Ran into something on my end — open the GrounduP app for now."
  }

  // ─── Extract tasks + clean reply ─────────────────────────────────────────
  const { cleaned: cleanReply, tasks } = extractTasks(reply)

  // ─── Send reply via Blooio ────────────────────────────────────────────────
  await sendBlooio(fromPhone, cleanReply)

  // ─── Log both sides to Supabase ───────────────────────────────────────────
  await supabase.from('up_conversations').insert([
    { user_id: userId, role: 'user',      content: inboundText, channel: 'imessage' },
    { user_id: userId, role: 'assistant', content: cleanReply,  channel: 'imessage' },
  ])

  // ─── Save extracted tasks ─────────────────────────────────────────────────
  if (tasks.length > 0) {
    await supabase.from('up_tasks').insert(
      tasks.map(content => ({ user_id: userId, content, source: 'imessage' }))
    )
  }

  return { statusCode: 200, body: 'OK' }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractTasks(text: string): { cleaned: string; tasks: string[] } {
  const match = text.match(/<up_tasks>([\s\S]*?)<\/up_tasks>/)
  if (!match) return { cleaned: text.trim(), tasks: [] }
  let tasks: string[] = []
  try { tasks = JSON.parse(match[1].trim()) } catch { tasks = [] }
  if (!Array.isArray(tasks)) tasks = []
  const cleaned = text.replace(/<up_tasks>[\s\S]*?<\/up_tasks>/, '').trim()
  return { cleaned, tasks }
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return `+${digits}`
}

async function sendBlooio(to: string, text: string) {
  if (!BLOOIO_API_KEY) return
  try {
    const res = await fetch(BLOOIO_URL, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${BLOOIO_API_KEY}`,
      },
      body: JSON.stringify({ to, text }),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[blooio-webhook] Send error:', res.status, err)
    }
  } catch (err) {
    console.error('[blooio-webhook] Network error:', err)
  }
}
