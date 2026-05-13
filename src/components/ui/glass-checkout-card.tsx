import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Calendar, CreditCard, Lock, Crown, Zap } from "lucide-react"
import { useState } from "react"
import { stripeConfigured } from "../../lib/stripe"

interface GlassCheckoutCardProps {
  amount?: number
  planName?: string
  className?: string
  onSuccess?: () => void
}

export function GlassCheckoutCard({
  amount = 29,
  planName = "Pro",
  className,
  onSuccess,
}: GlassCheckoutCardProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [form, setForm] = useState({ cardNumber: "", expiry: "", cvc: "", name: "" })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const isDemo = !stripeConfigured

  function fmt(val: string, type: "card" | "expiry" | "cvc") {
    if (type === "card")   return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
    if (type === "expiry") return val.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2")
    if (type === "cvc")    return val.replace(/\D/g, "").slice(0, 4)
    return val
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (isDemo) {
      // Demo mode — simulate success without hitting Stripe
      setLoading(true)
      await new Promise(r => setTimeout(r, 1200))
      setLoading(false)
      setDone(true)
      setTimeout(() => onSuccess?.(), 1500)
      return
    }
    // Real Stripe checkout handled by parent (redirectToCheckout)
    onSuccess?.()
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("w-full max-w-[400px]", className)}
      >
        <Card className="p-8 flex flex-col items-center text-center gap-4 bg-zinc-950/80 border-[#FFD700]/20">
          <div className="w-14 h-14 rounded-2xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center">
            <Crown size={24} className="text-[#FFD700]" />
          </div>
          <div>
            <p className="text-white font-black text-lg uppercase tracking-tighter">You're on Pro</p>
            <p className="text-white/30 text-xs font-medium mt-1">Full network access unlocked.</p>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("w-full max-w-[400px]", className)}
    >
      <Card className="relative overflow-hidden bg-zinc-950/80 border-white/10 backdrop-blur-md hover:border-[#FFD700]/20 transition-all duration-300">
        {/* Gold glow top edge */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/40 to-transparent" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-[#FFD700]" />
                <span className="text-[#FFD700] font-black text-[10px] uppercase tracking-widest">{planName} Plan</span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight uppercase">Payment Details</h3>
              <p className="text-[11px] text-white/30 font-medium mt-0.5">
                {isDemo ? "Demo mode — no real charge" : "Complete your purchase securely"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">${amount}</p>
              <p className="text-[10px] text-white/25 font-bold uppercase tracking-widest">/month</p>
            </div>
          </div>

          {/* Payment method tabs */}
          <div className="mb-6 grid grid-cols-3 gap-2">
            {[
              { id: "card",   label: <CreditCard size={16} /> },
              { id: "paypal", label: <span className="font-black italic text-xs">Pay</span> },
              { id: "apple",  label: <span className="font-black text-xs"> Pay</span> },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPaymentMethod(id)}
                className={cn(
                  "flex h-10 items-center justify-center rounded-xl border transition-all text-white/40",
                  paymentMethod === id
                    ? "border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700]"
                    : "border-white/8 bg-white/3 hover:bg-white/8 hover:text-white/70"
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handlePay} className="space-y-4">
            {/* Card number */}
            <div className="space-y-1.5">
              <Label htmlFor="cardNumber">Card Number</Label>
              <div className="relative">
                <Input
                  id="cardNumber"
                  placeholder="0000 0000 0000 0000"
                  value={form.cardNumber}
                  onChange={e => setForm(f => ({ ...f, cardNumber: fmt(e.target.value, "card") }))}
                  className="pl-10"
                  required={!isDemo}
                  disabled={isDemo}
                />
                <CreditCard size={14} className="absolute left-3 top-3 text-white/20" />
              </div>
            </div>

            {/* Expiry + CVC */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="expiry">Expiry</Label>
                <div className="relative">
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={form.expiry}
                    onChange={e => setForm(f => ({ ...f, expiry: fmt(e.target.value, "expiry") }))}
                    className="pl-10"
                    required={!isDemo}
                    disabled={isDemo}
                  />
                  <Calendar size={14} className="absolute left-3 top-3 text-white/20" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cvc">CVC</Label>
                <div className="relative">
                  <Input
                    id="cvc"
                    placeholder="123"
                    value={form.cvc}
                    onChange={e => setForm(f => ({ ...f, cvc: fmt(e.target.value, "cvc") }))}
                    className="pl-10"
                    required={!isDemo}
                    disabled={isDemo}
                  />
                  <Lock size={14} className="absolute left-3 top-3 text-white/20" />
                </div>
              </div>
            </div>

            {/* Cardholder name */}
            <div className="space-y-1.5">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required={!isDemo}
                disabled={isDemo}
              />
            </div>

            {/* Demo notice */}
            {isDemo && (
              <div className="rounded-xl bg-[#FFD700]/8 border border-[#FFD700]/15 px-4 py-3">
                <p className="text-[#FFD700]/70 text-[10px] font-black uppercase tracking-widest">
                  Demo Mode — Stripe not configured
                </p>
                <p className="text-white/30 text-[10px] font-medium mt-0.5">
                  Add VITE_STRIPE_PUBLISHABLE_KEY to enable real payments.
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FFD700] text-black font-black text-sm uppercase tracking-widest shadow-lg shadow-[#FFD700]/20 hover:shadow-[#FFD700]/40 hover:bg-[#FFD700]/90 transition-all mt-2"
            >
              {loading
                ? "Processing..."
                : isDemo
                  ? `Activate ${planName} (Demo)`
                  : `Pay $${amount}/mo`}
            </Button>
          </form>

          <p className="mt-4 text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
            <Lock size={10} className="inline mr-1" />
            Payments are secure and encrypted
          </p>
        </div>
      </Card>
    </motion.div>
  )
}
