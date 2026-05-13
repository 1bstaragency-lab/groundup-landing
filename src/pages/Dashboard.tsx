import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DashboardShell } from '../components/layout/DashboardShell';
import { TeamDashboardMockup } from '../components/ui/TeamDashboardMockup';
import { LearnSection } from '../components/dashboard/LearnSection';
import { SchedulerSection } from '../components/dashboard/SchedulerSection';
import { StudioSection } from '../components/dashboard/StudioSection';
import { ProfileSection } from '../components/dashboard/ProfileSection';
import { RolloutsSection } from '../components/dashboard/RolloutsSection';
import { AnalyticsSection } from '../components/dashboard/AnalyticsSection';
import { TeamSection } from '../components/dashboard/TeamSection';

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [loggingOut, setLoggingOut] = useState(false);

  const displayName = profile?.artist_name ?? user?.artistName ?? user?.email?.split('@')[0] ?? 'Artist';

  async function handleSignOut() {
    setLoggingOut(true);
    await signOut();
  }

  return (
    <DashboardShell activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">

        {activeTab === 'home' && (
          <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-3">
                  Welcome, <span className="text-[#FFD700]">{displayName.toUpperCase()}</span>
                </h1>
                <p className="text-white/40 font-medium text-base leading-relaxed">
                  Your Artist OS is live. Start planning your next rollout.
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
            <TeamDashboardMockup />
          </motion.div>
        )}

        {activeTab === 'rollouts'  && <motion.div key="rollouts"  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><RolloutsSection /></motion.div>}
        {activeTab === 'analytics' && <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><AnalyticsSection /></motion.div>}
        {activeTab === 'team'      && <motion.div key="team"      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><TeamSection /></motion.div>}
        {activeTab === 'learn'     && <LearnSection />}
        {activeTab === 'scheduler' && <SchedulerSection />}
        {activeTab === 'studio'    && <StudioSection />}
        {activeTab === 'profile'   && <ProfileSection />}

      </AnimatePresence>
    </DashboardShell>
  );
}
