/**
 * Generic platform link scraper
 *
 * Accepts a public URL from any supported platform (Spotify, Apple Music,
 * SoundCloud, TikTok), detects which one, fetches the public HTML and parses
 * whatever public data we can extract.
 *
 * No OAuth, no API keys. Just whatever's visible to any visitor.
 *
 * POST body: { userId: string, url: string }
 */
import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL          ?? ''
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY  ?? ''

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Realistic browser UA — sites serve richer HTML to "humans"
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'

type Platform = 'spotify' | 'apple_music' | 'soundcloud' | 'tiktok'

interface ScrapeResult {
  platform:     Platform
  profileId:    string
  displayName:  string | null
  stats:        Record<string, number | string | null>
  topItems:     Array<{ name: string; image?: string | null; subtitle?: string | null }>
  imageUrl:     string | null
  rawMeta:      Record<string, string>
}

// ─── Platform detection ──────────────────────────────────────────────────────

function detectPlatform(url: string): { platform: Platform; profileId: string } | null {
  const u = url.trim()

  let m = u.match(/(?:spotify[.:](?:com\/(?:[a-z-]+\/)?)?artist[/:])([a-zA-Z0-9]{16,32})/i)
  if (m) return { platform: 'spotify', profileId: m[1] }

  m = u.match(/music\.apple\.com\/[a-z]{2}\/artist\/[^/]+\/(\d+)/i)
  if (m) return { platform: 'apple_music', profileId: m[1] }

  m = u.match(/soundcloud\.com\/([a-z0-9_\-.]+)(?:\/|$|\?)/i)
  if (m && !['discover', 'search', 'stream', 'you'].includes(m[1].toLowerCase())) {
    return { platform: 'soundcloud', profileId: m[1] }
  }

  m = u.match(/tiktok\.com\/@([a-zA-Z0-9_.]+)/i)
  if (m) return { platform: 'tiktok', profileId: m[1] }

  return null
}

// ─── Shared HTML helpers ─────────────────────────────────────────────────────

function parseMeta(html: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re1 = /<meta\s+(?:property|name)=["']([^"']+)["']\s+content=["']([^"']*)["']/gi
  const re2 = /<meta\s+content=["']([^"']*)["']\s+(?:property|name)=["']([^"']+)["']/gi
  let m
  while ((m = re1.exec(html))) out[m[1]] = m[2]
  while ((m = re2.exec(html))) out[m[2]] = m[1]
  return out
}

function parseJsonLd(html: string): Array<Record<string, unknown>> {
  const out: Array<Record<string, unknown>> = []
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  let m
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1])
      if (Array.isArray(parsed)) parsed.forEach(p => out.push(p))
      else out.push(parsed)
    } catch { /* skip */ }
  }
  return out
}

async function htmlOf(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent':       UA,
      'Accept':           'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language':  'en-US,en;q=0.9',
      'Cache-Control':    'no-cache',
    },
  })
  return res.text()
}

function parseHumanNumber(text: string): number | null {
  // "1.2M", "1,234", "850K"
  const m = text.replace(/\s/g, '').match(/^([\d.,]+)([KMB])?/i)
  if (!m) return null
  const raw = parseFloat(m[1].replace(/,/g, ''))
  if (!Number.isFinite(raw)) return null
  const suffix = m[2]?.toUpperCase()
  return suffix === 'B' ? raw * 1_000_000_000
       : suffix === 'M' ? raw * 1_000_000
       : suffix === 'K' ? raw * 1_000
       : raw
}

// ─── Spotify ──────────────────────────────────────────────────────────────────

/**
 * Spotify Client Credentials flow — server-to-server.
 * NOT user OAuth. Requires SPOTIFY_CLIENT_ID + SPOTIFY_CLIENT_SECRET env vars
 * (created once in a Spotify developer app at developer.spotify.com).
 * Token cached in-memory across warm invocations.
 */
let cachedSpotifyToken: { value: string; expiresAt: number } | null = null

