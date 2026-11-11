/**
 * Mock data for /internal/roster — an agency-facing (not client-facing)
 * view of the artist roster: who's signed to which tier, what a
 * marketing campaign cost and how long it ran, and before/after growth
 * across core platforms. Every number here is illustrative, invented for
 * demo/sales purposes — there is no live data source behind this page.
 * See src/data/clientDashboards for the real, client-facing, honest-empty-
 * state dashboard pattern this is intentionally NOT using.
 */

export type SubscriptionTier = 'Pro' | 'Growth' | 'Plant'

export interface MetricSnapshot {
  monthlyListeners: number
  instagramFollowers: number
  tiktokFollowers: number
  spotifyFollowers: number
}

export interface PrFeature {
  outlet: string
  headline: string
}

export interface SongPlatformData {
  tiktok: { videosCreated: number; views: number }
  spotify: { streams: number }
  twitter: { mentions: number; impressions: number }
  pr: PrFeature[]
}

export interface RosterSong {
  id: string
  title: string
  releaseDate: string // ISO date
  data: SongPlatformData
}

export interface ArtistRosterEntry {
  slug: string
  name: string
  image: string
  genre: string
  tier: SubscriptionTier
  campaign: {
    budgetSpent: number
    startDate: string // ISO date
    endDate: string   // ISO date
  }
  before: MetricSnapshot
  after: MetricSnapshot
  songs: RosterSong[]
}
