"use client"

import { motion } from "framer-motion"

interface Badge {
  id: string
  label: string
  color: string
}

const DEFAULT_BADGES: Badge[] = [
  { id: "releases", label: "releases", color: "from-yellow-400 to-[#FFD700]" },
  { id: "analytics", label: "analytics", color: "from-amber-500 to-amber-600" },
  { id: "social-media", label: "social media", color: "from-[#FFD700] to-amber-500" },
  { id: "studio", label: "studio", color: "from-orange-400 to-orange-500" },
  { id: "collaborators", label: "collaborators", color: "from-amber-300 to-yellow-400" },
  { id: "tours", label: "tours", color: "from-yellow-500 to-amber-600" },
]

interface MarketingBadgesProps {
  badges?: Badge[]
  label?: string
  subtitle?: string
  className?: string
}

export function MarketingBadges({
  badges = DEFAULT_BADGES,
  label = "Our Ecosystem",
  subtitle = "Everything an artist needs, unified in one intelligent platform.",
  className = "",
}: MarketingBadgesProps) {
  return (
    <div className={`w-full ${className}`}>
      {(label || subtitle) && (
        <div className="text-center mb-8">
          {label && (
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#FFD700]/60 mb-3">{label}</p>
          )}
          {subtitle && (
            <p className="text-white/30 text-sm font-medium max-w-md mx-auto">{subtitle}</p>
          )}
        </div>
      )}
      <div className="flex flex-wrap justify-center gap-3">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            whileHover={{ scale: 1.06, y: -2 }}
            className="relative group cursor-default"
          >
            <div className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-60 transition-opacity bg-gradient-to-r ${badge.color}`} />
            <div className={`relative px-5 py-2.5 rounded-full bg-gradient-to-r ${badge.color} shadow-[0_4px_20px_rgba(0,0,0,0.4)]`}>
              <span className="text-[11px] font-black uppercase tracking-[0.15em] text-black">
                {badge.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
