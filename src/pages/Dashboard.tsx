import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, CheckCircle, TrendingUp, Zap, Globe, Music2 } from 'lucide-react';
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
import { CuratorSection } from '../components/dashboard/CuratorSection';
import { InfluencerSection } from '../components/dashboard/InfluencerSection';

const INDUSTRY_NEWS = [
  {
    icon: <TrendingUp size={14} className="text-[#FFD700]" />,
    tag: 'TikTok',
    tagColor: 'text-sky-400 bg-sky-400/10',
    headline: "TikTok's \"Add to Music App\" feature now live for all creators",
    sub: "Direct DSP saves from TikTok videos — biggest conversion tool since pre-saves.",
    age: '2h ago',
  },
  {
    icon: <Music2 size={14} className="text-[#FFD700]" />,
    tag: 'Spotify',
    tagColor: 'text-green-400 bg-green-400/10',
    headline: 'Spotify Artist Clips now available in 185+ markets',
    sub: 'Short-form video on your artist profile — prime it before your next release.',
    age: '1d ago',
  },
  {
    icon: <Globe size={14} className="text-[#FFD700]" />,
    tag: 'Industry',
    tagColor: 'text-purple-400 bg-purple-400/10',
    headline: 'Global music revenue up 11% — streaming leads for 8th straight year',
    sub: 'Independent artists captured 12% of total market share — the highest on record.',
    age: '3d ago',
  },
  {
    icon: <Zap size={14} className="text-[#FFD700]" />,
    tag: 'Strategy',
    tagColor: 'text-orange-400 bg-orange-400/10',
    headline: 'Why artists releasing every 6–8 weeks outperform quarterly releases',
    sub: 'Algorithm consistency > hype cycles. More touchpoints = more playlist adds.',
    age: '5d ago',
  },
];

export function Dashboard() {
  const { user, profile, signOut, emailJustConfirmed, clearEmailConfirmed } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [loggingOut, setLoggingOut] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const displayName = profile?.artist_name ?? user?.artistName ?? user?.email?.split('@')[0] ?? 'Artist';

  // Show email confirmed banner when flag fires from AuthContext
  useEffect(() => {
    if (emailJustConfirmed) {
      setShowBanner(true);
      clearEmailConfirmed();
      const t = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(t);
    }
  }, [emailJustConfirmed, clearEmailConfirmed]);

  async function handleSignOut() {
    setLoggingOut(true);
    await signOut();
  }

  return (
    <>}

      {/* Email confirmed banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3.5 bg-[#FFD700] text-black rounded-2xl shadow-[0_20px_60px_rgba(255,215,0,0.4)] font-black text-[11px] uppercase tracking-widest whitespace-nowrap"
          >
            <CheckCircle size={16} strokeWidth={3} />
            Email confirmed — welcome to GrounduP!
            <button
              onClick={() => setShowBanner(false)}
              className="ml-2 opacity-50 hover:opacity-100 transition-opacity text-black font-black text-base leading-none"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <DashboardShell activeTab={activeTab} setActiveTab={setActiveTab}>
        <AnimatePresence mode="wait">

          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 lg:space-y-10">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-2">
                    Welcome, <span className="text-[#FFD700]">{displayName.toUpperCase()}</span>
                  </h1>
                  <p className="text-white/40 font-medium text-sm leading-relaxed">
                    Your Artist OS is live. Start planning your next rollout.
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="flex items-center gap-2 lg:gap-3 px-3 lg:px-5 py-2.5 lg:py-3 rounded-2xl bg-zinc-900/60 border border-white/5 text-white/40 hover:text-white hover:border-white/20 transition-all font-black text-[10px] uppercase tracking-widest shrink-0"
                >
                  <LogOut size={13} />
                  <span className="hidden sm:inline">{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
                </button>
              </div>
              <TeamDashboardMockup interactive />

              {/* Industry news feed */}
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-[#FFD700]" />
                  <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">Industry Pulse</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {INDUSTRY_NEWS.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all group cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.tagColor}`}>
                          {item.tag}
                        </span>
                        <span className="text-white/20 text-[9px] font-bold">{item.age}</span>
                      </div>
                      <p className="text-white font-bold text-sm leading-snug mb-1 group-hover:text-[#FFD700] transition-colors">
                        {item.headline}
                      </p>
                      <p className="text-white/30 text-[11px] leading-relaxed">{item.sub}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rollouts'  && <motion.div key="rollouts"  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><RolloutsSection /></motion.div>}
          {activeTab === 'analytics' && <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><AnalyticsSection /></motion.div>}
          {activeTab === 'team'      && <motion.div key="team"      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><TeamSection /></motion.div>}
          {activeTab === 'learn'     && <LearnSection />}
          {activeTab === 'scheduler' && <SchedulerSection />}
          {activeTab === 'studio'    && <StudioSection />}
          {activeTab === 'influencers' && <motion.div key="influencers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><InfluencerSection /></motion.div>}
          {activeTab === 'curator'   && <CuratorSection />}
          {activeTab === 'profile'   && <ProfileSection />}

        </AnimatePresence>
      </DashboardShell>
    </>
  );
}
