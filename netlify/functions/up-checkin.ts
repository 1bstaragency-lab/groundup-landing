/**
 * Proactive uP iMessage check-in
 *
 * Runs hourly via netlify.toml schedule. For each user with check-in enabled
 * whose preferred hour-in-their-timezone == current hour, composes a brief
 * personalized morning check-in via Claude and sends via Blooio.
 *
 * Also supports manual invocation:
 *   POST { userId: string, test?: true } → sends a check-in right now to that user
 *   (used by the "Send test now" button in settings)
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY
 *   BLOOIO_API_KEY
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import type { Handler, HandlerEvent } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY        ?? ''
const BLOOIO_KEY    = process.env.BLOOIO_API_KEY           ?? ''
const SUPABASE_URL  = process.env.VITE_SUPABASE_URL        ?? ''
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const BLOOIO_URL = 'https://backend.blooio.com/v1/api/messages'

const TONE_VOICE: Record<string, string> = {
  'Assistant Manager': 'Professional, proactive, results-focused. Warm but direct.',
  'Your Boy':          'Casual ride-or-die energy. Real, hype, no corporate fluff.',
  'Label Rep':         'Polished, data-driven. Industry lens. Metrics + positioning.',
  'Road Manager':      'No-nonsense, practical. Make-it-happen-now energy.',
  'Creative Partner':  'Inspired, collaborative. Push the artist creatively.',
}

interface CheckinUser {
  user_id:           string
  artist_name:       string | null
  tone:              string | null
  phone_number:      string | null
  plan_tier:         string
  checkin_hour:      number
  checkin_timezone:  string
  checkin_frequency: string
  last_checkin_at:   string | null
}

/** Current hour 0-23 in a given IANA timezone */
function hourInTz(tz: string): number {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: '2-digit', hour12: false })
    const parts = fmt.formatToParts(new Date())
    const h = parts.find(p => p.type === 'hour')?.value
    return h ? parseInt(h, 10) % 24 : -1
  } catch {
    return -1
  }
}

/** Day-of-week 0-6 (Sun=0) in a given timezone */
function dayInTz(tz: string): number {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' })
    const wd = fmt.format(new Date())
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(wd)
  } catch {
    return -1
  }
}

/** YYYY-MM-DD in a given timezone */
function dateInTz(tz: string): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
    return fmt.format(new Date())
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

function shouldFireToday(u: CheckinUser): boolean {
  if (u.checkin_frequency === 'daily') return true
  const dow = dayInTz(u.checkin_timezone)
  if (u.checkin_frequency === 'weekdays') return dow >= 1 && dow <= 5
  if (u.checkin_frequency === 'weekly')   return dow === 1 // Mondays
  return false
}

