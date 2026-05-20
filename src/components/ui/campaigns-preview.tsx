"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { CAMPAIGNS, type Campaign } from "../../data/campaigns"

function Row({ c, index }: { c: Campaign; index: number }) {
  const [hover, setHover] = useState(false)
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => window.location.assign('/campaigns')}
      className="group w-full text-left border-b border-white/8 py-5 sm:py-6"
    >
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-4 sm:gap-6 min-w-0">
          <span className="text-white/20 text-xs font-black tabular-nums shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <h3 className={`text-xl sm:text-3xl font-black tracking-tighter uppercase transition-colors duration-300 truncate ${hover ? 'text-[#FFD700]' : 'text-white'}`}>
              {c.artist}
            </h3>
            <p className="text-white/40 text-[11px] sm:text-sm font-medium mt-0.5 truncate">
              {c.project} · {c.type}
              {c.result && <span className="text-[#FFD700]/70"> · ✦ {c.result}</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-8 shrink-0">
          <div className="hidden sm:block text-right">
            <p className="text-white/55 text-sm font-bold whitespace-nowrap">{c.label}</p>
            <p className="text-white/25 text-[10px] font-black uppercase tracking-widest mt-0.5">{c.year}</p>
          </div>
          <ArrowUpRight size={20} className={`transition-all duration-300 ${hover ? 'text-[#FFD700] translate-x-1 -translate-y-1' : 'text-white/20'}`} />
        </div>
      </div>
    </motion.button>
  )
}

export function CampaignsPreview() {
  const navigate = useNavigate()
  const preview = CAMPAIGNS.slice(0, 4)

  return (
    <section className="py-24 px-6 bg-black overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.4em] mb-3">Our Campaigns</p>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase leading-[0.92]">
              Rollouts that <span className="text-[#FFD700]">hit.</span>
            </h2>
            <p className="text-white/40 text-sm font-medium mt-3 max-w-md">
              Real release campaigns we've run for artists and management teams across major and indie rosters.
            </p>
          </div>
          <button
            onClick={() => navigate('/campaigns')}
            className="hidden sm:inline-flex items-center gap-1.5 text-white/40 hover:text-[#FFD700] text-[11px] font-black uppercase tracking-widest transition-colors shrink-0"
          >
            View all
            <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="border-t border-white/8">
          {preview.map((c, i) => <Row key={i} c={c} index={i} />)}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <button
            onClick={() => navigate('/campaigns')}
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-[#FFD700] text-[11px] font-black uppercase tracking-widest transition-colors"
          >
            View all campaigns
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </section>
  )
}
