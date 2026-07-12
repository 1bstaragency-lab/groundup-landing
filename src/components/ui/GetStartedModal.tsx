/**
 * GetStartedModal — primary entry point from homepage CTAs.
 *
 * Instead of dumping all visitors at /signup, this modal asks
 * "What do you want uP to help with first?" and routes them to the
 * matching offer page so they self-segment by intent.
 *
 * Triggered by any homepage CTA that dispatches the `gup:get-started`
 * custom event. App.tsx mounts the modal and listens for the event.
 *
 * Conversion benefits:
 *   - Self-segmentation = higher intent at the offer page
 *   - Tracks the chosen path (variant_slug = 'modal:<choice>') so we
 *     know which goal is most popular
 *   - Lower friction than scrolling to a form
 */
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { usePaywallTracking } from '../../hooks/usePaywallTracking'
import { GradientButton } from './gradient-button'

type Path = {
  id:       string
  emoji:    string
  label:    string
  sub:      string
  href:     string
}

const PATHS: Path[] = [
  { id: 'curators', emoji: '🎯', label: 'Grow my Spotify',         sub: 'Free 50-curator pitch pack',  href: '/curators' },
  { id: 'rollout',  emoji: '📅', label: 'Plan my next release',    sub: 'Free 8-week rollout plan',     href: '/rollout'  },
  { id: 'ads',      emoji: '📊', label: 'Run ads for my music',    sub: '$50 Meta ad credit',           href: '/ads'      },
  { id: 'manager',  emoji: '🤖', label: 'Get an AI manager',       sub: '$300 in services, free',       href: '/manager'  },
  { id: 'comeback', emoji: '🔄', label: 'Re-launch an old track',  sub: 'Free comeback pack',           href: '/comeback' },
  { id: 'free',     emoji: '✨', label: 'Just try uP free',         sub: '30 days Pro · no card',        href: '/free'     },
]

export function GetStartedModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { trackCta } = usePaywallTracking(open ? 'modal:get-started' : '')

  // Close on ESC
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  function choose(p: Path) {
    trackCta({ choice: p.id, href: p.href })
    onClose()
    navigate(p.href)
  }

  function goSignupDirect() {
    trackCta({ choice: 'signup_fallback' })
    onClose()
    navigate('/signup')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-2xl pointer-events-auto rounded-3xl border border-white/10 overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #0F0F0F 0%, #0A0A0A 100%)',
                boxShadow:  '0 40px 80px rgba(0,0,0,0.6), 0 0 80px rgba(255,215,0,0.08)',
              }}
            >
              {/* gold glow */}
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[80%] h-48 bg-[#FFD700]/15 blur-[100px] rounded-full pointer-events-none" />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                aria-label="Close"
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Header */}
              <div className="relative px-8 pt-10 pb-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 mb-5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.6)]" />
                  <span className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.25em]">
                    Get Started
                  </span>
                </div>
                <h2 className="text-white text-3xl md:text-4xl font-black tracking-tighter leading-tight mb-2">
                  What should uP help with first?
                </h2>
                <p className="text-white/40 text-sm font-medium max-w-md mx-auto mb-6">
                  Pick the one that matters most right now — uP starts there.
                </p>
                <GradientButton onClick={goSignupDirect} className="text-[11px]">
                  Or just create an account →
                </GradientButton>
              </div>

              {/* Path cards */}
              <div className="relative px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {PATHS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => choose(p)}
                    className="group text-left p-4 rounded-2xl border border-white/8 bg-zinc-900/40 hover:border-[#FFD700]/40 hover:bg-zinc-900 transition-all flex items-center gap-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 group-hover:border-[#FFD700]/30 transition-all">
                      {p.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[13px] font-black uppercase tracking-wide leading-tight">
                        {p.label}
                      </p>
                      <p className="text-white/35 text-[11px] font-medium mt-0.5">{p.sub}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white/20 group-hover:text-[#FFD700] transition-colors shrink-0" strokeWidth="2.5">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/** Helper to fire from any CTA: `window.dispatchEvent(new CustomEvent('gup:get-started'))` */
export const GET_STARTED_EVENT = 'gup:get-started'

export default GetStartedModal
