"use client"

import { motion } from "framer-motion"
import { PulsingBorder } from "@paper-design/shaders-react"
import { Search, Phone, Settings, Mic, Smile, Send } from "lucide-react"
import { useIsMobile } from "../../hooks/useIsMobile"

const MESSAGES = [
  {
    from: "bot",
    text: "Hello Alex! I'm UP, your GrounduP assistant. How can I help with your music career today?",
    time: "9:05 AM",
  },
  {
    from: "user",
    text: "Hey UP, can you check my release schedule for next month?",
    time: "9:06 AM",
  },
  {
    from: "bot",
    text: "Of course! You have 'Midnight City' releasing Oct 14th (Pre-Save link setup required) and 'Echos of Us' on Oct 28th. Let's get the assets ready.",
    time: "9:06 AM",
  },
  {
    from: "user",
    text: "Ok. What are the key tasks for this week?",
    time: "9:08 AM",
  },
  {
    from: "bot",
    bullets: [
      "Confirm tour dates for Nov.",
      "Finalize artwork for 'Midnight City'.",
      "Review social media strategy with your manager.",
    ],
    text: "I've sent you the analytics report too. Need data insights now?",
    time: "9:10 AM",
  },
]

function UpOrbAvatar({ size = 36 }: { size?: number }) {
  const isMobile = useIsMobile()
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {isMobile ? (
        <span className="absolute inset-0 rounded-full border border-[#FFD700]/50 animate-pulse"
          style={{ boxShadow: "0 0 10px rgba(255,215,0,0.35)" }} />
      ) : (
        <PulsingBorder
          colors={["#FFD700", "#B8860B", "#ffffff", "#000000", "#FFD700"]}
          colorBack="#00000000"
          speed={1.5} roundness={1} thickness={0.18} softness={0.2}
          intensity={6} pulse={0.15} smoke={0.4} smokeSize={3}
          scale={0.7} rotation={0} frame={9161408}
          style={{ width: size, height: size, borderRadius: "50%", position: "absolute", inset: 0 }}
        />
      )}
      {/* Rotating text ring */}
      <motion.svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path id={`upavatar-circle-${size}`} d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text style={{ fontSize: 7, fill: "rgba(255,255,255,0.25)", fontWeight: 900, letterSpacing: "0.18em" }}>
          <textPath href={`#upavatar-circle-${size}`} startOffset="0%">
            uP • GrounduP •&nbsp;
          </textPath>
        </text>
      </motion.svg>
      <span className="absolute inset-0 flex items-center justify-center text-white font-black text-[7px] uppercase tracking-widest select-none z-10">
        uP
      </span>
    </div>
  )
}

