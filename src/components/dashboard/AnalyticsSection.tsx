import { BarChart2, RefreshCw } from 'lucide-react'
import { PlatformDataCard } from './PlatformDataCard'
import { useAuth } from '../../hooks/useAuth'
import { usePlatformStats, formatStat } from '../../hooks/usePlatformStats'
import { GOLDD } from '../../lib/brand-tokens'
import { INK, DIM, FAINT, CARD } from '../../lib/dashboard-theme'

export function AnalyticsSection() {
  const { user } = useAuth()
  const stats = usePlatformStats(user?.id ?? null)

  // Platform-brand colors kept (Spotify green, YouTube red are real brand
  // colors, not decorative); "Total Reach" uses the gold accent.
  const headlineTiles = [
    { label: 'Monthly Listeners',     value: stats.monthlyListeners, color: '#1DB954',  hint: 'Spotify' },
    { label: 'SoundCloud Followers',  value: stats.scFollowers,      color: '#FF7700',  hint: 'SoundCloud' },
    { label: 'YouTube Subscribers',   value: stats.ytSubscribers,    color: '#E03C31',  hint: 'YouTube' },
    { label: 'Total Reach',           value: stats.totalReach,       color: GOLDD,      hint: 'Across platforms' },
  ]
  const hasAnyData = headlineTiles.some(t => t.value !== null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase mb-2" style={{ color: INK }}>Analytics</h1>
          <p className="text-sm font-bold" style={{ color: DIM }}>Paste your platform link → we pull live public data.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl" style={{ background: CARD, border: `1px solid ${FAINT}` }}>
          <BarChart2 size={14} style={{ color: GOLDD }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: DIM }}>Live</span>
        </div>
      </div>

      {/* Headline stat tiles — only render when at least one is populated */}
      {hasAnyData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {headlineTiles.map(t => (
            <div key={t.label} className="rounded-2xl p-5 backdrop-blur-xl" style={{ background: CARD, border: `1px solid ${FAINT}` }}>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: t.color }}>{t.label}</p>
              <p className="font-black text-3xl tracking-tight" style={{ color: t.value === null ? 'rgba(var(--dash-fg),0.3)' : INK }}>
                {formatStat(t.value)}
              </p>
              <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: 'rgba(var(--dash-fg),0.45)' }}>
                {t.value === null ? 'Not linked' : t.hint}
              </p>
            </div>
          ))}
        </div>
      )}

      {stats.lastSyncedAt && (
        <p className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(var(--dash-fg),0.45)' }}>
          <RefreshCw size={10} />
          Last synced {new Date(stats.lastSyncedAt).toLocaleString()}
        </p>
      )}

      {/* Platform link cards — paste URL, pull live public data */}
      {user && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PlatformDataCard userId={user.id} platform="spotify" />
          <PlatformDataCard userId={user.id} platform="soundcloud" />
          <PlatformDataCard userId={user.id} platform="youtube" />
        </div>
      )}
    </div>
  )
}
