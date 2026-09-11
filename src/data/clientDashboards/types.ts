/**
 * Shared shape for every /client/:slug dashboard. One data file per
 * client (see staybarii-bounce.ts for the pattern) — add a new client by
 * dropping a new file + registering it in registry.ts, plus setting its
 * password as a Netlify env var (CLIENT_DASHBOARD_PASSWORD_<SLUG>).
 *
 * Every metric block is optional — before launch (or before a given
 * platform goes live) leave it `undefined` and the dashboard renders an
 * honest "awaiting launch data" state instead of a misleading zero.
 */

export type CampaignStatus = 'scheduled' | 'live' | 'optimizing' | 'completed'

export interface PlatformTimeline {
  youtube?: { startDate: string; note?: string }  // ISO date, e.g. "2026-09-09"
  tiktok?:  { startDate: string; note?: string }
}

/**
 * Every field here is individually optional — real data availability is
 * usually partial (e.g. public view/like/comment counts are known, but
 * watch time / ad views need YouTube Analytics API access we may not
 * have yet). Fill in only what's actually real; the dashboard renders
 * each known stat and quietly omits the rest, rather than forcing an
 * all-or-nothing block that tempts filling gaps with guesses.
 */
export interface YouTubePerformance {
  views?: number
  adViews?: number
  watchTimeHours?: number
  avgViewDuration?: string   // e.g. "1:42"
  likes?: number
  comments?: number
  shares?: number
  subscribersGained?: number
}

export interface GoogleAdsPerformance {
  spend?: number             // USD
  impressions?: number
  reach?: number               // estimated unique users reached
  views?: number
  cpv?: number                // cost per view, USD
  cpc?: number                 // cost per click, USD
  viewRate?: number           // percent, e.g. 24.5
  clicks?: number
  /** Who/what we're targeting — real even before real performance
   *  numbers exist, e.g. "Fans of Don Toliver", "Interest: R&B". */
  targeting?: string[]
}

export interface TrafficSource {
  source: string
  users: number
}

export interface WebsiteAnalytics {
  users?: number
  trafficSources?: TrafficSource[]
  musicVideoClicks?: number
  conversions?: number
}

export interface TikTokPerformance {
  impressions?: number
  videoViews?: number
  engagement?: number         // percent
  clicks?: number
  bestCreative?: string       // label of the top-performing ad/creative
}

export interface TikTokCreation {
  label: string               // e.g. "@handle — dance duet"
  url: string
  embedHtml?: string
}

export interface AudienceAvatar {
  ageRange: string
  locations: string[]
  interests: string[]
  behaviors: string[]
  contentPreferences: string[]
}

export type CreativeType = 'ad' | 'ugc' | 'dance' | 'music-video-cut'

export interface CreativeAsset {
  id: string
  title: string
  type: CreativeType
  url: string
  thumbnail?: string
}

export interface InsightEntry {
  date: string   // ISO date
  text: string
}

/** Where the ad actually runs — e.g. placement targeting a specific
 *  video (in-stream ad shown on another artist's most recent upload),
 *  rather than broad interest/affinity targeting. */
export interface AdPlacement {
  artistName: string
  videoTitle: string
  videoUrl: string
  thumbnail?: string
  note?: string   // e.g. "Most recent upload — placement target"
}

export interface ClientDashboardData {
  slug: string
  clientName: string
  campaignName: string
  status: CampaignStatus
  lastUpdated: string          // ISO datetime

  /** True = every metric on this page is illustrative sample data, not
   *  live performance — the dashboard shows a clear banner so it's never
   *  mistaken for a real report. Flip to false/omit once real data feeds
   *  the file. */
  isSample?: boolean

  /** false = skip the password gate entirely, page is open to anyone with
   *  the link. Defaults to true (protected) when omitted — set false
   *  explicitly per client, e.g. while sharing a sample/demo link. */
  passwordProtected?: boolean

  videoUrl?: string             // the actual YouTube watch URL, if there is one
  videoThumbnail?: string

  timeline: PlatformTimeline
  youtube?: YouTubePerformance
  googleAds?: GoogleAdsPerformance
  website?: WebsiteAnalytics
  tiktok?: TikTokPerformance
  tiktokCreations: TikTokCreation[]
  placements: AdPlacement[]
  audience: AudienceAvatar
  creativeLibrary: CreativeAsset[]
  insights: InsightEntry[]      // most recent first
}