async function getSpotifyToken(): Promise<string | null> {
  const clientId     = process.env.SPOTIFY_CLIENT_ID     ?? ''
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET ?? ''
  if (!clientId || !clientSecret) return null

  // Reuse cached token while valid (subtract 60s safety margin)
  if (cachedSpotifyToken && Date.now() < cachedSpotifyToken.expiresAt - 60_000) {
    return cachedSpotifyToken.value
  }

  try {
    const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method:  'POST',
      headers: {
        'Authorization': `Basic ${basic}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    if (!res.ok) {
      console.warn('[spotify-token] non-OK:', res.status, await res.text())
      return null
    }
    const data = await res.json() as { access_token: string; expires_in: number }
    cachedSpotifyToken = {
      value:     data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
    }
    return data.access_token
  } catch (err) {
    console.warn('[spotify-token] fetch error:', err)
    return null
  }
}

async function scrapeSpotify(profileId: string): Promise<ScrapeResult> {
  let displayName: string | null = null
  let imageUrl:    string | null = null
  let followers:   number | null = null
  let popularity:  number | null = null
  let genres:      string[] = []
  let monthlyListeners: number | null = null
  let topItems: ScrapeResult['topItems'] = []
  let rawMeta: Record<string, string> = {}
  let setupNote: string | null = null

  // ─── Primary: Client Credentials → official Spotify API ────────────────
  const token = await getSpotifyToken()
  if (!token) {
    setupNote = 'Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in Netlify env vars to pull metrics (5-min setup at developer.spotify.com — no user OAuth needed).'
  }
  if (token) {
    try {
      const [artistRes, tracksRes] = await Promise.all([
        fetch(`https://api.spotify.com/v1/artists/${profileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`https://api.spotify.com/v1/artists/${profileId}/top-tracks?market=US`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (artistRes.ok) {
        const a = await artistRes.json() as {
          name?: string
          images?: Array<{ url: string }>
          followers?: { total: number }
          popularity?: number
          genres?: string[]
        }
        displayName = a.name ?? null
        imageUrl    = a.images?.[0]?.url ?? null
        followers   = a.followers?.total ?? null
        popularity  = typeof a.popularity === 'number' ? a.popularity : null
        genres      = a.genres ?? []
      } else {
        console.warn('[scrapeSpotify] artist API non-OK:', artistRes.status)
      }

      if (tracksRes.ok) {
        const t = await tracksRes.json() as {
          tracks?: Array<{ name: string; album?: { images?: Array<{ url: string }> }; popularity?: number }>
        }
        topItems = (t.tracks ?? []).slice(0, 5).map(track => ({
          name:     track.name,
          image:    track.album?.images?.[0]?.url ?? null,
          subtitle: typeof track.popularity === 'number' ? `Popularity ${track.popularity}` : null,
        }))
      } else {
        console.warn('[scrapeSpotify] top-tracks API non-OK:', tracksRes.status)
      }
    } catch (err) {
      console.warn('[scrapeSpotify] anon API call failed:', err)
    }
  } else {
    console.warn('[scrapeSpotify] anon token fetch failed')
  }

  // ─── Try to extract monthly listeners from kworb.net (community stats) ──
  // Their /spotify/artist/{id}_songs.html page exposes monthly listeners
  try {
    const kw = await fetch(`https://kworb.net/spotify/artist/${profileId}_songs.html`, {
      headers: { 'User-Agent': UA, 'Accept': 'text/html' },
    })
    if (kw.ok) {
      const kwHtml = await kw.text()
      const m = kwHtml.match(/([\d,]+)\s*monthly\s*listeners/i)
      if (m) monthlyListeners = parseInt(m[1].replace(/,/g, ''), 10)
    }
  } catch (err) {
    console.warn('[scrapeSpotify] kworb fallback failed:', err)
  }

  // ─── Fallback: og meta + embed HTML scan if API failed ─────────────────
  if (!displayName || followers === null) {
    try {
      const mainHtml = await htmlOf(`https://open.spotify.com/artist/${profileId}`)
      const meta = parseMeta(mainHtml)
      rawMeta = meta
      if (!displayName) displayName = meta['og:title']?.split(' | Spotify')[0]?.trim() ?? null
      if (!imageUrl)    imageUrl    = meta['og:image'] ?? null

      const desc = meta['og:description'] ?? ''
      const ml = desc.match(/([\d,]+)\s+monthly\s+listeners/i)
      if (ml && monthlyListeners === null) monthlyListeners = parseInt(ml[1].replace(/,/g, ''), 10)
    } catch { /* ignore */ }
  }

  console.log('[scrapeSpotify]', JSON.stringify({
    profileId, displayName, followers, monthlyListeners, popularity, genres: genres.length, tracks: topItems.length,
  }))

  return {
    platform:    'spotify',
    profileId,
    displayName,
    stats:       {
      monthlyListeners,
      followers,
      popularity,
      genres: genres.length > 0 ? genres.slice(0, 3).join(', ') : null,
      setupNote,
    },
    topItems,
    imageUrl,
    rawMeta,
  }
}

