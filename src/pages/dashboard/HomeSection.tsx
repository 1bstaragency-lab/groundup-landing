import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, TrendingUp, Zap, Globe, Music2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { HomeDashboard } from '../../components/dashboard/HomeDashboard';
import { GmailConnectButton } from '../../components/ui/GmailCompose';

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

export function HomeSection() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const rawName = profile?.artist_name ?? user?.artistName ?? '';
  const displayName = rawName && !rawName.includes('@') ? rawName : 'Artist';

  async function handleSignOut() {
    setLoggingOut(true);
    await signOut();
  }

  return (
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
        <div className="flex items-center gap-2">
          <GmailConnectButton />
          <button
            onClick={handleSignOut}
            disabled={loggingOut}
            className="flex items-center gap-2 lg:gap-3 px-3 lg:px-5 py-2.5 lg:py-3 rounded-2xl bg-zinc-900/60 border border-white/5 text-white/40 hover:text-white hover:border-white/20 transition-all font-black text-[10px] uppercase tracking-widest shrink-0"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Live dashboard */}
      <HomeDashboard />

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
  );
}
