/**
 * Shared platform scraping logic — used by platform-fetch.ts (manual sync)
 * and stats-refresh.ts (automatic sync on login).
 *
 * No OAuth, no API keys required for the base path. Just whatever's visible
 * to any visitor, enriched with Chartmetric when CHARTMETRIC_REFRESH_TOKEN
 * is set.
 */

// Realistic browser UA — sites serve richer HTML to "humans"
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'

export type Platform = 'spotify' | 'soundcloud' | 'youtube'

export interface ScrapeResult {
  platform:     Platform
  profileId:    string
  displayName:  string | null
  stats:        Record<string, number | string | null>
  topItems:     Array<{ name: string; image?: string | null; subtitle?: string | null }>
  imageUrl:     string | null
  rawMeta:      Record<string, string>
}

// ─── Platform detection ──────────────────────────────────────────────────────

export function detectPlatform(url: string): { platform: Platform; profileId: string } | null {
  const u = url.trim()

  let m = u.match(/(?:spotify[.:](?:com\/(?:[a-z-]+\/)?)?artist[/:])([a-zA-Z0-9]{16,32})/i)
  if (m) return { platform: 'spotify', profileId: m[1] }

  m = u.match(/soundcloud\.com\/([a-z0-9_\-.]+)(?:\/|$|\?)/i)
  if (m && !['discover', 'search', 'stream', 'you'].includes(m[1].toLowerCase())) {
    return { platform: 'soundcloud', profileId: m[1] }
  }

  // YouTube — channel (/channel/UCxxx), handle (/@xxx), legacy (/c/xxx, /user/xxx)
  m = u.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]+)/i)
  if (m) return { platform: 'youtube', profileId: m[1] }
  m = u.match(/youtube\.com\/@([a-zA-Z0-9_.-]+)/i)
  if (m) return { platform: 'youtube', profileId: `@${m[1]}` }
  m = u.match(/youtube\.com\/(?:c|user)\/([a-zA-Z0-9_-]+)/i)
  if (m) return { platform: 'youtube', profileId: `@${m[1]}` }

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

/**
 * Fetch a page through Jina AI's free reader proxy. They run real browsers
 * server-side and return the fully-rendered HTML — bypasses Spotify/SoundCloud/
 * TikTok bot-detection because the request originates from their browser
 * infrastructure, not our Netlify IPs.
 *
 * No API key needed. Free tier: ~200 req/hr.
 * Add JINA_API_KEY env var later for higher limits.
 */
