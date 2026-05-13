"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles, ChevronRight, Search } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS = [
  {
    question: "What is uP?",
    answer: "uP is an elite music management platform (OS) that helps artists and teams stay organized, understand global performance, and take action using AI-driven insights and workflow tools in one place.",
    bullets: [
        "Real-time Artist Dashboard (Listeners, Data, Performance)",
        "Proactive Rollout Planning & Scheduling",
        "AI Music Concierge for 24/7 strategic support",
        "Seamless Team Collaboration & Asset Management"
    ]
  },
  {
    question: "How does the Concierge work?",
    answer: "Our AI Concierge is a dedicated agent trained on industry-standard rollout patterns. It builds your release plans, drafts press kits, and even suggests marketing strategies based on your specific audience data.",
    bullets: []
  },
  {
    question: "Is there a mobile app?",
    answer: "Yes, the GrounduP mobile app is currently in early access. It allows you to manage tasks, chat with your team, and receive proactive notifications about your release status on the go.",
    bullets: []
  }
]

export function SupportBot() {
  const [activeFaq, setActiveFaq] = useState(0)
  const [query, setQuery] = useState("")

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 uppercase">FAQ</h2>
        <p className="text-white/40 text-lg font-medium">Have questions? Chat with <span className="text-[#FFD700]">uP</span> to learn more.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        {/* Decorative Light */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#FFD700]/5 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Left Column: Chat Questions */}
        <div className="lg:col-span-4 space-y-4">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em] mb-6 px-4">Popular Questions</p>
          {FAQS.map((faq, i) => (
            <motion.button
              key={i}
              onClick={() => setActiveFaq(i)}
              className={cn(
                "w-full text-left p-6 rounded-[2rem] border transition-all duration-500 flex items-center justify-between group",
                activeFaq === i 
                  ? "bg-[#FFD700] border-transparent text-black shadow-[0_10px_30px_rgba(255,215,0,0.2)]" 
                  : "bg-zinc-900/40 border-white/5 text-white/40 hover:bg-zinc-900 hover:text-white"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              <span className="font-black text-xs uppercase tracking-widest">{faq.question}</span>
              <ChevronRight size={18} className={cn("transition-transform", activeFaq === i ? "rotate-0" : "opacity-0 group-hover:opacity-100")} />
            </motion.button>
          ))}
          
          <div className="pt-10">
            <div className="bg-zinc-950 p-6 rounded-[2.5rem] border border-white/5 flex items-center gap-4 group">
               <div className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center text-white/20 group-focus-within:text-[#FFD700] transition-colors">
                  <Search size={18} />
               </div>
               <input 
                type="text" 
                placeholder="Ask uP anything..." 
                className="bg-transparent border-none outline-none text-white text-sm font-bold w-full placeholder:text-white/10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
               />
               <button className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-lg">
                  <Send size={16} strokeWidth={3} />
               </button>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Answer Card */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFaq}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-zinc-900/40 border border-white/5 p-12 rounded-[3rem] backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <Sparkles size={32} className="text-[#FFD700] opacity-20 animate-pulse" />
              </div>

              <div className="max-w-2xl">
                <h3 className="text-white text-3xl font-black mb-8 tracking-tighter leading-tight underline decoration-[#FFD700]/30 decoration-4 underline-offset-8">
                  {FAQS[activeFaq].question}
                </h3>
                <p className="text-white/60 text-lg font-medium leading-relaxed mb-8">
                  {FAQS[activeFaq].answer}
                </p>

                {FAQS[activeFaq].bullets.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.4em] mb-4">Core Benefits:</p>
                    <div className="grid gap-3">
                      {FAQS[activeFaq].bullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group hover:bg-[#FFD700]/5 hover:border-[#FFD700]/20 transition-all">
                          <div className="w-1.5 h-1.5 bg-[#FFD700] rounded-full" />
                          <span className="text-white/80 text-sm font-bold tracking-tight">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Interactive Bar */}
              <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(j => (
                      <div key={j} className="w-8 h-8 rounded-full border-2 border-zinc-950 bg-zinc-800" />
                    ))}
                  </div>
                  <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">+ 1,400 recently asked this</span>
                </div>
                <button className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                  Was this helpful? <div className="flex gap-1"><span className="hover:text-[#FFD700] cursor-pointer">Yes</span> / <span className="hover:text-[#FFD700] cursor-pointer">No</span></div>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
