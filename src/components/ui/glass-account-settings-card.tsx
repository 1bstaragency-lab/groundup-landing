"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Shield, CreditCard, Zap, ChevronDown, ChevronRight, Check } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface PlanTier {
  id: string
  name: string
  price: string
  period: string
  features: string[]
  badge?: string
  current?: boolean
}

const PLANS: PlanTier[] = [
  {
    id: "free",
    name: "Starter",
    price: "$0",
    period: "forever",
    features: ["Basic dashboard", "1 release", "Community access"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "month",
    features: ["Unlimited releases", "AI rollout planner", "Analytics", "Team (3 seats)"],
    badge: "Popular",
    current: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: "$99",
    period: "month",
    features: ["Everything in Pro", "Unlimited team", "Priority AI", "White-label"],
    badge: "Best Value",
  },
]

interface NotificationSetting {
  id: string
  label: string
  description: string
  enabled: boolean
}

type SectionId = "subscription" | "notifications" | "security"

export function GlassAccountSettingsCard({ className }: { className?: string }) {
  const [openSection, setOpenSection] = useState<SectionId | null>("subscription")
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    { id: "releases", label: "Release alerts", description: "Notify me when a release milestone is due", enabled: true },
    { id: "analytics", label: "Weekly analytics", description: "Summary of streams, listeners, and growth", enabled: true },
    { id: "team", label: "Team activity", description: "When team members complete tasks or comment", enabled: false },
    { id: "billing", label: "Billing updates", description: "Receipts, renewals, and payment confirmations", enabled: true },
  ])

  function toggleNotif(id: string) {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n))
  }

  function toggleSection(id: SectionId) {
    setOpenSection(prev => prev === id ? null : id)
  }

  const sections: { id: SectionId; label: string; icon: React.ReactNode }[] = [
    { id: "subscription", label: "Plan", icon: <CreditCard size={13} /> },
    { id: "notifications", label: "Alerts", icon: <Bell size={13} /> },
    { id: "security", label: "Security", icon: <Shield size={13} /> },
  ]

  return (
    <div className={cn(
      "w-full rounded-3xl border border-white/8 bg-zinc-950/80 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.6)] overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <Zap size={14} className="text-[#FFD700]" />
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD700]/70">Account Settings</p>
        </div>
        <h3 className="text-white font-black text-lg uppercase tracking-tighter">Manage Your Plan</h3>
      </div>

      {/* Accordion sections */}
      <div className="divide-y divide-white/5">
        {sections.map(section => {
          const isOpen = openSection === section.id
          return (
            <div key={section.id}>
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className={cn(
                  "w-full flex items-center justify-between px-6 py-4 transition-all",
                  isOpen ? "text-[#FFD700]" : "text-white/40 hover:text-white/70"
                )}
              >
                <div className="flex items-center gap-2">
                  {section.icon}
                  <span className="text-[10px] font-black uppercase tracking-widest">{section.label}</span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                >
                  <ChevronDown size={14} />
                </motion.div>
              </button>

              {/* Section content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={section.id + "-content"}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="px-6 pb-6">
                      {section.id === "subscription" && (
                        <div className="space-y-3">
                          {PLANS.map(plan => (
                            <motion.div
                              key={plan.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                "relative p-5 rounded-2xl border transition-all",
                                plan.current
                                  ? "border-[#FFD700]/30 bg-[#FFD700]/5"
                                  : "border-white/5 bg-zinc-900/30 hover:border-white/10"
                              )}
                            >
                              {plan.badge && (
                                <div className="absolute top-3 right-3">
                                  <Badge className="text-[9px] font-black uppercase tracking-wide bg-[#FFD700] text-black border-0">
                                    {plan.badge}
                                  </Badge>
                                </div>
                              )}
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-white font-black text-sm uppercase tracking-wide">{plan.name}</p>
                                    {plan.current && (
                                      <span className="flex items-center gap-1 text-[9px] font-black uppercase text-[#FFD700]">
                                        <Check size={9} /> Current
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-baseline gap-1 mb-3">
                                    <span className="text-2xl font-black text-white">{plan.price}</span>
                                    <span className="text-white/30 text-xs font-medium">/{plan.period}</span>
                                  </div>
                                  <ul className="space-y-1">
                                    {plan.features.map((f, i) => (
                                      <li key={i} className="flex items-center gap-2 text-white/40 text-[11px] font-medium">
                                        <div className="w-1 h-1 rounded-full bg-[#FFD700]/50 shrink-0" />
                                        {f}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              {!plan.current && (
                                <button className="mt-4 w-full py-2.5 rounded-xl border border-[#FFD700]/20 text-[#FFD700] text-[10px] font-black uppercase tracking-widest hover:bg-[#FFD700]/10 transition-colors flex items-center justify-center gap-2">
                                  Upgrade <ChevronRight size={12} />
                                </button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {section.id === "notifications" && (
                        <div className="space-y-3">
                          {notifications.map((notif, i) => (
                            <motion.div
                              key={notif.id}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.06 }}
                              className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-white/5 bg-zinc-900/30 hover:border-white/8 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm">{notif.label}</p>
                                <p className="text-white/30 text-[11px] font-medium mt-0.5">{notif.description}</p>
                              </div>
                              <Switch
                                checked={notif.enabled}
                                onCheckedChange={() => toggleNotif(notif.id)}
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {section.id === "security" && (
                        <div className="space-y-4">
                          {[
                            { label: "Two-factor authentication", desc: "Add an extra layer of protection", status: "Not enabled", action: "Enable", danger: false },
                            { label: "Active sessions", desc: "Manage where you're logged in", status: "2 devices", action: "Manage", danger: false },
                            { label: "Delete account", desc: "Permanently remove all data", status: "Irreversible", action: "Delete", danger: true },
                          ].map((item, i) => (
                            <motion.div
                              key={item.label}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className={cn(
                                "flex items-center justify-between gap-4 p-4 rounded-2xl border transition-colors",
                                item.danger
                                  ? "border-red-500/15 bg-red-500/5 hover:border-red-500/25"
                                  : "border-white/5 bg-zinc-900/30 hover:border-white/8"
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <p className={cn("font-bold text-sm", item.danger ? "text-red-400" : "text-white")}>{item.label}</p>
                                <p className="text-white/30 text-[11px] font-medium mt-0.5">{item.desc}</p>
                              </div>
                              <div className="flex items-center gap-3 shrink-0">
                                <span className="text-white/20 text-[10px] font-black uppercase">{item.status}</span>
                                <button className={cn(
                                  "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors",
                                  item.danger
                                    ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                    : "border-white/10 text-white/50 hover:text-white hover:border-white/20"
                                )}>
                                  {item.action}
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
