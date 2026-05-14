"use client"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const BARS = [
  { label: "DistroKid",      value: 2,  color: "bg-white/20",  highlight: false },
  { label: "TuneCore",       value: 1,  color: "bg-white/20",  highlight: false },
  { label: "United Masters", value: 11, color: "bg-white/20",  highlight: false },
  { label: "GrounduP",       value: 94, color: "bg-[#FFD700]", highlight: true  },
]

export function StatisticsCard() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-zinc-950 p-8">
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-2">Artist Career Growth</p>
      <h3 className="text-2xl font-black text-white tracking-tight mb-1">We Deliver Results</h3>
      <p className="text-white/30 text-sm mb-8">Compared to other platforms, GrounduP artists grow faster.</p>

      <div className="flex items-end gap-4 h-48">
        {BARS.map((bar, i) => (
          <div key={bar.label} className="flex-1 flex flex-col items-center gap-2">
            <motion.div
              className={cn("text-[11px] font-black", bar.highlight ? "text-[#FFD700]" : "text-white/30")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 + 0.5 }}
            >
              {bar.value}%
            </motion.div>
            <div className="w-full flex flex-col justify-end rounded-2xl overflow-hidden" style={{ height: "160px", background: "rgba(255,255,255,0.04)" }}>
              <motion.div
                className={cn("w-full rounded-2xl", bar.color)}
                style={{ originY: 1 }}
                initial={{ height: 0 }}
                animate={{ height: `${bar.value}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 20, delay: i * 0.15 }}
              />
            </div>
            <p className={cn("text-[9px] font-black text-center uppercase tracking-wider leading-tight", bar.highlight ? "text-[#FFD700]" : "text-white/30")}>
              {bar.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3 p-3 rounded-2xl bg-[#FFD700]/5 border border-[#FFD700]/15">
        <div className="w-2 h-2 rounded-full bg-[#FFD700] shrink-0" />
        <p className="text-[11px] font-bold text-[#FFD700]/70">GrounduP artists see 94% higher career growth rate vs other platforms</p>
      </div>
    </div>
  )
}
