import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Grid, Calendar, Users, Image as ImageIcon, Settings,
  Plus, TrendingUp, Rocket, BarChart2, X, CheckSquare, Square,
  Music2, Crown, Briefcase,
} from 'lucide-react';

type MockTab = 'Dashboard' | 'Rollouts' | 'Analytics' | 'Team';

const EVENT_TYPES = [
  'Promotional Campaign', 'Interview', 'TikTok Post',
  'Blog Post', 'Twitter Promotion', 'Release', 'PR Outreach', 'Team Meeting',
];

const MOCK_EVENTS = [
  { day: 5,  title: 'Album Artwork Due', color: 'bg-[#FFD700]/20 text-[#FFD700]' },
  { day: 12, title: 'Release: Midnight Sun', color: 'bg-[#FFD700] text-black' },
  { day: 18, title: 'TikTok Campaign', color: 'bg-pink-500/20 text-pink-300' },
  { day: 22, title: 'Press Kit Delivery', color: 'bg-blue-500/20 text-blue-300' },
];

const MOCK_TASKS = [
  { label: 'Finalize masters w/ mixer', done: true },
  { label: 'Submit to distributors', done: true },
  { label: 'Brief press contacts', done: false },
];

const MOCK_BARS = [38, 52, 44, 70, 55, 82, 61, 74, 58, 88, 72, 95];

const MOCK_TEAM = [
  { name: 'Maya Chen',     role: 'Manager',  color: 'text-blue-400',   bg: 'bg-blue-400/10',   icon: <Crown size={12} /> },
  { name: 'Darius Scott',  role: 'Producer', color: 'text-green-400',  bg: 'bg-green-400/10',  icon: <Music2 size={12} /> },
  { name: 'Lexi Park',     role: 'Marketing',color: 'text-orange-400', bg: 'bg-orange-400/10', icon: <Briefcase size={12} /> },
];

const MOCK_CHECKLIST = [
  { label: 'Finalize masters', done: true },
  { label: 'Submit to distributors', done: true },
  { label: 'Upload cover art', done: true },
  { label: 'Schedule social posts', done: true },
  { label: 'Pitch to playlists', done: false },
  { label: 'Send to press contacts', done: false },
];

interface CalendarEvent { day: number; title: string; color: string }

function AddEventModal({ onClose, onSave }: { onClose: () => void; onSave: (ev: CalendarEvent) => void }) {
  const [title, setTitle] = useState('');
  const [day, setDay] = useState('');
  const [type, setType] = useState(EVENT_TYPES[0]);

  function save() {
    if (!title || !day) return;
    onSave({ day: Number(day), title, color: 'bg-[#FFD700]/20 text-[#FFD700]' });
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-black text-xl uppercase tracking-tighter">Add Event</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <input
            type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-sm outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20"
          />
          <div className="grid grid-cols-2 gap-2">
            {EVENT_TYPES.map(t => (
              <button
                key={t} onClick={() => setType(t)}
                className={`p-3 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all text-left ${
                  type === t ? 'bg-[#FFD700] border-transparent text-black' : 'bg-zinc-800 border-white/5 text-white/40 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <input
            type="number" min={1} max={31} placeholder="Day (1–31)" value={day} onChange={e => setDay(e.target.value)}
            className="w-full bg-zinc-800 border border-white/10 rounded-2xl px-5 py-4 text-white font-bold text-sm outline-none focus:border-[#FFD700]/40 transition-all placeholder:text-white/20"
          />
          <button
            onClick={save} disabled={!title || !day}
            className="w-full py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:scale-105 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            Add to Calendar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DashboardTab() {
  const allEvents = MOCK_EVENTS;

  return (
    <div className="flex flex-col sm:flex-row gap-6">
      {/* Calendar */}
      <div className="flex-1 bg-zinc-900/20 rounded-[28px] border border-white/5 p-5 sm:p-8 min-w-0">
        <div className="grid grid-cols-7 gap-1 sm:gap-4 text-center text-[9px] sm:text-[10px] font-black text-white/20 uppercase tracking-widest mb-4 sm:mb-6">
          {['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {[...Array(28)].map((_, i) => {
            const dayNum = i + 1;
            const ev = allEvents.find(e => e.day === dayNum);
            return (
              <div
                key={i}
                className={`relative flex flex-col items-center justify-start rounded-lg sm:rounded-xl p-1 sm:p-2 min-h-[32px] sm:min-h-[52px] transition-all ${
                  ev ? 'bg-white/5 border border-white/10' : 'border border-transparent hover:bg-white/5'
                }`}
              >
                <span className={`text-[9px] sm:text-xs font-black ${ev ? 'text-white' : 'text-white/30'}`}>{dayNum}</span>
                {ev && (
                  <div className={`hidden sm:block mt-1 w-full px-1 py-0.5 rounded text-[7px] font-black leading-tight uppercase truncate ${ev.color}`}>
                    {ev.title.split(':')[0]}
                  </div>
                )}
                {ev && <div className="sm:hidden w-1 h-1 bg-[#FFD700] rounded-full mt-0.5" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tasks */}
      <div className="w-full sm:w-52 shrink-0 space-y-3">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Live Tasks</p>
        <div className="space-y-2">
          {MOCK_TASKS.map((task, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
              task.done ? 'bg-[#FFD700]/10 border-[#FFD700]/20' : 'bg-zinc-900/40 border-white/5'
            }`}>
              {task.done
                ? <CheckSquare size={14} className="text-[#FFD700] shrink-0" />
                : <Square size={14} className="text-white/20 shrink-0" />
              }
              <span className={`text-[10px] font-bold leading-tight ${task.done ? 'text-white/40 line-through' : 'text-white/70'}`}>
                {task.label}
              </span>
            </div>
          ))}
        </div>
        <div className="w-full py-3 rounded-2xl bg-zinc-900/60 border border-white/5 text-white/20 text-[10px] font-black uppercase tracking-widest text-center">
          View Only
        </div>
      </div>
    </div>
  );
}

