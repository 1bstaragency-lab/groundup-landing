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
      className="relative rounded-2xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 w-full max-w-[300px]"
      style={{
        background: isPopular
          ? "radial-gradient(at 0% 64%, rgba(184,134,11,0.35) 0%, transparent 70%), radial-gradient(at 100% 99%, rgba(255,215,0,0.2) 0%, transparent 70%), #0f0f0f"
          : "#0f0f0f",
        boxShadow: isPopular
          ? "0 0 0 1px rgba(255,215,0,0.3), 0 -16px 24px 0 rgba(255,215,0,0.1) inset, 0 40px 80px rgba(0,0,0,0.5)"
          : "0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,0.5)",
      }}
    >
      <style>{`@keyframes rotateBorder { to { transform: translate(-50%, -50%) rotate(360deg); } }`}</style>

      {/* Rotating border for popular */}
      {isPopular && (
        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-[#FFD700] text-black text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-widest">
            Most Popular
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl border flex items-center justify-center"
            style={{ borderColor: `${accentColor}30`, background: `${accentColor}15` }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white tracking-tight">{planName}</h3>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{description}</p>
          </div>
        </div>
        <div
          className="h-5 w-5 rounded-full border-2 shrink-0"
          style={{ borderColor: isPopular ? "#FFD700" : "rgba(255,255,255,0.2)" }}
        />
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white tracking-tight">{price}</span>
          <span className="text-sm text-white/30 font-bold">{priceDescription}</span>
        </div>
        {trialBadge ? (
          <p className="text-[10px] font-black mt-1 uppercase tracking-widest" style={{ color: accentColor }}>
            ✦ {trialBadge} · No credit card required
          </p>
        ) : (
          <p className="text-[10px] text-white/20 font-bold mt-1 uppercase tracking-widest">No credit card required</p>
        )}
      </div>

      <ul className="space-y-3 flex-grow mb-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-white/60">
            <div
              className="flex items-center justify-center w-4 h-4 rounded-full shrink-0 mt-0.5"
              style={{ background: accentColor }}
            >
              <Check size={9} strokeWidth={3} className="text-black" />
            </div>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className="w-full h-12 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={
          isPopular
            ? { background: "#FFD700", color: "#000", boxShadow: "0 0 20px rgba(255,215,0,0.3)" }
            : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.08)" }
        }
      >
        {buttonText}
      </button>
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
      price: "$29", priceDescription: "/ month",
      trialBadge: "7-day free trial",
      icon: <Star size={18} />, accentColor: "#FFD700",
      features: [
        "Full Artist OS dashboard",
        "Unlimited release rollouts",
        "Real-time streaming analytics",
        "uP iMessage (unlimited)",
        "Priority AI processing",
        "Playlist pitch submissions",
        "Content scheduling tools",
      ],
      buttonText: "Start Free Trial", isPopular: true,
    },
    {
      planName: "Growth", description: "For established artists",
      price: "$55", priceDescription: "/ month",
      trialBadge: undefined,
      icon: <Zap size={18} />, accentColor: "#a78bfa",
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
      planName: "Plant", description: "For artists & managers scaling",
      price: "Custom", priceDescription: "pricing",
      trialBadge: undefined,
      icon: <Building2 size={18} />, accentColor: "#22c55e",
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
      <div className="text-center mb-16">
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] mb-4">Pricing</p>
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
          Find the plan that's right for you
        </h2>
        <p className="text-white/40 text-lg font-medium max-w-md mx-auto">
          Start with a 7-day free trial. No credit card required to begin.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
        {plans.map((plan) =>
          plan.isPopular ? (
            <GlowingShadow key={plan.planName} radius="1rem" intensity={0.6} duration={4}>
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
