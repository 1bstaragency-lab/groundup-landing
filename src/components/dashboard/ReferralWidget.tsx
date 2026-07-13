"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share2, Copy, Check, Sparkles, Users } from "lucide-react"
import { supabase } from "../../lib/supabaseClient"
import { GOLDD } from "../../lib/brand-tokens"
import { INK, DIM, FAINT, CARD } from "../../lib/dashboard-theme"

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
      className="relative w-full rounded-3xl p-6 overflow-hidden"
      style={{ background: CARD, border: '1px solid rgba(184,134,11,0.2)' }}
    >
      <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(255,215,0,0.1)' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(184,134,11,0.25)' }}>
            <Sparkles size={11} style={{ color: GOLDD }} />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: GOLDD }}>Refer & Earn</p>
        </div>

        <h4 className="font-black text-lg tracking-tighter mb-1" style={{ color: INK }}>
          Invite artists, earn points
        </h4>
        <p className="text-xs font-medium mb-5" style={{ color: DIM }}>
          500 points per signup. 2,500 points when they upgrade to Pro.
        </p>

        {/* Referral link */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex-1 rounded-xl px-4 py-3 min-w-0" style={{ background: 'rgba(var(--dash-fg),0.03)', border: `1px solid ${FAINT}` }}>
            <p className="text-[9px] font-black uppercase tracking-widest mb-0.5" style={{ color: 'rgba(var(--dash-fg),0.56)' }}>Your link</p>
            <p className="font-bold text-xs truncate" style={{ color: INK }}>{link || 'Generating…'}</p>
          </div>
          <button
            onClick={copyLink}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all dash-hover-border"
            style={{ background: 'rgba(var(--dash-fg),0.03)', border: `1px solid ${FAINT}`, color: DIM }}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2" style={{ color: GOLDD }}>
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
            className="gradient-button flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-transform hover:scale-[1.02]"
          >
            <Share2 size={11} /> Share
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { label: 'Invited',   val: stats?.total ?? 0,    color: INK },
            { label: 'Signed Up', val: stats?.pending ?? 0,  color: GOLDD },
            { label: 'Upgraded',  val: stats?.upgraded ?? 0, color: GOLDD },
          ].map((s) => (
            <div key={s.label} className="rounded-xl px-3 py-3 text-center" style={{ background: 'rgba(var(--dash-fg),0.02)', border: `1px solid ${FAINT}` }}>
              <p className="font-black text-xl tracking-tight" style={{ color: s.color }}>{s.val}</p>
              <p className="text-[9px] font-black uppercase tracking-widest mt-0.5" style={{ color: 'rgba(var(--dash-fg),0.56)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {stats && stats.total === 0 && (
          <p className="flex items-center gap-2 text-[10px] font-medium mt-4" style={{ color: 'rgba(var(--dash-fg),0.56)' }}>
            <Users size={11} /> No referrals yet — share the link to start earning.
          </p>
        )}
      </div>
    </motion.div>
  )
}
