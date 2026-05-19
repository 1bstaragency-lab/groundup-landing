/**
 * Spotify public-page scraper
 *
 * No OAuth. Takes the user's Spotify artist URL, fetches the public HTML page,
 * and parses everything we can see from anywhere on the internet:
 *   - og meta tags     (artist name, monthly listeners line)
 *   - JSON-LD blocks   (some pages embed schema.org/MusicGroup)
 *   - embed endpoint   (fallback for top tracks if main page is JS-rendered)
 *
 * Persists every fetch as a snapshot row in spotify_snapshots so we can chart
 * growth over time, and updates artist_preferences.spotify_url.
 *
 * POST body: { userId: string, spotifyUrl: string }
 */
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = process.env.VITE_SUPABASE_URL          ?? ''
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY  ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Realistic browser UA — Spotify serves a different (richer) HTML to bots
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'

interface ScrapedData {
  artistId:         string
  artistName:       string | null
  monthlyListeners: number | null
  followers:        number | null
  topTracks:        Array<{ name: string; albumArt?: string | null }>
  imageUrl:         string | null
  verified:         boolean
  description:      string | null
  rawMeta:          Record<string, string>
}

function extractArtistId(url: string): string | null {
  const trimmed = url.trim()
  // Match /artist/<id>, accept query strings & locale prefixes
  const m = trimmed.match(/(?:spotify[.:](?:com\/(?:[a-z-]+\/)?)?artist[/:])([a-zA-Z0-9]{16,32})/i)
  return m ? m[1] : null
}

function parseMetaTags(html: string): Record<string, string> {
  const out: Record<string, string> = {}
  // Match <meta property="..." content="..."> in either order
  const re = /<meta\s+(?:property|name)=["']([^"']+)["']\s+content=["']([^"']*)["']/gi
  const re2 = /<meta\s+content=["']([^"']*)["']\s+(?:property|name)=["']([^"']+)["']/gi
  let m
  while ((m = re.exec(html)) !== null) out[m[1]] = m[2]
  while ((m = re2.exec(html)) !== null) out[m[2]] = m[1]
  return out
}

function parseMonthlyListeners(text: string): number | null {
  // "Artist · 1,234,567 monthly listeners." or similar
  const m = text.match(/([\d,]+)\s+monthly\s+listeners/i)
  if (!m) return null
  const n = parseInt(m[1].replace(/,/g, ''), 10)
  return Number.isFinite(n) ? n : null
}

function parseJsonLd(html: string): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try { out.push(JSON.parse(m[1])) } catch { /* skip */ }
  }
  return out
}

async function scrape(artistId: string): Promise<ScrapedData> {
  const url = `https://open.spotify.com/artist/${artistId}`
  const res = await fetch(url, {
    headers: {
      'User-Agent':      UA,
      'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  })
  const html = await res.text()
  const meta = parseMetaTags(html)
  const jsonLd = parseJsonLd(html)

  const desc = meta['og:description'] ?? meta['description'] ?? ''
  const ogTitle = meta['og:title'] ?? null
  const image = meta['og:image'] ?? null
  const monthlyListeners = parseMonthlyListeners(desc)

  // Try to find a MusicGroup in JSON-LD
  type Maybe<T> = T | undefined
  const musicGroup = jsonLd.find(j => {
    const t = (j['@type'] as Maybe<string>) ?? ''
    return t === 'MusicGroup' || (Array.isArray(j['@type']) && (j['@type'] as string[]).includes('MusicGroup'))
  }) as Record<string, unknown> | undefined

  // top tracks — Spotify rarely embeds these in static HTML for unauth requests.
  // We try the embed endpoint as a backup, but if it fails just return empty.
  let topTracks: Array<{ name: string; albumArt?: string | null }> = []
  try {
    const embedRes = await fetch(`https://open.spotify.com/embed/artist/${artistId}`, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
    })
    const embedHtml = await embedRes.text()
    // Embed pages include __NEXT_DATA__ JSON with track names
    const nextMatch = embedHtml.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
    if (nextMatch) {
      const nd = JSON.parse(nextMatch[1])
      const entity = (nd?.props?.pageProps?.state?.data?.entity ?? {}) as Record<string, unknown>
      const tracks = (entity.trackList as Array<Record<string, unknown>> | undefined)
        ?? (entity.tracks as Array<Record<string, unknown>> | undefined)
        ?? []
      topTracks = tracks.slice(0, 5).map(t => ({
        name:     String(t.title ?? t.name ?? ''),
        albumArt: typeof t.albumOfTrack === 'object' && t.albumOfTrack !== null
          ? (((t.albumOfTrack as Record<string, unknown>).coverArt as Record<string, unknown> | undefined)?.sources as Array<{ url: string }> | undefined)?.[0]?.url ?? null
          : null,
      })).filter(t => t.name)
    }
  } catch { /* embed failed — fine */ }

  return {
    artistId,
    artistName:       ogTitle?.split(' | Spotify')[0] ?? (musicGroup?.name as string | undefined) ?? null,
    monthlyListeners,
    followers:        null, // not publicly exposed in HTML
    topTracks,
    imageUrl:         image,
    verified:         (musicGroup?.['additionalType'] as string | undefined) === 'VerifiedArtist',
    description:      desc || null,
    rawMeta:          meta,
  }
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: CORS, body: '' }
  if (event.httpMethod !== 'POST')   return { statusCode: 405, headers: CORS, body: 'Method not allowed' }

  let body: { userId?: string; spotifyUrl?: string }
  try { body = JSON.parse(event.body ?? '{}') }
  catch { return { statusCode: 400, headers: CORS, body: 'Invalid JSON' } }

  const { userId, spotifyUrl } = body
  if (!userId || !spotifyUrl) {
    return { statusCode: 400, headers: CORS, body: 'userId + spotifyUrl required' }
  }

  const artistId = extractArtistId(spotifyUrl)
  if (!artistId) {
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'invalid_url', message: "Couldn't find an artist ID in that link." }),
    }
  }

  let data: ScrapedData
  try {
    data = await scrape(artistId)
  } catch (err) {
    console.error('[spotify-fetch] scrape error:', err)
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'fetch_failed', message: 'Could not fetch Spotify page.' }),
    }
  }

  // Persist URL + snapshot
  if (SUPABASE_URL && SUPABASE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    await supabase.from('artist_preferences')
      .update({ spotify_url: spotifyUrl })
      .eq('user_id', userId)

    await supabase.from('spotify_snapshots').insert({
      user_id:           userId,
      artist_id:         artistId,
      artist_name:       data.artistName,
      monthly_listeners: data.monthlyListeners,
      followers:         data.followers,
      top_tracks:        data.topTracks,
      raw_meta:          data.rawMeta,
    })
  }

  return {
    statusCode: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, data }),
  }
}