async function htmlOf(url: string): Promise<string> {
  const jinaUrl = `https://r.jina.ai/${url}`
  const headers: Record<string, string> = {
    'X-Return-Format': 'html',
    'User-Agent':      UA,
  }
  if (process.env.JINA_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.JINA_API_KEY}`
  }
  const res = await fetch(jinaUrl, { headers })
  if (!res.ok) {
    console.warn(`[htmlOf] Jina returned ${res.status} for ${url} — falling back to direct fetch`)
    // Best-effort fallback (likely returns minimal HTML but at least we try)
    const direct = await fetch(url, {
      headers: {
        'User-Agent':      UA,
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    return direct.text()
  }
  return res.text()
}

/** Fetch as markdown (Jina default — easier text parsing for follower lines etc.) */
async function markdownOf(url: string): Promise<string> {
  const jinaUrl = `https://r.jina.ai/${url}`
  const headers: Record<string, string> = { 'User-Agent': UA }
  if (process.env.JINA_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.JINA_API_KEY}`
  }
  const res = await fetch(jinaUrl, { headers })
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

// ─── Chartmetric ──────────────────────────────────────────────────────────────

/**
 * Chartmetric REST API access token.
 * Requires CHARTMETRIC_REFRESH_TOKEN env var (generated once at app.chartmetric.com
 * → Settings → API). Access tokens last 1 hour and are cached in-memory.
 */
let cachedChartmetricToken: { value: string; expiresAt: number } | null = null

async function getChartmetricToken(): Promise<string | null> {
  const refreshToken = process.env.CHARTMETRIC_REFRESH_TOKEN ?? ''
  if (!refreshToken) return null

  if (cachedChartmetricToken && Date.now() < cachedChartmetricToken.expiresAt - 60_000) {
    return cachedChartmetricToken.value
  }

  try {
    const res = await fetch('https://api.chartmetric.com/api/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ refreshtoken: refreshToken }),
    })
    if (!res.ok) {
      console.warn('[chartmetric-token] non-OK:', res.status, await res.text())
      return null
    }
    const data = await res.json() as { token: string; expires_in?: number }
    const ttl = (data.expires_in ?? 3600) * 1000
    cachedChartmetricToken = { value: data.token, expiresAt: Date.now() + ttl }
    return data.token
  } catch (err) {
    console.warn('[chartmetric-token] fetch error:', err)
    return null
  }
}

/**
 * Look up a Chartmetric artist by their Spotify/Apple Music/SoundCloud/TikTok
 * ID. Returns the full artist record including cm_statistics — the rich
 * cross-platform stat bag (followers, monthly listeners, popularity, ranks).
 *
 * Two-step lookup: the /artist/{platform}/{id} endpoint returns a slim "find"
 * payload (just cm_id + name); the full record lives at /artist/{cm_id}.
 */
interface ChartmetricArtist {
  id?:                   number
  name?:                 string
  image_url?:            string
  code2?:                string                       // country code
  cm_artist_rank?:       number
  cm_artist_score?:      number
  verified?:             boolean
  spotify_genres?:       Array<string | { name: string }>
  cm_statistics?: {
    sp_monthly_listeners?: number
    sp_followers?:         number
    sp_popularity?:        number
    sp_where_people_listen?: Array<{ city: string; listeners: number }>
    am_listeners?:         number
    am_subscribers?:       number
    am_followers?:         number
    ins_followers?:        number
    ins_engagement_rate?:  number
    tiktok_followers?:     number
    tiktok_likes?:         number
    tiktok_top_video_views?: number
    soundcloud_followers?: number
    soundcloud_plays?:     number
    youtube_subscribers?:  number
    youtube_views?:        number
    twitter_followers?:    number
    facebook_followers?:   number
    shazam_count?:         number
    deezer_fans?:          number
  }
}

async function chartmetricGet(path: string, token: string): Promise<unknown | null> {
  try {
    const res = await fetch(`https://api.chartmetric.com${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      console.warn(`[chartmetric] ${path} non-OK:`, res.status)
      return null
    }
    return res.json()
  } catch (err) {
    console.warn(`[chartmetric] ${path} error:`, err)
    return null
  }
}

async function getChartmetricByPlatform(
  platform: 'spotify' | 'soundcloud' | 'youtube',
  profileId: string,
): Promise<ChartmetricArtist | null> {
  const token = await getChartmetricToken()
  if (!token) return null

  // For YouTube, profileId is either a UC... channel ID or @handle.
  // Chartmetric supports lookups by channel ID via /api/artist/youtube/{channelId}.
  const findPath =
    platform === 'spotify'    ? `/api/artist/spotify/${profileId}` :
    platform === 'soundcloud' ? `/api/artist/soundcloud/${encodeURIComponent(profileId)}` :
                                 `/api/artist/youtube/${encodeURIComponent(profileId.replace(/^@/, ''))}`

  // Step 1: resolve to chartmetric artist ID
  const findRes = await chartmetricGet(findPath, token) as { obj?: ChartmetricArtist | ChartmetricArtist[] } | null
  const slim = Array.isArray(findRes?.obj) ? findRes.obj[0] : findRes?.obj
  if (!slim?.id) {
    console.warn(`[chartmetric:${platform}] no cm_id found for ${profileId}`)
    return slim ?? null
  }

  // Step 2: fetch full artist record (includes cm_statistics)
  const fullRes = await chartmetricGet(`/api/artist/${slim.id}`, token) as { obj?: ChartmetricArtist } | null
  const full = fullRes?.obj
  if (!full) return slim
  // Merge — full record is richer
  return { ...slim, ...full, cm_statistics: full.cm_statistics ?? slim.cm_statistics }
}

