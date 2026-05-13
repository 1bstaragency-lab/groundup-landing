import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, X, Send, Loader2, Check, AlertCircle, ExternalLink } from 'lucide-react'
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

// ─── Compose modal ────────────────────────────────────────────────────────────

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
        {/* Header */}
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

        {/* Body */}
        <div className="p-6 space-y-4">
          {!isConnected ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                <Mail size={20} className="text-white/20" />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase tracking-tight">Gmail not connected</p>
                <p className="text-white/30 text-[11px] font-medium mt-1 leading-relaxed">
                  Connect your Gmail to send emails to curators, blogs, and influencers directly from uP.
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
                  <input
                    type="email" value={to} onChange={e => setTo(e.target.value)}
                    placeholder="curator@playlist.com"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20"
                  />
                </div>
                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5">Subject</p>
                  <input
                    type="text" value={subject} onChange={e => setSubject(e.target.value)}
                    placeholder="Music Submission — [Your Name]"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20"
                  />
                </div>
                <div>
                  <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1.5">Message</p>
                  <textarea
                    value={body} onChange={e => setBody(e.target.value)}
                    rows={6}
                    placeholder="Hey, I wanted to reach out about..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20 resize-none"
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <AlertCircle size={14} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-[11px] font-bold">{errMsg}</p>
                </div>
              )}

              <button
                onClick={send}
                disabled={!to || !subject || !body || status === 'sending'}
                className="w-full py-3.5 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {status === 'sending'
                  ? <><Loader2 size={14} className="animate-spin" /> Sending...</>
                  : <><Send size={14} /> Send Email</>}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Quick email button — drop anywhere (curator card, influencer card, etc.) ─

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
          <GmailComposeModal
            defaultTo={to}
            defaultSubject={subject}
            defaultBody={body}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
