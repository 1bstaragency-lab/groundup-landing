/**
 * mvp-chat.ts — anonymous chat endpoint for the /mvp web preview.
 *
 * The full /up-chat function requires a Supabase user_id for context
 * lookup. The /mvp preview is intentionally auth-less — visitors should
 * be able to message uP without creating an account.
 *
 * This endpoint:
 *   - Takes the artist's onboarding context (name, genre, goal, pains)
 *     directly in the request body
 *   - Forwards a system prompt + message history to Anthropic
 *   - Returns the assistant's text reply
 *   - Does NOT persist to Supabase (client owns chat state via localStorage)
 *
 * POST body: {
 *   artistName: string
 *   genre?: string
 *   goal?: string
 *   pains?: string[]
 *   history: Array<{ role: 'user' | 'assistant'; content: string }>
 *   message: string
 * }
 *
 * Required Netlify env vars:
 *   ANTHROPIC_API_KEY
 */
import type { Handler } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ReqBody {
  artistName?: string
  genre?:      string
  goal?:       string
  pains?:      string[]
  history?:    Array<{ role: 'user' | 'assistant'; content: string }>
  message?:    string
}

function buildSystemPrompt(b: ReqBody): string {
  const name  = b.artistName?.trim() || 'Artist'
  const genre = b.genre  || 'their genre'
  const goal  = b.goal   || 'grow their music career'
  const pains = (b.pains ?? []).join(', ') || 'none specified yet'

  return `You are uP, the AI music career assistant inside the GrounduP Artist OS.

# WHO YOU ARE
You are ${name}'s personal music business brain — part strategist, part
coach, part operator. You know the music industry: DSP rollout strategy,
playlisting, press, sync, social content, release timing, streaming
economics, team management, tour routing, publishing, and more.

You give real, specific, actionable advice — not generic platitudes.
You reference the artist's actual context when relevant.

# ARTIST CONTEXT
Name:    ${name}
Genre:   ${genre}
Goal:    ${goal}
Blocks:  ${pains}

# YOUR VOICE
You speak like a ride-or-die assistant manager — real, casual, hyped,
no corporate fluff. You celebrate wins and keep it 100 when something
needs fixing. Use slang naturally but stay smart. Concise — 2-5
sentences or a short bulleted list unless more depth is asked for.

# RESPONSE RULES
- Reference ${name}'s actual context (genre, goal, blocks) when relevant
- Suggest specific next actions, not vague advice
- You can help with: rollout strategy, playlist pitching, social content,
  PR timing, budget allocation, sync, songwriting, publishing
- Never say "as an AI" or break character. You ARE uP.
- If you don't know something specific, ask for it`
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  if (!ANTHROPIC_KEY) {
    return {
      statusCode: 200,
      headers:    { ...CORS, 'Content-Type': 'application/json' },
      body:       JSON.stringify({
        ok:    false,
        reply: "I'm not wired up yet — ANTHROPIC_API_KEY missing in Netlify env vars.",
      }),
    }
  }

  let body: ReqBody
  try { body = JSON.parse(event.body ?? '{}') }
  catch { return { statusCode: 400, headers: CORS, body: 'Invalid JSON' } }

  const message = (body.message ?? '').trim()
  if (!message) {
    return { statusCode: 400, headers: CORS, body: 'message required' }
  }

  const history = (body.history ?? []).slice(-12)  // cap context window

  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })
    const response = await anthropic.messages.create({
      model:      'claude-haiku-4-5',          // fast + cheap for chat
      max_tokens: 380,
      system:     buildSystemPrompt(body),
      messages: [
        ...history.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: message },
      ],
    })

    const reply = response.content[0]?.type === 'text'
      ? response.content[0].text
      : "I'm thinking — try that again?"

    return {
      statusCode: 200,
      headers:    { ...CORS, 'Content-Type': 'application/json' },
      body:       JSON.stringify({ ok: true, reply }),
    }
  } catch (err) {
    console.error('[mvp-chat] Anthropic error:', err)
    return {
      statusCode: 502,
      headers:    { ...CORS, 'Content-Type': 'application/json' },
      body:       JSON.stringify({
        ok:    false,
        reply: "Couldn't reach Claude — check ANTHROPIC_API_KEY and try again.",
      }),
    }
  }
}
