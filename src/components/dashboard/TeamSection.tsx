import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Crown, Briefcase, Mic2, Mail, X, Trash2 } from 'lucide-react';

type MemberRole = 'Artist' | 'Manager' | 'A&R' | 'Producer' | 'Marketing' | 'PR';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  joinedAt: string;
}

const ROLE_META: Record<MemberRole, { icon: React.ReactNode; color: string; bg: string }> = {
  Artist:    { icon: <Mic2 size={14} />,     color: 'text-[#FFD700]',  bg: 'bg-[#FFD700]/10 border-[#FFD700]/20' },
  Manager:   { icon: <Crown size={14} />,    color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20' },
  'A&R':     { icon: <Briefcase size={14} />, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  Producer:  { icon: <Mic2 size={14} />,     color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20' },
  Marketing: { icon: <Mail size={14} />,     color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  PR:        { icon: <Mail size={14} />,     color: 'text-pink-400',   bg: 'bg-pink-400/10 border-pink-400/20' },
};

function uid() { return Math.random().toString(36).slice(2); }

export function TeamSection() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Manager' as MemberRole });
  const [sent, setSent] = useState(false);

  function invite() {
    if (!form.name || !form.email) return;
    const m: TeamMember = {
      id: uid(),
      name: form.name,
      email: form.email,
      role: form.role,
      joinedAt: new Date().toISOString(),
    };
    setMembers(prev => [...prev, m]);
    setForm({ name: '', email: '', role: 'Manager' });
    setSent(true);
    setTimeout(() => { setSent(false); setShowInvite(false); }, 1500);
  }

  function remove(id: string) {
    setMembers(prev => prev.filter(m => m.id !== id));
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Team</h1>
          <p className="text-white/30 text-sm font-bold">
            {members.length === 0 ? 'No team members yet.' : `${members.length} member${members.length > 1 ? 's' : ''} on your team`}
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-3 px-6 py-3 bg-[#FFD700] text-black rounded-2xl font-black text-[11px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,215,0,0.2)]"
        >
          <Plus size={16} /> Invite Member
        </button>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
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
                <h3 className="text-white font-black text-xl uppercase tracking-tighter">Invite Team Member</h3>
                <button onClick={() => setShowInvite(false)} className="text-white/30 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-[#FFD700]/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Mail size={28} className="text-[#FFD700]" />
                  </div>
                  <p className="text-white font-black text-lg uppercase tracking-tighter">Invite Sent!</p>
                  <p className="text-white/30 text-sm font-medium mt-2">Added to your team.</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="wait-input"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="wait-input"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(ROLE_META) as MemberRole[]).map(r => (
                      <button
                        key={r}
                        onClick={() => setForm(f => ({ ...f, role: r }))}
                        className={`p-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          form.role === r
                            ? `${ROLE_META[r].bg} ${ROLE_META[r].color}`
                            : 'bg-zinc-800 border-white/5 text-white/30 hover:text-white'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={invite}
                    disabled={!form.name || !form.email}
                    className="w-full py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none mt-2"
                  >
                    Send Invite
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {members.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-32 text-center"
        >
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
            <Users size={32} className="text-white/20" />
          </div>
          <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-3">Build Your Team</h3>
          <p className="text-white/30 font-medium text-sm max-w-xs mb-8">
            Invite your manager, A&R, producer, or marketing team. Everyone sees the same rollout timeline.
          </p>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-3 px-6 py-3 border border-[#FFD700]/40 text-[#FFD700] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#FFD700]/10 transition-all"
          >
            <Plus size={14} /> Invite First Member
          </button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Members</p>
          {members.map(m => {
            const meta = ROLE_META[m.role];
            return (
              <motion.div
                key={m.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-5 p-5 bg-zinc-900/40 border border-white/5 rounded-2xl group hover:border-white/10 transition-all"
              >
                <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-white text-lg uppercase">
                  {m.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm uppercase tracking-tight">{m.name}</p>
                  <p className="text-white/30 text-[11px] font-medium truncate">{m.email}</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${meta.bg} ${meta.color}`}>
                  {meta.icon} {m.role}
                </div>
                <button
                  onClick={() => remove(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all ml-2"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
