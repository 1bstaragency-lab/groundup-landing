"use client"

import { useRef, useState } from "react"
import { motion, type Variants } from "framer-motion"
import NumberFlow from "@number-flow/react"
import { Rocket, CalendarClock, BarChart3, Send, Megaphone, Sparkles, Building2, Users, ShieldCheck, Check } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TimelineContent } from "@/components/ui/timeline-animation"
import { PIXEL, INK, DIM, FAINT, GOLD } from "@/lib/brand-tokens"

interface Plan {
  name: string
  description: string
  price: number | "CUSTOM"
  yearlyPrice: number | "CUSTOM"
  popular?: boolean
  features: { text: string; icon: React.ReactNode }[]
  includesHeader: string
  includes: string[]
}

const PLANS: Plan[] = [
  {
    name: "PRO",
    description: "FOR ARTISTS DROPPING THEIR FIRST RELEASE ON THEIR OWN TERMS.",
    price: 29,
    yearlyPrice: 290,
    features: [
      { text: "RELEASE PLANNING", icon: <Rocket size={16} /> },
      { text: "CONTENT SCHEDULER", icon: <CalendarClock size={16} /> },
      { text: "STREAMING ANALYTICS", icon: <BarChart3 size={16} /> },
    ],
    includesHeader: "FREE TRIAL INCLUDES:",
    includes: ["UP IN YOUR IMESSAGE", "7-DAY FREE TRIAL", "NO CARD REQUIRED"],
  },
  {
    name: "GROWTH",
    description: "FOR ARTISTS READY TO PITCH, ADVERTISE, AND SCALE THE CATALOG.",
    price: 55,
    yearlyPrice: 550,
    popular: true,
    features: [
      { text: "CURATOR OUTREACH", icon: <Send size={16} /> },
      { text: "AD CAMPAIGNS", icon: <Megaphone size={16} /> },
      { text: "SYNC OPPORTUNITIES", icon: <Sparkles size={16} /> },
    ],
    includesHeader: "EVERYTHING IN PRO, PLUS:",
    includes: ["PRIORITY UP RESPONSE TIME", "600+ CURATOR NETWORK", "UNLIMITED AD CAMPAIGNS"],
  },
  {
    name: "PLANT",
    description: "FOR MANAGERS AND LABELS RUNNING MULTIPLE ARTISTS AT ONCE.",
    price: "CUSTOM",
    yearlyPrice: "CUSTOM",
    features: [
      { text: "MULTI-ARTIST DASHBOARD", icon: <Building2 size={16} /> },
      { text: "TEAM SEATS", icon: <Users size={16} /> },
      { text: "DEDICATED SUPPORT", icon: <ShieldCheck size={16} /> },
    ],
    includesHeader: "EVERYTHING IN GROWTH, PLUS:",
    includes: ["UNLIMITED ARTIST ROSTERS", "ROLE-BASED TEAM ACCESS", "DEDICATED ACCOUNT MANAGER"],
  },
]

function PricingSwitch({ onSwitch }: { onSwitch: (yearly: boolean) => void }) {
  const [yearly, setYearly] = useState(false)

  function set(value: boolean) {
    setYearly(value)
    onSwitch(value)
  }

  return (
    <div className="flex justify-center mb-24">
      <div className="relative flex rounded-full p-1.5" style={{ border: `1px solid ${FAINT}` }}>
        <button
          onClick={() => set(false)}
          className="relative z-10 h-12 px-6 rounded-full font-black text-[10px] uppercase tracking-widest cursor-pointer transition-colors flex items-center"
          style={{ color: yearly ? DIM : INK }}
        >
          {!yearly && (
            <motion.span layoutId="pricing-switch" className="absolute inset-0 rounded-full -z-10"
              style={{ background: GOLD }} transition={{ type: "spring", stiffness: 500, damping: 32 }} />
          )}
          MONTHLY
        </button>
        <button
          onClick={() => set(true)}
          className="relative z-10 h-12 pl-6 pr-3 rounded-full font-black text-[10px] uppercase tracking-widest cursor-pointer transition-colors flex items-center gap-2"
          style={{ color: yearly ? INK : DIM }}
        >
          {yearly && (
            <motion.span layoutId="pricing-switch" className="absolute inset-0 rounded-full -z-10"
              style={{ background: GOLD }} transition={{ type: "spring", stiffness: 500, damping: 32 }} />
          )}
          YEARLY
          <span className="px-2.5 py-1 rounded-full text-[7px] leading-none whitespace-nowrap" style={{ background: yearly ? 'rgba(17,17,17,0.12)' : 'rgba(255,215,0,0.15)', color: yearly ? INK : '#8a6d00' }}>
            SAVE 17%
          </span>
        </button>
      </div>
    </div>
  )
}