// ─── Spotify ──────────────────────────────────────────────────────────────────

export async function scrapeSpotify(profileId: string): Promise<ScrapeResult> {
  let displayName: string | null = null
  let imageUrl:    string | null = null
  let monthlyListeners: number | null = null
  let topItems: ScrapeResult['topItems'] = []
  let rawMeta: Record<string, string> = {}

  // ─── PRIMARY: Jina-rendered HTML + markdown (no API keys needed) ────────
  let trackPlays: number[] = []
  let trackNames: string[] = []
  let trackImages: Array<string | null> = []
  try {
    const [html, md] = await Promise.all([
      htmlOf(`https://open.spotify.com/artist/${profileId}`),
      markdownOf(`https://open.spotify.com/artist/${profileId}`),
    ])
    const meta = parseMeta(html)
    rawMeta = meta

    // Monthly listeners — rendered into HTML by Spotify's React app
    const ml = html.match(/([\d,]+)\s+monthly\s+listeners/i)
    if (ml) monthlyListeners = parseInt(ml[1].replace(/,/g, ''), 10)

    // Artist name from <title>
    const titleMatch = html.match(/<title>([^|<]+)\s*\|\s*Spotify<\/title>/i)
    if (titleMatch) displayName = titleMatch[1].trim()

    // og:image
    if (meta['og:image']) imageUrl = meta['og:image']

    // Track names via aria-label="Play X by Y" — first 5 = popular tracks
    const ariaMatches = [...html.matchAll(/aria-label="Play ([^"]+?)(?: by [^"]+)?"/gi)]
    trackNames = ariaMatches
      .map(m => m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim())
      .slice(0, 5)

    // Play counts — markdown lists them right after the "## Popular" section
    // as standalone numeric lines (1,090,459 / 204,231 / etc.)
    const popularBlock = md.split(/## Popular/i)[1]?.split(/##/)[0] ?? ''
    const numberLines = popularBlock.match(/(?:^|\n)\s*([\d,]{3,})\s*(?:\n|$)/g) ?? []
    trackPlays = numberLines
      .map(s => parseInt(s.replace(/[^\d]/g, ''), 10))
      .filter(n => Number.isFinite(n) && n > 100)
      .slice(0, 5)

    // Track cover images from the Popular block
    const imgMatches = [...popularBlock.matchAll(/!\[Image \d+\]\((https?:\/\/i\.scdn\.co\/image\/[^)]+)\)/g)]
    trackImages = imgMatches.map(m => m[1]).slice(0, 5)
  } catch (err) {
    console.warn('[scrapeSpotify] Jina fetch failed:', err)
  }

  // Chartmetric fallback for monthly listeners only (if Jina parse missed it)
  if (monthlyListeners === null) {
    try {
      const cm = await getChartmetricByPlatform('spotify', profileId)
      if (cm) {
        const stats = cm.cm_statistics ?? {}
        if (stats.sp_monthly_listeners) monthlyListeners = stats.sp_monthly_listeners
        if (!displayName && cm.name)      displayName = cm.name
        if (!imageUrl    && cm.image_url) imageUrl    = cm.image_url
      }
    } catch (err) {
      console.warn('[scrapeSpotify] Chartmetric enrich failed:', err)
    }
  }

  // If the API path didn't fill topItems, build them from Jina-scraped data
  if (topItems.length === 0 && trackNames.length > 0) {
    topItems = trackNames.map((name, i) => ({
      name,
      image:    trackImages[i] ?? null,
      subtitle: trackPlays[i] ? `${trackPlays[i].toLocaleString()} plays` : null,
    }))
  } else if (topItems.length > 0 && trackPlays.length > 0) {
    // API gave us names+images; enrich with the play counts we scraped
    topItems = topItems.map((t, i) => ({
      ...t,
      subtitle: trackPlays[i] ? `${trackPlays[i].toLocaleString()} plays` : t.subtitle,
    }))
  }

  return {
    platform:    'spotify',
    profileId,
    displayName,
    stats:       { monthlyListeners },
    topItems,
    imageUrl,
    rawMeta,
  }
}

