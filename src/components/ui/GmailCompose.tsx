import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, X, Send, Loader2, Check, AlertCircle, ExternalLink, ChevronRight } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

// ─── Gmail connect button ─────────────────────────────────────────────────────

export function GmailConnectButton({ className }: { className?: string }) {
  const { user, profile } = useAuth()
  const isConnected = !!(profile as any)?.gmail_refresh_token

  function connect() {
    if (!user) return
    const url = `/.netlify/functions/gmail-oauth?init=1&user_id=${user.id}`
    window.location.href = url
  }

  if (isConnected) {
    return (
      <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20', className)}>
        <Check size={12} className="text-green-400" />
        <span className="text-green-400 font-black text-[10px] uppercase tracking-widest">Gmail Connected</span>
      </div>
    )
  }

  return (
    <button
      onClick={connect}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all font-black text-[10px] uppercase tracking-widest',
        className,
      )}
    >
      <Mail size={12} />
      Connect Gmail
      <ExternalLink size={10} className="opacity-50" />
    </button>
  )
}

// ─── Outreach slide-in panel ──────────────────────────────────────────────────
// Used by InfluencerSection — shows as a right-side drawer, auto-fills from influencer + profile

export interface OutreachTarget {
  name: string
  handle: string
  platform: string
  niche: string
  email?: string
}

interface OutreachPanelProps {
  target: OutreachTarget | null
  onClose: () => void
}