function RolloutsTab() {
  const progress = (MOCK_CHECKLIST.filter(c => c.done).length / MOCK_CHECKLIST.length) * 100;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between p-5 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#FFD700]/20 text-[#FFD700]">Single</span>
          </div>
          <p className="text-white font-black text-base uppercase tracking-tighter">Midnight Sun</p>
          <p className="text-white/40 text-[10px] font-bold mt-0.5 flex items-center gap-1">
            <Calendar size={9} /> June 14, 2026
          </p>
        </div>
        <div className="text-right">
          <p className="text-[#FFD700] font-black text-2xl">{Math.round(progress)}%</p>
          <p className="text-white/20 text-[9px] font-black uppercase tracking-widest">
            {MOCK_CHECKLIST.filter(c => c.done).length}/{MOCK_CHECKLIST.length} done
          </p>
        </div>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.4)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <div className="space-y-2">
        {MOCK_CHECKLIST.map((item, i) => (
          <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
            item.done ? 'bg-[#FFD700]/10 border-[#FFD700]/20' : 'bg-zinc-900/40 border-white/5'
          }`}>
            {item.done
              ? <CheckSquare size={14} className="text-[#FFD700] shrink-0" />
              : <Square size={14} className="text-white/20 shrink-0" />
            }
            <span className={`text-[11px] font-bold ${item.done ? 'text-white/40 line-through' : 'text-white/70'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AnalyticsTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Streams', val: '1.2M', color: 'text-green-400' },
          { label: 'Listeners', val: '847K', color: 'text-[#FFD700]' },
          { label: 'Followers', val: '24.5K', color: 'text-pink-400' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 text-center">
            <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${s.color}`}>{s.label}</p>
            <p className="text-white font-black text-xl tracking-tighter">{s.val}</p>
          </div>
        ))}
      </div>
      <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <BarChart2 size={12} /> Stream Trend · 30 days
          </p>
          <span className="text-green-400 text-[10px] font-black">↑ 23%</span>
        </div>
        <div className="flex items-end gap-1 h-20">
          {MOCK_BARS.map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-[#FFD700]/30 rounded-sm"
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: 'easeOut' }}
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-3">
          <p className="text-white/20 text-[9px] font-bold uppercase tracking-widest">May 2026</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
            <p className="text-green-400 text-[9px] font-black uppercase tracking-widest">Spotify Connected</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'YT Views', val: '318K', sub: 'YouTube' },
          { label: 'TikTok Uses', val: '9.4K', sub: 'TikTok' },
        ].map(s => (
          <div key={s.label} className="bg-zinc-900/20 border border-white/5 rounded-2xl p-4">
            <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-white font-black text-xl tracking-tighter">{s.val}</p>
            <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function TeamTab() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Your Team · 3 Members</p>
      {MOCK_TEAM.map((m, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-zinc-900/40 border border-white/5 rounded-2xl">
          <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-white text-sm uppercase shrink-0">
            {m.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm uppercase tracking-tight truncate">{m.name}</p>
            <p className="text-white/30 text-[10px] font-medium">{m.role}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${m.bg} border border-white/5 ${m.color} text-[9px] font-black uppercase tracking-wide shrink-0`}>
            {m.icon} {m.role}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 p-4 border border-dashed border-white/10 rounded-2xl">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
          <Plus size={16} className="text-white/20" />
        </div>
        <p className="text-white/20 text-[11px] font-black uppercase tracking-widest">Invite team member</p>
      </div>
    </motion.div>
  );
}

export function TeamDashboardMockup() {
  const [activeTab, setActiveTab] = useState<MockTab>('Dashboard');

  const TABS: MockTab[] = ['Dashboard', 'Rollouts', 'Analytics', 'Team'];

  const TAB_ICONS: Record<MockTab, React.ReactNode> = {
    Dashboard: <Grid size={12} />,
    Rollouts:  <Rocket size={12} />,
    Analytics: <TrendingUp size={12} />,
    Team:      <Users size={12} />,
  };

  return (
    <div className="w-full mx-auto bg-zinc-950 rounded-[32px] sm:rounded-[40px] border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-4 sm:px-8 pt-5 sm:pt-8 pb-4 sm:pb-6">
        <div className="flex items-center gap-3 sm:gap-5">
          <img src="/gu-logo.png" alt="GrounduP" className="h-8 sm:h-10 w-auto" />
          <div className="hidden sm:block">
            <h3 className="text-white font-black text-lg tracking-tighter uppercase">GrounduP</h3>
            <p className="text-[#FFD700] text-[9px] font-black tracking-[0.25em] opacity-80">MANAGEMENT OS</p>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex items-center gap-0.5 sm:gap-1 bg-zinc-900/60 border border-white/5 rounded-xl sm:rounded-2xl p-0.5 sm:p-1">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-[#FFD700] text-black shadow-[0_4px_20px_rgba(255,215,0,0.2)]'
                  : 'text-white/30 hover:text-white'
              }`}
            >
              {TAB_ICONS[tab]}
              <span className="hidden sm:inline">{tab}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex bg-zinc-900/50 px-4 py-2 rounded-full border border-white/5 items-center gap-3">
            <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_10px_#FFD700]" />
            <span className="text-white/40 font-black text-[10px] tracking-widest">LIVE</span>
          </div>
          <div className="w-2 h-2 bg-[#FFD700] rounded-full animate-pulse shadow-[0_0_10px_#FFD700] sm:hidden" />
          <Bell className="text-white/20 hover:text-white transition-colors cursor-pointer" size={16} />
        </div>
      </div>

      <div className="flex gap-0 sm:gap-8 px-4 sm:px-8 pb-6 sm:pb-10">
        {/* Sidebar Icons - desktop only */}
        <div className="hidden sm:flex flex-col gap-6 pt-2 border-r border-white/5 pr-8 shrink-0">
          {[Grid, Calendar, Users, ImageIcon].map((Icon, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-2xl transition-colors cursor-pointer ${
                i === TABS.indexOf(activeTab)
                  ? 'text-[#FFD700] bg-[#FFD700]/10'
                  : 'text-white/20 hover:text-white/60'
              }`}
              onClick={() => setActiveTab(TABS[i] ?? 'Dashboard')}
            >
              <Icon size={20} />
            </div>
          ))}
          <div className="mt-auto text-white/10 hover:text-white/40 transition-colors cursor-pointer p-2.5">
            <Settings size={20} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 sm:mb-8">
            <div>
              <h2 className="text-white text-2xl sm:text-4xl font-black mb-1 tracking-tighter leading-none">{activeTab}</h2>
              <p className="text-white/20 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em]">
                Artist OS · <span className="text-[#FFD700]">Ready</span>
              </p>
            </div>
            {activeTab === 'Dashboard' && (
              <div className="flex gap-2 sm:gap-3">
                <button className="hidden sm:block px-5 py-3 bg-zinc-900 border border-white/10 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all">Export</button>
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
              {activeTab === 'Dashboard' && (
                <DashboardTab />
              )}
              {activeTab === 'Rollouts'  && <RolloutsTab />}
              {activeTab === 'Analytics' && <AnalyticsTab />}
              {activeTab === 'Team'      && <TeamTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