// ─── SoundCloud ───────────────────────────────────────────────────────────────

export async function scrapeSoundCloud(profileId: string): Promise<ScrapeResult> {
  const stats: Record<string, number | null> = { followers: null, plays: null, tracks: null }
  let displayName: string | null = null
  let imageUrl:    string | null = null

  // Jina-rendered markdown — SoundCloud's rendered profile page exposes
  // "Followers 2.34M" / "Tracks 190" / "Following 11" as anchors with
  // exact counts in the title attribute.
  let md = ''
  try {
    md = await markdownOf(`https://soundcloud.com/${profileId}`)
  } catch (err) {
    console.warn('[scrapeSoundCloud] Jina fetch failed:', err)
  }

  // Title: "# Stream Post Malone music | ..." or "# ARTIST"
  const titleMatch = md.match(/^Title:\s*Stream\s+([^|]+?)\s+music/im)
    ?? md.match(/^#\s+Stream\s+([^|]+?)\s+music/im)
    ?? md.match(/^Title:\s*([^|\n]+)/im)
  if (titleMatch) displayName = titleMatch[1].trim()

  // Followers — "Followers 2.34M](url "2,341,832 followers")"
  const fExact = md.match(/"([\d,]+)\s+followers"/i)
  if (fExact) {
    stats.followers = parseInt(fExact[1].replace(/,/g, ''), 10)
  } else {
    const fHuman = md.match(/Followers\s+([\d.,]+[KMB]?)/i)
    if (fHuman) stats.followers = parseHumanNumber(fHuman[1])
  }

  // Tracks — "Tracks 190](url "190 tracks")"
  const tExact = md.match(/"(\d+)\s+tracks?"/i)
  if (tExact) {
    stats.tracks = parseInt(tExact[1], 10)
  } else {
    const tHuman = md.match(/Tracks\s+([\d.,]+[KMB]?)/i)
    if (tHuman) stats.tracks = parseHumanNumber(tHuman[1])
  }

  // Top tracks with play counts — pattern in markdown:
  //   [TRACK_NAME](url) PLAYS Like Repost ...
  const trackPattern = /\[([^\]]+?)\]\((https?:\/\/soundcloud\.com\/[^)]+?)\)\s+([\d.,]+[KMB]?)\s+Like/g
  const topTracks: Array<{ name: string; subtitle?: string | null }> = []
  let m: RegExpExecArray | null
  while ((m = trackPattern.exec(md)) !== null && topTracks.length < 5) {
    const plays = parseHumanNumber(m[3])
    topTracks.push({
      name:     m[1].trim(),
      subtitle: plays ? `${plays.toLocaleString()} plays` : null,
    })
  }

  // Total plays — sum of top track plays as a proxy if not directly exposed
  if (stats.plays === null && topTracks.length > 0) {
    // Try matching it explicitly first from a "X plays" or "all-time plays" line
    const allTime = md.match(/(\d[\d.,]*[KMB]?)\s*(?:all[-\s]?time\s+plays|total\s+plays)/i)
    if (allTime) stats.plays = parseHumanNumber(allTime[1])
  }

  // oEmbed for thumbnail
  try {
    const oembedRes = await fetch(
      `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(`https://soundcloud.com/${profileId}`)}`,
      { headers: { 'User-Agent': UA, 'Accept': 'application/json' } },
    )
    if (oembedRes.ok) {
      const o = await oembedRes.json() as { title?: string; author_name?: string; thumbnail_url?: string }
      if (!displayName) displayName = o.author_name ?? o.title ?? null
      imageUrl = o.thumbnail_url ?? null
    }
  } catch { /* ignore */ }

  // Chartmetric enrichment for SoundCloud follower + total plays
  try {
    const cm = await getChartmetricByPlatform('soundcloud', profileId)
    if (cm) {
      const cmStats = cm.cm_statistics ?? {}
      if (stats.followers === null && cmStats.soundcloud_followers) stats.followers = cmStats.soundcloud_followers
      if (stats.plays     === null && cmStats.soundcloud_plays)     stats.plays     = cmStats.soundcloud_plays
      if (!displayName && cm.name)      displayName = cm.name
      if (!imageUrl    && cm.image_url) imageUrl    = cm.image_url
    }
  } catch (err) {
    console.warn('[scrapeSoundCloud] Chartmetric enrich failed:', err)
  }

  return {
    platform:    'soundcloud',
    profileId,
    displayName,
    stats,
    topItems:    topTracks,
    imageUrl,
    rawMeta:     {},
  }
}