export function UpChatMockup() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Outer glow */}
      <div className="absolute -inset-4 bg-[#FFD700]/5 blur-[40px] rounded-[3rem] pointer-events-none" />

      <div className="relative bg-zinc-950/90 border border-white/8 rounded-[2rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <UpOrbAvatar size={34} />
            <div>
              <p className="text-white font-black text-sm uppercase tracking-widest leading-none">GrounduP</p>
              <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest mt-0.5">
                Chat with <span className="text-white">uP</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white/30">
            <Search size={15} />
            <Phone size={15} />
            <Settings size={15} />
          </div>
        </div>

        {/* Conversation — with label */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-2 mb-3">
            <UpOrbAvatar size={22} />
            <div>
              <p className="text-white text-[11px] font-black uppercase tracking-widest leading-none">uP</p>
              <p className="text-[#FFD700] text-[8px] font-bold">Online</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="px-4 pb-3 space-y-4 max-h-80 overflow-y-auto scrollbar-none">
          {MESSAGES.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`flex gap-2.5 ${msg.from === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.from === "bot" && <UpOrbAvatar size={28} />}

              <div className={`flex flex-col gap-1 max-w-[78%] ${msg.from === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-3.5 py-2.5 rounded-2xl text-[11px] font-medium leading-relaxed ${
                    msg.from === "user"
                      ? "bg-[#FFD700]/15 border border-[#FFD700]/20 text-white rounded-tr-sm"
                      : "bg-zinc-800/70 border border-white/5 text-white/80 rounded-tl-sm"
                  }`}
                >
                  {msg.bullets && (
                    <div className="mb-2">
                      <p className="text-white/60 font-bold mb-1.5">Here's your checklist:</p>
                      <ol className="space-y-0.5 list-decimal list-inside text-white/70">
                        {msg.bullets.map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {msg.text}
                </div>
                <span className="text-white/20 text-[8px] font-bold">{msg.time}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 pb-4 pt-2 border-t border-white/5">
          <div className="flex items-center gap-3 bg-zinc-900/60 rounded-full px-4 py-2.5 border border-white/5">
            <p className="flex-1 text-white/20 text-[11px] font-medium">Type your message to uP...</p>
            <div className="flex items-center gap-3 text-white/25">
              <Mic size={13} />
              <Smile size={13} />
              <div className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center">
                <Send size={10} className="text-black" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const orbKeyframes = `
@keyframes orbWiggle {
  0%   { transform: translateY(0px) rotate(-1deg); }
  25%  { transform: translateY(-5px) rotate(1deg); }
  50%  { transform: translateY(-8px) rotate(-0.5deg); }
  75%  { transform: translateY(-4px) rotate(1.5deg); }
  100% { transform: translateY(0px) rotate(-1deg); }
}
@keyframes goldShimmer {
  0%   { opacity: 0.15; transform: translateX(-60%) skewX(-12deg); }
  50%  { opacity: 0.35; transform: translateX(160%) skewX(-12deg); }
  100% { opacity: 0.15; transform: translateX(-60%) skewX(-12deg); }
}
@keyframes bloomPulse {
  0%, 100% { opacity: 0.18; transform: scale(1); }
  50%       { opacity: 0.32; transform: scale(1.1); }
}
`

export function UpOrbMascot() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      <style>{orbKeyframes}</style>

      {/* Ambient gold bloom */}
      <div style={{
        position: 'absolute', inset: -15,
        background: 'radial-gradient(circle, rgba(255,215,0,1) 0%, transparent 65%)',
        animation: 'bloomPulse 3s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Gold pulsing ring */}
      {typeof window !== 'undefined' && window.innerWidth >= 768 ? (
        <PulsingBorder
          colors={["#FFD700", "#B8860B", "#ffffff", "#000000", "#FFD700"]}
          colorBack="#00000000"
          speed={1.4} roundness={1} thickness={0.06} softness={0.15}
          intensity={8} pulse={0.18} smoke={0.3} smokeSize={3}
          scale={0.82} rotation={0} frame={9161408}
          style={{ width: 80, height: 80, borderRadius: '50%', position: 'absolute', inset: 0 }}
        />
      ) : (
        <span className="absolute inset-0 rounded-full border border-[#FFD700]/40 animate-pulse"
          style={{ boxShadow: "0 0 12px rgba(255,215,0,0.3), inset 0 0 6px rgba(255,215,0,0.1)" }} />
      )}

      {/* Gold 3D sphere */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: 44, height: 44,
        animation: 'orbWiggle 3.6s ease-in-out infinite',
      }}>
        <div style={{
          width: '100%', height: '100%',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 32%, rgba(255,255,200,0.95) 0%, rgba(255,230,80,0.9) 10%, #FFD700 28%, #B8860B 55%, #7a5500 78%, #3a2800 100%)',
          boxShadow: [
            '0 0 0 1px rgba(255,215,0,0.2)',
            'inset -4px -4px 12px rgba(0,0,0,0.5)',
            'inset 2px 2px 6px rgba(255,255,200,0.3)',
            '0 10px 20px rgba(255,180,0,0.25)',
            '0 4px 8px rgba(0,0,0,0.6)',
          ].join(', '),
        }}>
          <div style={{
            position: 'absolute', top: '14%', left: '22%',
            width: '36%', height: '26%', borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,230,0.75) 0%, rgba(255,240,150,0.3) 50%, transparent 100%)',
            filter: 'blur(1px)', pointerEvents: 'none',
          }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{
              position: 'absolute', top: 0, bottom: 0, width: '40%',
              background: 'linear-gradient(to bottom, rgba(255,255,200,0.4), rgba(255,215,0,0.15))',
              animation: 'goldShimmer 2.6s ease-in-out infinite',
              mixBlendMode: 'screen',
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
