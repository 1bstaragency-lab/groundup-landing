"use client"

import { useState, useRef, type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate, useLocation } from "react-router-dom"
import {
  Home, BookOpen, Calendar, Layout, User,
  Bell, TrendingUp, Users, Network,
  MoreHorizontal, X, Settings, Zap, Search,
  LogOut, ChevronDown,
} from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import { CdRocketIcon } from "../ui/CdRocketIcon"
import { PlanBadge } from "../ui/PlanGate"
import { GOLD, GOLDD } from "../../lib/brand-tokens"
import { SILVER, INK, DIM, FAINT, CARD, ThemeToggle } from "../../lib/dashboard-theme"

interface DashboardShellProps {
  children: ReactNode
}

// ── MVP nav model ────────────────────────────────────────────────────────────
// isMain = highlighted top tier with gold treatment
// preview = "Coming Soon" — visible but routes to a teaser page
type IconCmp = React.ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: React.CSSProperties }>

type MenuItem = {
  id:         string
  label:      string
  icon:       IconCmp
  mobileShow: boolean
  isMain:     boolean
  small?:     boolean
  preview?:   boolean
}

const MENU_ITEMS: MenuItem[] = [
  // ── Core MVP — the 6 pillars ───────────────────────────────────────────────
  { id: "home",        label: "Dashboard",          icon: Home,         mobileShow: true,  isMain: true },
  { id: "rollouts",    label: "Releases",           icon: CdRocketIcon, mobileShow: true,  isMain: true },
  { id: "scheduler",   label: "Campaigns",          icon: Calendar,     mobileShow: true,  isMain: true },
  { id: "influencers", label: "Influencer Outreach", icon: Network,     mobileShow: true,  isMain: true, small: true },
  { id: "analytics",   label: "Analytics",          icon: TrendingUp,   mobileShow: false, isMain: true },
  { id: "learn",       label: "Knowledge Base",     icon: BookOpen,     mobileShow: false, isMain: true, small: true },
  { id: "profile",     label: "Artist Profile",     icon: User,         mobileShow: false, isMain: true },

  // ── Preview (Coming Soon) ──────────────────────────────────────────────────
  { id: "studio",      label: "Content Studio",     icon: Layout,       mobileShow: false, isMain: false, preview: true },
  { id: "team",        label: "Team",               icon: Users,        mobileShow: false, isMain: false, preview: true },
]

const BOTTOM_NAV_ITEMS = MENU_ITEMS.filter(m => m.mobileShow)
const MORE_ITEMS       = MENU_ITEMS.filter(m => !m.mobileShow)
const MAIN_ITEMS       = MENU_ITEMS.filter(m => m.isMain)
const PREVIEW_ITEMS    = MENU_ITEMS.filter(m => m.preview)

