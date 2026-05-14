"use client"
import { motion } from "framer-motion"
import { TrendingUp, Users, Music, Star, BarChart2, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"

const STAT_DEFS = [
  { label: "Monthly Streams", icon: Music },
  { label: "Followers",       icon: Users },
  { label: "Playlist Adds",  icon: Star },
  { label: "Saves",           icon: BarChart2 },
]

const STREAM_DATA = [1200, 1800, 1600, 2400, 2100, 2800, 3100, 2600, 3400, 2900, 3800, 4200]

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

export function MusicStatsCard() {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 overflow-hidden">
      {/* Sparkline header — shows trend shape as a teaser */}
      <div className="p-5 pb-0">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-1">Monthly Streams</p>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-black text-white/20 tracking-tight">— —</span>
          <span className="text-xs font-bold text-white/20 flex items-center gap-1 mb-1">
            <TrendingUp size={11} /> No data yet
          </span>
        </div>
      </div>
      <div className="px-3 -mt-1 overflow-hidden opacity-20">
        <Sparkline data={STREAM_DATA} color="#FFD700" />
      </div>

      {/* Connect prompt */}
      <div className="px-5 py-3 border-t border-white/5">
        <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-[#FFD700]/5 border border-[#FFD700]/10">
          <Link2 size={11} className="text-[#FFD700]/50 shrink-0" />
          <p className="text-[10px] font-bold text-white/30">
            Connect your Spotify for Artists to see live data
          </p>
        </div>
      </div>

      {/* Stat grid — empty state */}
      <div className="grid grid-cols-2 border-t border-white/5">
        {STAT_DEFS.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn("p-4 border-white/5", i % 2 === 0 ? "border-r" : "", i < 2 ? "border-b" : "")}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon size={11} className="text-white/15" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">{s.label}</span>
              </div>
              <p className="text-lg font-black text-white/20 tracking-tight">—</p>
              <p className="text-[10px] font-bold text-white/15">not connected</p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
