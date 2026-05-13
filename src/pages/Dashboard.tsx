import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Zap, Music, Mic2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TeamDashboardMockup } from '../components/ui/TeamDashboardMockup';
import { LearnSection } from '../components/dashboard/LearnSection';
import { SchedulerSection } from '../components/dashboard/SchedulerSection';
import { StudioSection } from '../components/dashboard/StudioSection';
import { ProfileSection } from '../components/dashboard/ProfileSection';

const TONE_COLORS: Record<string, string> = {
  Professional: 'text-blue-400',
  Conversational: 'text-green-400',
  Direct: 'text-red-400',
  Analytical: 'text-purple-400',
  Strategic: 'text-orange-400',
};

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile?.artist_name ?? user?.artistName ?? user?.email?.split('@')[0] ?? 'Artist';
  const tone = profile?.tone ?? 'Professional';
  const genre = profile?.genre ?? '';

  async function handleSignOut() {
    setLoggingOut(true);
    await signOut();
  }

  return (
    <DashboardShell activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            <div className="flex items-start justify-between">
              <div className="max-w-xl">
                <h1 className="text-6xl font-black text-white tracking-tighter mb-4 uppercase">
                  Welcome,{' '}
                  <span className="text-[#FFD700]">{displayName.toUpperCase()}</span>
                </h1>
                <p className="text-white/40 font-medium text-lg leading-relaxed">
                  Your Artist OS is live. uP is processing your career data.
                </p>
              </div>
              <button
                onClick={handleSignOut}
                disabled={loggingOut}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-zinc-900/60 border border-white/5 text-white/40 hover:text-white hover:border-white/20 transition-all font-black text-[10px] uppercase tracking-widest"
              >
                <LogOut size={14} />
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>

            {/* User stat cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-3">
                  <User size={14} className="text-[#FFD700]" />
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Account</p>
                </div>
                <p className="text-white font-black text-sm truncate">{user?.email}</p>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Zap size={14} className="text-[#FFD700]" />
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Tone</p>
                </div>
                <p className={`font-black text-sm uppercase tracking-wide ${TONE_COLORS[tone] ?? 'text-white'}`}>
                  {tone}
                </p>
              </div>

              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Music size={14} className="text-[#FFD700]" />
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Genre</p>
                </div>
                <p className="text-white font-black text-sm">{genre || '—'}</p>
              </div>
            </div>

            {profile?.bio && (
              <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <Mic2 size={14} className="text-[#FFD700]" />
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Artist Bio</p>
                </div>
                <p className="text-white/60 text-sm font-medium leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <TeamDashboardMockup />
          </motion.div>
        )}
        {activeTab === 'learn' && <LearnSection />}
        {activeTab === 'scheduler' && <SchedulerSection />}
        {activeTab === 'studio' && <StudioSection />}
        {activeTab === 'profile' && <ProfileSection />}
      </AnimatePresence>
    </DashboardShell>
  );
}
