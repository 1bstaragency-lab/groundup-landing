/**
 * Generic platform link scraper
 *
 * Accepts a public URL from any supported platform (Spotify, SoundCloud,
 * YouTube), detects which one, fetches the public HTML and parses whatever
 * public data we can extract.
 *
 * No OAuth, no API keys. Just whatever's visible to any visitor.
 *
 * POST body: { userId: string, url: string }
 *
 * Scraping logic lives in _shared/platformScrape.ts — shared with
 * stats-refresh.ts (automatic sync on login).
 */
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import { detectPlatform, scrapeByPlatform, type ScrapeResult } from './_shared/platformScrape'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL          ?? ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY  ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  let body: { userId?: string; url?: string }
  try { body = JSON.parse(event.body ?? '{}') }
  catch { return { statusCode: 400, headers: CORS, body: 'Invalid JSON' } }

  const { userId, url } = body
  if (!userId || !url) {
    return { statusCode: 400, headers: CORS, body: 'userId + url required' }
  }

  const detected = detectPlatform(url)
  if (!detected) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'unknown_platform', message: "We don't recognize that URL — paste a Spotify, SoundCloud, or YouTube link." }),
    }
  }

  let result: ScrapeResult
  try {
    result = await scrapeByPlatform(detected.platform, detected.profileId)
  } catch (err) {
    console.error(`[platform-fetch:${detected.platform}] scrape error:`, err)
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'fetch_failed', message: 'Could not fetch that page right now — try again in a minute.' }),
    }
  }

  const saveWarnings: string[] = []
  if (SUPABASE_URL && SUPABASE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const urlColumn =
      detected.platform === 'soundcloud' ? 'soundcloud_url' :
      detected.platform === 'youtube'    ? 'youtube_url'    :
                                            'spotify_url'

    // Update existing row. If the user has no artist_preferences row yet
    // (rare — happens if onboarding was skipped), upsert with a sentinel
    // artist_name to satisfy the NOT NULL constraint.
    const { error: prefsErr, count } = await supabase
      .from('artist_preferences')
      .update({ [urlColumn]: url }, { count: 'exact' })
      .eq('user_id', userId)
    if (prefsErr) {
      console.error(`[platform-fetch] artist_preferences update error:`, prefsErr)
      saveWarnings.push(`URL not bound: ${prefsErr.message}`)
    } else if ((count ?? 0) === 0) {
      // No row existed — create one with placeholder artist_name
      const { error: insErr } = await supabase
        .from('artist_preferences')
        .insert({ user_id: userId, artist_name: 'Artist', [urlColumn]: url })
      if (insErr) {
        console.error(`[platform-fetch] artist_preferences insert error:`, insErr)
        saveWarnings.push(`URL not bound: ${insErr.message}`)
      }
    }

    const { error: snapErr } = await supabase.from('platform_snapshots').insert({
      user_id:      userId,
      platform:     result.platform,
      profile_id:   result.profileId,
      display_name: result.displayName,
      stats:        result.stats,
      top_items:    result.topItems,
      image_url:    result.imageUrl,
      raw_meta:     result.rawMeta,
    })
    if (snapErr) {
      console.error(`[platform-fetch] platform_snapshots insert error:`, snapErr)
      saveWarnings.push(`Snapshot not stored: ${snapErr.message}`)
    }
  }

  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, data: result, warnings: saveWarnings.length ? saveWarnings : undefined }),
  }
}
