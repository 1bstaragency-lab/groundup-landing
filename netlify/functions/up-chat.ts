import type { Handler } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? ''
const SUPABASE_URL  = process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? ''

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// ─── Relationship voice map ───────────────────────────────────────────────────
const TONE_VOICE: Record<string, string> = {
  'Assistant Manager': 'You speak professionally and proactively — like a dedicated assistant manager who anticipates needs, keeps track of details, and always has the artist\'s back. Formal but warm. Results-focused.',
  'Your Boy':          'You speak like a ride-or-die homie — real, casual, hyped, no corporate fluff. You celebrate wins loud and keep it 100 when something needs fixing. Use slang naturally but stay smart.',
  'Label Rep':         'You speak like a polished A&R or label rep — data-driven, industry-savvy, focused on growth metrics, positioning, and market opportunities. Professional tone with creative insight.',
  'Road Manager':      'You speak like a no-nonsense road manager — practical, logistical, keep-it-moving energy. You handle details, flag problems fast, and make sure everything runs on schedule.',
  'Creative Partner':  'You speak like a trusted creative collaborator — inspired, visionary, curious. You push the artist\'s ideas further, ask the right questions, and match their creative energy.',
}

function buildSystemPrompt(context: ArtistContext): string {
  const voice = TONE_VOICE[context.tone ?? ''] ?? TONE_VOICE['Assistant Manager']

  const upcomingReleases = context.releases
    .filter(r => r.release_date && new Date(r.release_date) >= new Date())
    .slice(0, 5)

  const releaseSummary = upcomingReleases.length > 0
    ? upcomingReleases.map(r => {
        const tasks = (r.checklist ?? [])
        const done  = tasks.filter((t: { done: boolean }) => t.done).length
        return `• "${r.title}" (${r.type}) — ${r.release_date} — ${done}/${tasks.length} checklist items done`
      }).join('\n')
    : '• No upcoming releases logged yet'

  const upcomingEvents = context.events.slice(0, 5).map(e =>
    `• ${e.title} (${e.event_type}) — ${e.event_date}`
  ).join('\n') || '• No events on the calendar yet'

  // Platform stats summary
  const ps = context.platformStats
  const fmt = (n: number | null) => n === null ? '—' : n.toLocaleString()
  const platformLines: string[] = []
  if (ps.monthlyListeners !== null) platformLines.push(`Spotify monthly listeners: ${fmt(ps.monthlyListeners)}`)
  if (ps.spotifyTopTracks.length > 0) {
    const topLine = ps.spotifyTopTracks.slice(0, 3).map(t =>
      t.plays ? `${t.name} (${fmt(t.plays)} plays)` : t.name
    ).join('; ')
    platformLines.push(`Spotify top tracks: ${topLine}`)
  }
  if (ps.scFollowers !== null) platformLines.push(`SoundCloud: ${fmt(ps.scFollowers)} followers · ${fmt(ps.scPlays)} plays · ${fmt(ps.scTracks)} tracks`)
  if (ps.ytSubscribers !== null) platformLines.push(`YouTube: ${fmt(ps.ytSubscribers)} subscribers · ${fmt(ps.ytVideos)} videos`)
  const platformBlock = platformLines.length > 0
    ? platformLines.map(l => `- ${l}`).join('\n')
    : '- No platforms linked yet (artist should connect Spotify/SoundCloud/YouTube in Analytics)'

  return `You are uP, the AI music career assistant inside the GrounduP Artist OS platform.

# WHO YOU ARE
You are the artist's personal music business brain — part strategist, part coach, part operator. You know the music industry: DSP rollout strategy, playlisting, press, sync, social content, release timing, streaming economics, team management, tour routing, publishing, and more.

You have full context about this artist's releases, events, and live streaming numbers. You give real, specific, actionable advice — not generic platitudes. You reference their actual releases, dates, and current numbers when relevant.

# YOUR VOICE
${voice}

# ARTIST CONTEXT
**Name:** ${context.artistName}
**Points:** ${context.points} pts available (${context.totalEarned} total earned)

**Live Platform Stats:**
${platformBlock}

**Upcoming Releases:**
${releaseSummary}

**Calendar Events:**
${upcomingEvents}

# HOW YOU RESPOND
- Keep responses concise — 2-5 sentences or a short bulleted list unless more depth is asked for
- Reference the artist's actual releases and dates when relevant
- Suggest specific next actions, not vague advice
- When asked about a release, check its checklist progress and flag what's missing
- You can help with: rollout strategy, playlist pitching, social content ideas, PR timing, budget allocation, team coordination, touring, sync licensing, songwriting, production, publishing
- Never say "as an AI" or break character. You ARE uP. This is your purpose.
- If you don't know something specific (like real streaming numbers), say so and ask what they have
- End responses with a natural follow-up hook when appropriate, but don't force it every time

# TASK EXTRACTION
If your response implies the artist should take any action (create content, reach out to someone, set a deadline, prepare assets, pitch something, schedule anything, etc.), extract those as specific tasks. Append them at the VERY END of your response in this exact format — the artist will NOT see this block, it is stripped automatically:
<up_tasks>["Action item 1 (5-10 words)", "Action item 2"]</up_tasks>
Rules: Only include genuinely actionable tasks. Keep each task specific and short. Never fabricate tasks not implied by the conversation. Omit the block entirely if no tasks apply.`
}

