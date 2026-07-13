"use client"

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Sparkles, Loader2, Search, ArrowRight, ArrowLeft, Send, Info } from 'lucide-react'
import { INFLUENCERS, type Influencer, type Platform } from '../../data/influencers'

// Platforms where an AI "content idea" makes sense (a post you create).
// Spotify/SoundCloud are placements, so no idea generation there.
const IDEA_PLATFORMS: Platform[] = ['TikTok', 'Twitter', 'YouTube']

// ─── Platform color themes ───────────────────────────────────────────────────
const PLATFORM_TAB_ACTIVE: Record<Platform | 'All', string> = {
  All:        'bg-[#FFD700] text-black',
  TikTok:     'bg-sky-500 text-white',
  Twitter:    'bg-blue-500 text-white',
  Spotify:    'bg-green-600 text-white',
  Blog:       'bg-purple-500 text-white',
  YouTube:    'bg-red-500 text-white',
  SoundCloud: 'bg-orange-500 text-white',
}

// Left-border accent color strip on each brief card
const PLATFORM_ACCENT_BAR: Record<Platform, string> = {
  TikTok:     'bg-sky-500',
  Twitter:    'bg-blue-500',
  Spotify:    'bg-green-500',
  Blog:       'bg-purple-500',
  YouTube:    'bg-red-500',
  SoundCloud: 'bg-orange-500',
}

// Card border/bg when checked in the pick-list
const PLATFORM_CHECKED: Record<Platform, { border: string; bg: string }> = {
  TikTok:     { border: 'border-sky-400/40',    bg: 'bg-sky-500/8' },
  Twitter:    { border: 'border-blue-400/40',   bg: 'bg-blue-500/8' },
  Spotify:    { border: 'border-green-400/40',  bg: 'bg-green-500/8' },
  Blog:       { border: 'border-purple-400/40', bg: 'bg-purple-500/8' },
  YouTube:    { border: 'border-red-400/40',    bg: 'bg-red-500/8' },
  SoundCloud: { border: 'border-orange-400/40', bg: 'bg-orange-500/8' },
}

// Brief card header background tint
const PLATFORM_BRIEF_BG: Record<Platform, string> = {
  TikTok:     'bg-sky-500/6',
  Twitter:    'bg-blue-500/6',
  Spotify:    'bg-green-500/6',
  Blog:       'bg-purple-500/6',
  YouTube:    'bg-red-500/6',
  SoundCloud: 'bg-orange-500/6',
}

// Platform badge styles (same as InfluencerSection for consistency)
const PLATFORM_BADGE: Record<Platform, string> = {
  TikTok:     'bg-sky-500/15 text-sky-400',
  Twitter:    'bg-blue-500/15 text-blue-400',
  Spotify:    'bg-green-500/15 text-green-400',
  Blog:       'bg-purple-500/15 text-purple-400',
  YouTube:    'bg-red-500/15 text-red-400',
  SoundCloud: 'bg-orange-500/15 text-orange-400',
}

const PLATFORM_AVATAR: Record<Platform, string> = {
  TikTok:     'bg-sky-500/20 text-sky-300',
  Twitter:    'bg-blue-500/20 text-blue-300',
  Spotify:    'bg-green-500/20 text-green-300',
  Blog:       'bg-purple-500/20 text-purple-300',
  YouTube:    'bg-red-500/20 text-red-300',
  SoundCloud: 'bg-orange-500/20 text-orange-300',
}

interface Props {
  song?:        string
  artist?:      string
  /** Pre-checked influencer ids coming from the guided curated flow */
  preSelected?: Record<string, boolean>
  onClose:      () => void
}

