"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Music2, Loader2, RefreshCw, Check, ExternalLink, AlertCircle, Headphones, TrendingUp, Award } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"

interface Snapshot {
  artist_id:         string
  artist_name:       string | null
  monthly_listeners: number | null
  followers:         number | null
  top_tracks:        Array<{ name: string; albumArt?: string | null }> | null
  fetched_at:        string
}

interface ScrapedResp {
  ok:   boolean
  data?: {
    artistId:         string
    artistName:       string | null
    monthlyListeners: number | null
    followers:        number | null
    topTracks:        Array<{ name: string; albumArt?: string | null }>
    imageUrl:         string | null
    verified:         boolean
    description:      string | null
  }
  error?:   string
  message?: string
}

function formatNum(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000), h = Math.floor(diff / 3600000), d = Math.floor(diff / 86400000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

export function SpotifyDataCard({ userId }: { userId: string }) {
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
        supabase.from('artist_preferences').select('spotify_url').eq('user_id', userId).maybeSingle(),
        supabase.from('spotify_snapshots').select('artist_id, artist_name, monthly_listeners, followers, top_tracks, fetched_at').eq('user_id', userId).order('fetched_at', { ascending: false }).limit(1).maybeSingle(),
      ])
      if (cancelled) return
      const u = prefsRes.data?.spotify_url ?? ''
      setSavedUrl(u)
      setUrl(u)
      setLatest((snapRes.data as Snapshot | null) ?? null)
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [userId])

  async function syncNow(spotifyUrl: string) {
    setFetching(true)
    setError(null)
    try {
      const res = await fetch('/.netlify/functions/spotify-fetch', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, spotifyUrl }),
      })
      const data = (await res.json()) as ScrapedResp
      if (!data.ok || !data.data) {
        setError(data.message ?? 'Could not fetch — make sure the link is a public Spotify artist URL.')
      } else {
        setSavedUrl(spotifyUrl)
        setLatest({
          artist_id:         data.data.artistId,
          artist_name:       data.data.artistName,
          monthly_listeners: data.data.monthlyListeners,
          followers:         data.data.followers,
          top_tracks:        data.data.topTracks ?? [],
          fetched_at:        new Date().toISOString(),
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
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 flex items-center justify-center">
        <Loader2 size={18} className="text-[#FFD700]/40 animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-zinc-900/40 border border-green-500/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center text-green-400">
            <Music2 size={18} />
          </div>
          <div>
            <p className="text-green-400 text-[10px] font-black uppercase tracking-[0.3em]">Spotify</p>
            <h3 className="text-white font-black text-lg tracking-tighter">
              {latest?.artist_name ?? 'Connect your artist page'}
            </h3>
          </div>
        </div>
        {savedUrl && (
          <button
            onClick={() => syncNow(savedUrl)}
            disabled={fetching}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {fetching ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
            {fetching ? 'Fetching…' : 'Refresh'}
          </button>
        )}
      </div>

      {/* URL input */}
      <div className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="flex-1 flex items-center bg-zinc-950 border border-white/8 focus-within:border-green-500/30 rounded-xl px-4 py-3 transition-colors">
          <ExternalLink size={13} className="text-white/20 mr-2" />
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://open.spotify.com/artist/..."
            className="flex-1 bg-transparent text-white text-sm font-medium placeholder-white/20 outline-none min-w-0"
          />
        </div>
        <button
          onClick={() => url.trim() && syncNow(url.trim())}
          disabled={!url.trim() || fetching}
          className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex-shrink-0 ${
            url.trim()
              ? 'bg-green-500 text-black hover:scale-[1.02]'
              : 'bg-white/5 text-white/20 cursor-not-allowed'
          }`}
        >
          {fetching ? <Loader2 size={11} className="animate-spin" /> : savedUrl === url ? <RefreshCw size={11} /> : <Check size={11} />}
          {fetching ? 'Fetching…' : savedUrl === url ? 'Re-sync' : 'Sync'}
        </button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-500/8 border border-red-500/20 mb-4"
          >
            <AlertCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-400 text-[11px] font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      {latest ? (
        <>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-zinc-950/60 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Headphones size={11} className="text-green-400" />
                <p className="text-green-400 text-[9px] font-black uppercase tracking-widest">Monthly Listeners</p>
              </div>
              <p className="text-white font-black text-3xl tracking-tight">{formatNum(latest.monthly_listeners)}</p>
            </div>
            <div className="bg-zinc-950/60 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <TrendingUp size={11} className="text-[#FFD700]" />
                <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest">Followers</p>
              </div>
              <p className="text-white font-black text-3xl tracking-tight">{formatNum(latest.followers)}</p>
            </div>
          </div>

          {/* Top tracks */}
          {latest.top_tracks && latest.top_tracks.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-3">
                <Award size={11} className="text-[#FFD700]" />
                <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Top Tracks</p>
              </div>
              <ul className="space-y-1.5">
                {latest.top_tracks.slice(0, 5).map((t, i) => (
                  <li key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-950/40 border border-white/5">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                      {t.albumArt
                        ? <img src={t.albumArt} alt="" className="w-full h-full object-cover" />
                        : <span className="text-white/30 text-[10px] font-black">{i + 1}</span>}
                    </div>
                    <span className="text-white text-sm font-medium flex-1 truncate">{t.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-white/15 text-[9px] font-bold uppercase tracking-widest text-right">
            Last synced {timeAgo(latest.fetched_at)}
          </p>
        </>
      ) : !savedUrl && (
        <div className="py-6 text-center border border-dashed border-white/8 rounded-2xl">
          <Music2 size={20} className="text-white/15 mx-auto mb-2" />
          <p className="text-white/30 text-[11px] font-medium">
            Paste your Spotify artist URL above to pull live numbers from your public page.
          </p>
          <p className="text-white/15 text-[10px] font-medium mt-1">
            No OAuth required — same data anyone can see when they visit your profile.
          </p>
        </div>
      )}
    </div>
  )
}
