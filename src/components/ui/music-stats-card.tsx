"use client"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Users, Music, Star, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"

const STATS = [
  { label: "Monthly Streams",  value: "2.4M",  change: "+18.2%",  up: true,  icon: Music },
  { label: "Followers",        value: "48.2K", change: "+5.1%",   up: true,  icon: Users },
  { label: "Playlist Adds",    value: "1,240", change: "+32.7%",  up: true,  icon: Star },
  { label: "Saves",            value: "8,910", change: "-1.4%",   up: false, icon: BarChart2 },
]

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
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      <motion.polygon
        points={`${pts} ${W - pad},${H} ${pad},${H}`}
        fill={`url(#sg-${colorId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
      />
    </svg>
  )
}

const STREAM_DATA = [1200, 1800, 1600, 2400, 2100, 2800, 3100, 2600, 3400, 2900, 3800, 4200]

export function MusicStatsCard() {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-zinc-950 overflow-hidden">
      {/* Sparkline header */}
      <div className="p-5 pb-0">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-1">Monthly Streams</p>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-black text-white tracking-tight">2.4M</span>
          <span className="text-xs font-bold text-green-400 flex items-center gap-1 mb-1"><TrendingUp size={11} />+18.2%</span>
        </div>
      </div>
      <div className="px-3 -mt-1 overflow-hidden">
        <Sparkline data={STREAM_DATA} color="#FFD700" />
      </div>

      {/* Platform dominance bar */}
      <div className="px-5 py-3 border-t border-white/5">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25 mb-2">Platform Split</p>
        <div className="flex h-1.5 w-full rounded-full overflow-hidden gap-px">
          {[
            { pct: 48, color: "#1DB954" },
            { pct: 18, color: "#FC3C44" },
            { pct: 14, color: "#ffffff" },
            { pct: 11, color: "#FF0000" },
            { pct: 9,  color: "#555" },
          ].map((s, i) => (
            <div key={i} className="h-full" style={{ background: s.color, width: `${s.pct}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {["Spotify","Apple","TikTok","YT","Other"].map((n,i) => (
            <span key={i} className="text-[9px] text-white/20 font-bold">{n}</span>
          ))}
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 border-t border-white/5">
        {STATS.map((s, i) => {
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
                <Icon size={11} className="text-white/25" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/25">{s.label}</span>
              </div>
              <p className="text-lg font-black text-white tracking-tight">{s.value}</p>
              <p className={cn("text-[10px] font-bold flex items-center gap-0.5", s.up ? "text-green-400" : "text-red-400")}>
                {s.up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                {s.change}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