function alreadySentToday(u: CheckinUser): boolean {
  if (!u.last_checkin_at) return false
  // Compare local-date strings in user's timezone
  const lastLocal = new Date(u.last_checkin_at).toLocaleString('en-CA', {
    timeZone: u.checkin_timezone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).split(',')[0]
  return lastLocal === dateInTz(u.checkin_timezone)
}

async function sendBlooio(to: string, text: string) {
  if (!BLOOIO_KEY) return false
  const res = await fetch(BLOOIO_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${BLOOIO_KEY}` },
    body:    JSON.stringify({ to, text }),
  })
  if (!res.ok) {
    console.error('[up-checkin] Blooio send error', res.status, await res.text())
    return false
  }
  return true
}

/** Build artist context + ask Claude to compose the check-in */
async function composeAndSend(
  user: CheckinUser,
  supabase: ReturnType<typeof createClient>,
  anthropic: Anthropic,
): Promise<{ sent: boolean; text: string | null }> {
  if (!user.phone_number) return { sent: false, text: null }

  // Pull everything we need in parallel
  const today = dateInTz(user.checkin_timezone)
  const [releasesRes, eventsRes, tasksRes, snapsRes, lastConvosRes] = await Promise.all([
    supabase.from('releases').select('title, type, release_date, checklist').eq('user_id', user.user_id).gte('release_date', today).order('release_date', { ascending: true }).limit(5),
    supabase.from('calendar_events').select('title, event_type, event_date').eq('user_id', user.user_id).gte('event_date', today).order('event_date', { ascending: true }).limit(5),
    supabase.from('up_tasks').select('content, status, created_at').eq('user_id', user.user_id).eq('status', 'pending').order('created_at', { ascending: false }).limit(8),
    supabase.from('platform_snapshots').select('platform, stats, fetched_at').eq('user_id', user.user_id).order('fetched_at', { ascending: false }).limit(20),
    supabase.from('up_conversations').select('role, content').eq('user_id', user.user_id).eq('channel', 'imessage').order('created_at', { ascending: false }).limit(2),
  ])

  const releases = (releasesRes.data ?? []) as Array<{ title: string; type: string; release_date: string; checklist: Array<{ label: string; done: boolean }> }>
  const events   = (eventsRes.data ?? [])   as Array<{ title: string; event_type: string; event_date: string }>
  const tasks    = (tasksRes.data ?? [])    as Array<{ content: string; status: string }>
  const snaps    = (snapsRes.data ?? [])    as Array<{ platform: string; stats: Record<string, unknown> }>

  // Latest snapshot per platform
  const byP: Record<string, Record<string, unknown>> = {}
  for (const s of snaps) if (!byP[s.platform]) byP[s.platform] = s.stats

  const fmt = (n: unknown) => typeof n === 'number' ? n.toLocaleString() : '—'
  const statLines: string[] = []
  if (byP['spotify']?.monthlyListeners)  statLines.push(`Spotify: ${fmt(byP['spotify'].monthlyListeners)} monthly listeners`)
  if (byP['soundcloud']?.followers)      statLines.push(`SoundCloud: ${fmt(byP['soundcloud'].followers)} followers`)
  if (byP['youtube']?.subscribers)       statLines.push(`YouTube: ${fmt(byP['youtube'].subscribers)} subs`)

  const releaseLines = releases.length > 0
    ? releases.slice(0, 3).map(r => {
        const days = Math.ceil((new Date(r.release_date).getTime() - new Date(today).getTime()) / 86_400_000)
        return `"${r.title}" (${r.type}) in ${days}d`
      }).join('; ')
    : 'No upcoming releases'

  const eventLines = events.length > 0
    ? events.slice(0, 3).map(e => `${e.title} on ${e.event_date}`).join('; ')
    : 'Nothing on calendar'

  const taskLines = tasks.length > 0
    ? tasks.slice(0, 5).map(t => `- ${t.content}`).join('\n')
    : 'No pending tasks'

  const voice = TONE_VOICE[user.tone ?? ''] ?? TONE_VOICE['Assistant Manager']
  const name = (user.artist_name ?? 'there').split('@')[0]

  const systemPrompt = `You are uP, the AI music career assistant texting ${name} via iMessage as a morning check-in.

Voice: ${voice}

Today's context for ${name}:
- Live stats: ${statLines.length ? statLines.join('; ') : 'No platforms linked'}
- Upcoming releases: ${releaseLines}
- Calendar: ${eventLines}
- Pending tasks:
${taskLines}

Compose a SHORT morning check-in (2-4 sentences max, plain text, no markdown).
Lead with the single most important thing for today — pick from: next release deadline if <=7 days out, oldest pending task, biggest stat shift if streaming numbers changed materially, or a calendar event in next 2 days.
End with one open-ended question or call to action they can reply to.
Do not greet with "Good morning" if it's later in the day. Match their timezone implicitly via tone.
Never repeat the same opener you used in your last check-in.`

  const recentConvo = (lastConvosRes.data ?? []).reverse().map(c => ({
    role:    (c as { role: string }).role as 'user' | 'assistant',
    content: (c as { content: string }).content,
  }))

  let text = ''
  try {
    const res = await anthropic.messages.create({
      model:      'claude-haiku-4-5',
      max_tokens: 220,
      system:     systemPrompt,
      messages:   [
        ...recentConvo,
        { role: 'user', content: 'Send my morning check-in now.' },
      ],
    })
    text = res.content[0].type === 'text' ? res.content[0].text.trim() : ''
  } catch (err) {
    console.error('[up-checkin] Claude error:', err)
    return { sent: false, text: null }
  }

  // Strip any <up_tasks> block the model might add
  text = text.replace(/<up_tasks>[\s\S]*?<\/up_tasks>/g, '').trim()
  if (!text) return { sent: false, text: null }

  const ok = await sendBlooio(user.phone_number, text)
  if (ok) {
    await Promise.all([
      supabase.from('artist_preferences')
        .update({ last_checkin_at: new Date().toISOString() })
        .eq('user_id', user.user_id),
      supabase.from('up_conversations').insert({
        user_id: user.user_id, role: 'assistant', content: text, channel: 'imessage',
      }),
    ])
  }
  return { sent: ok, text }
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (!ANTHROPIC_KEY || !BLOOIO_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
    console.warn('[up-checkin] missing env vars — skipping')
    return { statusCode: 200, body: 'Not configured' }
  }

  const supabase  = createClient(SUPABASE_URL, SUPABASE_KEY)
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

  // ─── Manual single-user trigger (test from settings) ───────────────────
  if (event.httpMethod === 'POST') {
    let body: { userId?: string; test?: boolean } = {}
    try { body = JSON.parse(event.body ?? '{}') } catch { /* noop */ }
    if (!body.userId) return { statusCode: 400, body: 'userId required' }

    const { data } = await supabase
      .from('artist_preferences')
      .select('user_id, artist_name, tone, phone_number, plan_tier, checkin_hour, checkin_timezone, checkin_frequency, last_checkin_at')
      .eq('user_id', body.userId)
      .maybeSingle()

    if (!data?.phone_number) {
      return { statusCode: 200, body: JSON.stringify({ ok: false, error: 'no_phone' }) }
    }
    if (data.plan_tier === 'free' && !body.test) {
      return { statusCode: 200, body: JSON.stringify({ ok: false, error: 'requires_pro' }) }
    }

    const result = await composeAndSend(data as CheckinUser, supabase, anthropic)
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: result.sent, preview: result.text }),
    }
  }

  // ─── Scheduled run — find due users ─────────────────────────────────────
  const { data: candidates } = await supabase
    .from('artist_preferences')
    .select('user_id, artist_name, tone, phone_number, plan_tier, checkin_hour, checkin_timezone, checkin_frequency, last_checkin_at')
    .eq('checkin_enabled', true)
    .neq('plan_tier', 'free')                          // Pro+ only
    .not('phone_number', 'is', null)

  const users = (candidates ?? []) as CheckinUser[]
  const due = users.filter(u =>
    hourInTz(u.checkin_timezone) === u.checkin_hour &&
    shouldFireToday(u) &&
    !alreadySentToday(u),
  )

  console.log(`[up-checkin] scheduled run — ${users.length} enrolled, ${due.length} due this hour`)

  // Send in parallel but cap concurrency at 4 so we don't blow up Blooio
  const concurrency = 4
  let sentCount = 0
  for (let i = 0; i < due.length; i += concurrency) {
    const batch = due.slice(i, i + concurrency)
    const results = await Promise.all(batch.map(u => composeAndSend(u, supabase, anthropic)))
    sentCount += results.filter(r => r.sent).length
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ enrolled: users.length, due: due.length, sent: sentCount }),
  }
}
