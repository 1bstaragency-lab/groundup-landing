import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Users, Crown, Briefcase, Mic2, Mail, X, Trash2, Shield, Star, Copy, Check, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

type MemberRole = 'Artist' | 'Manager' | 'A&R' | 'Producer' | 'Marketing' | 'PR';
type InviteStatus = 'pending' | 'accepted' | 'cancelled';

interface TeamInvite {
  id: string;
  invitee_email: string;
  invitee_name: string;
  role: MemberRole;
  status: InviteStatus;
  created_at: string;
  expires_at: string;
}

const ROLE_META: Record<MemberRole, { icon: React.ReactNode; color: string; bg: string }> = {
  Artist:    { icon: <Mic2 size={14} />,      color: 'text-[#FFD700]',  bg: 'bg-[#FFD700]/10 border-[#FFD700]/20' },
  Manager:   { icon: <Crown size={14} />,     color: 'text-blue-400',   bg: 'bg-blue-400/10 border-blue-400/20' },
  'A&R':     { icon: <Briefcase size={14} />, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  Producer:  { icon: <Mic2 size={14} />,      color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/20' },
  Marketing: { icon: <Mail size={14} />,      color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
  PR:        { icon: <Mail size={14} />,      color: 'text-pink-400',   bg: 'bg-pink-400/10 border-pink-400/20' },
};

export function TeamSection() {
  const { user, profile } = useAuth();
  const [invites, setInvites] = useState<TeamInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: 'Manager' as MemberRole });
  const [sending, setSending] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const displayName = profile?.artist_name ?? user?.artistName ?? user?.email?.split('@')[0] ?? 'Artist';

  const loadInvites = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('team_invites')
      .select('*')
      .eq('inviter_id', user.id)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false });
    if (data) setInvites(data as TeamInvite[]);
    setLoadingInvites(false);
  }, [user]);

  useEffect(() => { loadInvites(); }, [loadInvites]);

  async function sendInvite() {
    if (!form.name || !form.email || !user) return;
    setSending(true);
    setError('');
    const { data, error: err } = await supabase
      .from('team_invites')
      .insert({
        inviter_id: user.id,
        invitee_email: form.email.trim().toLowerCase(),
        invitee_name: form.name.trim(),
        role: form.role,
      })
      .select()
      .single();

    setSending(false);
    if (err || !data) {
      setError(err?.message ?? 'Failed to create invite. Try again.');
      return;
    }
    const link = `${window.location.origin}/join/${data.id}`;
    setInviteLink(link);
    setInvites(prev => [data as TeamInvite, ...prev]);
    setForm({ name: '', email: '', role: 'Manager' });
  }

  async function cancelInvite(id: string) {
    await supabase.from('team_invites').update({ status: 'cancelled' }).eq('id', id);
    setInvites(prev => prev.filter(i => i.id !== id));
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function closeModal() {
    setShowInvite(false);
    setInviteLink('');
    setError('');
    setForm({ name: '', email: '', role: 'Manager' });
  }

  const pending  = invites.filter(i => i.status === 'pending');
  const accepted = invites.filter(i => i.status === 'accepted');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-2">Team</h1>
          <p className="text-white/30 text-sm font-bold">
            {invites.length === 0 ? 'No team members yet.' : `${accepted.length} active · ${pending.length} pending`}
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
                <h3 className="text-white font-black text-xl uppercase tracking-tighter">
                  {inviteLink ? 'Share Invite Link' : 'Invite Team Member'}
                </h3>
                <button onClick={closeModal} className="text-white/30 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {inviteLink ? (
                /* ── Invite link view ── */
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex flex-col items-center text-center gap-3 py-2">
                    <div className="w-16 h-16 bg-[#FFD700]/20 rounded-3xl flex items-center justify-center border border-[#FFD700]/30">
                      <Mail size={26} className="text-[#FFD700]" />
                    </div>
                    <div>
                      <p className="text-white font-black text-lg uppercase tracking-tighter">Invite Created!</p>
                      <p className="text-white/30 text-sm font-medium mt-1">
                        Share this link with your team member. They'll create their account and get connected.
                      </p>
                    </div>
                  </div>

                  <div className="bg-zinc-950 border border-white/8 rounded-2xl p-4 flex items-center gap-3">
                    <p className="text-white/50 text-xs font-mono flex-1 truncate">{inviteLink}</p>
                    <button
                      onClick={copyLink}
                      className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-[#FFD700] text-black hover:bg-yellow-300'
                      }`}
                    >
                      {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>

                  <p className="text-white/20 text-[10px] font-bold text-center">Link expires in 7 days</p>

                  <button
                    onClick={closeModal}
                    className="w-full py-3 rounded-2xl border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all font-black text-[11px] uppercase tracking-widest"
                  >
                    Done
                  </button>
                </motion.div>
              ) : (
                /* ── Invite form ── */
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
                  <div>
                    <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-3">Role</p>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(ROLE_META) as MemberRole[]).filter(r => r !== 'Artist').map(r => (
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
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs font-bold uppercase tracking-widest">{error}</p>
                  )}

                  <button
                    onClick={sendInvite}
                    disabled={!form.name || !form.email || sending}
                    className="w-full py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none mt-2 flex items-center justify-center gap-2"
                  >
                    {sending ? <><Loader2 size={14} className="animate-spin" /> Creating Invite...</> : 'Generate Invite Link'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin card */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <Shield size={12} className="text-[#FFD700]" />
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">Admin Access</p>
        </div>
        <div className="flex items-center gap-5 p-5 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-2xl">
          <div className="w-12 h-12 bg-[#FFD700]/20 rounded-2xl flex items-center justify-center font-black text-[#FFD700] text-lg uppercase border border-[#FFD700]/30">
            {displayName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm uppercase tracking-tight">{displayName}</p>
            <p className="text-white/30 text-[11px] font-medium truncate">{user?.email ?? ''}</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest bg-[#FFD700]/10 border-[#FFD700]/20 text-[#FFD700]">
            <Star size={12} fill="currentColor" /> Artist · Admin
          </div>
        </div>
      </div>

      {/* Team list */}
      {loadingInvites ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={20} className="text-white/20 animate-spin" />
        </div>
      ) : invites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
            <Users size={32} className="text-white/20" />
          </div>
          <h3 className="text-white font-black text-2xl uppercase tracking-tighter mb-3">Build Your Team</h3>
          <p className="text-white/30 font-medium text-sm max-w-xs mb-8">
            Invite your manager, A&R, producer, or marketing team. Everyone gets a unique sign-up link.
          </p>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-3 px-6 py-3 border border-[#FFD700]/40 text-[#FFD700] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[#FFD700]/10 transition-all"
          >
            <Plus size={14} /> Invite First Member
          </button>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Accepted members */}
          {accepted.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={11} className="text-green-400" />
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Active Members</p>
              </div>
              {accepted.map(invite => {
                const meta = ROLE_META[invite.role];
                return (
                  <motion.div
                    key={invite.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-5 p-5 bg-zinc-900/40 border border-white/5 rounded-2xl group hover:border-white/10 transition-all"
                  >
                    <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-white text-lg uppercase">
                      {invite.invitee_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-black text-sm uppercase tracking-tight">{invite.invitee_name}</p>
                      <p className="text-white/30 text-[11px] font-medium truncate">{invite.invitee_email}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${meta.bg} ${meta.color}`}>
                      {meta.icon} {invite.role}
                    </div>
                    <button
                      onClick={() => cancelInvite(invite.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all ml-2"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pending invites */}
          {pending.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={11} className="text-white/30" />
                <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Pending Invites</p>
              </div>
              {pending.map(invite => {
                const meta = ROLE_META[invite.role];
                const inviteUrl = `${window.location.origin}/join/${invite.id}`;
                return (
                  <motion.div
                    key={invite.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-5 p-5 bg-zinc-900/20 border border-white/5 border-dashed rounded-2xl group hover:border-white/10 transition-all"
                  >
                    <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center font-black text-white/30 text-lg uppercase">
                      {invite.invitee_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/50 font-black text-sm uppercase tracking-tight">{invite.invitee_name}</p>
                      <p className="text-white/20 text-[11px] font-medium truncate">{invite.invitee_email}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest opacity-50 ${meta.bg} ${meta.color}`}>
                      {meta.icon} {invite.role}
                    </div>
                    {/* Resend/copy */}
                    <button
                      onClick={() => { navigator.clipboard.writeText(inviteUrl); }}
                      title="Copy invite link"
                      className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-white transition-all"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      onClick={() => cancelInvite(invite.id)}
                      className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