// ─── YouTube ──────────────────────────────────────────────────────────────────

export async function scrapeYouTube(profileId: string): Promise<ScrapeResult> {
  let displayName: string | null = null
  let imageUrl:    string | null = null
  const stats: Record<string, number | null> = { subscribers: null, views: null, videos: null }
  const topItems: ScrapeResult['topItems'] = []

  // Build canonical channel URL: /channel/UCxxx or /@handle
  const url = profileId.startsWith('UC')
    ? `https://www.youtube.com/channel/${profileId}`
    : `https://www.youtube.com/${profileId.startsWith('@') ? profileId : '@' + profileId}`

  // ─── Path 1: Jina-rendered channel page ───────────────────────────────
  try {
    const md = await markdownOf(url)

    // Channel name from `Title: NAME - YouTube`
    const t = md.match(/^Title:\s*(.+?)\s*-\s*YouTube/im)
    if (t) displayName = t[1].trim()

    // Subscribers — "X.XM subscribers"
    const subs = md.match(/([\d.,]+[KMB]?)\s+subscribers?/i)
    if (subs) stats.subscribers = parseHumanNumber(subs[1])

    // Video count — "X videos"
    const vids = md.match(/(\d[\d,]*)\s+videos?(?:\s|<|$)/i)
    if (vids) stats.videos = parseInt(vids[1].replace(/,/g, ''), 10)

    // Total views — "X,XXX,XXX views" (often appears in About tab)
    const views = md.match(/([\d,]+)\s+views?\s*$/im)
    if (views) stats.views = parseInt(views[1].replace(/,/g, ''), 10)

    // Top videos pattern: [TITLE](url) followed by view count
    const videoPattern = /\[([^\]]{3,80}?)\]\((https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[^)]+)\)[^\n]*?([\d.,]+[KMB]?)\s+views/gi
    let m: RegExpExecArray | null
    while ((m = videoPattern.exec(md)) !== null && topItems.length < 5) {
      const views = parseHumanNumber(m[3])
      topItems.push({
        name:     m[1].trim(),
        subtitle: views ? `${views.toLocaleString()} views` : null,
      })
    }
  } catch (err) {
    console.warn('[scrapeYouTube] Jina fetch failed:', err)
  }

  // ─── Path 2: Chartmetric enrichment ───────────────────────────────────
  try {
    const cm = await getChartmetricByPlatform('youtube', profileId)
    if (cm) {
      const s = cm.cm_statistics ?? {}
      if (stats.subscribers === null && s.youtube_subscribers) stats.subscribers = s.youtube_subscribers
      if (stats.views       === null && s.youtube_views)       stats.views       = s.youtube_views
      if (!displayName && cm.name)      displayName = cm.name
      if (!imageUrl    && cm.image_url) imageUrl    = cm.image_url
    }
  } catch (err) {
    console.warn('[scrapeYouTube] Chartmetric enrich failed:', err)
  }

  return {
    platform:    'youtube',
    profileId,
    displayName,
    stats,
    topItems,
    imageUrl,
    rawMeta:     {},
  }
}

export async function scrapeByPlatform(platform: Platform, profileId: string): Promise<ScrapeResult> {
  return platform === 'spotify'    ? scrapeSpotify(profileId)
       : platform === 'soundcloud' ? scrapeSoundCloud(profileId)
       :                             scrapeYouTube(profileId)
}