interface ArtistContext {
  artistName: string
  tone: string | null
  releases: Array<{ title: string; type: string; release_date: string; checklist: Array<{ label: string; done: boolean }> }>
  events: Array<{ title: string; event_type: string; event_date: string }>
  points: number
  totalEarned: number
  platformStats: {
    monthlyListeners: number | null
    spotifyTopTracks: Array<{ name: string; plays?: number | null }>
    scFollowers:      number | null
    scPlays:          number | null
    scTracks:         number | null
    ytSubscribers:    number | null
    ytVideos:         number | null
  }
}

interface ConvMessage {
  role: 'user' | 'assistant'
  content: string
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  if (!ANTHROPIC_KEY) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'ANTHROPIC_API_KEY not set. Add it to Netlify environment variables.' }),
    }
  }

  let body: { message: string; userId: string; conversationId?: string; pointsAvailable?: number; totalEarned?: number }
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return { statusCode: 400, headers: CORS, body: 'Invalid JSON' }
  }

  const { message, userId, conversationId, pointsAvailable = 0, totalEarned = 0 } = body
  if (!message || !userId) {
    return { statusCode: 400, headers: CORS, body: 'message and userId required' }
  }

  // ─── Pull artist context from Supabase ────────────────────────────────────
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const [profileRes, releasesRes, eventsRes, historyRes, snapshotsRes] = await Promise.all([
    supabase.from('artist_profiles').select('artist_name, tone').eq('user_id', userId).single(),
    supabase.from('releases').select('title, type, release_date, checklist').eq('user_id', userId).order('release_date', { ascending: true }).limit(10),
    supabase.from('calendar_events').select('title, event_type, event_date').eq('user_id', userId).gte('event_date', new Date().toISOString().split('T')[0]).order('event_date', { ascending: true }).limit(10),
    conversationId
      ? supabase.from('up_conversations').select('role, content').eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(20)
      : Promise.resolve({ data: [] }),
    supabase.from('platform_snapshots').select('platform, stats, top_items, fetched_at').eq('user_id', userId).order('fetched_at', { ascending: false }).limit(30),
  ])

  const profile  = profileRes.data
  const releases = releasesRes.data ?? []
  const events   = eventsRes.data ?? []
  const history  = (historyRes.data ?? []) as ConvMessage[]

  // Latest snapshot per platform
  const snaps = (snapshotsRes.data ?? []) as Array<{ platform: string; stats: Record<string, unknown>; top_items: Array<{ name: string; subtitle?: string | null }> | null }>
  const byPlatform: Record<string, typeof snaps[number]> = {}
  for (const s of snaps) if (!byPlatform[s.platform]) byPlatform[s.platform] = s

  const sp = byPlatform['spotify']
  const sc = byPlatform['soundcloud']
  const yt = byPlatform['youtube']

  const spotifyTopTracks = (sp?.top_items ?? []).slice(0, 5).map(t => ({
    name:  t.name,
    plays: t.subtitle ? parseInt(String(t.subtitle).replace(/[^\d]/g, ''), 10) || null : null,
  }))

  const context: ArtistContext = {
    artistName: profile?.artist_name ?? 'Artist',
    tone:       profile?.tone ?? null,
    releases,
    events,
    points:      pointsAvailable,
    totalEarned,
    platformStats: {
      monthlyListeners: (sp?.stats?.monthlyListeners as number | null) ?? null,
      spotifyTopTracks,
      scFollowers:      (sc?.stats?.followers as number | null) ?? null,
      scPlays:          (sc?.stats?.plays     as number | null) ?? null,
      scTracks:         (sc?.stats?.tracks    as number | null) ?? null,
      ytSubscribers:    (yt?.stats?.subscribers as number | null) ?? null,
      ytVideos:         (yt?.stats?.videos      as number | null) ?? null,
    },
  }

  // ─── Build message history for Claude ─────────────────────────────────────
  const priorMessages: Array<{ role: 'user' | 'assistant'; content: string }> = history.map(h => ({
    role:    h.role,
    content: h.content,
  }))

  // ─── Call Anthropic ───────────────────────────────────────────────────────
  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

  let assistantReply = ''
  try {
    const response = await anthropic.messages.create({
      model:      'claude-opus-4-5',
      max_tokens: 1024,
      system:     buildSystemPrompt(context),
      messages:   [...priorMessages, { role: 'user', content: message }],
    })
    assistantReply = response.content[0].type === 'text' ? response.content[0].text : ''
  } catch (err) {
    console.error('Anthropic error:', err)
    return {
      statusCode: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'Claude API error. Check your ANTHROPIC_API_KEY.' }),
    }
  }

  // ─── Extract tasks from reply ─────────────────────────────────────────────
  const { cleaned: cleanReply, tasks } = extractTasks(assistantReply)
  assistantReply = cleanReply

  // ─── Persist conversation to Supabase ─────────────────────────────────────
  let convId = conversationId
  if (!convId) {
    const { data: conv } = await supabase.from('up_conversations').insert({
      user_id: userId,
      role:    'user',
      content: message,
    }).select('conversation_id').single()
    convId = conv?.conversation_id
  }

  if (convId) {
    if (conversationId) {
      await supabase.from('up_conversations').insert({ user_id: userId, conversation_id: convId, role: 'user', content: message })
    }
    await supabase.from('up_conversations').insert({ user_id: userId, conversation_id: convId, role: 'assistant', content: assistantReply })
  }

  // ─── Save extracted tasks ─────────────────────────────────────────────────
  if (tasks.length > 0) {
    await supabase.from('up_tasks').insert(
      tasks.map(content => ({
        user_id: userId,
        content,
        source: 'app',
        conversation_id: convId ?? undefined,
      }))
    )
  }

  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, reply: assistantReply, conversationId: convId, tasks }),
  }
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