// ─── Apple Music ──────────────────────────────────────────────────────────────

async function scrapeAppleMusic(profileId: string, originalUrl: string): Promise<ScrapeResult> {
  const html = await htmlOf(originalUrl)
  const meta = parseMeta(html)
  const ld = parseJsonLd(html)

  // Apple Music JSON-LD often has MusicGroup with tracks
  const musicGroup = ld.find(j => {
    const t = j['@type']
    return t === 'MusicGroup' || (Array.isArray(t) && t.includes('MusicGroup'))
  }) ?? {} as Record<string, unknown>

  // Pull popular albums/tracks from any embedded data
  const tracks = (musicGroup.track as Array<Record<string, unknown>> | undefined) ?? []
  const topItems = tracks.slice(0, 5).map(t => ({
    name:  String(t.name ?? ''),
    image: typeof t.image === 'string' ? t.image : null,
  })).filter(t => t.name)

  return {
    platform:    'apple_music',
    profileId,
    displayName: (musicGroup.name as string | undefined) ?? meta['og:title']?.split(/[—|]/)[0]?.trim() ?? null,
    stats:       { genre: (musicGroup.genre as string | undefined) ?? null },
    topItems,
    imageUrl:    (musicGroup.image as string | undefined) ?? meta['og:image'] ?? null,
    rawMeta:     meta,
  }
}

// ─── SoundCloud ───────────────────────────────────────────────────────────────

async function scrapeSoundCloud(profileId: string): Promise<ScrapeResult> {
  const stats: Record<string, number | null> = { followers: null, plays: null, tracks: null }
  let displayName: string | null = null
  let imageUrl:    string | null = null
  let rawMeta:     Record<string, string> = {}

  // ─── Path 1: oEmbed (always responds, gives basic info) ───────────────
  try {
    const oembedRes = await fetch(
      `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(`https://soundcloud.com/${profileId}`)}`,
      { headers: { 'User-Agent': UA, 'Accept': 'application/json' } },
    )
    if (oembedRes.ok) {
      const o = await oembedRes.json() as { title?: string; author_name?: string; thumbnail_url?: string }
      displayName = o.author_name ?? o.title ?? null
      imageUrl    = o.thumbnail_url ?? null
    }
  } catch (err) {
    console.warn('[scrapeSoundCloud] oEmbed failed:', err)
  }

  // ─── Path 2: scrape the public HTML page for follower / play counts ───
  try {
    const html = await htmlOf(`https://soundcloud.com/${profileId}`)
    const meta = parseMeta(html)
    rawMeta = meta
    const ld = parseJsonLd(html)

    if (!displayName) displayName = meta['og:title']?.split(/[—|·]/)[0]?.trim() ?? null
    if (!imageUrl)    imageUrl    = meta['og:image'] ?? null

    const musicGroup = ld.find(j => {
      const t = j['@type']
      return t === 'MusicGroup' || t === 'Person' || t === 'ProfilePage'
    }) as Record<string, unknown> | undefined

    const interactions = (musicGroup?.interactionStatistic as Array<Record<string, unknown>> | undefined) ?? []
    for (const i of interactions) {
      const kind = String(((i.interactionType as Record<string, unknown>)?.['@type'] ?? '')).toLowerCase()
      const count = parseHumanNumber(String(i.userInteractionCount ?? ''))
      if (kind.includes('follow'))   stats.followers = count
      if (kind.includes('listen'))   stats.plays     = count
    }

    // Free-text fallbacks from raw HTML
    if (stats.followers === null) {
      const m = html.match(/"followers_count"\s*:\s*(\d+)/)
      if (m) stats.followers = parseInt(m[1], 10)
    }
    if (stats.plays === null) {
      const m = html.match(/"playback_count"\s*:\s*(\d+)/)
      if (m) stats.plays = parseInt(m[1], 10)
    }
    if (stats.tracks === null) {
      const m = html.match(/"track_count"\s*:\s*(\d+)/)
      if (m) stats.tracks = parseInt(m[1], 10)
    }

    // Last-ditch description parse: "X Followers · Y Tracks"
    const desc = meta['og:description'] ?? ''
    if (stats.followers === null) {
      const f = desc.match(/([\d.,]+[KMB]?)\s+Followers/i)
      if (f) stats.followers = parseHumanNumber(f[1])
    }
    if (stats.tracks === null) {
      const t = desc.match(/(\d[\d,]*)\s+tracks?/i)
      if (t) stats.tracks = parseInt(t[1].replace(/,/g, ''), 10)
    }
  } catch (err) {
    console.warn('[scrapeSoundCloud] HTML scrape failed:', err)
  }

  console.log('[scrapeSoundCloud]', JSON.stringify({ profileId, displayName, ...stats }))

  return {
    platform:    'soundcloud',
    profileId,
    displayName,
    stats,
    topItems:    [],
    imageUrl,
    rawMeta,
  }
}

