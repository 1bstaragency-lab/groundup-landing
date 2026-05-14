"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Zap, Megaphone, Image, Film, ChevronRight, CheckCircle2, Lock } from "lucide-react"

interface Reward {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  cost: number
  category: string
  comingSoon?: boolean
}

const REWARDS: Reward[] = [
  {
    id: "influencer",
    icon: <Megaphone size={16} />,
    title: "Influencer Intro",
    description: "Get connected with a verified micro-influencer in your genre.",
    cost: 500,
    category: "Network",
  },
  {
    id: "meta-ad",
    icon: <Zap size={16} />,
    title: "$10 Meta Ad Credit",
    description: "Boost a post on Instagram or Facebook for your next release.",
    cost: 400,
    category: "Advertising",
  },
  {
    id: "album-art",
    icon: <Image size={16} />,
    title: "Album Art Credit",
    description: "Generate professional AI-assisted cover art for your release.",
    cost: 300,
    category: "Creative",
  },
  {
    id: "visualizer",
    icon: <Film size={16} />,
    title: "Visualizer Credit",
    description: "Generate a music visualizer video for any track in your catalog.",
    cost: 350,
    category: "Creative",
    comingSoon: true,
  },
]

interface PointsWidgetProps {
  available: number
  totalEarned: number
  onSpend: (points: number, label: string) => boolean
}

export function PointsWidget({ available, totalEarned, onSpend }: PointsWidgetProps) {
  const [redeemed, setRedeemed] = useState<string | null>(null)
  const [insufficient, setInsufficient] = useState<string | null>(null)

  function handleRedeem(reward: Reward) {
    if (reward.comingSoon) return
    const ok = onSpend(reward.cost, `Redeemed: ${reward.title}`)
    if (ok) {
      setRedeemed(reward.id)
      setTimeout(() => setRedeemed(null), 2500)
    } else {
      setInsufficient(reward.id)
      setTimeout(() => setInsufficient(null), 1800)
    }
  }

  return (
    <div className="rounded-3xl border border-white/[0.07] bg-zinc-950 overflow-hidden">
      {/* Header strip */}
      <div className="px-5 pt-5 pb-4 border-b border-white/5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Artist Points</p>
            <div className="flex items-baseline gap-2">
              <motion.span
                key={available}
                initial={{ scale: 1.15, color: "#FFD700" }}
                animate={{ scale: 1, color: "#ffffff" }}
                transition={{ duration: 0.4 }}
                className="text-4xl font-black tracking-tight text-white"
              >
                {available.toLocaleString()}
              </motion.span>
              <span className="text-sm font-black text-[#FFD700] uppercase tracking-widest">pts</span>
            </div>
            <p className="text-white/25 text-[10px] font-bold mt-0.5">{totalEarned.toLocaleString()} earned total</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Earn 100 pts</p>
            <p className="text-[9px] text-white/15 font-medium">per completed task</p>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-4">
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[#FFD700]"
              style={{ boxShadow: "0 0 8px rgba(255,215,0,0.5)" }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((available % 500) / 5, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-white/15 font-bold">{available % 500} / 500 pts to next tier</span>
            <span className="text-[8px] text-[#FFD700]/50 font-black uppercase">
              {available >= 500 ? "Gold" : available >= 200 ? "Silver" : "Bronze"}
            </span>
          </div>
        </div>
      </div>

      {/* Rewards */}
      <div className="p-4 space-y-2">
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 mb-3 px-1">Redeem</p>
        {REWARDS.map(reward => {
          const canAfford = available >= reward.cost
          const isRedeemed = redeemed === reward.id
          const isInsufficient = insufficient === reward.id

          return (
            <motion.button
              key={reward.id}
              onClick={() => handleRedeem(reward)}
              disabled={reward.comingSoon}
              whileTap={!reward.comingSoon ? { scale: 0.98 } : {}}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border transition-all text-left group"
              style={{
                background: isRedeemed
                  ? "rgba(74,222,128,0.08)"
                  : isInsufficient
                  ? "rgba(244,63,94,0.06)"
                  : canAfford
                  ? "rgba(255,215,0,0.04)"
                  : "rgba(255,255,255,0.02)",
                borderColor: isRedeemed
                  ? "rgba(74,222,128,0.25)"
                  : isInsufficient
                  ? "rgba(244,63,94,0.2)"
                  : canAfford
                  ? "rgba(255,215,0,0.12)"
                  : "rgba(255,255,255,0.05)",
                cursor: reward.comingSoon ? "default" : "pointer",
              }}
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: canAfford && !reward.comingSoon ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.04)",
                  color: canAfford && !reward.comingSoon ? "#FFD700" : "rgba(255,255,255,0.2)",
                }}
              >
                {isRedeemed ? <CheckCircle2 size={16} color="#4ade80" /> : reward.comingSoon ? <Lock size={14} /> : reward.icon}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-[11px] font-black uppercase tracking-tight ${canAfford && !reward.comingSoon ? "text-white" : "text-white/30"}`}>
                    {reward.title}
                  </p>
                  {reward.comingSoon && (
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/20 border border-white/10 px-1.5 py-0.5 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-white/25 font-medium leading-snug mt-0.5 line-clamp-1">
                  {isRedeemed ? "Redeemed! Check your email." : isInsufficient ? `Need ${(reward.cost - available).toLocaleString()} more pts` : reward.description}
                </p>
              </div>

              {/* Cost */}
              <div className="text-right shrink-0">
                <p className={`text-[11px] font-black ${canAfford && !reward.comingSoon ? "text-[#FFD700]" : "text-white/20"}`}>
                  {reward.cost}
                </p>
                <p className="text-[8px] text-white/15 font-bold uppercase">pts</p>
              </div>

              {!reward.comingSoon && canAfford && (
                <ChevronRight size={12} className="text-white/15 group-hover:text-white/40 transition-colors shrink-0" />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
