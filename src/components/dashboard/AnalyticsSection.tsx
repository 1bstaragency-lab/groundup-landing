import { BarChart2, RefreshCw } from 'lucide-react'
import { PlatformDataCard } from './PlatformDataCard'
import { useAuth } from '../../hooks/useAuth'
import { usePlatformStats, formatStat } from '../../hooks/usePlatformStats'

export function AnalyticsSection() {
  const { user } = useAuth()
  const stats = usePlatformStats(user?.id ?? null)

  // Top-line stats — only show tiles with data. Empty state when nothing linked.
  const headlineTiles = [
    { label: 'Monthly Listeners', value: stats.monthlyListeners, color: 'text-green-400',  hint: 'Spotify' },
    { label: 'SoundCloud Plays',  value: stats.scPlays,          color: 'text-orange-400', hint: 'SoundCloud' },
    { label: 'YouTube Subscribers', value: stats.ytSubscribers,  color: 'text-red-400',    hint: 'YouTube' },
    { label: 'Total Reach',       value: stats.totalReach,       color: 'text-[#FFD700]',  hint: 'Across platforms' },
  ]
  const hasAnyData = headlineTiles.some(t => t.value !== null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-2">Analytics</h1>
          <p className="text-white/30 text-sm font-bold">Paste your platform link → we pull live public data.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/60 border border-white/5 rounded-2xl">
          <BarChart2 size={14} className="text-[#FFD700]" />
          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Headline stat tiles — only render when at least one is populated */}
      {hasAnyData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {headlineTiles.map(t => (
            <div key={t.label} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
              <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${t.color}`}>{t.label}</p>
              <p className={`font-black text-3xl tracking-tight ${t.value === null ? 'text-white/15' : 'text-white'}`}>
                {formatStat(t.value)}
              </p>
              <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest mt-1">
                {t.value === null ? 'Not linked' : t.hint}
              </p>
            </div>
          ))}
        </div>
      )}

      {stats.lastSyncedAt && (
        <p className="flex items-center justify-end gap-2 text-white/20 text-[10px] font-black uppercase tracking-widest">
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