const revealVariants: Variants = {
  visible: (i: number) => ({ y: 0, opacity: 1, filter: "blur(0px)", transition: { delay: i * 0.06, duration: 0.5 } }),
  hidden: { y: -16, opacity: 0, filter: "blur(8px)" },
}

export function PricingSection({ onSelect }: { onSelect?: (planName: string) => void }) {
  const [isYearly, setIsYearly] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div ref={ref} className="px-8">
      <TimelineContent as="div" animationNum={0} timelineRef={ref} customVariants={revealVariants}>
        <PricingSwitch onSwitch={setIsYearly} />
      </TimelineContent>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan, i) => {
          const price = isYearly ? plan.yearlyPrice : plan.price
          const isCustom = price === "CUSTOM"

          return (
            <TimelineContent key={plan.name} as="div" animationNum={i + 1} timelineRef={ref} customVariants={revealVariants}>
              <Card
                className="h-full flex flex-col rounded-2xl p-2"
                style={{
                  background: plan.popular ? INK : "#fff",
                  color: plan.popular ? "#F4F1EC" : INK,
                  border: `1px solid ${plan.popular ? INK : FAINT}`,
                }}
              >
                <CardHeader className="pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-lg tracking-tight">{plan.name}</span>
                    {plan.popular && (
                      <span className="px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest" style={{ background: GOLD, color: INK }}>
                        MOST POPULAR
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold leading-relaxed tracking-wide mb-6" style={{ color: plan.popular ? "rgba(244,241,236,0.55)" : DIM }}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    {isCustom ? (
                      <span className="font-black tracking-tighter" style={{ fontSize: 40 }}>CUSTOM</span>
                    ) : (
                      <>
                        <span className="font-black tracking-tighter" style={{ fontSize: 56, lineHeight: 1 }}>
                          $<NumberFlow value={price as number} />
                        </span>
                        <span className="font-bold text-sm" style={{ color: plan.popular ? "rgba(244,241,236,0.5)" : DIM }}>
                          /{isYearly ? "YR" : "MO"}
                        </span>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-4 flex flex-col flex-1">
                  <button
                    onClick={() => onSelect?.(plan.name)}
                    className="w-full mb-8 py-4 rounded-full font-black text-[11px] uppercase tracking-widest cursor-pointer transition-transform hover:scale-[1.02]"
                    style={{ background: plan.popular ? GOLD : INK, color: plan.popular ? INK : "#F4F1EC" }}
                  >
                    {isCustom ? "TALK TO US" : "START FREE"}
                  </button>

                  <ul className="m-0 p-0 list-none space-y-3 mb-8">
                    {plan.features.map(f => (
                      <li key={f.text} className="flex items-center gap-3">
                        <span className="shrink-0" style={{ color: plan.popular ? GOLD : INK, opacity: plan.popular ? 1 : 0.6 }}>{f.icon}</span>
                        <span className="font-bold text-[11px] tracking-[0.1em]">{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6 mt-auto" style={{ borderTop: `1px solid ${plan.popular ? "rgba(244,241,236,0.14)" : FAINT}` }}>
                    <p className="font-black text-[10px] uppercase tracking-widest mb-4" style={{ fontFamily: PIXEL, color: plan.popular ? GOLD : DIM }}>
                      {plan.includesHeader}
                    </p>
                    <ul className="m-0 p-0 list-none space-y-3">
                      {plan.includes.map(f => (
                        <li key={f} className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: plan.popular ? "rgba(255,215,0,0.15)" : "rgba(17,17,17,0.06)" }}>
                            <Check size={11} style={{ color: plan.popular ? GOLD : INK }} />
                          </span>
                          <span className="font-bold text-[11px] tracking-[0.1em]">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TimelineContent>
          )
        })}
      </div>
    </div>
  )
}

export default PricingSection