export function CampaignBuilder({ song, artist, preSelected, onClose }: Props) {
  const hasPreSelected = preSelected && Object.values(preSelected).some(Boolean)
  const [step, setStep]         = useState<0 | 1>(hasPreSelected ? 1 : 0)
  const [search, setSearch]     = useState('')
  const [platform, setPlatform] = useState<Platform | 'All'>('All')
  const [selected, setSelected] = useState<Record<string, boolean>>(preSelected ?? {})
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

  // SoundCloud: only one DJ host per campaign (radio-select behavior)
  function toggle(id: string) {
    const inf = INFLUENCERS.find(i => i.id === id)
    setSelected(prev => {
      const next = { ...prev, [id]: !prev[id] }
      if (inf?.platform === 'SoundCloud' && next[id]) {
        INFLUENCERS
          .filter(i => i.platform === 'SoundCloud' && i.id !== id)
          .forEach(i => { next[i.id] = false })
      }
      return next
    })
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
        className="bg-[var(--dash-card)] border border-[rgba(var(--dash-fg),0.15)] rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--dash-border)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FFD700]/15 border border-[#FFD700]/25 flex items-center justify-center">
              <Sparkles size={13} className="text-[#FFD700]" />
            </div>
            <div>
              <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest leading-none">
                {step === 0 ? 'Step 1 · Pick creators' : 'Step 2 · Brief each post'}
              </p>
              <h3 className="text-[rgb(var(--dash-fg))] font-black text-sm uppercase tracking-tighter">Create Campaign</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-[rgba(var(--dash-fg),0.5)] hover:text-[rgb(var(--dash-fg))] transition-colors p-1"><X size={20} /></button>
        </div>

        {/* ── Step 0: pick influencers ── */}
        {step === 0 && (
          <>
            <div className="px-6 py-3 border-b border-[var(--dash-border)] shrink-0 space-y-3">
              <div className="flex items-center gap-2 bg-[var(--dash-card-alt)] border border-[var(--dash-border)] rounded-xl px-3 py-2">
                <Search size={13} className="text-[rgba(var(--dash-fg),0.5)]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search creators, niches…"
                  className="flex-1 bg-transparent text-[rgb(var(--dash-fg))] text-sm outline-none placeholder:text-[rgba(var(--dash-fg),0.35)]"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(['All','TikTok','Twitter','YouTube','Spotify','SoundCloud'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      platform === p
                        ? PLATFORM_TAB_ACTIVE[p]
                        : 'bg-[var(--dash-card-alt)] border border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.52)] hover:text-[rgb(var(--dash-fg))]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              {/* SoundCloud single-host notice */}
              {platform === 'SoundCloud' && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-500/8 border border-orange-500/20">
                  <Info size={11} className="text-orange-400 shrink-0" />
                  <p className="text-orange-300/80 text-[10px] font-bold">
                    Only one SoundCloud DJ host can be added per campaign.
                  </p>
                </div>
              )}
            </div>

            <div className="overflow-y-auto px-6 py-4 space-y-2 flex-1">
              {filtered.map(inf => {
                const on = !!selected[inf.id]
                const theme = PLATFORM_CHECKED[inf.platform]
                return (
                  <button
                    key={inf.id}
                    onClick={() => toggle(inf.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                      on
                        ? `${theme.bg} ${theme.border}`
                        : 'bg-[var(--dash-card-alt)] border-[var(--dash-border)] hover:border-[rgba(var(--dash-fg),0.15)]'
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      on ? PLATFORM_AVATAR[inf.platform] : 'bg-[rgba(var(--dash-fg),0.08)] text-[rgba(var(--dash-fg),0.55)]'
                    }`}>
                      {inf.name[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[rgb(var(--dash-fg))] font-bold text-sm truncate">{inf.name}</p>
                      <p className="text-[rgba(var(--dash-fg),0.5)] text-[11px] truncate">{inf.handle} · {inf.niche}</p>
                    </div>

                    {/* Platform badge */}
                    <span className={`shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${PLATFORM_BADGE[inf.platform]}`}>
                      {inf.platform}
                    </span>

                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      on ? 'bg-[#FFD700] border-[#FFD700]' : 'border-[rgba(var(--dash-fg),0.25)]'
                    }`}>
                      {on && <Check size={11} strokeWidth={3} className="text-black" />}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="px-6 py-4 border-t border-[var(--dash-border)] shrink-0 flex items-center justify-between">
              <p className="text-[rgba(var(--dash-fg),0.52)] text-xs font-bold">{count} selected</p>
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
                const canIdea  = IDEA_PLATFORMS.includes(inf.platform)
                const accentBar = PLATFORM_ACCENT_BAR[inf.platform]
                const briefBg   = PLATFORM_BRIEF_BG[inf.platform]
                return (
                  <div key={inf.id} className="rounded-2xl border border-[var(--dash-border)] overflow-hidden">
                    {/* Platform-colored top accent bar */}
                    <div className={`h-[3px] w-full ${accentBar}`} />

                    {/* Card header */}
                    <div className={`flex items-center justify-between gap-3 px-4 pt-3.5 pb-3 ${briefBg}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${PLATFORM_AVATAR[inf.platform]}`}>
                          {inf.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[rgb(var(--dash-fg))] font-bold text-sm truncate leading-none">{inf.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${PLATFORM_BADGE[inf.platform]}`}>
                              {inf.platform}
                            </span>
                            <p className="text-[rgba(var(--dash-fg),0.5)] text-[10px] truncate">{inf.handle}</p>
                          </div>
                        </div>
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
                        <span className={`text-[9px] font-black uppercase tracking-widest shrink-0 ${
                          inf.platform === 'SoundCloud' ? 'text-orange-400/70' : 'text-[rgba(var(--dash-fg),0.48)]'
                        }`}>
                          {inf.platform === 'SoundCloud' ? 'Upload Placement' : 'Placement'}
                        </span>
                      )}
                    </div>

                    {/* Textarea */}
                    <div className="px-4 pb-4 pt-2">
                      <textarea
                        value={briefs[inf.id] ?? ''}
                        onChange={e => setBriefs(prev => ({ ...prev, [inf.id]: e.target.value }))}
                        placeholder={
                          inf.platform === 'SoundCloud'
                            ? 'Upload placement — track + any pin/repost notes (optional)'
                            : canIdea
                            ? 'Describe the promotion / content idea — or hit Generate idea ↑'
                            : 'Add placement notes (playlist target, pitch angle, timing…)'
                        }
                        rows={3}
                        className="w-full bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl px-3 py-2.5 text-sm text-[rgb(var(--dash-fg))] placeholder:text-[rgba(var(--dash-fg),0.35)] outline-none focus:border-[rgba(var(--dash-fg),0.25)] resize-none"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="px-6 py-4 border-t border-[var(--dash-border)] shrink-0 flex items-center justify-between">
              <button onClick={() => setStep(0)} className="flex items-center gap-1.5 text-[rgba(var(--dash-fg),0.52)] hover:text-[rgb(var(--dash-fg))] text-[10px] font-black uppercase tracking-widest">
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
