"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share2, Copy, Check, Sparkles, Users } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"

interface ReferralStats {
  code:    string
  total:   number
  pending: number
  upgraded:number
}

export function ReferralWidget({ userId }: { userId: string }) {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    ;(async () => {
      const [{ data: prefs }, { data: refs }] = await Promise.all([
        supabase.from('artist_preferences').select('referral_code').eq('user_id', userId).maybeSingle(),
        supabase.from('referrals').select('status').eq('referrer_user_id', userId),
      ])
      if (cancelled) return
      const list = refs ?? []
      setStats({
        code:     prefs?.referral_code ?? '——',
        total:    list.length,
        pending:  list.filter(r => r.status === 'signed_up').length,
        upgraded: list.filter(r => r.status === 'upgraded').length,
      })
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [userId])

  const link = stats?.code ? `https://groundupapp.com/?ref=${stats.code}` : ''

  async function copyLink() {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  async function share() {
    if (!link) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GrounduP — your AI music career co-pilot',
          text:  'Join me on GrounduP — the AI Artist OS for indie musicians.',
          url:   link,
        })
      } catch { /* user cancelled */ }
    } else {
      copyLink()
    }
  }

  if (loading) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full rounded-3xl border border-[#FFD700]/15 bg-gradient-to-br from-[#FFD700]/[0.04] via-zinc-950 to-zinc-950 p-6 overflow-hidden"
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#FFD700]/8 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md bg-[#FFD700]/15 border border-[#FFD700]/25 flex items-center justify-center">
            <Sparkles size={11} className="text-[#FFD700]" />
          </div>
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">Refer & Earn</p>
        </div>

        <h4 className="text-white font-black text-lg tracking-tighter mb-1">
          Invite artists, earn points
        </h4>
        <p className="text-white/40 text-xs font-medium mb-5">
          500 points per signup. 2,500 points when they upgrade to Pro.
        </p>

        {/* Referral link */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex-1 bg-zinc-900/80 border border-white/8 rounded-xl px-4 py-3 min-w-0">
            <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-0.5">Your link</p>
            <p className="text-white font-bold text-xs truncate">{link || 'Generating…'}</p>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-[10px] font-black uppercase tracking-widest transition-all"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 text-green-400">
                  <Check size={11} /> Copied
                </motion.span>
              ) : (
                <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                  <Copy size={11} /> Copy
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          <button
            onClick={share}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#FFD700] text-black hover:scale-[1.02] text-[10px] font-black uppercase tracking-widest transition-transform shadow-[0_0_16px_rgba(255,215,0,0.2)]"
          >
            <Share2 size={11} /> Share
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: 'Invited',  val: stats?.total ?? 0,    color: 'text-white' },
            { label: 'Signed Up', val: stats?.pending ?? 0, color: 'text-[#FFD700]' },
            { label: 'Upgraded', val: stats?.upgraded ?? 0, color: 'text-green-400' },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900/40 border border-white/5 rounded-xl px-3 py-3 text-center">
              <p className={`font-black text-xl tracking-tight ${s.color}`}>{s.val}</p>
              <p className="text-white/30 text-[9px] font-black uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {stats && stats.total === 0 && (
          <p className="flex items-center gap-2 text-white/30 text-[10px] font-medium mt-4">
            <Users size={11} /> No referrals yet — share the link to start earning.
          </p>
        )}
      </div>
    </motion.div>
  )
}
