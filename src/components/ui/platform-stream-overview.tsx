"use client"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

const PLATFORMS = [
  { name: "Spotify",     value: "2.4M", pct: 48, trend: "up",   change: "+12.4%", color: "#1DB954" },
  { name: "Apple Music", value: "890K", pct: 18, trend: "up",   change: "+8.1%",  color: "#FC3C44" },
  { name: "TikTok",      value: "680K", pct: 14, trend: "up",   change: "+31.7%", color: "#ffffff" },
  { name: "YouTube",     value: "540K", pct: 11, trend: "down", change: "-2.3%",  color: "#FF0000" },
  { name: "SoundCloud",  value: "220K", pct: 5,  trend: "up",   change: "+4.2%",  color: "#FF5500" },
  { name: "Other",       value: "200K", pct: 4,  trend: "up",   change: "+1.1%",  color: "#555555" },
]

export function PlatformStreamOverview() {
  return (
    <div className="w-full rounded-2xl border border-white/8 bg-zinc-900/50 px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">Stream Split</p>
        <p className="text-[10px] font-bold text-white/20">Total: 5.03M</p>
      </div>

      {/* Segmented bar */}
      <div className="flex h-2 w-full rounded-full overflow-hidden gap-px mb-3">
        {PLATFORMS.map((p, i) => (
          <motion.div
            key={p.name}
            className="h-full"
            style={{ background: p.color, width: `${p.pct}%` }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* Compact row */}
      <div className="flex items-center gap-4 flex-wrap">
        {PLATFORMS.map((p) => (
          <div key={p.name} className="flex items-center gap-1.5 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.color }} />
            <span className="text-[10px] font-bold text-white/40 whitespace-nowrap">{p.name}</span>
            <span className="text-[10px] font-black text-white/70">{p.value}</span>
            <span className={cn("text-[9px] font-bold flex items-center gap-0.5", p.trend === "up" ? "text-green-400" : "text-red-400")}>
              {p.trend === "up" ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
              {p.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
