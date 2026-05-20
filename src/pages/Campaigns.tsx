"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { CAMPAIGNS, type Campaign } from '../data/campaigns'

function CampaignRow({ c, index }: { c: Campaign; index: number }) {
  const [hover, setHover] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="group relative border-b border-white/8 py-6 sm:py-8 cursor-pointer"
    >
      <div className="flex items-baseline justify-between gap-4">
        {/* index + artist/project */}
        <div className="flex items-baseline gap-4 sm:gap-6 min-w-0">
          <span className="text-white/20 text-xs font-black tabular-nums shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <h3 className={`text-2xl sm:text-4xl font-black tracking-tighter uppercase transition-colors duration-300 truncate ${hover ? 'text-[#FFD700]' : 'text-white'}`}>
              {c.song}
            </h3>
            <p className="text-white/40 text-xs sm:text-sm font-medium mt-1 truncate">
              {c.type}
            </p>
          </div>
        </div>

        {/* meta + arrow */}
        <div className="flex items-center gap-4 sm:gap-8 shrink-0">
          <div className="hidden sm:block text-right">
            {c.artist && <p className="text-white/60 text-sm font-bold whitespace-nowrap">{c.artist}</p>}
            <p className="text-white/25 text-[10px] font-black uppercase tracking-widest mt-0.5">{c.year}</p>
          </div>
          <ArrowUpRight
            size={24}
            className={`transition-all duration-300 ${hover ? 'text-[#FFD700] translate-x-1 -translate-y-1' : 'text-white/20'}`}
          />
        </div>
      </div>

      {/* result metric — reveals on hover (desktop) / always (mobile) */}
      {c.result && (
        <motion.p
          initial={false}
          animate={{ opacity: hover ? 1 : 0, height: hover ? 'auto' : 0 }}
          transition={{ duration: 0.25 }}
          className="hidden sm:block overflow-hidden text-[#FFD700]/80 text-sm font-black uppercase tracking-widest pl-10 sm:pl-[3.25rem] mt-2"
        >
          ✦ {c.result}
        </motion.p>
      )}
      {c.result && (
        <p className="sm:hidden text-[#FFD700]/70 text-[11px] font-black uppercase tracking-widest pl-8 mt-1">
          ✦ {c.result}{c.artist && ` · ${c.artist}`}
        </p>
      )}
    </motion.div>
  )
}

export function CampaignsPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-5 sm:px-8 py-5 flex items-center justify-between border-b border-white/5">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-white/40 hover:text-white text-[11px] font-black uppercase tracking-widest transition-colors">
          <ArrowLeft size={14} /> GrounduP
        </button>
        <a href="/signup" className="px-4 py-2 rounded-xl bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.03] transition-transform">
          Get Started
        </a>
      </header>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
        {/* Title */}
        <div className="mb-12 sm:mb-16">
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.4em] mb-4">Our Campaigns</p>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter uppercase leading-[0.9] mb-4">
            Rollouts<br /><span className="text-[#FFD700]">that hit.</span>
          </h1>
          <p className="text-white/40 text-base font-medium max-w-md">
            Real release campaigns we've run for artists and management teams — strategy, execution, results.
          </p>
        </div>

        {/* Campaign list */}
        <div className="border-t border-white/8">
          {CAMPAIGNS.map((c, i) => <CampaignRow key={i} c={c} index={i} />)}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/30 text-sm font-medium mb-5">Want this for your next release?</p>
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 px-7 h-14 rounded-2xl bg-[#FFD700] text-black font-black text-base uppercase tracking-tight hover:scale-[1.02] transition-transform shadow-[0_8px_32px_rgba(255,215,0,0.25)]"
          >
            Start your rollout
            <ArrowUpRight size={18} />
          </button>
        </div>
      </main>

      <footer className="px-5 py-6 text-center border-t border-white/5">
        <p className="text-white/15 text-[10px] font-bold uppercase tracking-widest">
          © {new Date().getFullYear()} GrounduP · The Artist OS
        </p>
      </footer>
    </div>
  )
}
