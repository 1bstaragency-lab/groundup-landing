import React from "react"
import { Check, Zap, Star, Building2 } from "lucide-react"
import { GlowingShadow } from "./glowing-shadow"

function PricingCard({
  planName, description, price, priceDescription, features,
  icon, accentColor, isPopular, buttonText, trialBadge, onSelect,
}: {
  planName: string; description: string; price: string; priceDescription: string
  features: string[]; icon: React.ReactNode; accentColor: string
  isPopular?: boolean; buttonText: string; trialBadge?: string; onSelect?: () => void
}) {
  return (
    <div
      className="relative rounded-2xl flex flex-col w-full transition-all duration-300 hover:-translate-y-1"
      style={{
        background: isPopular
          ? "radial-gradient(at 0% 64%, rgba(184,134,11,0.35) 0%, transparent 70%), radial-gradient(at 100% 99%, rgba(255,215,0,0.2) 0%, transparent 70%), #0f0f0f"
          : "#0f0f0f",
        boxShadow: isPopular
          ? "0 0 0 1px rgba(255,215,0,0.3), 0 -16px 24px 0 rgba(255,215,0,0.1) inset, 0 40px 80px rgba(0,0,0,0.5)"
          : "0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.5)",
      }}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-[#FFD700] text-black text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest whitespace-nowrap">
            Most Popular
          </span>
        </div>
      )}

      {/* Top accent bar */}
      <div
        className="h-1 w-full rounded-t-2xl"
        style={{ background: isPopular ? "#FFD700" : `${accentColor}60` }}
      />

      <div className="p-5 sm:p-6 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl border flex items-center justify-center shrink-0"
              style={{ borderColor: `${accentColor}30`, background: `${accentColor}15` }}
            >
              <span style={{ color: accentColor }}>{icon}</span>
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight leading-none">{planName}</h3>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{description}</p>
            </div>
          </div>
          <div
            className="h-4 w-4 rounded-full border-2 shrink-0"
            style={{ borderColor: isPopular ? "#FFD700" : "rgba(255,255,255,0.2)" }}
          />
        </div>

        {/* Price */}
        <div className="mb-5 pb-5 border-b border-white/5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">{price}</span>
            <span className="text-sm text-white/30 font-bold">{priceDescription}</span>
          </div>
          {trialBadge ? (
            <p className="text-[10px] font-black mt-1.5 uppercase tracking-widest" style={{ color: accentColor }}>
              ✦ {trialBadge} · No card required
            </p>
          ) : (
            <p className="text-[10px] text-white/20 font-bold mt-1.5 uppercase tracking-widest">Get in touch to start</p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-2.5 flex-1 mb-6">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] text-white/60 leading-snug">
              <div
                className="flex items-center justify-center w-4 h-4 rounded-full shrink-0 mt-0.5"
                style={{ background: accentColor }}
              >
                <Check size={8} strokeWidth={3} className="text-black" />
              </div>
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={onSelect}
          className="w-full h-11 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={
            isPopular
              ? { background: "#FFD700", color: "#000", boxShadow: "0 0 24px rgba(255,215,0,0.25)" }
              : { background: `${accentColor}12`, color: accentColor, border: `1px solid ${accentColor}25` }
          }
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
}

interface PricingPageProps {
  onSelect?: (plan: string) => void
}

export function PricingPage({ onSelect }: PricingPageProps) {
  const plans = [
    {
      planName: "Pro", description: "For serious artists",
      price: "$29", priceDescription: "/ mo",
      trialBadge: "7-day free trial",
      icon: <Star size={16} />, accentColor: "#FFD700",
      features: [
        "Full Artist OS dashboard",
        "Unlimited release rollouts",
        "Real-time streaming analytics",
        "uP AI — in-app + iMessage",
        "Priority AI processing",
        "Playlist pitch submissions",
        "Content scheduling tools",
      ],
      buttonText: "Start Free Trial", isPopular: true,
    },
    {
      planName: "Growth", description: "For established artists",
      price: "$55", priceDescription: "/ mo",
      trialBadge: undefined,
      icon: <Zap size={16} />, accentColor: "#a78bfa",
      features: [
        "Everything in Pro",
        "Multi-project management",
        "Team collaboration (3 seats)",
        "Advanced release reporting",
        "Influencer network access",
        "Blog & press outreach tools",
        "Priority support",
      ],
      buttonText: "Get Growth", isPopular: false,
    },
    {
      planName: "Plant", description: "Managers scaling a roster",
      price: "Custom", priceDescription: "pricing",
      trialBadge: undefined,
      icon: <Building2 size={16} />, accentColor: "#22c55e",
      features: [
        "Everything in Growth",
        "Unlimited team seats",
        "Multi-artist roster management",
        "Dedicated account manager",
        "Custom API integrations",
        "White-label options",
        "SLA & priority infrastructure",
      ],
      buttonText: "Talk to Us", isPopular: false,
    },
  ]

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-10 sm:mb-14 px-4">
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] mb-3">Pricing</p>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter mb-3">
          Find the plan that's right for you
        </h2>
        <p className="text-white/40 text-base font-medium max-w-sm mx-auto">
          Start with a 7-day free trial. No credit card required.
        </p>
      </div>

      {/* Cards — single col mobile, 3 col desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 px-1">
        {plans.map((plan) =>
          plan.isPopular ? (
            <GlowingShadow key={plan.planName} radius="1rem" intensity={0.6} duration={4} className="w-full">
              <PricingCard {...plan} trialBadge={plan.trialBadge} onSelect={() => onSelect?.(plan.planName)} />
            </GlowingShadow>
          ) : (
            <PricingCard key={plan.planName} {...plan} trialBadge={plan.trialBadge} onSelect={() => onSelect?.(plan.planName)} />
          )
        )}
      </div>
    </div>
  )
}
