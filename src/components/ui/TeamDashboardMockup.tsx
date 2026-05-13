import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Grid, Calendar, Users, Image as ImageIcon, Settings, Plus, TrendingUp, Rocket, BarChart2 } from 'lucide-react';

type MockTab = 'Dashboard' | 'Rollouts' | 'Analytics' | 'Team';

function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-16 h-16 bg-zinc-900 rounded-3xl flex items-center justify-center mb-4 border border-white/5">
        {icon}
      </div>
      <p className="text-white font-black text-base uppercase tracking-tighter mb-2">{title}</p>
      <p className="text-white/20 text-xs font-medium max-w-[200px] leading-relaxed">{sub}</p>
      <button className="mt-5 flex items-center gap-2 px-5 py-2.5 border border-[#FFD700]/30 text-[#FFD700] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#FFD700]/10 transition-all">
        <Plus size={12} /> Get Started
      </button>
    </motion.div>
  );
}

function DashboardTab() {
  return (
    <div className="flex gap-8">
      {/* Calendar */}
      <div className="flex-1 bg-zinc-900/20 rounded-[32px] border border-white/5 p-8">
        <div className="grid grid-cols-7 gap-6 text-center text-[10px] font-black text-white/20 uppercase tracking-widest mb-8">
          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
        </div>
        <div className="grid grid-cols-7 gap-y-8 gap-x-6 text-center">
          {[...Array(31)].map((_, i) => (
            <div key={i} className="relative flex items-center justify-center aspect-square text-sm font-black text-white/20">
              <span className="relative z-10">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-white/20">
          <Calendar size={14} />
          <span className="text-[11px] font-bold uppercase tracking-widest">No releases scheduled</span>
        </div>
      </div>

      {/* Tasks */}
      <div className="w-56 space-y-4">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Live Tasks</p>
        <div className="flex flex-col items-center justify-center py-10 text-center border border-white/5 rounded-3xl bg-zinc-900/20">
          <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center mb-3">
            <Grid size={16} className="text-white/20" />
          </div>
          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest leading-relaxed">No tasks yet</p>
        </div>
        <button className="w-full py-3.5 bg-[#FFD700] rounded-2xl text-black font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,215,0,0.15)] flex items-center justify-center gap-2">
          <Plus size={12} /> Add Task
        </button>
      </div>
    </div>
  );
}

function RolloutsTab() {
  return (
    <EmptyState
      icon={<Rocket size={28} className="text-white/20" />}
      title="No Releases Planned"
      sub="Add your first single, EP, or album to start your rollout timeline."
    />
  );
}

function AnalyticsTab() {
  const bars = [30, 45, 28, 60, 40, 55, 35, 50, 42, 65, 38, 70];
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {['Streams', 'Listeners', 'Followers'].map(label => (
          <div key={label} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-center">
            <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1">{label}</p>
            <p className="text-white font-black text-2xl tracking-tighter">—</p>
          </div>
        ))}
      </div>
      <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <BarChart2 size={12} /> Stream Trend
        </p>
        <div className="flex items-end gap-1.5 h-20">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 bg-[#FFD700]/10 rounded-sm" style={{ height: `${h}%` }} />
          ))}
        </div>
        <p className="text-white/10 text-center text-[10px] font-bold uppercase tracking-widest mt-3">Connect Spotify to see data</p>
      </div>
    </motion.div>
  );
}

function TeamTab() {
  return (
    <EmptyState
      icon={<Users size={28} className="text-white/20" />}
      title="No Team Members"
      sub="Invite your manager, A&R, or producer to collaborate on your rollouts."
    />
  );
}

export function TeamDashboardMockup() {
  const [activeTab, setActiveTab] = useState<MockTab>('Dashboard');

  const TABS: MockTab[] = ['Dashboard', 'Rollouts', 'Analytics', 'Team'];

  const TAB_ICONS: Record<MockTab, React.ReactNode> = {
    Dashboard: <Grid size={13} />,
    Rollouts:  <Rocket size={13} />,
    Analytics: <TrendingUp size={13} />,
    Team:      <Users size={13} />,
  };

  return (
    <div className="w-full mx-auto p-6 sm:p-10 bg-zinc-950 rounded-[40px] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-10 px-2">
        <div className="flex items-center gap-5">
          <img src="/gu-logo.png" alt="GrounduP" className="h-10 w-auto" />
          <div>
            <h3 className="text-white font-black text-lg tracking-tighter uppercase">GrounduP</h3>
            <p className="text-[#FFD700] text-[10px] font-black tracking-[0.25em] opacity-80">MANAGEMENT OS</p>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="hidden lg:flex items-center gap-1 bg-zinc-900/60 border border-white/5 rounded-2xl p-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-[#FFD700] text-black shadow-[0_4px_20px_rgba(255,215,0,0.2)]'
                  : 'text-white/30 hover:text-white'
              }`}
            >
              {TAB_ICONS[tab]} {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5 flex items-center gap-3">
            <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_10px_#FFD700]" />
            <span className="text-white/40 font-black text-[10px] tracking-widest">LIVE</span>
          </div>
          <Bell className="text-white/20 hover:text-white transition-colors cursor-pointer" size={20} />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Icons */}
        <div className="flex flex-col gap-8 pt-2 border-r border-white/5 pr-8 shrink-0">
          {[Grid, Calendar, Users, ImageIcon].map((Icon, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl transition-colors cursor-pointer ${
                i === TABS.indexOf(activeTab)
                  ? 'text-[#FFD700] bg-[#FFD700]/10'
                  : 'text-white/20 hover:text-white/60'
              }`}
              onClick={() => setActiveTab(TABS[i] ?? 'Dashboard')}
            >
              <Icon size={24} />
            </div>
          ))}
          <div className="mt-auto text-white/10 hover:text-white/40 transition-colors cursor-pointer p-3">
            <Settings size={24} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-white text-4xl lg:text-5xl font-black mb-2 tracking-tighter leading-none">{activeTab}</h2>
              <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.3em]">
                Artist OS · <span className="text-[#FFD700]">Ready</span>
              </p>
            </div>
            {activeTab === 'Dashboard' && (
              <div className="flex gap-3">
                <button className="px-5 py-3 bg-zinc-900 border border-white/10 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">Export</button>
                <button className="px-5 py-3 bg-[#FFD700] rounded-2xl text-black text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,215,0,0.2)] flex items-center gap-2">
                  <Plus size={14} /> Add Event
                </button>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'Dashboard'  && <DashboardTab />}
              {activeTab === 'Rollouts'   && <RolloutsTab />}
              {activeTab === 'Analytics'  && <AnalyticsTab />}
              {activeTab === 'Team'       && <TeamTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