export function DashboardShell({ children }: DashboardShellProps) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const activeTab = pathname.split('/')[2] || 'home'
  const [moreOpen, setMoreOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
  const userBtnRef = useRef<HTMLButtonElement>(null)

  function toggleUserMenu() {
    if (!userMenuOpen && userBtnRef.current) {
      const rect = userBtnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right })
    }
    setUserMenuOpen(o => !o)
  }

  const displayName = profile?.artist_name ?? user?.artistName ?? user?.email?.split('@')[0] ?? 'Artist'

  function selectTab(id: string) {
    navigate('/dashboard/' + id)
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
          onClick={() => navigate('/dashboard/' + item.id)}
          className={`gradient-button relative w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group overflow-hidden ${
            active ? "gradient-button-active text-white" : "dash-nav-inactive"
          }`}
          style={active ? undefined : { background: 'transparent' }}
        >
          {/* Subtle gold-tinted border when not active */}
          {!active && (
            <span
              className="pointer-events-none absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg,rgba(184,134,11,0.06),rgba(184,134,11,0.02))',
                border: `1px solid ${FAINT}`,
              }}
            />
          )}
          <Icon size={18} className={active ? "text-white" : "text-[#B8860B]/70 group-hover:text-[#B8860B] transition-colors"} />
          <span className={`relative font-black uppercase tracking-widest ${item.small ? 'text-[9px]' : 'text-[11px]'}`}>{item.label}</span>
          {active && <motion.div layoutId="activeTab" className="relative ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
        </motion.button>
      )
    }

    return (
      <button
        onClick={() => navigate('/dashboard/' + item.id)}
        className="w-full flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-300"
        style={{
          background: active ? 'rgba(var(--dash-fg),0.06)' : 'transparent',
          color: active ? INK : DIM,
        }}
      >
        <Icon size={17} />
        <span className={`font-black uppercase tracking-widest ${item.small ? 'text-[9px]' : 'text-[11px]'}`}>{item.label}</span>
        {item.preview && (
          <span className="ml-auto text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-md" style={{ border: '1px solid rgba(184,134,11,0.3)', color: GOLDD, background: 'rgba(184,134,11,0.06)' }}>
            Soon
          </span>
        )}
        {active && !item.preview && <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: DIM }} />}
      </button>
    )
  }

  return (
    <div className="flex h-dvh overflow-hidden" style={{ background: SILVER, color: INK }}>
      {/* ── Sidebar — desktop only ─────────────────────────── */}
      <aside className="hidden lg:flex w-60 flex-col z-50 shrink-0" style={{ background: CARD, borderRight: `1px solid ${FAINT}` }}>
        {/* Logo */}
        <div className="px-6 py-6 mb-2 flex flex-col gap-2">
          <img src="/gu-icon.png" alt="GrounduP" className="h-10 w-10 object-contain flex-shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: DIM }}>Artist OS v4.0</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto pb-4">
          {/* MVP Core — the 6 pillars */}
          <p className="text-[8px] font-black uppercase tracking-[0.35em] px-2 pb-2 pt-2" style={{ color: 'rgba(184,134,11,0.5)' }}>Core</p>
          {MAIN_ITEMS.map(item => <SidebarNavItem key={item.id} item={item} />)}

          {/* Divider */}
          <div className="my-3" style={{ borderTop: `1px solid ${FAINT}` }} />

          {/* Preview tiles — coming soon */}
          <p className="text-[8px] font-black uppercase tracking-[0.35em] px-2 pb-2" style={{ color: 'rgba(var(--dash-fg),0.4)' }}>Coming Soon</p>
          {PREVIEW_ITEMS.map(item => <SidebarNavItem key={item.id} item={item} />)}
        </nav>

        <div className="p-6 space-y-4" style={{ borderTop: `1px solid ${FAINT}` }}>
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-colors"
            style={{ color: activeTab === 'profile' ? INK : DIM, background: activeTab === 'profile' ? 'rgba(var(--dash-fg),0.05)' : 'transparent' }}
          >
            <Settings size={20} />
            <span className="font-black text-[11px] uppercase tracking-widest">Settings</span>
          </button>
          <div className="p-6 rounded-3xl relative overflow-hidden group" style={{ background: CARD, border: `1px solid ${FAINT}`, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(184,134,11,0.08), transparent)' }} />
            <div className="relative flex items-center gap-3 mb-3">
              <Zap size={14} style={{ color: GOLDD }} />
              <span className="font-black text-[10px] uppercase tracking-widest">Growth Plan</span>
            </div>
            <p className="relative text-[10px] font-medium leading-relaxed mb-4" style={{ color: DIM }}>35 credits remaining this month.</p>
            <div className="relative w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(var(--dash-fg),0.08)' }}>
              <div className="h-full w-2/3" style={{ background: GOLD }} />
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        {/* Header */}
        <header className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-10 backdrop-blur-md relative z-40 shrink-0" style={{ borderBottom: `1px solid ${FAINT}`, background: 'rgba(var(--dash-fg-inv), 0.7)' }}>
          {/* Mobile: logo */}
          <div className="flex lg:hidden items-center gap-3">
            <img src="/gu-logo.png" alt="GrounduP" className="h-8 w-auto" />
          </div>

          {/* Desktop: search */}
          <div className="hidden lg:flex items-center gap-4 px-5 py-2.5 rounded-2xl w-80" style={{ background: 'rgba(var(--dash-fg),0.04)', border: `1px solid ${FAINT}` }}>
            <Search size={14} style={{ color: 'rgba(var(--dash-fg),0.52)' }} className="shrink-0" />
            <input
              type="text"
              placeholder="Search tasks, releases, team..."
              className="bg-transparent border-none outline-none text-xs font-bold w-full"
              style={{ color: INK }}
            />
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <PlanBadge onClick={() => navigate('/dashboard/profile')} />
            <ThemeToggle />
            <button className="relative transition-colors" style={{ color: DIM }}>
              <Bell size={18} />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full" style={{ background: GOLD, border: '1px solid rgb(var(--dash-fg-inv))' }} />
            </button>
            <div className="h-6 w-px hidden lg:block" style={{ background: FAINT }} />
            {/* User menu trigger */}
            <button
              ref={userBtnRef}
              onClick={toggleUserMenu}
              className="flex items-center gap-3 group transition-all rounded-2xl px-2 py-1.5"
              style={{ background: userMenuOpen ? 'rgba(var(--dash-fg),0.05)' : 'transparent' }}
            >
              <div className="hidden lg:block text-right">
                <p className="font-black text-xs tracking-tight uppercase transition-colors" style={{ color: userMenuOpen ? GOLDD : INK }}>
                  {displayName}
                </p>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: DIM }}>Artist Account</p>
              </div>
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-sm uppercase" style={{ background: 'rgba(184,134,11,0.1)', border: '1px solid rgba(184,134,11,0.25)', color: GOLDD }}>
                {displayName[0]}
              </div>
              <ChevronDown
                size={13}
                className={`hidden lg:block transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                style={{ color: userMenuOpen ? GOLDD : DIM }}
              />
            </button>

            {/* User dropdown — rendered via fixed positioning to escape overflow */}
            <AnimatePresence>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[150]" onClick={() => setUserMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -6 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, background: CARD, border: `1px solid ${FAINT}`, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
                    className="z-[200] w-52 rounded-2xl overflow-hidden"
                  >
                    {/* Account info header */}
                    <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${FAINT}` }}>
                      <p className="font-black text-[11px] uppercase tracking-widest truncate" style={{ color: INK }}>{displayName}</p>
                      <p className="text-[10px] font-medium truncate mt-0.5" style={{ color: DIM }}>{user?.email}</p>
                    </div>

                    {/* Settings */}
                    <button
                      onClick={() => { setUserMenuOpen(false); navigate('/dashboard/profile') }}
                      className="w-full flex items-center gap-3 px-4 py-3 transition-all text-[11px] font-black uppercase tracking-widest dash-hover-surface"
                      style={{ color: DIM }}
                    >
                      <Settings size={13} style={{ color: 'rgba(var(--dash-fg),0.56)' }} />
                      Settings
                    </button>

                    {/* Sign out — kept red; a destructive-action color, not decorative */}
                    <div style={{ borderTop: `1px solid ${FAINT}` }}>
                      <button
                        onClick={() => { setUserMenuOpen(false); signOut() }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500/80 hover:text-red-600 hover:bg-red-500/5 transition-all text-[11px] font-black uppercase tracking-widest"
                      >
                        <LogOut size={13} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Content — extra bottom padding on mobile for the nav bar */}
        <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-8 lg:py-8 pb-24 lg:pb-8 relative">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* ── Bottom nav — mobile only ────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', background: 'rgba(var(--dash-fg-inv), 0.95)', borderTop: `1px solid ${FAINT}` }}
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
                  <span className="absolute top-1 right-2 w-1 h-1 rounded-full" style={{ background: 'rgba(184,134,11,0.5)' }} />
                )}
                <Icon size={22} style={{ color: active ? GOLDD : 'rgba(var(--dash-fg),0.56)' }} className="transition-colors" />
                <span className="text-[9px] font-black uppercase tracking-wide transition-colors" style={{ color: active ? GOLDD : 'rgba(var(--dash-fg),0.4)' }}>
                  {item.id === 'home' ? 'Home' : item.id === 'learn' ? 'Learn' : item.id === 'rollouts' ? 'Releases' : item.label.split(' ')[0]}
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
              style={{ color: isMoreActive || moreOpen ? GOLDD : 'rgba(var(--dash-fg),0.56)' }}
              className="transition-colors"
            />
            <span className="text-[9px] font-black uppercase tracking-wide transition-colors" style={{ color: isMoreActive || moreOpen ? GOLDD : 'rgba(var(--dash-fg),0.4)' }}>
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
              className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)', background: CARD, borderTop: `1px solid ${FAINT}` }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${FAINT}` }}>
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: DIM }}>More Tools</p>
                <button onClick={() => setMoreOpen(false)} className="transition-colors" style={{ color: DIM }}>
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
                      className={active ? "gradient-button gradient-button-active flex items-center gap-3 p-4 rounded-2xl transition-all" : "flex items-center gap-3 p-4 rounded-2xl border transition-all dash-hover-border"}
                      style={active ? undefined : { background: 'rgba(var(--dash-fg),0.02)', borderColor: FAINT }}
                    >
                      <Icon size={18} style={{ color: active ? '#fff' : DIM }} />
                      <span className="font-black text-[11px] uppercase tracking-wide" style={{ color: active ? '#fff' : INK }}>
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
