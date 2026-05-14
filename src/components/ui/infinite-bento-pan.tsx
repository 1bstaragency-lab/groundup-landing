"use client"

import { useRef } from "react"
import { motion, useAnimationFrame, useMotionValue } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCard {
  label: string
  value: string
  delta: string
  trend: "up" | "down" | "flat"
  color: string
  bg: string
}

const CARDS: MetricCard[] = [
  { label: "Streams", value: "2.4M", delta: "+18%", trend: "up", color: "text-[#FFD700]", bg: "bg-[#FFD700]/10" },
  { label: "Monthly Listeners", value: "84K", delta: "+7%", trend: "up", color: "text-green-400", bg: "bg-green-400/10" },
  { label: "Chart Position", value: "#12", delta: "+4", trend: "up", color: "text-blue-400", bg: "bg-blue-400/10" },
  { label: "TikTok Views", value: "9.1M", delta: "+42%", trend: "up", color: "text-pink-400", bg: "bg-pink-400/10" },
  { label: "Followers", value: "127K", delta: "+2.3K", trend: "up", color: "text-purple-400", bg: "bg-purple-400/10" },
  { label: "Revenue", value: "$6,840", delta: "+12%", trend: "up", color: "text-[#FFD700]", bg: "bg-[#FFD700]/10" },
  { label: "Billboard #", value: "47", delta: "-3", trend: "down", color: "text-red-400", bg: "bg-red-400/10" },
  { label: "Releases", value: "3", delta: "+1", trend: "up", color: "text-amber-400", bg: "bg-amber-400/10" },
  { label: "Playlists", value: "218", delta: "+31", trend: "up", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { label: "Streams/Day", value: "82K", delta: "+5%", trend: "up", color: "text-[#FFD700]", bg: "bg-[#FFD700]/10" },
  { label: "Fan Score", value: "94", delta: "+2", trend: "up", color: "text-green-400", bg: "bg-green-400/10" },
  { label: "Pitches", value: "14", delta: "-2", trend: "down", color: "text-orange-400", bg: "bg-orange-400/10" },
  { label: "Press Hits", value: "7", delta: "+3", trend: "up", color: "text-white", bg: "bg-white/10" },
  { label: "Sync Deals", value: "2", delta: "new", trend: "up", color: "text-[#FFD700]", bg: "bg-[#FFD700]/10" },
  { label: "Merch Sales", value: "$1.2K", delta: "+28%", trend: "up", color: "text-purple-400", bg: "bg-purple-400/10" },
  { label: "Tour Dates", value: "8", delta: "+2", trend: "up", color: "text-blue-400", bg: "bg-blue-400/10" },
]

function MetricCardItem({ card }: { card: MetricCard }) {
  return (
    <div className="w-48 shrink-0 rounded-2xl border border-white/8 bg-zinc-950/80 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">{card.label}</p>
        <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${card.bg}`}>
          {card.trend === "up" && <TrendingUp size={12} className={card.color} />}
          {card.trend === "down" && <TrendingDown size={12} className={card.color} />}
          {card.trend === "flat" && <Minus size={12} className={card.color} />}
        </div>
      </div>
      <p className={`text-2xl font-black tracking-tighter ${card.color}`}>{card.value}</p>
      <div className="flex items-center gap-1 mt-1">
        <span className={`text-[10px] font-black ${
          card.trend === "up" ? "text-green-400" :
          card.trend === "down" ? "text-red-400" :
          "text-white/30"
        }`}>{card.delta}</span>
        <span className="text-white/15 text-[10px]">vs last month</span>
      </div>
    </div>
  )
}

function InfiniteRow({ cards, direction = 1, speed = 40 }: { cards: MetricCard[]; direction?: 1 | -1; speed?: number }) {
  const x = useMotionValue(0)
  const containerRef = useRef<HTMLDivElement>(null)
  // Doubled for seamless loop
  const doubled = [...cards, ...cards]

  useAnimationFrame((_, delta) => {
    const pxPerMs = (speed / 1000) * direction
    let newX = x.get() - pxPerMs * delta
    const containerWidth = containerRef.current ? containerRef.current.scrollWidth / 2 : 0
    if (containerWidth > 0) {
      if (direction === 1 && newX <= -containerWidth) newX += containerWidth
      if (direction === -1 && newX >= 0) newX -= containerWidth
    }
    x.set(newX)
  })

  return (
    <div className="overflow-hidden w-full">
      <motion.div
        ref={containerRef}
        className="flex gap-4 will-change-transform"
        style={{ x }}
      >
        {doubled.map((card, i) => (
          <MetricCardItem key={i} card={card} />
        ))}
      </motion.div>
    </div>
  )
}

export function InfiniteBentoPan() {
  const half = Math.ceil(CARDS.length / 2)
  const row1 = CARDS.slice(0, half)
  const row2 = CARDS.slice(half)

  return (
    <div className="w-full overflow-hidden py-4 space-y-4">
      <InfiniteRow cards={row1} direction={1} speed={35} />
      <InfiniteRow cards={row2} direction={-1} speed={28} />
    </div>
  )
}
