/**
 * Automatic stats refresh — fired once per login (see Dashboard.tsx).
 *
 * For every platform URL the artist has connected (Spotify/SoundCloud/
 * YouTube), re-scrapes current public stats (same scraper platform-fetch.ts
 * uses), stores a fresh platform_snapshots row, then asks Claude for one
 * short, plain-English headline about what changed since the last sync.
 *
 * Rate-limited server-side via artist_preferences.last_auto_synced_at so
 * rapid repeat logins don't re-scrape or re-call the Anthropic API.
 *
 * POST body: { userId: string }
 *
 * Required Netlify env vars:
 *   ANTHROPIC_API_KEY
 *   VITE_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Requires the 20260714_stats_auto_refresh.sql migration (adds
 * last_auto_synced_at / latest_insight / insight_generated_at to
 * artist_preferences).
 */
import type { Handler } from '@netlify/functions'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { detectPlatform, scrapeByPlatform, type Platform, type ScrapeResult } from './_shared/platformScrape'

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY      ?? ''
const SUPABASE_URL   = process.env.VITE_SUPABASE_URL      ?? ''
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Don't re-scrape/re-call Claude more than once per this window, even if
// the user logs in repeatedly (page refreshes, multiple tabs, etc).
const COOLDOWN_HOURS = 6

const URL_FIELD: Record<Platform, 'spotify_url' | 'soundcloud_url' | 'youtube_url'> = {
  spotify:    'spotify_url',
  soundcloud: 'soundcloud_url',
  youtube:    'youtube_url',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  let body: { userId?: string }
  try { body = JSON.parse(event.body ?? '{}') }
  catch { return { statusCode: 400, headers: CORS, body: 'Invalid JSON' } }

  const { userId } = body
  if (!userId) return { statusCode: 400, headers: CORS, body: 'userId required' }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'not_configured', message: 'Supabase not configured on the server.' }),
    }
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

  const { data: prefs } = await supabase
    .from('artist_preferences')
    .select('artist_name, spotify_url, soundcloud_url, youtube_url, last_auto_synced_at, latest_insight')
    .eq('user_id', userId)
    .maybeSingle()

  if (!prefs) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, skipped: true, reason: 'no_profile' }),
    }
  }

  // Rate limit — skip re-scraping if we synced recently, just hand back the
  // last insight so the UI still has something to show.
  if (prefs.last_auto_synced_at) {
    const hoursSince = (Date.now() - new Date(prefs.last_auto_synced_at).getTime()) / 3_600_000
    if (hoursSince < COOLDOWN_HOURS) {
      return {
        statusCode: 200,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ok: true, skipped: true, reason: 'cooldown', insight: prefs.latest_insight ?? null }),
      }
    }
  }

  const connected: Array<{ platform: Platform; profileId: string }> = []
  for (const platform of Object.keys(URL_FIELD) as Platform[]) {
    const url = prefs[URL_FIELD[platform]] as string | null
    if (!url) continue
    const detected = detectPlatform(url)
    if (detected) connected.push(detected)
  }

  if (connected.length === 0) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, skipped: true, reason: 'no_platforms' }),
    }
  }

  // Pull the previous snapshot per platform BEFORE we overwrite it, so we
  // can hand Claude a before/after comparison.
  const previousByPlatform: Record<string, ScrapeResult['stats']> = {}
  await Promise.all(connected.map(async ({ platform }) => {
    const { data } = await supabase
      .from('platform_snapshots')
      .select('stats')
      .eq('user_id', userId).eq('platform', platform)
      .order('fetched_at', { ascending: false }).limit(1).maybeSingle()
    if (data?.stats) previousByPlatform[platform] = data.stats as ScrapeResult['stats']
  }))

  const fresh: Array<{ platform: Platform; result: ScrapeResult }> = []
  await Promise.all(connected.map(async ({ platform, profileId }) => {
    try {
      const result = await scrapeByPlatform(platform, profileId)
      fresh.push({ platform, result })
    } catch (err) {
      console.error(`[stats-refresh:${platform}] scrape error:`, err)
    }
  }))

  if (fresh.length > 0) {
    await supabase.from('platform_snapshots').insert(
      fresh.map(({ platform, result }) => ({
        user_id:      userId,
        platform,
        profile_id:   result.profileId,
        display_name: result.displayName,
        stats:        result.stats,
        top_items:    result.topItems,
        image_url:    result.imageUrl,
        raw_meta:     result.rawMeta,
      })),
    )
  }

  // ─── Claude insight ─────────────────────────────────────────────────────
  let insight: string | null = null
  if (ANTHROPIC_KEY && fresh.length > 0) {
    try {
      const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })
      const comparison = fresh.map(({ platform, result }) => ({
        platform,
        previous: previousByPlatform[platform] ?? null,
        current:  result.stats,
      }))
      const response = await anthropic.messages.create({
        model:      'claude-haiku-4-5',
        max_tokens: 80,
        system:
          'You are a terse artist-analytics assistant inside a music dashboard. ' +
          'Given an artist\'s previous vs. current stats across their connected ' +
          'platforms, write exactly ONE short, punchy sentence (under 20 words) ' +
          'highlighting the most notable number or change. No fluff, no hashtags, ' +
          'no emoji, no "Great news!" filler — just the fact. If nothing moved, ' +
          'say the number that\'s most worth showing off right now.',
        messages: [{
          role: 'user',
          content: `Artist: ${prefs.artist_name ?? 'Artist'}\nStats: ${JSON.stringify(comparison)}`,
        }],
      })
      const block = response.content[0]
      insight = block.type === 'text' ? block.text.trim() : null
    } catch (err) {
      console.error('[stats-refresh] Anthropic error:', err)
    }
  }

  await supabase
    .from('artist_preferences')
    .update({
      last_auto_synced_at: new Date().toISOString(),
      ...(insight ? { latest_insight: insight, insight_generated_at: new Date().toISOString() } : {}),
    })
    .eq('user_id', userId)

  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok:      true,
      skipped: false,
      synced:  fresh.map(f => f.platform),
      insight,
    }),
  }
}
