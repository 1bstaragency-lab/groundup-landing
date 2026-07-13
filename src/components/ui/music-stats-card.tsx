"use client"
import { motion } from "framer-motion"
import { TrendingUp, Users, Music, Play, Link2, Radio } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlatformStats, formatStat } from "../../hooks/usePlatformStats"
import { GOLD, GOLDD } from "../../lib/brand-tokens"
import { INK, DIM, FAINT, CARD } from "../../lib/dashboard-theme"

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
    <div className="rounded-3xl overflow-hidden" style={{ background: CARD, border: `1px solid ${FAINT}` }}>
      {/* Headline — Monthly Listeners */}
      <div className="p-5 pb-0">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-1" style={{ color: DIM }}>Monthly Listeners</p>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-black tracking-tight" style={{ color: headline ? INK : 'rgba(var(--dash-fg),0.48)' }}>
            {headline ? formatStat(headline) : '— —'}
          </span>
          <span className="text-xs font-bold flex items-center gap-1 mb-1" style={{ color: headline ? GOLDD : 'rgba(var(--dash-fg),0.48)' }}>
            <TrendingUp size={11} /> {headline ? 'Spotify' : 'No data yet'}
          </span>
        </div>
      </div>
      <div className={cn("px-3 -mt-1 overflow-hidden", headline ? 'opacity-100' : 'opacity-20')}>
        <Sparkline data={sparklineData} color={GOLD} />
      </div>

      {/* Connect prompt when nothing linked */}
      {!hasAnyData && (
        <div className="px-5 py-3" style={{ borderTop: `1px solid ${FAINT}` }}>
          <a href="/dashboard/analytics" className="flex items-center gap-2 py-2 px-3 rounded-xl transition-colors dash-hover-surface" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(184,134,11,0.15)' }}>
            <Link2 size={11} className="shrink-0" style={{ color: GOLDD, opacity: 0.7 }} />
            <p className="text-[10px] font-bold" style={{ color: DIM }}>
              Link your Spotify / SoundCloud / YouTube in Analytics →
            </p>
          </a>
        </div>
      )}

      {/* Stat grid */}
      <div className="grid grid-cols-2" style={{ borderTop: `1px solid ${FAINT}` }}>
        {tiles.map((s, i) => {
          const Icon = s.icon
          const hasData = s.value !== null
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="p-4"
              style={{
                borderRight: i % 2 === 0 ? `1px solid ${FAINT}` : undefined,
                borderBottom: i < 2 ? `1px solid ${FAINT}` : undefined,
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon size={11} style={{ color: hasData ? GOLDD : 'rgba(var(--dash-fg),0.45)', opacity: hasData ? 0.7 : 1 }} />
                <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: hasData ? DIM : 'rgba(var(--dash-fg),0.48)' }}>
                  {s.label}
                </span>
              </div>
              <p className="text-lg font-black tracking-tight" style={{ color: hasData ? INK : 'rgba(var(--dash-fg),0.48)' }}>
                {hasData ? formatStat(s.value) : '—'}
              </p>
              <p className="text-[10px] font-bold" style={{ color: hasData ? DIM : 'rgba(var(--dash-fg),0.45)' }}>
                {hasData ? s.placeholder : 'not connected'}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
