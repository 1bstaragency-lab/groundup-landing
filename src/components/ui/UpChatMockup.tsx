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

export function UpOrbMascot() {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Outer ambient glow */}
      <div className="absolute inset-0 bg-[#FFD700]/10 blur-[60px] rounded-full" />

      <PulsingBorder
        colors={["#FFD700", "#B8860B", "#ffffff", "#000000", "#FFD700"]}
        colorBack="#00000000"
        speed={1.2}
        roundness={1}
        thickness={0.08}
        softness={0.2}
        intensity={7}
        pulse={0.12}
        smoke={0.5}
        smokeSize={5}
        scale={0.65}
        rotation={0}
        frame={9161408}
        style={{ width: 160, height: 160, borderRadius: "50%", position: "absolute", inset: 0 }}
      />

      {/* Rotating text ring */}
      <motion.svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path id="mascot-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text style={{ fontSize: 6.5, fill: "rgba(255,255,255,0.35)", fontWeight: 900, letterSpacing: "0.2em" }}>
          <textPath href="#mascot-circle" startOffset="0%">
            GrounduP OS • Artist First • uP •&nbsp;
          </textPath>
        </text>
      </motion.svg>

      {/* Center "uP" label */}
      <span className="relative z-10 text-white font-black text-xl uppercase tracking-widest select-none">
        uP
      </span>

      {/* Live dot */}
      <span className="absolute top-3 right-3 w-3.5 h-3.5 bg-[#FFD700] rounded-full border-2 border-black animate-pulse" />
    </div>
  )
}
