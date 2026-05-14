"use client"

import { motion } from "framer-motion"
import { PulsingBorder } from "@paper-design/shaders-react"
import { Search, Phone, Settings, Mic, Smile, Send } from "lucide-react"

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
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <PulsingBorder
        colors={["#FFD700", "#B8860B", "#ffffff", "#000000", "#FFD700"]}
        colorBack="#00000000"
        speed={1.5}
        roundness={1}
        thickness={0.18}
        softness={0.2}
        intensity={6}
        pulse={0.15}
        smoke={0.4}
        smokeSize={3}
        scale={0.7}
        rotation={0}
        frame={9161408}
        style={{ width: size, height: size, borderRadius: "50%", position: "absolute", inset: 0 }}
      />
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

const liquidKeyframes = `
@keyframes liquidMorph {
  0%   { border-radius: 58% 42% 35% 65% / 55% 38% 62% 45%; }
  16%  { border-radius: 42% 58% 62% 38% / 48% 62% 38% 52%; }
  33%  { border-radius: 65% 35% 48% 52% / 35% 55% 45% 65%; }
  50%  { border-radius: 38% 62% 55% 45% / 62% 42% 58% 38%; }
  66%  { border-radius: 55% 45% 38% 62% / 45% 58% 42% 55%; }
  83%  { border-radius: 45% 55% 65% 35% / 58% 35% 65% 42%; }
  100% { border-radius: 58% 42% 35% 65% / 55% 38% 62% 45%; }
}
@keyframes shimmerSweep {
  0%   { background-position: -200% 0; }
  100% { background-position: 300% 0; }
}
@keyframes goldGlow {
  0%, 100% { box-shadow: 0 0 18px 4px rgba(255,215,0,0.18), inset 0 0 20px 4px rgba(255,215,0,0.08); }
  50%       { box-shadow: 0 0 32px 8px rgba(255,215,0,0.30), inset 0 0 28px 8px rgba(255,215,0,0.15); }
}
`

export function UpOrbMascot() {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
      <style>{liquidKeyframes}</style>

      {/* Ambient gold bloom */}
      <div style={{
        position: 'absolute', inset: -20,
        background: 'radial-gradient(circle, rgba(255,215,0,0.12) 0%, transparent 70%)',
        filter: 'blur(20px)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      {/* Gold pulsing ring — tight */}
      <PulsingBorder
        colors={["#FFD700", "#B8860B", "#ffffff", "#000000", "#FFD700"]}
        colorBack="#00000000"
        speed={1.4}
        roundness={1}
        thickness={0.06}
        softness={0.15}
        intensity={8}
        pulse={0.18}
        smoke={0.3}
        smokeSize={3}
        scale={0.82}
        rotation={0}
        frame={9161408}
        style={{ width: 160, height: 160, borderRadius: '50%', position: 'absolute', inset: 0 }}
      />

      {/* Liquid metallic silver sphere */}
      <motion.div
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ perspective: 400, position: 'relative', zIndex: 10 }}
      >
        <div style={{
          width: 104,
          height: 104,
          animation: 'liquidMorph 6s ease-in-out infinite, goldGlow 3s ease-in-out infinite',
          background: `
            radial-gradient(ellipse at 32% 28%, rgba(255,255,255,0.95) 0%, transparent 38%),
            radial-gradient(ellipse at 68% 72%, rgba(180,180,200,0.6) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 50%, #c8ccd8 0%, #9098a8 35%, #5a6070 65%, #2a2e38 100%)
          `,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Gold shimmer sweep */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(105deg, transparent 20%, rgba(255,215,0,0.22) 45%, rgba(255,200,50,0.35) 50%, rgba(255,215,0,0.22) 55%, transparent 80%)',
            backgroundSize: '200% 100%',
            animation: 'shimmerSweep 2.8s ease-in-out infinite',
            mixBlendMode: 'screen',
          }} />
          {/* Dark crevice shadow (top-right) */}
          <div style={{
            position: 'absolute', top: '8%', right: '12%',
            width: '40%', height: '35%',
            background: 'radial-gradient(ellipse, rgba(10,12,18,0.55) 0%, transparent 80%)',
            borderRadius: '50%',
          }} />
          {/* Secondary highlight */}
          <div style={{
            position: 'absolute', bottom: '18%', left: '20%',
            width: '28%', height: '20%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.45) 0%, transparent 80%)',
            borderRadius: '50%',
          }} />
        </div>
      </motion.div>
    </div>
  )
}
