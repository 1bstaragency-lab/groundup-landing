import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export interface PlatformSnapshot {
  platform:     'spotify' | 'soundcloud' | 'youtube' | 'apple_music' | 'tiktok'
  profile_id:   string
  display_name: string | null
  stats:        Record<string, number | string | null>
  top_items:    Array<{ name: string; image?: string | null; subtitle?: string | null }> | null
  image_url:    string | null
  fetched_at:   string
}

export interface PlatformStats {
  loading:           boolean
  spotify:           PlatformSnapshot | null
  soundcloud:        PlatformSnapshot | null
  youtube:           PlatformSnapshot | null
  // Convenience flat reads — null if no snapshot or stat missing
  monthlyListeners:  number | null
  spotifyFollowers:  number | null
  scFollowers:       number | null
  scPlays:           number | null
  scTracks:          number | null
  ytSubscribers:     number | null
  ytVideos:          number | null
  // Aggregate "total reach" across known platforms (rough monthly-listener-equivalent)
  totalReach:        number | null
  // Snapshot of when the most recent sync happened, for "last updated" labels
  lastSyncedAt:      string | null
  refresh:           () => Promise<void>
}

function num(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/[^\d.]/g, ''))
    return Number.isFinite(n) ? n : null
  }
  return null
}

export function usePlatformStats(userId: string | null | undefined): PlatformStats {
  const [snapshots, setSnapshots] = useState<Record<string, PlatformSnapshot>>({})
  const [loading, setLoading]     = useState(true)

  async function load() {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    // Pull all snapshots, keep only the latest per platform
    const { data } = await supabase
      .from('platform_snapshots')
      .select('platform, profile_id, display_name, stats, top_items, image_url, fetched_at')
      .eq('user_id', userId)
      .order('fetched_at', { ascending: false })
      .limit(40)

    const byPlatform: Record<string, PlatformSnapshot> = {}
    for (const row of (data ?? []) as PlatformSnapshot[]) {
      if (!byPlatform[row.platform]) byPlatform[row.platform] = row
    }
    setSnapshots(byPlatform)
    setLoading(false)
  }

  useEffect(() => { load() /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [userId])

  const spotify    = snapshots['spotify']    ?? null
  const soundcloud = snapshots['soundcloud'] ?? null
  const youtube    = snapshots['youtube']    ?? null

  const monthlyListeners = num(spotify?.stats?.monthlyListeners)
  const spotifyFollowers = num(spotify?.stats?.followers)
  const scFollowers      = num(soundcloud?.stats?.followers)
  const scPlays          = num(soundcloud?.stats?.plays)
  const scTracks         = num(soundcloud?.stats?.tracks)
  const ytSubscribers    = num(youtube?.stats?.subscribers)
  const ytVideos         = num(youtube?.stats?.videos)

  // Rough total reach — monthly listeners + SC followers + YT subs
  // (each represents a distinct audience cohort with light overlap)
  const reachParts = [monthlyListeners, scFollowers, ytSubscribers].filter((v): v is number => typeof v === 'number')
  const totalReach = reachParts.length > 0 ? reachParts.reduce((a, b) => a + b, 0) : null

  // Latest sync time across all platforms
  const allTimes = [spotify, soundcloud, youtube]
    .map(s => s?.fetched_at)
    .filter((s): s is string => typeof s === 'string')
    .sort((a, b) => b.localeCompare(a))
  const lastSyncedAt = allTimes[0] ?? null

  return {
    loading,
    spotify, soundcloud, youtube,
    monthlyListeners, spotifyFollowers,
    scFollowers, scPlays, scTracks,
    ytSubscribers, ytVideos,
    totalReach,
    lastSyncedAt,
    refresh: load,
  }
}

/** Format big numbers compactly: 1,234,567 → "1.2M" */
export function formatStat(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}
