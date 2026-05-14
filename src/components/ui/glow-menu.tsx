"use client"
import { motion } from "framer-motion"
import { Home, Settings, Bell, User } from "lucide-react"

interface MenuItem {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  gradient: string
  iconColor: string
}

const itemVariants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}
const backVariants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}
const glowVariants = {
  initial: { opacity: 0, scale: 0.8 },
  hover: { opacity: 1, scale: 2, transition: { opacity: { duration: 0.5 }, scale: { duration: 0.5, type: "spring" as const, stiffness: 300, damping: 25 } } },
}
const sharedTransition = { type: "spring" as const, stiffness: 100, damping: 20, duration: 0.5 }

interface GlowMenuProps {
  onHome?: () => void
  onNotifications?: () => void
  onSettings?: () => void
  onProfile?: () => void
}

export function GlowMenu({ onHome, onNotifications, onSettings, onProfile }: GlowMenuProps) {
  const menuItems: MenuItem[] = [
    { icon: <Home className="h-5 w-5" />, label: "Home", onClick: onHome, gradient: "radial-gradient(circle, rgba(255,215,0,0.18) 0%, rgba(184,134,11,0.08) 50%, transparent 100%)", iconColor: "text-[#FFD700]" },
    { icon: <Bell className="h-5 w-5" />, label: "Alerts", onClick: onNotifications, gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, transparent 100%)", iconColor: "text-orange-400" },
    { icon: <Settings className="h-5 w-5" />, label: "Settings", onClick: onSettings, gradient: "radial-gradient(circle, rgba(255,215,0,0.12) 0%, rgba(184,134,11,0.05) 50%, transparent 100%)", iconColor: "text-[#FFD700]" },
    { icon: <User className="h-5 w-5" />, label: "Profile", onClick: onProfile, gradient: "radial-gradient(circle, rgba(255,215,0,0.15) 0%, rgba(184,134,11,0.06) 50%, transparent 100%)", iconColor: "text-[#FFD700]" },
  ]

  return (
    <motion.nav
      className="p-2 rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,215,0,0.06)_inset] relative overflow-hidden"
      initial="initial"
      whileHover="hover"
    >
      {/* Gold ambient glow on nav hover */}
      <motion.div
        className="absolute -inset-2 rounded-3xl z-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(255,215,0,0.06) 0%, transparent 70%)" }}
        variants={{ initial: { opacity: 0 }, hover: { opacity: 1, transition: { duration: 0.4 } } }}
      />
      <ul className="flex items-center gap-1 relative z-10">
        {menuItems.map((item) => (
          <motion.li key={item.label} className="relative">
            <motion.div
              className="block rounded-xl overflow-visible group relative"
              style={{ perspective: "600px" }}
              whileHover="hover"
              initial="initial"
            >
              <motion.div
                className="absolute inset-0 z-0 pointer-events-none"
                variants={glowVariants}
                style={{ background: item.gradient, opacity: 0, borderRadius: "12px" }}
              />
              <motion.button
                onClick={item.onClick}
                className="flex items-center gap-2 px-4 py-2 relative z-10 bg-transparent text-white/40 group-hover:text-white transition-colors rounded-xl text-sm font-bold"
                variants={itemVariants}
                transition={sharedTransition}
                style={{ transformStyle: "preserve-3d", transformOrigin: "center bottom" }}
              >
                <span className={`transition-colors duration-300 group-hover:${item.iconColor}`}>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </motion.button>
              <motion.button
                onClick={item.onClick}
                className="flex items-center gap-2 px-4 py-2 absolute inset-0 z-10 bg-transparent text-white/40 group-hover:text-white transition-colors rounded-xl text-sm font-bold"
                variants={backVariants}
                transition={sharedTransition}
                style={{ transformStyle: "preserve-3d", transformOrigin: "center top", rotateX: 90 }}
              >
                <span className={`transition-colors duration-300 group-hover:${item.iconColor}`}>{item.icon}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </motion.button>
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </motion.nav>
  )
}
