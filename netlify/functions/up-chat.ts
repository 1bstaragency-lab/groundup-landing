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

  return `You are uP, the AI music career assistant inside the GrounduP Artist OS platform.

# WHO YOU ARE
You are the artist's personal music business brain — part strategist, part coach, part operator. You know the music industry: DSP rollout strategy, playlisting, press, sync, social content, release timing, streaming economics, team management, tour routing, publishing, and more.

You have full context about this artist's releases, events, and career. You give real, specific, actionable advice — not generic platitudes. You reference their actual releases, dates, and progress when relevant.

# YOUR VOICE
${voice}

# ARTIST CONTEXT
**Name:** ${context.artistName}
**Points:** ${context.points} pts available (${context.totalEarned} total earned)

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
- End responses with a natural follow-up hook when appropriate, but don't force it every time`
}

interface ArtistContext {
  artistName: string
  tone: string | null
  releases: Array<{ title: string; type: string; release_date: string; checklist: Array<{ label: string; done: boolean }> }>
  events: Array<{ title: string; event_type: string; event_date: string }>
  points: number
  totalEarned: number
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

  const [profileRes, releasesRes, eventsRes, historyRes] = await Promise.all([
    supabase.from('artist_profiles').select('artist_name, tone').eq('user_id', userId).single(),
    supabase.from('releases').select('title, type, release_date, checklist').eq('user_id', userId).order('release_date', { ascending: true }).limit(10),
    supabase.from('calendar_events').select('title, event_type, event_date').eq('user_id', userId).gte('event_date', new Date().toISOString().split('T')[0]).order('event_date', { ascending: true }).limit(10),
    conversationId
      ? supabase.from('up_conversations').select('role, content').eq('conversation_id', conversationId).order('created_at', { ascending: true }).limit(20)
      : Promise.resolve({ data: [] }),
  ])

  const profile  = profileRes.data
  const releases = releasesRes.data ?? []
  const events   = eventsRes.data ?? []
  const history  = (historyRes.data ?? []) as ConvMessage[]

  const context: ArtistContext = {
    artistName: profile?.artist_name ?? 'Artist',
    tone:       profile?.tone ?? null,
    releases,
    events,
    points:      pointsAvailable,
    totalEarned,
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

  // ─── Persist conversation to Supabase ─────────────────────────────────────
  let convId = conversationId
  if (!convId) {
    // Create new conversation
    const { data: conv } = await supabase.from('up_conversations').insert({
      user_id: userId,
      role:    'user',
      content: message,
    }).select('conversation_id').single()
    convId = conv?.conversation_id
  }

  if (convId) {
    // Save user message (if it was a new conversation, already done above via the insert)
    if (conversationId) {
      await supabase.from('up_conversations').insert({ user_id: userId, conversation_id: convId, role: 'user', content: message })
    }
    // Save assistant reply
    await supabase.from('up_conversations').insert({ user_id: userId, conversation_id: convId, role: 'assistant', content: assistantReply })
  }

  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, reply: assistantReply, conversationId: convId }),
  }
}
