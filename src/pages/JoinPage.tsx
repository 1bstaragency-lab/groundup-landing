import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface InviteData {
  id: string;
  invitee_email: string;
  invitee_name: string;
  role: string;
  status: string;
  expires_at: string;
  inviter_id: string;
}

type PageState = 'loading' | 'invalid' | 'expired' | 'already_accepted' | 'form' | 'success';

export function JoinPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [form, setForm] = useState({ name: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setPageState('invalid'); return; }

    supabase
      .from('team_invites')
      .select('*')
      .eq('id', token)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) { setPageState('invalid'); return; }
        const inv = data as InviteData;
        if (inv.status === 'accepted')  { setInvite(inv); setPageState('already_accepted'); return; }
        if (inv.status === 'cancelled') { setPageState('invalid'); return; }
        if (new Date(inv.expires_at) < new Date()) { setPageState('expired'); return; }
        setInvite(inv);
        setForm(f => ({ ...f, name: inv.invitee_name }));
        setPageState('form');
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!invite) return;
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }

    setSubmitting(true);
    setError('');

    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: invite.invitee_email,
      password: form.password,
      options: { data: { artist_name: form.name } },
    });

    if (signUpErr) {
      setError(signUpErr.message);
      setSubmitting(false);
      return;
    }

    const newUserId = signUpData.user?.id;

    // Mark invite accepted
    await supabase
      .from('team_invites')
      .update({ status: 'accepted', member_id: newUserId ?? null })
      .eq('id', invite.id);

    // Create artist_preferences row so they have a profile
    if (newUserId) {
      await supabase.from('artist_preferences').upsert({
        user_id: newUserId,
        artist_name: form.name,
        genre: '',
        bio: '',
        tone: 'Conversational',
        onboarding_complete: true,
      }, { onConflict: 'user_id' });
    }

    setSubmitting(false);
    setPageState('success');
    setTimeout(() => navigate('/dashboard'), 2500);
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#FFD700]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#FFD700]/3 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img src="/logo.png" alt="GrounduP" className="h-10 opacity-80" />
        </div>

        <AnimatePresence mode="wait">

          {/* Loading */}
          {pageState === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-20">
              <Loader2 size={24} className="text-white/30 animate-spin" />
            </motion.div>
          )}

          {/* Invalid / cancelled */}
          {pageState === 'invalid' && (
            <motion.div key="invalid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <AlertCircle size={32} className="text-red-400" />
              </div>
              <h2 className="text-white font-black text-2xl uppercase tracking-tighter mb-3">Invalid Invite</h2>
              <p className="text-white/30 text-sm font-medium">This invite link is invalid or has been cancelled. Ask your team admin for a new one.</p>
            </motion.div>
          )}

          {/* Expired */}
          {pageState === 'expired' && (
            <motion.div key="expired" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-orange-500/20">
                <AlertCircle size={32} className="text-orange-400" />
              </div>
              <h2 className="text-white font-black text-2xl uppercase tracking-tighter mb-3">Invite Expired</h2>
              <p className="text-white/30 text-sm font-medium">This invite link expired after 7 days. Ask your team admin to send a new one.</p>
            </motion.div>
          )}

          {/* Already accepted */}
          {pageState === 'already_accepted' && (
            <motion.div key="accepted" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="w-20 h-20 bg-[#FFD700]/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#FFD700]/20">
                <CheckCircle size={32} className="text-[#FFD700]" />
              </div>
              <h2 className="text-white font-black text-2xl uppercase tracking-tighter mb-3">Already Joined</h2>
              <p className="text-white/30 text-sm font-medium mb-8">
                {invite?.invitee_name} has already accepted this invite.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-yellow-300 transition-colors"
              >
                Sign In
              </button>
            </motion.div>
          )}

          {/* Sign-up form */}
          {pageState === 'form' && invite && (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* Invite card */}
              <div className="bg-zinc-900/60 border border-white/8 rounded-2xl p-5 mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFD700]/10 rounded-2xl flex items-center justify-center font-black text-[#FFD700] text-lg uppercase border border-[#FFD700]/20 shrink-0">
                  {invite.invitee_name[0]}
                </div>
                <div className="min-w-0">
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">You've been invited as</p>
                  <p className="text-white font-black text-base uppercase tracking-tight">{invite.role}</p>
                  <p className="text-white/30 text-xs font-medium truncate">{invite.invitee_email}</p>
                </div>
              </div>

              <h2 className="text-white font-black text-3xl uppercase tracking-tighter mb-2">Create Your Account</h2>
              <p className="text-white/30 text-sm font-medium mb-8">Set a password to join the team on GrounduP.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Your Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    className="wait-input"
                  />
                </div>

                <div>
                  <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Email</label>
                  <input
                    type="email"
                    value={invite.invitee_email}
                    disabled
                    className="wait-input opacity-40 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Min 8 characters"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                      className="wait-input pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Confirm Password</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    required
                    className="wait-input"
                  />
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold uppercase tracking-widest">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-yellow-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {submitting ? <><Loader2 size={14} className="animate-spin" /> Creating Account...</> : 'Join the Team'}
                </button>
              </form>
            </motion.div>
          )}

          {/* Success */}
          {pageState === 'success' && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="w-20 h-20 bg-[#FFD700]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#FFD700]/30">
                <CheckCircle size={32} className="text-[#FFD700]" />
              </div>
              <h2 className="text-white font-black text-2xl uppercase tracking-tighter mb-3">You're In!</h2>
              <p className="text-white/30 text-sm font-medium">Account created. Redirecting you to the dashboard...</p>
              <div className="mt-6 flex justify-center">
                <Loader2 size={18} className="text-[#FFD700] animate-spin" />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
