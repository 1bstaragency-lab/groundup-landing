"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Sparkles, ChevronDown, RotateCcw, Zap } from 'lucide-react'
import { PulsingBorder } from '@paper-design/shaders-react'
import { useAuth } from '../../hooks/useAuth'
import { useIsMobile } from '../../hooks/useIsMobile'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
}

interface UpSectionProps {
  pointsAvailable: number
  totalEarned: number
}

// ─── uP Orb Avatar ───────────────────────────────────────────────────────────

function UpOrbAvatar({ size = 36, pulse = false }: { size?: number; pulse?: boolean }) {
  const isMobile = useIsMobile()
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {(isMobile || pulse) ? (
        <span
          className="absolute inset-0 rounded-full border border-[#FFD700]/50"
          style={{
            boxShadow: "0 0 10px rgba(255,215,0,0.35)",
            animation: pulse ? "upPulse 1s ease-in-out infinite" : undefined,
          }}
        />
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
      <motion.svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <defs>
          <path id={`up-circle-${size}`} d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <text style={{ fontSize: 7, fill: "rgba(255,255,255,0.25)", fontWeight: 900, letterSpacing: "0.18em" }}>
          <textPath href={`#up-circle-${size}`} startOffset="0%">uP • GrounduP •&nbsp;</textPath>
        </text>
      </motion.svg>
      <span className="absolute inset-0 flex items-center justify-center text-white font-black text-[7px] uppercase tracking-widest select-none z-10">
        uP
      </span>
    </div>
  )
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-3.5 py-2.5 bg-zinc-800/70 border border-white/5 rounded-2xl rounded-tl-sm w-fit">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#FFD700]/60"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
        />
      ))}
    </div>
  )
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {!isUser && <UpOrbAvatar size={28} />}

      <div className={`flex flex-col gap-1 max-w-[82%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-[12px] font-medium leading-relaxed ${
            isUser
              ? 'bg-[#FFD700]/15 border border-[#FFD700]/20 text-white rounded-tr-sm'
              : 'bg-zinc-800/70 border border-white/5 text-white/85 rounded-tl-sm'
          }`}
          style={msg.isStreaming ? { borderColor: 'rgba(255,215,0,0.15)' } : undefined}
        >
          {msg.content}
          {msg.isStreaming && (
            <span className="inline-block w-0.5 h-3.5 bg-[#FFD700] ml-0.5 align-text-bottom animate-pulse" />
          )}
        </div>
        <span className="text-white/20 text-[8px] font-bold">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  )
}

// ─── Quick prompts ────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  "What should I focus on this week?",
  "How's my rollout looking?",
  "Give me content ideas for my next drop",
  "What's missing from my checklist?",
]

// ─── Main component ───────────────────────────────────────────────────────────

