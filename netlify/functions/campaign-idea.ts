/**
 * Generate a short promotion idea for an influencer campaign.
 * Only meaningful for content platforms (TikTok / Twitter / YouTube) — not
 * Spotify/SoundCloud (those are placements, not creative posts).
 *
 * POST { platform, influencerName, niche, song?, artist?, type? }
 * → { ok, idea }
 *
 * Env: ANTHROPIC_API_KEY
 */
import type { Handler } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const IDEA_PLATFORMS = ['TikTok', 'Twitter', 'YouTube']

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  if (!ANTHROPIC_KEY) {
    return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'not_configured' }) }
  }

  let body: { platform?: string; influencerName?: string; niche?: string; song?: string; artist?: string }
  try { body = JSON.parse(event.body ?? '{}') }
  catch { return { statusCode: 400, headers: CORS, body: 'Invalid JSON' } }

  const { platform = '', influencerName = '', niche = '', song = '', artist = '' } = body

  if (!IDEA_PLATFORMS.includes(platform)) {
    return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'platform_not_supported',
        message: `Idea generation isn't applicable for ${platform} — that's a placement, not a content post.` }) }
  }

  // Each platform trends differently — tailor the format the idea should take.
  const PLATFORM_GUIDE: Record<string, string> = {
    TikTok: `TikTok ideas must be SHORT-FORM VIDEO concepts built around the track as a sound: a trend/challenge, a POV skit, a transition, a "use this sound" hook, or a relatable scenario synced to a specific lyric or beat drop. Reference timing/visual beats. Think viral-loop, watch-to-end.`,
    Twitter: `Twitter/X ideas must fit the platform's TEXT-FIRST, fast-conversation culture: a punchy quote-tweet take, a meme/screenshot with a one-liner, a "name a song that goes harder than this" bait, a relatable hot-take tweet that links the track, or a reply-guy thread. NO video-trend formats — Twitter is about wit, debate, and shareable text/images, not choreography.`,
    YouTube: `YouTube ideas must be longer-form or Shorts concepts: a reaction/first-listen, a "songs that should be bigger" breakdown, a beat/production analysis, a playlist placement with commentary, or a Short stitching the hook. Lean on watch-time and discovery via title/thumbnail.`,
  }

  const sys = `You are uP, a music marketing strategist. Generate ONE concrete, scroll-stopping ${platform} content idea a creator could post to promote a track.

PLATFORM RULES — ${PLATFORM_GUIDE[platform]}

Tailor it to the creator's niche. 1-2 sentences, punchy, no preamble, no markdown, no hashtag lists. Just the idea, in the native format for ${platform}.`

  const ctx = [
    influencerName && `Creator: ${influencerName}`,
    niche && `Niche: ${niche}`,
    artist && `Artist: ${artist}`,
    song && `Track: "${song}"`,
  ].filter(Boolean).join(' · ')

  try {
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })
    const res = await anthropic.messages.create({
      model:      'claude-haiku-4-5',
      max_tokens: 160,
      system:     sys,
      messages:   [{ role: 'user', content: `Give me a ${platform} promo idea. ${ctx}` }],
    })
    const idea = res.content[0].type === 'text' ? res.content[0].text.trim() : ''
    return { statusCode: 200, headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, idea }) }
  } catch (err) {
    console.error('[campaign-idea] error:', err)
    return { statusCode: 502, headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: String(err) }) }
  }
}