// ─── TikTok ───────────────────────────────────────────────────────────────────

async function scrapeTikTok(profileId: string): Promise<ScrapeResult> {
  const html = await htmlOf(`https://www.tiktok.com/@${profileId}`)
  const meta = parseMeta(html)

  const stats: Record<string, number | null> = {
    followers: null, following: null, hearts: null, videos: null,
  }

  // TikTok embeds SIGI_STATE / __UNIVERSAL_DATA_FOR_REHYDRATION__ JSON
  const universalMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/)
  if (universalMatch) {
    try {
      const data = JSON.parse(universalMatch[1])
      const scope = data?.__DEFAULT_SCOPE__ ?? {}
      const userDetail = scope?.['webapp.user-detail'] ?? {}
      const userInfo = userDetail?.userInfo ?? {}
      const userStats = userInfo?.stats ?? {}
      stats.followers = Number(userStats.followerCount  ?? null) || null
      stats.following = Number(userStats.followingCount ?? null) || null
      stats.hearts    = Number(userStats.heartCount     ?? null) || null
      stats.videos    = Number(userStats.videoCount     ?? null) || null
    } catch { /* ignore */ }
  }

  // Fallback: parse the "X Followers · Y Following · Z Likes" og description
  const desc = meta['og:description'] ?? ''
  if (stats.followers === null) {
    const f = desc.match(/([\d.,]+[KMB]?)\s+Followers/i)
    if (f) stats.followers = parseHumanNumber(f[1])
  }
  if (stats.hearts === null) {
    const l = desc.match(/([\d.,]+[KMB]?)\s+Likes/i)
    if (l) stats.hearts = parseHumanNumber(l[1])
  }

  return {
    platform:    'tiktok',
    profileId,
    displayName: meta['og:title']?.replace(/ \(@.*\) on TikTok$/, '') ?? null,
    stats,
    topItems:    [],
    imageUrl:    meta['og:image'] ?? null,
    rawMeta:     meta,
  }
}

// ─── Handler ──────────────────────────────────────────────────────────────────

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
      body: JSON.stringify({ ok: false, error: 'unknown_platform', message: "We don't recognize that URL — paste a Spotify, Apple Music, SoundCloud, or TikTok link." }),
    }
  }

  let result: ScrapeResult
  try {
    result =
      detected.platform === 'spotify'     ? await scrapeSpotify(detected.profileId) :
      detected.platform === 'apple_music' ? await scrapeAppleMusic(detected.profileId, url) :
      detected.platform === 'soundcloud'  ? await scrapeSoundCloud(detected.profileId) :
                                            await scrapeTikTok(detected.profileId)
  } catch (err) {
    console.error(`[platform-fetch:${detected.platform}] scrape error:`, err)
    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: false, error: 'fetch_failed', message: 'Could not fetch that page right now — try again in a minute.' }),
    }
  }

  let saveWarnings: string[] = []
  if (SUPABASE_URL && SUPABASE_KEY) {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const urlColumn =
      detected.platform === 'apple_music' ? 'apple_music_url' :
      detected.platform === 'soundcloud'  ? 'soundcloud_url'  :
      detected.platform === 'tiktok'      ? 'tiktok_url'      :
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
