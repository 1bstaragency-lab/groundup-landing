/**
 * PlatformLinkPrompt
 *
 * Appears once after login when none of the platform URLs
 * (Spotify, SoundCloud, YouTube) have been linked yet.
 *
 * - Slides up as a bottom sheet
 * - Lets the user paste 1-3 platform URLs (all optional)
 * - Saves URLs to artist_preferences + fires platform-fetch for each
 * - "Later" dismisses and sets a session flag so it doesn't re-appear
 */
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, Check, Loader2, Music2, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'

// Dismiss key uses localStorage — persists across sessions (truly one-time)

// Persists across sessions — prompt truly shows once
const DISMISS_KEY = 'gup_platform_prompt_v1'

interface Props {
  userId: string
}

interface FetchStatus {
  loading: boolean
  done:    boolean
  error:   string | null
}

export function PlatformLinkPrompt({ userId }: Props) {
  const [visible,   setVisible]   = useState(false)
  const [expanded,  setExpanded]  = useState(false)
  const [spotifyUrl,    setSpotifyUrl]    = useState('')
  const [soundcloudUrl, setSoundcloudUrl] = useState('')
  const [youtubeUrl,    setYoutubeUrl]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done,       setDone]       = useState(false)
  const [statuses,   setStatuses]   = useState<Record<string, FetchStatus>>({})

  // ── On mount: only show for temp-password (iMessage-onboarded) users ────────
  useEffect(() => {
    if (!userId) return
    // Permanently dismissed?
    if (localStorage.getItem(DISMISS_KEY)) return

    ;(async () => {
      // Only trigger for accounts created via iMessage onboarding (temp password)
      const { data: { session } } = await supabase.auth.getSession()
      const isTempPasswordUser = session?.user?.user_metadata?.must_change_password === true
      if (!isTempPasswordUser) return

      // Check if any platform is already linked
      const { data } = await supabase
        .from('artist_preferences')
        .select('spotify_url, soundcloud_url, youtube_url')
        .eq('user_id', userId)
        .maybeSingle()

      const hasAny =
        (data as Record<string, string | null> | null)?.spotify_url ||
        (data as Record<string, string | null> | null)?.soundcloud_url ||
        (data as Record<string, string | null> | null)?.youtube_url

      if (!hasAny) {
        // Small delay so the dashboard renders first
        setTimeout(() => setVisible(true), 1800)
      }
    })()
  }, [userId])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1')
    setVisible(false)
  }

  async function handleSubmit() {
    const entries: { field: string; url: string; label: string }[] = []
    if (spotifyUrl.trim())    entries.push({ field: 'spotify_url',    url: spotifyUrl.trim(),    label: 'Spotify'    })
    if (soundcloudUrl.trim()) entries.push({ field: 'soundcloud_url', url: soundcloudUrl.trim(), label: 'SoundCloud' })
    if (youtubeUrl.trim())    entries.push({ field: 'youtube_url',    url: youtubeUrl.trim(),    label: 'YouTube'    })

    if (!entries.length) { dismiss(); return }

    setSubmitting(true)

    // 1. Save URLs to artist_preferences
    const urlPatch: Record<string, string> = {}
    for (const e of entries) urlPatch[e.field] = e.url
    await supabase
      .from('artist_preferences')
      .upsert({ user_id: userId, ...urlPatch }, { onConflict: 'user_id' })

    // 2. Fire platform-fetch for each URL concurrently
    const initialStatuses: Record<string, FetchStatus> = {}
    for (const e of entries) initialStatuses[e.label] = { loading: true, done: false, error: null }
    setStatuses(initialStatuses)

    await Promise.all(
      entries.map(async (e) => {
        try {
          const res = await fetch('/.netlify/functions/platform-fetch', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, url: e.url }),
          })
          const data = await res.json()
          setStatuses(prev => ({
            ...prev,
            [e.label]: {
              loading: false,
              done:    !!data.ok,
              error:   data.ok ? null : (data.message ?? 'Could not fetch stats'),
            },
          }))
        } catch {
          setStatuses(prev => ({
            ...prev,
            [e.label]: { loading: false, done: false, error: 'Network error' },
          }))
        }
      })
    )

    setSubmitting(false)
    setDone(true)
    // Auto-dismiss after a beat so user sees the success state
    setTimeout(() => {
      localStorage.setItem(DISMISS_KEY, '1')
      setVisible(false)
    }, 2800)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="platform-prompt"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0,   opacity: 1 }}
          exit={{   y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100vw-32px)] max-w-md"
        >
          <div className="bg-zinc-900 border border-white/10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl overflow-hidden">

            {/* ── Collapsed prompt ── */}
            {!expanded && !done && (
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center shrink-0">
                  <Link2 size={17} className="text-[#FFD700]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm leading-tight">Connect your platforms</p>
                  <p className="text-white/40 text-xs mt-0.5 truncate">Link Spotify, SoundCloud, or YouTube to power your dashboard</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpanded(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#FFD700] text-black text-xs font-black uppercase tracking-wider hover:bg-[#f0c800] transition-colors"
                  >
                    Add <ChevronRight size={12} strokeWidth={3} />
                  </button>
                  <button onClick={dismiss} className="w-7 h-7 flex items-center justify-center rounded-xl text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Expanded form ── */}
            {expanded && !done && (
              <div className="px-5 py-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-black text-sm uppercase tracking-wider">Link your platforms</p>
                    <p className="text-white/30 text-xs mt-0.5">Paste any or all — we'll pull the stats automatically</p>
                  </div>
                  <button onClick={dismiss} className="w-7 h-7 flex items-center justify-center rounded-xl text-white/30 hover:text-white/50 hover:bg-white/5 transition-colors">
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {/* Spotify */}
                  <div className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-2xl px-3 py-2.5 focus-within:border-green-500/40 transition-colors">
                    <Music2 size={14} className="text-green-400 shrink-0" />
                    <input
                      type="url"
                      placeholder="Spotify artist URL"
                      value={spotifyUrl}
                      onChange={e => setSpotifyUrl(e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none min-w-0"
                    />
                  </div>

                  {/* SoundCloud */}
                  <div className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-2xl px-3 py-2.5 focus-within:border-orange-500/40 transition-colors">
                    <Music2 size={14} className="text-orange-400 shrink-0" />
                    <input
                      type="url"
                      placeholder="SoundCloud profile URL"
                      value={soundcloudUrl}
                      onChange={e => setSoundcloudUrl(e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none min-w-0"
                    />
                  </div>

                  {/* YouTube */}
                  <div className="flex items-center gap-3 bg-white/3 border border-white/8 rounded-2xl px-3 py-2.5 focus-within:border-red-500/40 transition-colors">
                    <Music2 size={14} className="text-red-400 shrink-0" />
                    <input
                      type="url"
                      placeholder="YouTube channel URL"
                      value={youtubeUrl}
                      onChange={e => setYoutubeUrl(e.target.value)}
                      className="flex-1 bg-transparent text-white text-sm placeholder:text-white/20 focus:outline-none min-w-0"
                    />
                  </div>
                </div>

                {/* In-progress statuses */}
                {Object.keys(statuses).length > 0 && (
                  <div className="mt-3 space-y-1">
                    {Object.entries(statuses).map(([label, st]) => (
                      <div key={label} className="flex items-center gap-2 text-xs">
                        {st.loading && <Loader2 size={11} className="text-white/40 animate-spin shrink-0" />}
                        {!st.loading && st.done  && <Check size={11} className="text-green-400 shrink-0" />}
                        {!st.loading && !st.done && <X    size={11} className="text-red-400  shrink-0" />}
                        <span className={st.done ? 'text-white/60' : st.error ? 'text-red-400' : 'text-white/40'}>
                          {st.loading ? `Fetching ${label}…` : st.done ? `${label} synced` : st.error ?? 'Error'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || (!spotifyUrl && !soundcloudUrl && !youtubeUrl)}
                    className="flex-1 py-2.5 rounded-2xl bg-[#FFD700] text-black font-black text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#f0c800] transition-colors flex items-center justify-center gap-2"
                  >
                    {submitting
                      ? <><Loader2 size={13} className="animate-spin" /> Syncing…</>
                      : 'Sync & Connect'
                    }
                  </button>
                  <button
                    onClick={dismiss}
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-2xl border border-white/10 text-white/40 text-xs font-bold hover:text-white/60 hover:border-white/20 transition-colors disabled:opacity-40"
                  >
                    Later
                  </button>
                </div>
              </div>
            )}

            {/* ── Success state ── */}
            {done && (
              <div className="px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center shrink-0">
                  <Check size={16} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Platforms connected!</p>
                  <p className="text-white/40 text-xs">Your stats are synced and live in your dashboard</p>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
