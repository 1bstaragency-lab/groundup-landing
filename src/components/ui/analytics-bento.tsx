"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface BudgetItem {
  label: string
  amount: number
  pct: number
  trend: "up" | "down" | "flat"
  color: string
}

interface BudgetCardProps {
  className?: string
  title?: string
  total?: number
  currency?: string
  items?: BudgetItem[]
}

const DEFAULT_ITEMS: BudgetItem[] = [
  { label: "Distribution", amount: 120, pct: 20, trend: "flat", color: "#FFD700" },
  { label: "Marketing", amount: 350, pct: 58, trend: "up", color: "#B8860B" },
  { label: "Production", amount: 130, pct: 22, trend: "down", color: "#ffffff" },
]

export function BudgetCard({
  className,
  title = "Release Budget",
  total = 600,
  currency = "$",
  items = DEFAULT_ITEMS,
}: BudgetCardProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div className={cn(
      "w-full rounded-3xl border border-white/8 bg-zinc-950/80 backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={14} className="text-[#FFD700]" />
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">{title}</p>
          </div>
          <p className="text-4xl font-black text-white tracking-tighter">
            {currency}{total.toLocaleString()}
          </p>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mt-1">This Release</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center">
          <TrendingUp size={16} className="text-[#FFD700]" />
        </div>
      </div>

      {/* SVG bar chart */}
      <div className="mb-5">
        <svg width="100%" height="8" className="rounded-full overflow-hidden">
          {items.reduce<{ els: React.ReactNode[]; offset: number }>(
            ({ els, offset }, item, i) => {
              const w = item.pct
              els.push(
                <rect
                  key={item.label}
                  x={`${offset}%`}
                  y={0}
                  width={`${w}%`}
                  height={8}
                  fill={item.color}
                  opacity={hovered === null || hovered === item.label ? 1 : 0.3}
                  style={{ transition: "opacity 0.2s" }}
                  rx={i === 0 ? 4 : i === items.length - 1 ? 4 : 0}
                />
              )
              return { els, offset: offset + w }
            },
            { els: [], offset: 0 }
          ).els}
        </svg>
      </div>

      {/* Line items */}
      <div className="space-y-3">
        {items.map((item) => (
          <motion.div
            key={item.label}
            className="flex items-center justify-between gap-3 p-3 rounded-xl cursor-default transition-all"
            style={{ background: hovered === item.label ? "rgba(255,255,255,0.04)" : "transparent" }}
            onMouseEnter={() => setHovered(item.label)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
              <span className="text-white/60 text-xs font-bold">{item.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-1 w-20 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <span className="text-white font-black text-sm w-16 text-right">
                {currency}{item.amount.toLocaleString()}
              </span>
              {item.trend === "up" && <TrendingUp size={12} className="text-green-400 shrink-0" />}
              {item.trend === "down" && <TrendingDown size={12} className="text-red-400 shrink-0" />}
              {item.trend === "flat" && <div className="w-3 h-0.5 bg-white/20 shrink-0 rounded-full" />}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