export function UpSection({ pointsAvailable, totalEarned }: UpSectionProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [convId, setConvId]     = useState<string | undefined>()
  const [showScrollBtn, setShowScrollBtn] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollRef      = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLTextAreaElement>(null)

  // Greeting on first load
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: Message = {
        id:        'greeting',
        role:      'assistant',
        content:   "What's good! I'm uP — your music career co-pilot. I've got your releases, calendar, and goals loaded up. What are we working on today?",
        timestamp: new Date(),
      }
      setMessages([greeting])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  // Show scroll-to-bottom button when scrolled up
  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    setShowScrollBtn(!atBottom)
  }

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim()
    if (!content || loading || !user) return

    setInput('')
    inputRef.current?.style.setProperty('height', 'auto')

    const userMsg: Message = {
      id:        `u-${Date.now()}`,
      role:      'user',
      content,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/.netlify/functions/up-chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:         content,
          userId:          user.id,
          conversationId:  convId,
          pointsAvailable,
          totalEarned,
        }),
      })

      const data = await res.json()

      if (data.ok && data.reply) {
        if (data.conversationId && !convId) setConvId(data.conversationId)

        // Animate the reply in word-by-word for a streamed feel
        const words = data.reply.split(' ')
        const streamId = `a-${Date.now()}`
        setMessages(prev => [...prev, {
          id:          streamId,
          role:        'assistant',
          content:     '',
          timestamp:   new Date(),
          isStreaming: true,
        }])

        let built = ''
        for (let i = 0; i < words.length; i++) {
          built += (i === 0 ? '' : ' ') + words[i]
          const snap = built
          setMessages(prev => prev.map(m => m.id === streamId ? { ...m, content: snap } : m))
          await new Promise(r => setTimeout(r, 28))
        }
        setMessages(prev => prev.map(m => m.id === streamId ? { ...m, isStreaming: false } : m))
      } else {
        setMessages(prev => [...prev, {
          id:        `err-${Date.now()}`,
          role:      'assistant',
          content:   data.error ?? 'Something went sideways on my end — try again in a sec.',
          timestamp: new Date(),
        }])
      }
    } catch {
      setMessages(prev => [...prev, {
        id:        `err-${Date.now()}`,
        role:      'assistant',
        content:   'Lost connection for a moment. Check your network and try again.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  function resetConversation() {
    setMessages([])
    setConvId(undefined)
    setTimeout(() => {
      setMessages([{
        id:        'greeting-new',
        role:      'assistant',
        content:   "Fresh start — what are we working on?",
        timestamp: new Date(),
      }])
    }, 50)
  }

  const canSend = input.trim().length > 0 && !loading

  return (
    <div className="flex flex-col" style={{ height: 'min(600px, calc(100vh - 260px))' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <UpOrbAvatar size={38} />
          <div>
            <p className="text-white font-black text-sm uppercase tracking-widest leading-none">Chat with uP</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_6px_#FFD700]" />
              <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest">AI-powered · online</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Points badge */}
          <div className="flex items-center gap-1.5 bg-[#FFD700]/8 border border-[#FFD700]/15 rounded-full px-3 py-1.5">
            <Zap size={9} className="text-[#FFD700]" />
            <span className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest">{pointsAvailable.toLocaleString()} pts</span>
          </div>
          <button
            onClick={resetConversation}
            className="w-7 h-7 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
            title="New conversation"
          >
            <RotateCcw size={11} />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/30">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto px-4 py-4 space-y-4 scrollbar-none"
        >
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {loading && !messages.find(m => m.isStreaming) && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="flex gap-2.5"
              >
                <UpOrbAvatar size={28} pulse />
                <TypingDots />
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll-to-bottom button */}
        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scrollToBottom()}
              className="absolute bottom-3 right-3 w-7 h-7 bg-zinc-800 border border-white/10 rounded-full flex items-center justify-center text-white/40 hover:text-white/70 shadow-lg"
            >
              <ChevronDown size={13} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Quick prompts (show when no real messages yet) */}
      <AnimatePresence>
        {messages.length <= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="mt-3 flex flex-wrap gap-2 flex-shrink-0"
          >
            {QUICK_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.03] hover:bg-[#FFD700]/8 border border-white/5 hover:border-[#FFD700]/20 rounded-full text-[10px] font-bold text-white/40 hover:text-white/70 transition-all"
              >
                <Sparkles size={9} className="text-[#FFD700]/50" />
                {prompt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="mt-3 flex-shrink-0">
        <div className={`flex items-end gap-2 bg-zinc-900/60 rounded-2xl px-3.5 py-2.5 border transition-all ${
          input.length > 0 ? 'border-[#FFD700]/20' : 'border-white/5'
        }`}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask uP anything about your career…"
            rows={1}
            disabled={loading}
            className="flex-1 bg-transparent text-white text-[12px] font-medium placeholder-white/25 resize-none focus:outline-none leading-relaxed max-h-[120px] scrollbar-none disabled:opacity-50"
            style={{ height: 'auto' }}
          />

          <div className="flex items-center gap-2 pb-0.5 flex-shrink-0">
            <button className="text-white/20 hover:text-white/40 transition-colors">
              <Mic size={14} />
            </button>

            <motion.button
              whileTap={canSend ? { scale: 0.9 } : {}}
              onClick={() => sendMessage()}
              disabled={!canSend}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{
                background: canSend ? '#FFD700' : 'rgba(255,255,255,0.06)',
                boxShadow: canSend ? '0 0 12px rgba(255,215,0,0.35)' : 'none',
              }}
            >
              <Send size={11} className={canSend ? 'text-black' : 'text-white/20'} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>
        <p className="text-center text-white/10 text-[8px] font-bold tracking-widest mt-1.5 uppercase">
          uP · Powered by Claude · Your context is private
        </p>
      </div>

      <style>{`
        @keyframes upPulse {
          0%, 100% { box-shadow: 0 0 8px rgba(255,215,0,0.2); }
          50%       { box-shadow: 0 0 18px rgba(255,215,0,0.5); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
