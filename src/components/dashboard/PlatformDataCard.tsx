"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Music2, Loader2, RefreshCw, Check, ExternalLink, AlertCircle } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"

export type PlatformId = 'spotify' | 'apple_music' | 'soundcloud' | 'tiktok'

interface PlatformMeta {
  label:      string
  accent:     string  // tailwind color suffix e.g. 'green-400'
  border:     string  // border color class
  bg:         string  // accent background
  urlField:   'spotify_url' | 'apple_music_url' | 'soundcloud_url' | 'tiktok_url'
  hint:       string
  placeholder:string
}

const META: Record<PlatformId, PlatformMeta> = {
  spotify: {
    label: 'Spotify',
    accent: 'text-green-400',
    border: 'border-green-500/15',
    bg:     'bg-green-500/15 border-green-500/25',
    urlField: 'spotify_url',
    hint:     'Paste your Spotify artist URL',
    placeholder: 'https://open.spotify.com/artist/...',
  },
  apple_music: {
    label: 'Apple Music',
    accent: 'text-pink-300',
    border: 'border-pink-500/15',
    bg:     'bg-pink-500/15 border-pink-500/25',
    urlField: 'apple_music_url',
    hint:     'Paste your Apple Music artist URL',
    placeholder: 'https://music.apple.com/us/artist/.../...',
  },
  soundcloud: {
    label: 'SoundCloud',
    accent: 'text-orange-400',
    border: 'border-orange-500/15',
    bg:     'bg-orange-500/15 border-orange-500/25',
    urlField: 'soundcloud_url',
    hint:     'Paste your SoundCloud profile URL',
    placeholder: 'https://soundcloud.com/your-handle',
  },
  tiktok: {
    label: 'TikTok',
    accent: 'text-sky-400',
    border: 'border-sky-500/15',
    bg:     'bg-sky-500/15 border-sky-500/25',
    urlField: 'tiktok_url',
    hint:     'Paste your TikTok profile URL',
    placeholder: 'https://tiktok.com/@your-handle',
  },
}

interface Snapshot {
  profile_id:   string
  display_name: string | null
  stats:        Record<string, number | string | null>
  top_items:    Array<{ name: string; image?: string | null; subtitle?: string | null }> | null
  image_url:    string | null
  fetched_at:   string
}

