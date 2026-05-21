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
  // ─── Diagnostic: GET /?ping=1 returns env var status & DB sanity check ────
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters ?? {}
    if (params.ping === '1') {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
      let phoneSample: Array<{ phone_number: string | null }> = []
      let phoneError: string | null = null
      try {
        const { data, error } = await supabase
          .from('artist_profiles')
          .select('phone_number')
          .not('phone_number', 'is', null)
          .limit(20)
        phoneSample = data ?? []
        phoneError  = error?.message ?? null
      } catch (e) {
        phoneError = String(e)
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          env: {
            BLOOIO_API_KEY:           !!BLOOIO_API_KEY,
            BLOOIO_WEBHOOK_SECRET:    !!BLOOIO_WEBHOOK_SECRET,
            ANTHROPIC_API_KEY:        !!ANTHROPIC_KEY,
            VITE_SUPABASE_URL:        !!SUPABASE_URL,
            SUPABASE_KEY:             !!SUPABASE_KEY,
            keyType: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : process.env.VITE_SUPABASE_ANON_KEY ? 'anon' : 'MISSING',
          },
          supabase: {
            url: SUPABASE_URL ? SUPABASE_URL.replace(/^https?:\/\//, '').slice(0, 30) + '...' : null,
            phonesInDb: phoneSample.length,
            samplePhones: phoneSample.map(p => p.phone_number),
            queryError: phoneError,
          },
        }, null, 2),
      }
    }
    if (params.recent === '1') {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
      const { data, error } = await supabase
        .from('up_conversations')
        .select('role, content, channel, created_at')
        .eq('channel', 'imessage')
        .order('created_at', { ascending: false })
        .limit(20)
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, error: error?.message }, null, 2),
      }
    }
    if (params.hits === '1') {
      // Show raw webhook events — proves whether Blooio is calling us at all
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
      const { data, error } = await supabase
        .from('webhook_events')
        .select('source, headers, payload, created_at')
        .order('created_at', { ascending: false })
        .limit(20)
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: data?.length ?? 0, data, error: error?.message }, null, 2),
      }
    }
    return { statusCode: 405, body: 'Use POST for inbound webhooks. GET ?ping=1 or ?recent=1 for diagnostics.' }
  }

  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' }

  // ─── Log headers (still no strict auth until we identify Blooio's header) ──
  const safeHeaders = Object.fromEntries(
    Object.entries(event.headers).filter(([k]) => !k.toLowerCase().includes('cookie'))
  )
  console.log('[blooio-webhook] Headers:', JSON.stringify(safeHeaders))

  // ─── Unconditional hit log to webhook_events (proves Blooio is calling us) ──
  const sourceIp = event.headers['x-forwarded-for'] ?? event.headers['x-nf-client-connection-ip'] ?? ''
  let rawPayload: unknown = null
  try { rawPayload = JSON.parse(event.body ?? 'null') } catch { rawPayload = event.body }
  if (SUPABASE_URL && SUPABASE_KEY) {
    const supabaseHit = createClient(SUPABASE_URL, SUPABASE_KEY)
    await supabaseHit.from('webhook_events').insert({
      source:  'blooio',
      headers: safeHeaders,
      payload: rawPayload as object,
      ip:      sourceIp,
    })
  }

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
      console.warn('[blooio-webhook] Signature mismatch — continuing anyway. Header value:', sigHeader || '(none)')
    }
  }

  let payload: BlooioInbound
  try {
    payload = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' }
  }

  console.log('[blooio-webhook] Inbound payload:', JSON.stringify(payload))

  const anyPayload = payload as Record<string, unknown>
  const fromPhone   = (payload.from ?? (anyPayload.sender as string) ?? '') as string
  const inboundText = (payload.text ?? payload.message ?? payload.body ?? (anyPayload.content as string) ?? '') as string

  if (!fromPhone || !inboundText) {
    console.log('[blooio-webhook] Missing from/text — ignoring')
    return { statusCode: 200, body: 'No sender/text' }
  }

  if (!BLOOIO_API_KEY || !ANTHROPIC_KEY) {
    console.log('[blooio-webhook] Missing required API keys')
    return { statusCode: 200, body: 'Not configured' }
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('[blooio-webhook] Supabase not configured — set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)')
    await sendBlooio(fromPhone, "uP is misconfigured — Supabase credentials missing on the server. Reach out to support.")
    return { statusCode: 200, body: 'Supabase not configured' }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  // ─── Bulletproof phone lookup: try multiple formats ───────────────────────
  const digits = fromPhone.replace(/\D/g, '')
  const last10 = digits.slice(-10)
  const candidates = Array.from(new Set([
    fromPhone,                  // raw as Blooio sent it
    `+${digits}`,               // +<all digits>
    `+1${last10}`,              // +1<last10>
    last10,                     // last 10 digits only
    digits,                     // all digits
  ].filter(Boolean)))

  console.log('[blooio-webhook] Looking up phone — candidates:', JSON.stringify(candidates), 'last10:', last10)

  // Try exact match first (any candidate)
  let { data: profile } = await supabase
    .from('artist_profiles')
    .select('user_id, artist_name, tone, phone_number')
    .in('phone_number', candidates)
    .limit(1)
    .maybeSingle()

  // Fallback: fuzzy match on last 10 digits using ilike
  if (!profile && last10.length === 10) {
    const fuzzy = await supabase
      .from('artist_profiles')
      .select('user_id, artist_name, tone, phone_number')
      .ilike('phone_number', `%${last10}%`)
      .limit(1)
      .maybeSingle()
    profile = fuzzy.data
    console.log('[blooio-webhook] Fuzzy match result:', JSON.stringify({ found: !!profile, stored: profile?.phone_number }))
  } else {
    console.log('[blooio-webhook] Exact match result:', JSON.stringify({ found: !!profile, stored: profile?.phone_number }))
  }

  // ─── Auto-normalize mangled phone records to canonical E.164 ──────────────
  if (profile?.phone_number) {
    const storedDigits = profile.phone_number.replace(/\D/g, '')
    const canonical = '+' + (storedDigits.length > 10 ? storedDigits.slice(-11) : '1' + storedDigits)
    if (profile.phone_number !== canonical) {
      console.log(`[blooio-webhook] Normalizing stored phone "${profile.phone_number}" → "${canonical}"`)
      supabase.from('artist_profiles').update({ phone_number: canonical }).eq('user_id', profile.user_id)
        .then(() => console.log('[blooio-webhook] Phone normalized'))
    }
  }

  if (!profile) {
    const { data: allPhones } = await supabase
      .from('artist_profiles')
      .select('phone_number')
      .not('phone_number', 'is', null)
      .limit(20)
    console.log('[blooio-webhook] No match. All stored phones:', JSON.stringify(allPhones))

    await sendBlooio(fromPhone, "Hey! I don't recognize this number. Log into your GrounduP account and connect your phone under Profile to chat with uP 🎵")
    return { statusCode: 200, body: 'Unknown number' }
  }

  const userId = profile.user_id
  const voice  = TONE_VOICE[profile.tone ?? ''] ?? TONE_VOICE['Assistant Manager']

  // ─── Parallel: releases, events, history, plan tier, today's message count ──
  const today = new Date().toISOString().split('T')[0]
  const startOfDay = `${today}T00:00:00.000Z`
  const [releasesRes, eventsRes, historyRes, prefsRes, countRes, snapsRes] = await Promise.all([
    supabase.from('releases').select('title, type, release_date, checklist').eq('user_id', userId).order('release_date', { ascending: true }).limit(5),
    supabase.from('calendar_events').select('title, event_type, event_date').eq('user_id', userId).gte('event_date', today).order('event_date', { ascending: true }).limit(5),
    supabase.from('up_conversations').select('role, content').eq('user_id', userId).eq('channel', 'imessage').order('created_at', { ascending: false }).limit(6),
    supabase.from('artist_preferences').select('plan_tier').eq('user_id', userId).maybeSingle(),
    supabase.from('up_conversations').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).eq('channel', 'imessage').eq('role', 'user')
      .gte('created_at', startOfDay),
    supabase.from('platform_snapshots').select('platform, stats, fetched_at').eq('user_id', userId).order('fetched_at', { ascending: false }).limit(15),
  ])

  // ─── Enforce plan-based daily iMessage limit ───────────────────────────────
  const planTier = (prefsRes.data?.plan_tier ?? 'free') as 'free' | 'pro' | 'growth'
  const dailyMax: Record<typeof planTier, number> = { free: 5, pro: 100, growth: 500 }
  const usedToday = countRes.count ?? 0
  console.log('[blooio-webhook] Plan check —', JSON.stringify({ planTier, usedToday, max: dailyMax[planTier] }))

  if (usedToday >= dailyMax[planTier]) {
    const upgradeLine = planTier === 'free'
      ? 'You hit your daily uP message limit on the Starter plan. Upgrade to Pro at groundupapp.com/pricing for 100/day. Resets at midnight.'
      : planTier === 'pro'
      ? 'You hit today\'s 100-message Pro limit. Upgrade to Growth at groundupapp.com/pricing for 500/day. Resets at midnight.'
      : 'You hit today\'s 500-message limit. Wild. Reach out to support if you need more. Resets at midnight.'
    await sendBlooio(fromPhone, upgradeLine)
    // Still log the inbound so we have a record of throttle hits
    await supabase.from('up_conversations').insert([
      { user_id: userId, role: 'user',      content: inboundText, channel: 'imessage' },
      { user_id: userId, role: 'assistant', content: upgradeLine, channel: 'imessage' },
    ])
    return { statusCode: 200, body: 'Rate limited' }
  }

  const releases = releasesRes.data ?? []
  const events   = eventsRes.data ?? []
  const priorMessages = (historyRes.data ?? [])
    .reverse()
    .map(h => ({ role: h.role as 'user' | 'assistant', content: h.content }))

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

  // Latest platform snapshot per platform
  const snaps = (snapsRes.data ?? []) as Array<{ platform: string; stats: Record<string, unknown> }>
  const latestByPlatform: Record<string, Record<string, unknown>> = {}
  for (const s of snaps) if (!latestByPlatform[s.platform]) latestByPlatform[s.platform] = s.stats

  const fmt = (n: unknown) => typeof n === 'number' ? n.toLocaleString() : '—'
  const sp = latestByPlatform['spotify']
  const sc = latestByPlatform['soundcloud']
  const yt = latestByPlatform['youtube']
  const statLines: string[] = []
  if (sp?.monthlyListeners) statLines.push(`Spotify ${fmt(sp.monthlyListeners)} monthly listeners`)
  if (sc?.followers)        statLines.push(`SoundCloud ${fmt(sc.followers)} followers`)
  if (yt?.subscribers)      statLines.push(`YouTube ${fmt(yt.subscribers)} subs`)
  const statSummary = statLines.length > 0 ? statLines.join(', ') : 'No platforms linked'

  const systemPrompt = `You are uP, the AI music career assistant for ${profile.artist_name} on GrounduP. ${voice}

Artist context:
- Live stats: ${statSummary}
- Releases: ${releaseSummary}
- Events: ${eventSummary}

FORMAT: iMessage only — plain text, no markdown, no bullet symbols. Use numbers or line breaks when listing steps. Keep it conversational and direct.

RELEASE INTAKE FLOW — when the artist mentions dropping, releasing, or uploading any song or project, run through these qualifying questions ONE AT A TIME (ask one, wait for the answer, then move to the next):

Step 1 — Platform & upload type:
  - SoundCloud: "Is this going on your own profile, or is a DJ / producer uploading it to their page?"
  - Spotify / Apple Music: "Are you distributing through DistroKid, TuneCore, or another distributor?"
  - TikTok / YouTube: "Is this an original post on your channel, or a collab with another creator?"

Step 2 — Timeline & assets: Confirm the exact drop date and whether cover art, caption, and audio file are locked.

Step 3 — Promo angle: Ask who the target audience is and whether they have any TikTok hooks, playlist targets, blog outreach, or curators lined up.

After you have that context, send a short numbered rollout checklist (3-5 steps max) tailored to their platform and timeline. Reference their real stats and mention that their GrounduP dashboard has an influencer network and curator tool they can use to find the right people.

Never ask all questions at once — one question per reply, wait for their answer.

TASK EXTRACTION: If you identify any action items for the artist, append them at the VERY END (auto-stripped, not seen by artist):
<up_tasks>["Task 1 (5-10 words)", "Task 2"]</up_tasks>
Only if genuinely actionable. Omit entirely if no tasks.`

  // ─── Call Claude — use Haiku for speed (perfect for short iMessage replies) ─
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })
  let reply = ''
  try {
    const res = await anthropic.messages.create({
      model:      'claude-haiku-4-5',
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

  // ─── Send reply + log in parallel; await both so Lambda doesn't freeze logging ──
  const sendP = sendBlooio(fromPhone, cleanReply)
  const logP  = supabase.from('up_conversations').insert([
    { user_id: userId, role: 'user',      content: inboundText, channel: 'imessage' },
    { user_id: userId, role: 'assistant', content: cleanReply,  channel: 'imessage' },
  ])
  const tasksP = tasks.length > 0
    ? supabase.from('up_tasks').insert(tasks.map(content => ({ user_id: userId, content, source: 'imessage' })))
    : Promise.resolve()

  const [, logRes, tasksRes] = await Promise.all([sendP, logP, tasksP])
  if (logRes && (logRes as { error?: unknown }).error) {
    console.error('[blooio-webhook] Conversation log error:', (logRes as { error: unknown }).error)
  }
  if (tasksRes && (tasksRes as { error?: unknown }).error) {
    console.error('[blooio-webhook] Task log error:', (tasksRes as { error: unknown }).error)
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
