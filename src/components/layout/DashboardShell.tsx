"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home, BookOpen, Calendar, Layout, User, Settings,
  Bell, Search, Zap, TrendingUp, Users, Rocket,
  MoreHorizontal, X, Music2,
} from "lucide-react"
import { useAuth } from "../../hooks/useAuth"

interface DashboardShellProps {
  children: ReactNode
  activeTab: string
  setActiveTab: (tab: string) => void
}

// isMain = highlighted top-4 with gold treatment in sidebar
const MENU_ITEMS = [
  { id: "home",      label: "Dashboard",     icon: Home,      mobileShow: true,  isMain: true },
  { id: "rollouts",  label: "Rollouts",      icon: Rocket,    mobileShow: true,  isMain: true },
  { id: "analytics", label: "Analytics",     icon: TrendingUp,mobileShow: true,  isMain: true },
  { id: "learn",     label: "Learn & DB",    icon: BookOpen,  mobileShow: true,  isMain: true },
  { id: "team",      label: "Team",          icon: Users,     mobileShow: false, isMain: false },
  { id: "scheduler", label: "Scheduler",     icon: Calendar,  mobileShow: false, isMain: false },
  { id: "studio",    label: "Content Studio",icon: Layout,    mobileShow: false, isMain: false },
  { id: "curator",   label: "Curator",       icon: Music2,    mobileShow: false, isMain: false },
  { id: "profile",   label: "Artist Profile",icon: User,      mobileShow: false, isMain: false },
]

const BOTTOM_NAV_ITEMS = MENU_ITEMS.filter(m => m.mobileShow)
const MORE_ITEMS       = MENU_ITEMS.filter(m => !m.mobileShow)
const MAIN_ITEMS       = MENU_ITEMS.filter(m => m.isMain)
const OTHER_ITEMS      = MENU_ITEMS.filter(m => !m.isMain)