function formatNum(n: number | string | null | undefined): string {
  if (n === null || n === undefined || n === '') return '—'
  const num = typeof n === 'string' ? parseFloat(n) : n
  if (!Number.isFinite(num)) return String(n)
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString()
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

interface StatTile {
  label: string
  value: number | string | null | undefined
}

function statTiles(platform: PlatformId, snap: Snapshot): StatTile[] {
  const s = snap.stats ?? {}
  switch (platform) {
    case 'spotify':
      return [{ label: 'Monthly Listeners', value: s.monthlyListeners as number | null }]
    case 'apple_music':
      return [{ label: 'Genre', value: (s.genre as string) ?? '—' }]
    case 'soundcloud':
      return [
        { label: 'Followers', value: s.followers as number | null },
        { label: 'Plays',     value: s.plays     as number | null },
        { label: 'Tracks',    value: s.tracks    as number | null },
      ]
    case 'tiktok':
      return [
        { label: 'Followers', value: s.followers as number | null },
        { label: 'Likes',     value: s.hearts    as number | null },
        { label: 'Videos',    value: s.videos    as number | null },
      ]
  }
}

export function PlatformDataCard({ userId, platform }: { userId: string; platform: PlatformId }) {
  const meta = META[platform]
  const [url, setUrl]           = useState('')
  const [savedUrl, setSavedUrl] = useState('')
  const [latest, setLatest]     = useState<Snapshot | null>(null)
  const [loading, setLoading]   = useState(true)
  const [fetching, setFetching] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [prefsRes, snapRes] = await Promise.all([
        supabase.from('artist_preferences').select(meta.urlField).eq('user_id', userId).maybeSingle(),
        supabase.from('platform_snapshots')
          .select('profile_id, display_name, stats, top_items, image_url, fetched_at')
          .eq('user_id', userId).eq('platform', platform)
          .order('fetched_at', { ascending: false }).limit(1).maybeSingle(),
      ])
      if (cancelled) return
      const u = (prefsRes.data as Record<string, string> | null)?.[meta.urlField] ?? ''
      setSavedUrl(u)
      setUrl(u)
      setLatest((snapRes.data as Snapshot | null) ?? null)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [userId, platform, meta.urlField])

  async function syncNow(submitUrl: string) {
    setFetching(true)
    setError(null)
    try {
      const res = await fetch('/.netlify/functions/platform-fetch', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, url: submitUrl }),
      })
      const data = await res.json()
      if (!data.ok || !data.data) {
        setError(data.message ?? 'Could not fetch.')
      } else if (data.data.platform !== platform) {
        setError(`That looks like a ${data.data.platform} link, not ${meta.label}. Use the ${data.data.platform} card.`)
      } else {
        setSavedUrl(submitUrl)
        setLatest({
          profile_id:   data.data.profileId,
          display_name: data.data.displayName,
          stats:        data.data.stats,
          top_items:    data.data.topItems ?? [],
          image_url:    data.data.imageUrl,
          fetched_at:   new Date().toISOString(),
        })
      }
    } catch {
      setError('Network error — try again.')
    } finally {
      setFetching(false)
    }
  }

  if (loading) {
    return (
      <div className={`bg-zinc-900/40 border ${meta.border} rounded-3xl p-8 flex items-center justify-center`}>
        <Loader2 size={16} className={`${meta.accent} opacity-60 animate-spin`} />
      </div>
    )
  }

  const tiles = latest ? statTiles(platform, latest) : []

  return (
    <div className={`bg-zinc-900/40 border ${meta.border} rounded-3xl p-6 backdrop-blur-xl`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.bg} ${meta.accent} shrink-0 border`}>
            <Music2 size={16} />
          </div>
          <div className="min-w-0">
            <p className={`${meta.accent} text-[10px] font-black uppercase tracking-[0.3em]`}>{meta.label}</p>
            <h3 className="text-white font-black text-base sm:text-lg tracking-tighter truncate">
              {latest?.display_name ?? 'Not connected'}
            </h3>
          </div>
        </div>
        {savedUrl && (
          <button
            onClick={() => syncNow(savedUrl)}
            disabled={fetching}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shrink-0"
          >
            {fetching ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
            {fetching ? 'Syncing' : 'Refresh'}
          </button>
        )}
      </div>

      {/* URL input */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1 flex items-center bg-zinc-950 border border-white/8 rounded-xl px-3 py-2.5 min-w-0">
          <ExternalLink size={12} className="text-white/20 mr-2 shrink-0" />
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder={meta.placeholder}
            className="flex-1 bg-transparent text-white text-xs font-medium placeholder-white/20 outline-none min-w-0"
          />
        </div>
        <button
          onClick={() => url.trim() && syncNow(url.trim())}
          disabled={!url.trim() || fetching}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex-shrink-0 ${
            url.trim()
              ? `${meta.bg} ${meta.accent} border hover:scale-[1.02]`
              : 'bg-white/5 text-white/20 cursor-not-allowed'
          }`}
        >
          {fetching ? <Loader2 size={11} className="animate-spin" /> : savedUrl === url ? <RefreshCw size={11} /> : <Check size={11} />}
          {fetching ? 'Fetching' : savedUrl === url && savedUrl ? 'Re-sync' : 'Sync'}
        </button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-500/8 border border-red-500/20 mb-3">
            <AlertCircle size={11} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-400 text-[11px] font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats grid */}
      {latest && (
        <>
          <div className={`grid gap-2 ${tiles.length === 1 ? 'grid-cols-1' : tiles.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {tiles.map(t => (
              <div key={t.label} className="bg-zinc-950/60 border border-white/5 rounded-xl p-3">
                <p className={`${meta.accent} text-[9px] font-black uppercase tracking-widest mb-1`}>{t.label}</p>
                <p className="text-white font-black text-xl tracking-tight">
                  {typeof t.value === 'string' ? t.value : formatNum(t.value as number | null)}
                </p>
              </div>
            ))}
          </div>

          {/* Top items (Spotify tracks etc.) */}
          {latest.top_items && latest.top_items.length > 0 && (
            <ul className="space-y-1 mt-3">
              {latest.top_items.slice(0, 5).map((t, i) => (
                <li key={i} className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-950/40 border border-white/5">
                  <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                    {t.image
                      ? <img src={t.image} alt="" className="w-full h-full object-cover" />
                      : <span className="text-white/30 text-[9px] font-black">{i + 1}</span>}
                  </div>
                  <span className="text-white text-xs font-medium flex-1 truncate">{t.name}</span>
                </li>
              ))}
            </ul>
          )}

          <p className="text-white/15 text-[9px] font-bold uppercase tracking-widest text-right mt-3">
            Last synced {timeAgo(latest.fetched_at)}
          </p>
        </>
      )}

      {!latest && !savedUrl && (
        <p className="text-white/30 text-[10px] font-medium text-center py-3">
          {meta.hint} — we pull public stats from the page.
        </p>
      )}
    </div>
  )
}
