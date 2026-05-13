import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Trash2, ChevronRight, CheckSquare, Square, X, Disc3, Layers, Music, ListMusic } from 'lucide-react';

type ReleaseType = 'Single' | 'EP' | 'Album' | 'Mixtape';

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

interface Release {
  id: string;
  title: string;
  type: ReleaseType;
  date: string;
  checklist: ChecklistItem[];
}

const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { label: 'Finalize masters', done: false },
  { label: 'Submit to distributors', done: false },
  { label: 'Upload cover art', done: false },
  { label: 'Schedule social posts', done: false },
  { label: 'Pitch to playlists', done: false },
  { label: 'Send to press contacts', done: false },
];

const TYPE_META: Record<ReleaseType, { color: string; bg: string; border: string; icon: React.ReactNode; desc: string }> = {
  Single:  { color: 'text-[#FFD700]',  bg: 'bg-[#FFD700]/10',  border: 'border-[#FFD700]/20',  icon: <Disc3 size={28} />,    desc: 'One track, one moment. Perfect for testing an idea or building momentum.' },
  EP:      { color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   icon: <Layers size={28} />,   desc: '3–6 tracks. Introduce a sound or chapter without full album pressure.' },
  Album:   { color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: <Music size={28} />,    desc: 'Your full statement. Plan the rollout months in advance.' },
  Mixtape: { color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20',  icon: <ListMusic size={28} />, desc: 'Raw, uncut, no label needed. Rapid fire and community-first.' },
};

function uid() { return Math.random().toString(36).slice(2); }

export function RolloutsSection() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', type: 'Single' as ReleaseType, date: '' });

  function addRelease() {
    if (!form.title || !form.date) return;
    const r: Release = {
      id: uid(),
      title: form.title,
      type: form.type,
      date: form.date,
      checklist: DEFAULT_CHECKLIST.map(c => ({ ...c, id: uid() })),
    };
    setReleases(prev => [...prev, r].sort((a, b) => a.date.localeCompare(b.date)));
    setForm({ title: '', type: 'Single', date: '' });
    setShowForm(false);
    setSelected(r.id);
  }

  function toggleCheck(releaseId: string, itemId: string) {
    setReleases(prev => prev.map(r =>
      r.id === releaseId
        ? { ...r, checklist: r.checklist.map(c => c.id === itemId ? { ...c, done: !c.done } : c) }
        : r
    ));
  }

  function deleteRelease(id: string) {
    setReleases(prev => prev.filter(r => r.id !== id));
    if (selected === id) setSelected(null);
  }

  const activeRelease = releases.find(r => r.id === selected);
  const completedCount = activeRelease?.checklist.filter(c => c.done).length ?? 0;
  const totalCount = activeRelease?.checklist.length ?? 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const TYPE_COLORS: Record<ReleaseType, string> = {
    Single: 'bg-[#FFD700]/20 text-[#FFD700]',
    EP: 'bg-blue-500/20 text-blue-400',
    Album: 'bg-purple-500/20 text-purple-400',
    Mixtape: 'bg-green-500/20 text-green-400',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Rollouts</h1>
          <p className="text-white/30 text-sm font-bold">
            {releases.length === 0 ? 'No releases planned yet.' : `${releases.length} release${releases.length > 1 ? 's' : ''} in pipeline`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-3 px-6 py-3 bg-[#FFD700] text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,215,0,0.2)]"
        >
          <Plus size={16} /> Add Release
        </button>
      </div>

      {/* Add Release Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-white font-black text-xl uppercase tracking-tighter">New Release</h3>
                <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Release Title"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="wait-input"
                />
                <div className="grid grid-cols-2 gap-3">
                  {(['Single', 'EP', 'Album', 'Mixtape'] as ReleaseType[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setForm(f => ({ ...f, type: t }))}
                      className={`p-4 rounded-2xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                        form.type === t ? 'bg-[#FFD700] border-transparent text-black' : 'bg-zinc-800 border-white/5 text-white/40 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="wait-input"
                />
                <button
                  onClick={addRelease}
                  disabled={!form.title || !form.date}
                  className="w-full py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none mt-4"
                >
                  Create Release
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {releases.length === 0 ? (
        /* Type Card Empty States */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Choose a release type to get started</p>
          <div className="grid grid-cols-2 gap-5">
            {(Object.keys(TYPE_META) as ReleaseType[]).map(type => {
              const meta = TYPE_META[type];
              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setForm(f => ({ ...f, type })); setShowForm(true); }}
                  className={`group flex flex-col items-start p-8 rounded-3xl border ${meta.bg} ${meta.border} hover:shadow-[0_0_40px_rgba(0,0,0,0.4)] transition-all duration-300 text-left`}
                >
                  <div className={`mb-5 ${meta.color}`}>{meta.icon}</div>
                  <p className={`font-black text-xl uppercase tracking-tighter mb-2 ${meta.color}`}>{type}</p>
                  <p className="text-white/30 text-[11px] font-medium leading-relaxed mb-6">{meta.desc}</p>
                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${meta.color} group-hover:translate-x-1 transition-transform`}>
                    Plan {type} <ChevronRight size={12} />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-12 gap-6">
          {/* Release List */}
          <div className="col-span-4 space-y-3">
            <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Pipeline</p>
            {releases.map(r => (
              <motion.button
                key={r.id}
                layout
                onClick={() => setSelected(r.id)}
                className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 group ${
                  selected === r.id
                    ? 'bg-zinc-900 border-[#FFD700]/40 shadow-[0_0_30px_rgba(255,215,0,0.08)]'
                    : 'bg-zinc-900/30 border-white/5 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${TYPE_COLORS[r.type]}`}>{r.type}</span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteRelease(r.id); }}
                    className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <p className="text-white font-black text-sm uppercase tracking-tight mb-1">{r.title}</p>
                <div className="flex items-center gap-2 text-white/30">
                  <Calendar size={10} />
                  <span className="text-[10px] font-bold">{new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FFD700] transition-all duration-500"
                    style={{ width: `${(r.checklist.filter(c => c.done).length / r.checklist.length) * 100}%` }}
                  />
                </div>
              </motion.button>
            ))}
          </div>

          {/* Checklist Panel */}
          <div className="col-span-8">
            <AnimatePresence mode="wait">
              {activeRelease ? (
                <motion.div
                  key={activeRelease.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg inline-block mb-3 ${TYPE_COLORS[activeRelease.type]}`}>{activeRelease.type}</p>
                      <h3 className="text-white font-black text-3xl uppercase tracking-tighter">{activeRelease.title}</h3>
                      <p className="text-white/30 text-sm font-bold mt-1 flex items-center gap-2">
                        <Calendar size={12} />
                        {new Date(activeRelease.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#FFD700] font-black text-3xl">{Math.round(progress)}%</p>
                      <p className="text-white/20 text-[10px] font-black uppercase tracking-widest">{completedCount}/{totalCount} done</p>
                    </div>
                  </div>

                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-8">
                    <motion.div
                      className="h-full bg-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.4)]"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Rollout Checklist</p>
                    {activeRelease.checklist.map(item => (
                      <button
                        key={item.id}
                        onClick={() => toggleCheck(activeRelease.id, item.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left group ${
                          item.done
                            ? 'bg-[#FFD700]/10 border-[#FFD700]/20'
                            : 'bg-zinc-900/40 border-white/5 hover:border-white/20'
                        }`}
                      >
                        {item.done
                          ? <CheckSquare size={18} className="text-[#FFD700] shrink-0" />
                          : <Square size={18} className="text-white/20 group-hover:text-white/40 shrink-0 transition-colors" />
                        }
                        <span className={`font-bold text-sm ${item.done ? 'text-white/40 line-through' : 'text-white/80'}`}>
                          {item.label}
                        </span>
                        {item.done && <ChevronRight size={14} className="text-[#FFD700] ml-auto" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full py-24 text-center"
                >
                  <p className="text-white/20 font-black text-sm uppercase tracking-widest">Select a release to view checklist</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
