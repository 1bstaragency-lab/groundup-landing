"use client"
import { motion } from "framer-motion"
import { TrendingUp, Users, Music, Play, Link2, Radio } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlatformStats, formatStat } from "../../hooks/usePlatformStats"

interface Props {
  userId?: string
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 120, H = 36, pad = 2
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = H - pad - ((v - min) / range) * (H - pad * 2)
    return `${x},${y}`
  }).join(" ")
  const colorId = color.replace('#', '')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id={`sg-${colorId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.polyline
        points={pts} fill="none" stroke={color} strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      <motion.polygon
        points={`${pts} ${W - pad},${H} ${pad},${H}`}
        fill={`url(#sg-${colorId})`}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      />
    </svg>
  )
}

// Build a sparkline approximating the trend if we have only the current value
function approxTrend(current: number | null): number[] {
  if (!current || current <= 0) return [1200, 1800, 1600, 2400, 2100, 2800, 3100, 2600, 3400, 2900, 3800, 4200]
  // Show recent 12 values ramping toward `current` with light noise — replace
  // with real time-series once we have ≥12 snapshots stored.
  const out: number[] = []
  for (let i = 0; i < 12; i++) {
    const t = (i + 1) / 12
    const wobble = 1 + (Math.sin(i * 1.7) * 0.06)
    out.push(Math.round(current * t * wobble * 0.8))
  }
  return out
}

export function MusicStatsCard({ userId }: Props) {
  const stats = usePlatformStats(userId ?? null)
  const headline = stats.monthlyListeners
  const sparklineData = approxTrend(headline)

  const tiles: Array<{ label: string; icon: React.ElementType; value: number | null; placeholder: string }> = [
    { label: 'Monthly Listeners', icon: Music,   value: stats.monthlyListeners, placeholder: 'Spotify' },
    { label: 'SC Followers',      icon: Users,   value: stats.scFollowers,      placeholder: 'SoundCloud' },
    { label: 'SC Plays',          icon: Radio,   value: stats.scPlays,          placeholder: 'SoundCloud' },
    { label: 'YT Subscribers',    icon: Play,    value: stats.ytSubscribers,    placeholder: 'YouTube' },
  ]

  const hasAnyData = tiles.some(t => t.value !== null)

  return (
    <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 overflow-hidden">
      {/* Headline — Monthly Listeners */}
      <div className="p-5 pb-0">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-1">Monthly Listeners</p>
        <div className="flex items-end justify-between">
          <span className={cn("text-3xl font-black tracking-tight", headline ? 'text-white' : 'text-white/20')}>
            {headline ? formatStat(headline) : '— —'}
          </span>
          <span className={cn("text-xs font-bold flex items-center gap-1 mb-1", headline ? 'text-green-400/70' : 'text-white/20')}>
            <TrendingUp size={11} /> {headline ? 'Spotify' : 'No data yet'}
          </span>
        </div>
      </div>
      <div className={cn("px-3 -mt-1 overflow-hidden", headline ? 'opacity-100' : 'opacity-20')}>
        <Sparkline data={sparklineData} color="#FFD700" />
      </div>

      {/* Connect prompt when nothing linked */}
      {!hasAnyData && (
        <div className="px-5 py-3 border-t border-white/5">
          <a href="/dashboard/analytics" className="flex items-center gap-2 py-2 px-3 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/10 hover:bg-[#FFD700]/8 transition-colors">
            <Link2 size={11} className="text-[#FFD700]/50 shrink-0" />
            <p className="text-[10px] font-bold text-white/30">
              Link your Spotify / SoundCloud / YouTube in Analytics →
            </p>
          </a>
        </div>
      )}

      {/* Stat grid */}
      <div className="grid grid-cols-2 border-t border-white/5">
        {tiles.map((s, i) => {
          const Icon = s.icon
          const hasData = s.value !== null
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className={cn("p-4 border-white/5", i % 2 === 0 ? "border-r" : "", i < 2 ? "border-b" : "")}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon size={11} className={hasData ? 'text-[#FFD700]/60' : 'text-white/15'} />
                <span className={cn("text-[9px] font-black uppercase tracking-widest", hasData ? 'text-white/50' : 'text-white/20')}>
                  {s.label}
                </span>
              </div>
              <p className={cn("text-lg font-black tracking-tight", hasData ? 'text-white' : 'text-white/20')}>
                {hasData ? formatStat(s.value) : '—'}
              </p>
              <p className={cn("text-[10px] font-bold", hasData ? 'text-white/40' : 'text-white/15')}>
                {hasData ? s.placeholder : 'not connected'}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
