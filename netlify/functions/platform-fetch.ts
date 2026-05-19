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

async function scrapeSpotify(profileId: string): Promise<ScrapeResult> {
  // Fetch main + embed in parallel — different sources expose different metrics
  const [mainHtml, embedHtml] = await Promise.all([
    htmlOf(`https://open.spotify.com/artist/${profileId}`),
    htmlOf(`https://open.spotify.com/embed/artist/${profileId}`),
  ])

  const meta = parseMeta(mainHtml)
  const desc = meta['og:description'] ?? meta['description'] ?? ''

  let monthlyListeners: number | null = null
  let followers:        number | null = null
  let displayName: string | null = null
  let topItems: ScrapeResult['topItems'] = []
  let imageUrl: string | null = meta['og:image'] ?? null

  // ─── Strategy 1: og:description regex ─────────────────
  const ml1 = desc.match(/([\d,]+)\s+monthly\s+listeners/i)
  if (ml1) monthlyListeners = parseInt(ml1[1].replace(/,/g, ''), 10)

  // ─── Strategy 2: search anywhere in main HTML ─────────
  if (monthlyListeners === null) {
    const m2 = mainHtml.match(/"monthlyListeners"\s*:\s*"?(\d+)/)
    if (m2) monthlyListeners = parseInt(m2[1], 10)
  }
  if (monthlyListeners === null) {
    const m3 = mainHtml.match(/(\d[\d,]*)\s*monthly\s*listeners/i)
    if (m3) monthlyListeners = parseInt(m3[1].replace(/,/g, ''), 10)
  }

  // followers in main HTML
  const f1 = mainHtml.match(/"followers"\s*:\s*\{?\s*"total"\s*:\s*(\d+)/)
  if (f1) followers = parseInt(f1[1], 10)
  if (followers === null) {
    const f2 = mainHtml.match(/"totalFollowing"\s*:\s*"?(\d+)/)
    if (f2) followers = parseInt(f2[1], 10)
  }

  // ─── Strategy 3: parse embed __NEXT_DATA__ JSON ───────
  try {
    const nd = embedHtml.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
    if (nd) {
      const data = JSON.parse(nd[1])
      const entity = data?.props?.pageProps?.state?.data?.entity ?? {}

      if (entity.name && !displayName) displayName = String(entity.name)
      if (entity.visualIdentity?.image?.[0]?.url && !imageUrl) imageUrl = String(entity.visualIdentity.image[0].url)

      if (monthlyListeners === null && entity.monthlyListeners) {
        monthlyListeners = Number(entity.monthlyListeners) || null
      }
      if (followers === null && entity.totalFollowing) {
        followers = Number(entity.totalFollowing) || null
      }

      const tracks = (entity.trackList ?? entity.tracks ?? []) as Array<Record<string, unknown>>
      topItems = tracks.slice(0, 5).map(t => ({
        name:  String(t.title ?? t.name ?? ''),
        image: ((t.albumOfTrack as Record<string, unknown>)?.coverArt as { sources?: Array<{ url: string }> })?.sources?.[0]?.url ?? null,
      })).filter(t => t.name)
    }
  } catch (err) {
    console.warn('[scrapeSpotify] embed parse failed:', err)
  }

  // ─── Strategy 4: scan embed HTML free-text for metrics ─
  if (monthlyListeners === null) {
    const m4 = embedHtml.match(/"monthlyListeners"\s*:\s*"?(\d+)/)
    if (m4) monthlyListeners = parseInt(m4[1], 10)
  }
  if (followers === null) {
    const f3 = embedHtml.match(/"totalFollowing"\s*:\s*"?(\d+)/)
    if (f3) followers = parseInt(f3[1], 10)
  }

  // Name fallback
  if (!displayName) displayName = meta['og:title']?.split(' | Spotify')[0]?.trim() ?? null

  console.log('[scrapeSpotify]', JSON.stringify({ profileId, displayName, monthlyListeners, followers, topItemsCount: topItems.length }))

  return {
    platform:    'spotify',
    profileId,
    displayName,
    stats:       { monthlyListeners, followers },
    topItems,
    imageUrl,
    rawMeta:     meta,
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
  const html = await htmlOf(`https://soundcloud.com/${profileId}`)
  const meta = parseMeta(html)
  const ld = parseJsonLd(html)

  const musicGroup = ld.find(j => {
    const t = j['@type']
    return t === 'MusicGroup' || t === 'Person'
  }) as Record<string, unknown> | undefined

  // SoundCloud exposes followers via "interactionStatistic" in JSON-LD
  const stats: Record<string, number | null> = { followers: null, plays: null, tracks: null }
  const interactions = (musicGroup?.interactionStatistic as Array<Record<string, unknown>> | undefined) ?? []
  for (const i of interactions) {
    const kind = String(((i.interactionType as Record<string, unknown>)?.['@type'] ?? '')).toLowerCase()
    const count = parseHumanNumber(String(i.userInteractionCount ?? ''))
    if (kind.includes('follow'))   stats.followers = count
    if (kind.includes('listen'))   stats.plays     = count
    if (kind.includes('comment'))  stats.comments  = count
  }

  // Track count fallback from description
  const trackCountMatch = (meta['og:description'] ?? '').match(/(\d[\d,]*)\s+tracks?/i)
  if (trackCountMatch) stats.tracks = parseInt(trackCountMatch[1].replace(/,/g, ''), 10)

  return {
    platform:    'soundcloud',
    profileId,
    displayName: (musicGroup?.name as string | undefined) ?? meta['og:title']?.split(/[—|]/)[0]?.trim() ?? null,
    stats,
    topItems:    [],
    imageUrl:    (musicGroup?.image as string | undefined) ?? meta['og:image'] ?? null,
    rawMeta:     meta,
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

    // Upsert so a missing artist_preferences row still gets created
    const { error: prefsErr } = await supabase
      .from('artist_preferences')
      .upsert({ user_id: userId, [urlColumn]: url }, { onConflict: 'user_id' })
    if (prefsErr) {
      console.error(`[platform-fetch] artist_preferences upsert error:`, prefsErr)
      saveWarnings.push(`URL not bound: ${prefsErr.message}`)
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