export function OutreachPanel({ target, onClose }: OutreachPanelProps) {
  const { user, profile } = useAuth()
  const isConnected = !!(profile as any)?.gmail_refresh_token
  const artistName = (profile as any)?.artist_name ?? user?.email ?? 'Artist'
  const genre = (profile as any)?.genre ?? 'your genre'

  const defaultSubject = target
    ? `Music Submission — ${artistName} × ${target.name}`
    : ''

  const defaultBody = target
    ? `Hi ${target.name},\n\nI'm ${artistName}, an independent ${genre} artist and I came across your ${target.platform} page — the content you put out around ${target.niche} is exactly the kind of community I want to be part of.\n\nI have a new release I think would resonate with your audience. I'd love for you to give it a listen and consider featuring it.\n\n[Paste your music link here]\n\nNo pressure at all — I appreciate everything you do for the scene.\n\nBest,\n${artistName}`
    : ''

  const [to, setTo] = useState(target?.email ?? '')
  const [subject, setSubject] = useState(defaultSubject)
  const [body, setBody] = useState(defaultBody)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState('')

  // Reset fields when target changes
  const [lastTarget, setLastTarget] = useState(target?.name)
  if (target?.name !== lastTarget) {
    setLastTarget(target?.name ?? null)
    setTo(target?.email ?? '')
    setSubject(target ? `Music Submission — ${artistName} × ${target.name}` : '')
    setBody(target
      ? `Hi ${target.name},\n\nI'm ${artistName}, an independent ${genre} artist and I came across your ${target.platform} page — the content you put out around ${target.niche} is exactly the kind of community I want to be part of.\n\nI have a new release I think would resonate with your audience. I'd love for you to give it a listen and consider featuring it.\n\n[Paste your music link here]\n\nNo pressure at all — I appreciate everything you do for the scene.\n\nBest,\n${artistName}`
      : '')
    setStatus('idle')
  }

  async function send() {
    if (!to || !subject || !body || !user) return
    setStatus('sending')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setStatus('error'); setErrMsg('Not authenticated'); return }

    const res = await fetch('/.netlify/functions/gmail-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ to, subject, message: body }),
    })

    const data = await res.json()
    if (res.ok) {
      setStatus('sent')
    } else {
      setStatus('error')
      setErrMsg(data.error ?? 'Send failed')
    }
  }

  return (
    <AnimatePresence>
      {target && (
        <>
          {/* Backdrop (mobile only) */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[140] bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[150] w-full max-w-md bg-zinc-950 border-l border-white/10 shadow-[−20px_0_80px_rgba(0,0,0,0.6)] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5 flex-shrink-0">
              <div>
                <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest mb-1">Outreach</p>
                <p className="text-white font-black text-sm uppercase tracking-tight leading-none">{target.name}</p>
                <p className="text-white/30 text-[10px] font-mono mt-0.5">{target.handle} · {target.platform}</p>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-1">
                <X size={18} />
              </button>
            </div>

            {/* Gmail not connected */}
            {!isConnected ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Mail size={22} className="text-white/20" />
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-tight mb-1">Connect Gmail first</p>
                  <p className="text-white/30 text-[11px] font-medium leading-relaxed max-w-xs">
                    Link your Gmail account to send pitches directly from GrounduP. Your credentials stay private.
                  </p>
                </div>
                <GmailConnectButton />
                <p className="text-white/15 text-[9px] font-medium">
                  You can also connect via Settings → Profile
                </p>
              </div>
            ) : status === 'sent' ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="w-16 h-16 rounded-3xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <Check size={28} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-tight">Email sent!</p>
                  <p className="text-white/30 text-[11px] mt-1">→ {to}</p>
                </div>
                <button
                  onClick={() => { setStatus('idle'); setTo(target?.email ?? '') }}
                  className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest hover:text-[#FFD700]/70 transition-colors"
                >
                  Send another
                </button>
              </div>
            ) : (
              /* Compose form */
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* To */}
                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5">To</p>
                  <input
                    type="email"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    placeholder={`${target.handle.replace('@', '')}@email.com`}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20"
                  />
                  {!target.email && (
                    <p className="text-white/20 text-[9px] font-medium mt-1 leading-relaxed">
                      Find their contact email in their bio or submission page, then paste it here.
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5">Subject</p>
                  <input
                    type="text"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20"
                  />
                </div>

                {/* Body */}
                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5">Message</p>
                  <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    rows={10}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20 resize-none"
                  />
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <AlertCircle size={14} className="text-red-400 shrink-0" />
                    <p className="text-red-400 text-[11px] font-bold">{errMsg}</p>
                  </div>
                )}
              </div>
            )}

            {/* Footer send button */}
            {isConnected && status !== 'sent' && (
              <div className="p-6 border-t border-white/5 flex-shrink-0">
                <button
                  onClick={send}
                  disabled={!to || !subject || !body || status === 'sending'}
                  className="w-full py-3.5 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {status === 'sending'
                    ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
                    : <><Send size={14} /> Send to {target.name} <ChevronRight size={13} /></>}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Legacy full-screen modal (kept for backward compat) ─────────────────────

interface ComposeProps {
  defaultTo?: string
  defaultSubject?: string
  defaultBody?: string
  onClose: () => void
}

export function GmailComposeModal({ defaultTo = '', defaultSubject = '', defaultBody = '', onClose }: ComposeProps) {
  const { user, profile } = useAuth()
  const isConnected = !!(profile as any)?.gmail_refresh_token

  const [to,      setTo]      = useState(defaultTo)
  const [subject, setSubject] = useState(defaultSubject)
  const [body,    setBody]    = useState(defaultBody)
  const [status,  setStatus]  = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errMsg,  setErrMsg]  = useState('')

  async function send() {
    if (!to || !subject || !body || !user) return
    setStatus('sending')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setStatus('error'); setErrMsg('Not authenticated'); return }

    const res = await fetch('/.netlify/functions/gmail-send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ to, subject, message: body }),
    })

    const data = await res.json()

    if (res.ok) {
      setStatus('sent')
      setTimeout(onClose, 1800)
    } else {
      setStatus('error')
      setErrMsg(data.error ?? 'Send failed')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center">
              <Mail size={14} className="text-[#FFD700]" />
            </div>
            <div>
              <p className="text-white font-black text-sm uppercase tracking-tight">Compose Email</p>
              <p className="text-white/30 text-[10px] font-medium">Sending via your Gmail</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          {!isConnected ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                <Mail size={20} className="text-white/20" />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-tight">Gmail not connected</p>
                <p className="text-white/30 text-[11px] font-medium mt-1 leading-relaxed">
                  Connect your Gmail to send emails directly from uP.
                </p>
              </div>
              <GmailConnectButton className="mx-auto" />
            </div>
          ) : status === 'sent' ? (
            <div className="py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check size={24} className="text-green-400" />
              </div>
              <p className="text-white font-black text-sm uppercase tracking-tight">Sent!</p>
              <p className="text-white/30 text-[11px] mt-1">{to}</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5">To</p>
                  <input type="email" value={to} onChange={e => setTo(e.target.value)} placeholder="curator@playlist.com"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20" />
                </div>
                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5">Subject</p>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Music Submission"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20" />
                </div>
                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5">Message</p>
                  <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} placeholder="Hey, I wanted to reach out about..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20 resize-none" />
                </div>
              </div>
              {status === 'error' && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-[11px] font-bold">{errMsg}</p>
                </div>
              )}
              <button onClick={send} disabled={!to || !subject || !body || status === 'sending'}
                className="w-full py-3.5 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2">
                {status === 'sending' ? <><Loader2 size={14} className="animate-spin" /> Sending...</> : <><Send size={14} /> Send Email</>}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Quick email button — drop anywhere ─────────────────────────────────────

interface EmailButtonProps {
  to?: string
  subject?: string
  body?: string
  label?: string
  className?: string
}

export function EmailButton({ to, subject, body, label = 'Email', className }: EmailButtonProps) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-[#FFD700]/30 hover:bg-[#FFD700]/8 transition-all font-black text-[10px] uppercase tracking-widest',
          className,
        )}
      >
        <Mail size={12} /> {label}
      </button>
      <AnimatePresence>
        {open && (
          <GmailComposeModal defaultTo={to} defaultSubject={subject} defaultBody={body} onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </>
  )
}
