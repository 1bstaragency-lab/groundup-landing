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
import { GOLDD } from '../../lib/brand-tokens'
import { INK, DIM, FAINT, CARD } from '../../lib/dashboard-theme'

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
          <div className="rounded-3xl overflow-hidden backdrop-blur-xl" style={{ background: CARD, border: `1px solid ${FAINT}`, boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>

            {/* ── Collapsed prompt ── */}
            {!expanded && !done && (
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(184,134,11,0.2)' }}>
                  <Link2 size={17} style={{ color: GOLDD }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm leading-tight" style={{ color: INK }}>Connect your platforms</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: DIM }}>Link Spotify, SoundCloud, or YouTube to power your dashboard</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpanded(true)}
                    className="gradient-button flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider"
                  >
                    Add <ChevronRight size={12} strokeWidth={3} />
                  </button>
                  <button onClick={dismiss} className="w-7 h-7 flex items-center justify-center rounded-xl transition-colors dash-hover-surface" style={{ color: 'rgba(var(--dash-fg),0.56)' }}>
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
                    <p className="font-black text-sm uppercase tracking-wider" style={{ color: INK }}>Link your platforms</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(var(--dash-fg),0.56)' }}>Paste any or all — we'll pull the stats automatically</p>
                  </div>
                  <button onClick={dismiss} className="w-7 h-7 flex items-center justify-center rounded-xl transition-colors dash-hover-surface" style={{ color: 'rgba(var(--dash-fg),0.56)' }}>
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {/* Spotify — platform's real brand green, kept */}
                  <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors" style={{ background: 'rgba(var(--dash-fg),0.02)', border: '1px solid rgba(var(--dash-fg),0.08)' }}>
                    <Music2 size={14} className="shrink-0" style={{ color: '#1DB954' }} />
                    <input
                      type="url"
                      placeholder="Spotify artist URL"
                      value={spotifyUrl}
                      onChange={e => setSpotifyUrl(e.target.value)}
                      className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
                      style={{ color: INK }}
                    />
                  </div>

                  {/* SoundCloud — platform's real brand orange, kept */}
                  <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors" style={{ background: 'rgba(var(--dash-fg),0.02)', border: '1px solid rgba(var(--dash-fg),0.08)' }}>
                    <Music2 size={14} className="shrink-0" style={{ color: '#FF7700' }} />
                    <input
                      type="url"
                      placeholder="SoundCloud profile URL"
                      value={soundcloudUrl}
                      onChange={e => setSoundcloudUrl(e.target.value)}
                      className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
                      style={{ color: INK }}
                    />
                  </div>

                  {/* YouTube — platform's real brand red, kept */}
                  <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors" style={{ background: 'rgba(var(--dash-fg),0.02)', border: '1px solid rgba(var(--dash-fg),0.08)' }}>
                    <Music2 size={14} className="shrink-0" style={{ color: '#E03C31' }} />
                    <input
                      type="url"
                      placeholder="YouTube channel URL"
                      value={youtubeUrl}
                      onChange={e => setYoutubeUrl(e.target.value)}
                      className="flex-1 bg-transparent text-sm focus:outline-none min-w-0"
                      style={{ color: INK }}
                    />
                  </div>
                </div>

                {/* In-progress statuses */}
                {Object.keys(statuses).length > 0 && (
                  <div className="mt-3 space-y-1">
                    {Object.entries(statuses).map(([label, st]) => (
                      <div key={label} className="flex items-center gap-2 text-xs">
                        {st.loading && <Loader2 size={11} className="animate-spin shrink-0" style={{ color: DIM }} />}
                        {!st.loading && st.done  && <Check size={11} className="shrink-0" style={{ color: '#16A34A' }} />}
                        {!st.loading && !st.done && <X    size={11} className="shrink-0" style={{ color: '#DC2626' }} />}
                        <span style={{ color: st.done ? DIM : st.error ? '#DC2626' : 'rgba(var(--dash-fg),0.6)' }}>
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
                    className="gradient-button flex-1 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {submitting
                      ? <><Loader2 size={13} className="animate-spin" /> Syncing…</>
                      : 'Sync & Connect'
                    }
                  </button>
                  <button
                    onClick={dismiss}
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors disabled:opacity-40 dash-hover-border"
                    style={{ border: `1px solid ${FAINT}`, color: DIM }}
                  >
                    Later
                  </button>
                </div>
              </div>
            )}

            {/* ── Success state ── */}
            {done && (
              <div className="px-5 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <Check size={16} style={{ color: '#16A34A' }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: INK }}>Platforms connected!</p>
                  <p className="text-xs" style={{ color: DIM }}>Your stats are synced and live in your dashboard</p>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
