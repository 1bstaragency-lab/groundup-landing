"use client"

import { type ReactNode } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, 
  BookOpen, 
  Calendar, 
  Layout, 
  User, 
  Settings, 
  Bell,
  Search,
  Zap
} from "lucide-react"

interface DashboardShellProps {
  children: ReactNode
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function DashboardShell({ children, activeTab, setActiveTab }: DashboardShellProps) {
  const MENU_ITEMS = [
    { id: "home", label: "Dashboard", icon: <Home size={20} /> },
    { id: "learn", label: "Learn & DB", icon: <BookOpen size={20} /> },
    { id: "scheduler", label: "Scheduler", icon: <Calendar size={20} /> },
    { id: "studio", label: "Content Studio", icon: <Layout size={20} /> },
    { id: "profile", label: "Artist Profile", icon: <User size={20} /> }
  ]

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-black border-r border-white/5 flex flex-col z-50">
        <div className="p-8 flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-[#FFD700] rounded-2xl flex items-center justify-center font-black text-black text-xl shadow-[0_0_30px_rgba(255,215,0,0.2)]">uP</div>
          <div className="flex flex-col">
            <span className="text-white font-black text-sm tracking-tighter">GROUNDUP</span>
            <span className="text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">Artist OS v4.0</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? "bg-[#FFD700] text-black" 
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`${activeTab === item.id ? "text-black" : "text-inherit"}`}>{item.icon}</span>
              <span className="font-black text-[11px] uppercase tracking-widest">{item.label}</span>
              {activeTab === item.id && (
                <motion.div 
                  layoutId="activeTab" 
                  className="ml-auto w-1.5 h-1.5 bg-black rounded-full" 
                />
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-white/20 hover:text-white transition-colors group">
            <Settings size={20} />
            <span className="font-black text-[11px] uppercase tracking-widest">Settings</span>
          </button>
          <div className="bg-zinc-900/50 p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 mb-3">
              <Zap size={14} className="text-[#FFD700]" />
              <span className="text-white font-black text-[10px] uppercase tracking-widest">Growth Plan</span>
            </div>
            <p className="text-white/40 text-[10px] font-medium leading-relaxed mb-4">You have 35 credits remaining this month.</p>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
               <div className="bg-[#FFD700] h-full w-2/3" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-black/50 backdrop-blur-md relative z-40">
           <div className="flex items-center gap-6 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 w-96">
              <Search size={16} className="text-white/20" />
              <input type="text" placeholder="Search patterns, assets, or tasks..." className="bg-transparent border-none outline-none text-xs font-bold text-white w-full placeholder:text-white/10" />
           </div>

           <div className="flex items-center gap-8">
              <button className="relative text-white/40 hover:text-white transition-colors">
                 <Bell size={20} />
                 <span className="absolute top-0 right-0 w-2 h-2 bg-[#FFD700] rounded-full border-2 border-black" />
              </button>
              <div className="h-10 w-px bg-white/5" />
              <div className="flex items-center gap-4 group cursor-pointer">
                 <div className="text-right">
                    <p className="text-white font-black text-xs tracking-tight group-hover:text-[#FFD700] transition-colors uppercase">ELARA</p>
                    <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">Artist Account</p>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 p-1">
                    <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover rounded-xl" alt="Artist Profile" />
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-12 relative">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
               className="h-full"
             >
               {children}
             </motion.div>
           </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
