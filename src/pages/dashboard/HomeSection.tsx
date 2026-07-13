import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, TrendingUp, Zap, Globe, Music2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { HomeDashboard } from '../../components/dashboard/HomeDashboard';
import { GmailConnectButton } from '../../components/ui/GmailCompose';
import { readPlanIntent, clearPlanIntent, openCheckout } from '../../lib/pricingCheckout';
import { PlatformLinkPrompt } from '../../components/dashboard/PlatformLinkPrompt';
import { GOLDD } from '../../lib/brand-tokens';
import { INK, DIM, FAINT, CARD } from '../../lib/dashboard-theme';

// Tag colors consolidated to a single gold-monochrome accent (was a decorative
// sky/green/purple/orange system per-topic — didn't fit the brand's strict
// black/gold/white palette; the topic label itself still carries the meaning).
const INDUSTRY_NEWS = [
  {
    icon: <TrendingUp size={14} style={{ color: GOLDD }} />,
    tag: 'TikTok',
    headline: "TikTok's \"Add to Music App\" feature now live for all creators",
    sub: "Direct DSP saves from TikTok videos — biggest conversion tool since pre-saves.",
    age: '2h ago',
  },
  {
    icon: <Music2 size={14} style={{ color: GOLDD }} />,
    tag: 'Spotify',
    headline: 'Spotify Artist Clips now available in 185+ markets',
    sub: 'Short-form video on your artist profile — prime it before your next release.',
    age: '1d ago',
  },
  {
    icon: <Globe size={14} style={{ color: GOLDD }} />,
    tag: 'Industry',
    headline: 'Global music revenue up 11% — streaming leads for 8th straight year',
    sub: 'Independent artists captured 12% of total market share — the highest on record.',
    age: '3d ago',
  },
  {
    icon: <Zap size={14} style={{ color: GOLDD }} />,
    tag: 'Strategy',
    headline: 'Why artists releasing every 6–8 weeks outperform quarterly releases',
    sub: 'Algorithm consistency > hype cycles. More touchpoints = more playlist adds.',
    age: '5d ago',
  },
];

export function HomeSection() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const rawName = profile?.artist_name ?? user?.artistName ?? '';
  const displayName = rawName && !rawName.includes('@') ? rawName : 'Artist';

  // ─── Auto-checkout: if user signed up via a pricing card, finish the flow ──
  useEffect(() => {
    if (!user?.id) return;
    const intent = readPlanIntent();
    if (!intent) return;
    // Don't re-fire if Stripe already brought them back (returnUrl carries ?upgraded=1)
    if (new URLSearchParams(window.location.search).has('upgraded')) {
      clearPlanIntent();
      return;
    }
    clearPlanIntent();
    openCheckout(user.id, intent);
  }, [user?.id]);

  // ─── Returning from Stripe (?upgraded=1): the webhook flips plan_tier in the
  // DB, but our cached profile still says the old tier. Re-fetch a few times so
  // the unlocked features show without a manual reload (webhook can lag a sec).
  useEffect(() => {
    if (!user?.id) return;
    if (!new URLSearchParams(window.location.search).has('upgraded')) return;
    let tries = 0;
    const poll = setInterval(async () => {
      tries += 1;
      await refreshProfile();
      if (tries >= 6) clearInterval(poll); // ~12s of polling
    }, 2000);
    return () => clearInterval(poll);
  }, [user?.id]);

  async function handleSignOut() {
    setLoggingOut(true);
    await signOut();
  }

  return (
    <motion.div key="home" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 lg:space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase mb-2" style={{ color: INK }}>
            Welcome, <span style={{ color: GOLDD }}>{displayName.toUpperCase()}</span>
          </h1>
          <p className="font-medium text-sm leading-relaxed" style={{ color: DIM }}>
            Your Artist OS is live. Start planning your next rollout.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <GmailConnectButton />
          <button
            onClick={handleSignOut}
            disabled={loggingOut}
            className="flex items-center gap-2 lg:gap-3 px-3 lg:px-5 py-2.5 lg:py-3 rounded-2xl transition-all font-black text-[10px] uppercase tracking-widest shrink-0"
            style={{ background: CARD, border: `1px solid ${FAINT}`, color: DIM }}
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
          <TrendingUp size={14} style={{ color: GOLDD }} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: GOLDD }}>Industry Pulse</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {INDUSTRY_NEWS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="rounded-2xl p-4 transition-all group cursor-pointer dash-hover-border"
              style={{ background: CARD, border: `1px solid ${FAINT}` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ color: GOLDD, background: 'rgba(184,134,11,0.1)' }}>
                  {item.tag}
                </span>
                <span className="text-[9px] font-bold" style={{ color: DIM }}>{item.age}</span>
              </div>
              <p className="font-bold text-sm leading-snug mb-1 transition-colors" style={{ color: INK }}>
                {item.headline}
              </p>
              <p className="text-[11px] leading-relaxed" style={{ color: DIM }}>{item.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Platform link prompt — slides up if no platforms are connected */}
      {user?.id && <PlatformLinkPrompt userId={user.id} />}
    </motion.div>
  );
}
