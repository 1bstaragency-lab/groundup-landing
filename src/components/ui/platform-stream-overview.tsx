"use client"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Music2, Apple, Video, PlayCircle, Radio } from "lucide-react"
import { cn } from "@/lib/utils"

const PLATFORMS = [
  { name: "Spotify",      value: "2.4M",  pct: 48, trend: "up",   change: "+12.4%", color: "#1DB954", icon: Music2 },
  { name: "Apple Music",  value: "890K",  pct: 18, trend: "up",   change: "+8.1%",  color: "#FC3C44", icon: Apple },
  { name: "TikTok",       value: "680K",  pct: 14, trend: "up",   change: "+31.7%", color: "#ffffff", icon: Video },
  { name: "YouTube",      value: "540K",  pct: 11, trend: "down",  change: "-2.3%",  color: "#FF0000", icon: PlayCircle },
  { name: "SoundCloud",   value: "220K",  pct: 5,  trend: "up",   change: "+4.2%",  color: "#FF5500", icon: Radio },
  { name: "Other",        value: "200K",  pct: 4,  trend: "up",   change: "+1.1%",  color: "#888888", icon: Radio },
]

export function PlatformStreamOverview() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-1">Stream Split</p>
        <h3 className="text-2xl font-black text-white tracking-tight">Platform Overview</h3>
      </div>

      {/* Distribution bar */}
      <div className="flex h-2.5 w-full rounded-full overflow-hidden gap-px">
        {PLATFORMS.map((p) => (
          <motion.div
            key={p.name}
            className="h-full"
            style={{ background: p.color, width: `${p.pct}%` }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: PLATFORMS.indexOf(p) * 0.08, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* Platform cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {PLATFORMS.slice(0, 5).map((p, i) => {
          const Icon = p.icon
          return (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-white/[0.08] bg-zinc-900/60 p-4 cursor-default"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                  <span className="text-[11px] font-bold text-white/50">{p.name}</span>
                </div>
                <Icon size={12} className="text-white/20" />
              </div>
              <p className="text-xl font-black text-white tracking-tight">{p.value}</p>
              <p className="text-[10px] font-bold text-white/30 mt-0.5">{p.pct}% of total</p>
              <p className={cn("text-[10px] font-bold mt-2 flex items-center gap-1", p.trend === "up" ? "text-green-400" : "text-red-400")}>
                {p.trend === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {p.change}
              </p>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
