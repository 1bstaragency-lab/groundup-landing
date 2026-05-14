"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PulsingBorder } from "@paper-design/shaders-react"
import { X, ArrowRight } from "lucide-react"

const QUICK_LINKS = [
  { label: "How does GrounduP work?", href: "#features" },
  { label: "See pricing plans", href: "#pricing" },
]

const MESSAGES = [
  "Your Artist OS is here. I'm uP — your guide to everything GrounduP.",
  "Ask me anything about releases, rollouts, analytics, or your team.",
  "Let's build your career from the ground up. 🎵",
]

export function UpBot({ onViewDemo }: { onViewDemo?: () => void }) {
  const [open, setOpen] = useState(false)
  const [msgIdx] = useState(() => Math.floor(Math.random() * MESSAGES.length))

  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-72 bg-zinc-950/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8 flex-shrink-0">
                  <PulsingBorder
                    colors={["#FFD700", "#B8860B", "#ffffff", "#000000", "#FFD700"]}
                    colorBack="#00000000"
                    speed={1.5}
                    roundness={1}
                    thickness={0.15}
                    softness={0.2}
                    intensity={6}
                    pulse={0.15}
                    smoke={0.4}
                    smokeSize={3}
                    scale={0.7}
                    rotation={0}
                    frame={9161408}
                    style={{ width: 32, height: 32, borderRadius: "50%" }}
                  />
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-tight leading-none">uP</p>
                  <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest">Artist OS Guide</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/30 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Message */}
            <div className="px-5 py-4">
              <div className="bg-zinc-900/60 rounded-2xl rounded-tl-sm px-4 py-3 mb-4">
                <p className="text-white/70 text-[12px] font-medium leading-relaxed">
                  {MESSAGES[msgIdx]}
                </p>
              </div>

              {/* Quick actions */}
              <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-2">Quick links</p>
              <div className="flex flex-col gap-1.5">
                {QUICK_LINKS.map(action => (
                  <a
                    key={action.href}
                    href={action.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 hover:border-[#FFD700]/20 group transition-all"
                  >
                    <span className="text-white/60 group-hover:text-white text-[11px] font-bold transition-colors">{action.label}</span>
                    <ArrowRight size={11} className="text-white/20 group-hover:text-[#FFD700] transition-colors flex-shrink-0" />
                  </a>
                ))}
                <button
                  onClick={() => { setOpen(false); onViewDemo?.() }}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#FFD700]/10 hover:bg-[#FFD700]/20 border border-[#FFD700]/20 hover:border-[#FFD700]/40 group transition-all"
                >
                  <span className="text-[#FFD700] text-[11px] font-black uppercase tracking-widest">View Demo</span>
                  <ArrowRight size={11} className="text-[#FFD700]/60 group-hover:text-[#FFD700] transition-colors flex-shrink-0" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-4">
              <p className="text-white/15 text-[9px] font-black uppercase tracking-widest text-center">
                Powered by GrounduP OS
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating orb button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative w-16 h-16 flex items-center justify-center focus:outline-none"
        title="Chat with uP"
      >
        {/* Glow ring + pulsing border */}
        <PulsingBorder
          colors={["#FFD700", "#B8860B", "#ffffff", "#000000", "#FFD700"]}
          colorBack="#00000000"
          speed={1.5}
          roundness={1}
          thickness={0.1}
          softness={0.2}
          intensity={5}
          pulse={0.1}
          smoke={0.5}
          smokeSize={4}
          scale={0.65}
          rotation={0}
          frame={9161408.251009725}
          style={{ width: 64, height: 64, borderRadius: "50%", position: "absolute", inset: 0 }}
        />

        {/* Rotating text ring */}
        <motion.svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          animate={{ rotate: open ? -360 : 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <defs>
            <path id="upbot-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text style={{ fontSize: 6, fill: "rgba(255,255,255,0.35)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em" }}>
            <textPath href="#upbot-circle" startOffset="0%">
              GrounduP OS • Artist First • uP •&nbsp;
            </textPath>
          </text>
        </motion.svg>

        {/* Center label */}
        <span className="relative z-10 text-white font-black text-[10px] uppercase tracking-widest select-none">
          uP
        </span>

        {/* Unread dot when closed */}
        {!open && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#FFD700] rounded-full border-2 border-black" />
        )}
      </motion.button>
    </div>
  )
}
