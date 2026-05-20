"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Sparkles, Loader2, Search, ArrowRight, ArrowLeft, Send } from 'lucide-react'
import { INFLUENCERS, type Influencer, type Platform } from '../../data/influencers'

// Platforms where an AI "content idea" makes sense (a post you create).
// Spotify/SoundCloud are placements, so no idea generation there.
const IDEA_PLATFORMS: Platform[] = ['TikTok', 'Twitter', 'YouTube']

interface Props {
  song?:   string
  artist?: string
  onClose: () => void
}

export function CampaignBuilder({ song, artist, onClose }: Props) {
  const [step, setStep]       = useState<0 | 1>(0)   // 0 = pick, 1 = brief
  const [search, setSearch]   = useState('')
  const [platform, setPlatform] = useState<Platform | 'All'>('All')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [briefs, setBriefs]     = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState<Record<string, boolean>>({})

  const filtered = useMemo(() => {
    let list = INFLUENCERS
    if (platform !== 'All') list = list.filter(i => i.platform === platform)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.niche.toLowerCase().includes(q) || i.handle.toLowerCase().includes(q))
    }
    return list
  }, [platform, search])

  const chosen = INFLUENCERS.filter(i => selected[i.id])
  const count  = chosen.length

  function toggle(id: string) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function generateIdea(inf: Influencer) {
    setGenerating(prev => ({ ...prev, [inf.id]: true }))
    try {
      const res = await fetch('/.netlify/functions/campaign-idea', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: inf.platform, influencerName: inf.name, niche: inf.niche, song, artist }),
      })
      const data = await res.json().catch(() => ({}))
      if (data.ok && data.idea) {
        setBriefs(prev => ({ ...prev, [inf.id]: data.idea }))
      }
    } catch { /* noop */ } finally {
      setGenerating(prev => ({ ...prev, [inf.id]: false }))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 24 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        onClick={e => e.stopPropagation()}
        className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFD700]/15 border border-[#FFD700]/25 flex items-center justify-center">
              <Sparkles size={13} className="text-[#FFD700]" />
            </div>
            <div>
              <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest leading-none">
                {step === 0 ? 'Step 1 · Pick creators' : 'Step 2 · Brief each post'}
              </p>
              <h3 className="text-white font-black text-sm uppercase tracking-tighter">Create Campaign</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1"><X size={20} /></button>
        </div>

        {/* ── Step 0: pick influencers ── */}
        {step === 0 && (
          <>
            <div className="px-6 py-3 border-b border-white/5 shrink-0 space-y-3">
              <div className="flex items-center gap-2 bg-zinc-900/60 border border-white/8 rounded-xl px-3 py-2">
                <Search size={13} className="text-white/30" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search creators, niches…"
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/20"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['All','TikTok','Twitter','YouTube','Spotify','SoundCloud'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      platform === p ? 'bg-[#FFD700] text-black' : 'bg-zinc-900/60 border border-white/8 text-white/40 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-2 flex-1">
              {filtered.map(inf => {
                const on = !!selected[inf.id]
                return (
                  <button
                    key={inf.id}
                    onClick={() => toggle(inf.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      on ? 'bg-[#FFD700]/8 border-[#FFD700]/30' : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      on ? 'bg-[#FFD700] border-[#FFD700]' : 'border-white/20'
                    }`}>
                      {on && <Check size={11} strokeWidth={3} className="text-black" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{inf.name}</p>
                      <p className="text-white/35 text-[11px] truncate">{inf.handle} · {inf.niche}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white/60 text-xs font-bold">{inf.followers}</p>
                      <p className="text-white/25 text-[9px] font-black uppercase tracking-widest">{inf.platform}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="px-6 py-4 border-t border-white/5 shrink-0 flex items-center justify-between">
              <p className="text-white/40 text-xs font-bold">{count} selected</p>
              <button
                onClick={() => setStep(1)}
                disabled={count === 0}
                className="flex items-center gap-2 px-5 h-11 rounded-xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest disabled:opacity-40 hover:scale-[1.02] transition-transform"
              >
                Brief the campaign <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}

        {/* ── Step 1: brief each ── */}
        {step === 1 && (
          <>
            <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
              {chosen.map(inf => {
                const canIdea = IDEA_PLATFORMS.includes(inf.platform)
                return (
                  <div key={inf.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="text-white font-bold text-sm truncate">{inf.name}</p>
                        <p className="text-white/35 text-[11px] truncate">{inf.handle} · {inf.platform}</p>
                      </div>
                      {canIdea ? (
                        <button
                          onClick={() => generateIdea(inf)}
                          disabled={generating[inf.id]}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/25 text-[#FFD700] text-[9px] font-black uppercase tracking-widest hover:bg-[#FFD700]/20 transition-all shrink-0 disabled:opacity-50"
                        >
                          {generating[inf.id] ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                          {generating[inf.id] ? 'Thinking' : 'Generate idea'}
                        </button>
                      ) : (
                        <span className="text-white/25 text-[9px] font-black uppercase tracking-widest shrink-0">Placement</span>
                      )}
                    </div>
                    <textarea
                      value={briefs[inf.id] ?? ''}
                      onChange={e => setBriefs(prev => ({ ...prev, [inf.id]: e.target.value }))}
                      placeholder={canIdea
                        ? 'Describe the promotion / content idea — or hit Generate idea ↑'
                        : 'Add placement notes (playlist target, pitch angle, timing…)'}
                      rows={3}
                      className="w-full bg-zinc-950 border border-white/8 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#FFD700]/30 resize-none"
                    />
                  </div>
                )
              })}
            </div>

            <div className="px-6 py-4 border-t border-white/5 shrink-0 flex items-center justify-between">
              <button onClick={() => setStep(0)} className="flex items-center gap-1.5 text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest">
                <ArrowLeft size={13} /> Back
              </button>
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-5 h-11 rounded-xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform"
              >
                <Send size={13} /> Launch campaign ({count})
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