export function DashboardShell({ children, activeTab, setActiveTab }: DashboardShellProps) {
  const { user, profile } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)

  const displayName = profile?.artist_name ?? user?.artistName ?? user?.email?.split('@')[0] ?? 'Artist'

  function selectTab(id: string) {
    setActiveTab(id)
    setMoreOpen(false)
  }

  const isMoreActive = MORE_ITEMS.some(m => m.id === activeTab)

  function SidebarNavItem({ item }: { item: typeof MENU_ITEMS[number] }) {
    const Icon = item.icon
    const active = activeTab === item.id

    if (item.isMain) {
      return (
        <motion.button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`relative w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden ${
            active ? "bg-[#FFD700] text-black" : "text-white/50 hover:text-white"
          }`}
        >
          {/* Animated gold border when not active */}
          {!active && (
            <span
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg,rgba(255,215,0,0.12),rgba(255,215,0,0.04))',
                border: '1px solid rgba(255,215,0,0.15)',
              }}
            />
          )}
          {/* Shimmer sweep on hover */}
          {!active && (
            <motion.span
              initial={{ x: '-100%', opacity: 0 }}
              whileHover={{ x: '150%', opacity: 0.4 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent skew-x-12"
            />
          )}
          <Icon size={18} className={active ? "text-black" : "text-[#FFD700]/60 group-hover:text-[#FFD700] transition-colors"} />
          <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
          {active && <motion.div layoutId="activeTab" className="ml-auto w-1.5 h-1.5 bg-black rounded-full" />}
        </motion.button>
      )
    }

    return (
      <button
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300 ${
          active ? "bg-white/10 text-white" : "text-white/25 hover:bg-white/5 hover:text-white/60"
        }`}
      >
        <Icon size={17} />
        <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
        {active && <div className="ml-auto w-1.5 h-1.5 bg-white/60 rounded-full" />}
      </button>
    )
  }

  return (
    <div className="flex h-dvh bg-[#050505] text-white overflow-hidden">
      {/* ── Sidebar — desktop only ─────────────────────────── */}
      <aside className="hidden lg:flex w-60 bg-black border-r border-white/5 flex-col z-50 shrink-0">
        {/* Logo */}
        <div className="p-8 flex items-center gap-4 mb-2">
          <img src="/gu-logo.png" alt="GrounduP" className="h-10 w-auto" />
          <div className="flex flex-col">
            <span className="text-white font-black text-sm tracking-tighter">GROUNDUP</span>
            <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">Artist OS v4.0</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
          {/* Main 4 — gold-treated */}
          <p className="text-[#FFD700]/30 text-[8px] font-black uppercase tracking-[0.35em] px-2 pb-2 pt-2">Core</p>
          {MAIN_ITEMS.map(item => <SidebarNavItem key={item.id} item={item} />)}

          {/* Divider */}
          <div className="my-3 border-t border-white/5" />

          {/* Others */}
          <p className="text-white/15 text-[8px] font-black uppercase tracking-[0.35em] px-2 pb-2">Tools</p>
          {OTHER_ITEMS.map(item => <SidebarNavItem key={item.id} item={item} />)}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <button className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-white/20 hover:text-white transition-colors">
            <Settings size={20} />
            <span className="font-black text-[11px] uppercase tracking-widest">Settings</span>
          </button>
          <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-3">
              <Zap size={14} className="text-[#FFD700]" />
              <span className="text-white font-black text-[10px] uppercase tracking-widest">Growth Plan</span>
            </div>
            <p className="text-white/40 text-[10px] font-medium leading-relaxed mb-4">35 credits remaining this month.</p>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="bg-[#FFD700] h-full w-2/3" />
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 lg:h-20 border-b border-white/5 flex items-center justify-between px-4 lg:px-10 bg-black/50 backdrop-blur-md relative z-40 shrink-0">
          {/* Mobile: logo */}
          <div className="flex lg:hidden items-center gap-3">
            <img src="/gu-logo.png" alt="GrounduP" className="h-8 w-auto" />
          </div>

          {/* Desktop: search */}
          <div className="hidden lg:flex items-center gap-4 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/5 w-80">
            <Search size={14} className="text-white/20 shrink-0" />
            <input
              type="text"
              placeholder="Search tasks, releases, team..."
              className="bg-transparent border-none outline-none text-xs font-bold text-white w-full placeholder:text-white/10"
            />
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <button className="relative text-white/40 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#FFD700] rounded-full border border-black" />
            </button>
            <div className="h-6 w-px bg-white/5 hidden lg:block" />
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="hidden lg:block text-right">
                <p className="text-white font-black text-xs tracking-tight group-hover:text-[#FFD700] transition-colors uppercase">
                  {displayName}
                </p>
                <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">Artist Account</p>
              </div>
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center font-black text-[#FFD700] text-sm uppercase">
                {displayName[0]}
              </div>
            </div>
          </div>
        </header>

        {/* Content — extra bottom padding on mobile for the nav bar */}
        <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-8 lg:py-8 pb-24 lg:pb-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Bottom nav — mobile only ────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/5"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1">
          {BOTTOM_NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => selectTab(item.id)}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all min-w-[52px] relative"
              >
                {/* Gold dot for main items */}
                {item.isMain && !active && (
                  <span className="absolute top-1 right-2 w-1 h-1 rounded-full bg-[#FFD700]/50" />
                )}
                <Icon size={22} className={`transition-colors ${active ? 'text-[#FFD700]' : 'text-white/30'}`} />
                <span className={`text-[9px] font-black uppercase tracking-wide transition-colors ${active ? 'text-[#FFD700]' : 'text-white/20'}`}>
                  {item.id === 'home' ? 'Home' : item.id === 'learn' ? 'Learn' : item.label.split(' ')[0]}
                </span>
              </button>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(v => !v)}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all min-w-[52px]"
          >
            <MoreHorizontal
              size={22}
              className={`transition-colors ${isMoreActive || moreOpen ? 'text-[#FFD700]' : 'text-white/30'}`}
            />
            <span className={`text-[9px] font-black uppercase tracking-wide transition-colors ${isMoreActive || moreOpen ? 'text-[#FFD700]' : 'text-white/20'}`}>
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ── "More" slide-up sheet ───────────────────────────── */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-white/10 rounded-t-3xl"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/5">
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">More Tools</p>
                <button onClick={() => setMoreOpen(false)} className="text-white/30 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 p-5">
                {MORE_ITEMS.map(item => {
                  const Icon = item.icon
                  const active = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => selectTab(item.id)}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                        active
                          ? 'bg-[#FFD700] border-transparent'
                          : 'bg-zinc-900/40 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <Icon size={18} className={active ? 'text-black' : 'text-white/40'} />
                      <span className={`font-black text-[11px] uppercase tracking-wide ${active ? 'text-black' : 'text-white/60'}`}>
                        {item.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
