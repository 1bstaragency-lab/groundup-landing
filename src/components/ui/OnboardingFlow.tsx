"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, Sparkles, Music, Users, Target } from "lucide-react"
import { LiquidButton } from "./liquid-glass-button"

interface OnboardingProps {
  onComplete: (data: any) => void
}

export function OnboardingFlow({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({
    artistType: "",
    goal: "",
    teamSize: "Solo",
    focus: "Content & Growth"
  })

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => Math.max(1, s - 1))

  const STEPS = [
    {
      title: "Tell us who you are",
      subtitle: "We'll tailor your dashboard to your current career stage.",
      icon: <Music className="text-[#FFD700]" />,
      options: ["Independent Artist", "Manager", "Record Label", "Producer"],
      key: "artistType"
    },
    {
      title: "What's your primary goal?",
      subtitle: "This helps uP prioritize your daily tasks and rollout plans.",
      icon: <Target className="text-[#FFD700]" />,
      options: ["Scale My Audience", "Release a Project", "Sign a Major Deal", "Build My Team"],
      key: "goal"
    },
    {
      title: "How big is your team?",
      subtitle: "uP scales its collaboration tools based on your network.",
      icon: <Users className="text-[#FFD700]" />,
      options: ["Solo", "2-5 People", "Full Agency", "Large Label"],
      key: "teamSize"
    }
  ]

  const current = STEPS[step - 1]

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      {/* Progress Bar */}
      <div className="w-full max-w-xl flex gap-2 mb-20 relative z-10">
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-[#FFD700]" : "bg-white/10"}`} 
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl relative z-10"
        >
          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-16 h-16 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#FFD700]/20">
              {current.icon}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 uppercase">{current.title}</h2>
            <p className="text-white/40 text-lg font-medium max-w-md">{current.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 mb-12">
            {current.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setData({ ...data, [current.key]: opt })}
                className={`p-6 rounded-[2rem] border transition-all duration-300 text-left flex items-center justify-between group ${
                  data[current.key as keyof typeof data] === opt 
                    ? "bg-[#FFD700] border-transparent text-black" 
                    : "bg-zinc-900/40 border-white/5 text-white/40 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <span className="font-black text-sm uppercase tracking-widest">{opt}</span>
                {data[current.key as keyof typeof data] === opt && <Sparkles size={18} />}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-6">
            {step > 1 ? (
              <button onClick={back} className="flex items-center gap-2 text-white/40 hover:text-white font-black text-[10px] tracking-widest uppercase transition-colors">
                <ChevronLeft size={16} /> Back
              </button>
            ) : <div />}
            
            <LiquidButton 
              onClick={step === 3 ? () => onComplete(data) : next}
              className="px-12"
            >
              {step === 3 ? "LAUNCH DASHBOARD" : "CONTINUE"} <ChevronRight size={16} />
            </LiquidButton>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Footer Branding */}
      <div className="absolute bottom-12 flex items-center gap-3 opacity-20 hover:opacity-50 transition-opacity">
        <div className="w-8 h-8 bg-[#FFD700] rounded-xl flex items-center justify-center font-black text-black text-sm">uP</div>
        <span className="text-white font-black text-xs tracking-widest uppercase">GrounduP Onboarding</span>
      </div>
    </div>
  )
}
