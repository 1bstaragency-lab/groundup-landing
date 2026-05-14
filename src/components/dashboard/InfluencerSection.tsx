import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Users, Music2, Globe, ExternalLink, Zap, Play, Radio, Lock, Crown, X, Mail, Check } from 'lucide-react';
import { INFLUENCERS, NETWORK_STATS, type Platform, type TikTokTier } from '../../data/influencers';
import { useAuth } from '../../hooks/useAuth';
import { GlassCheckoutCard } from '../ui/glass-checkout-card';
import { OutreachPanel, GmailConnectButton, type OutreachTarget } from '../ui/GmailCompose';

const FREE_ROW_LIMIT = 6; // 2 rows × 3 cols on desktop

const PLATFORM_TABS: { id: Platform | 'All'; label: string; icon: React.ReactNode }[] = [
  { id: 'All',        label: 'All',              icon: <Globe size={13} /> },
  { id: 'TikTok',     label: 'TikTok',           icon: <Zap size={13} /> },
  { id: 'Twitter',    label: 'Twitter / X',      icon: <TrendingUp size={13} /> },
  { id: 'Spotify',    label: 'Spotify Curators', icon: <Music2 size={13} /> },
  { id: 'YouTube',    label: 'YouTube',           icon: <Play size={13} /> },
  { id: 'SoundCloud', label: 'SoundCloud',        icon: <Radio size={13} /> },
];

const TIKTOK_TIERS: { id: TikTokTier | 'All'; label: string; range: string }[] = [
  { id: 'All',   label: 'All Tiers', range: '' },
  { id: 'Mega',  label: 'Mega',      range: '500K+' },
  { id: 'Macro', label: 'Macro',     range: '50K–500K' },
  { id: 'Micro', label: 'Micro',     range: '1K–50K' },
];

const TIER_COLORS: Record<TikTokTier, string> = {
  Mega:  'bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30',
  Macro: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Micro: 'bg-green-500/15 text-green-400 border-green-500/25',
};

const PLATFORM_COLORS: Record<Platform, string> = {
  TikTok:     'bg-sky-500/15 text-sky-400',
  Twitter:    'bg-blue-500/15 text-blue-400',
  Spotify:    'bg-green-500/15 text-green-400',
  Blog:       'bg-purple-500/15 text-purple-400',
  YouTube:    'bg-red-500/15 text-red-400',
  SoundCloud: 'bg-orange-500/15 text-orange-400',
};

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 26, stiffness: 300 }}
        className="relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors"
        >
          <X size={13} />
        </button>
        <GlassCheckoutCard
          amount={29}
          planName="Pro"
          onSuccess={onClose}
        />
      </motion.div>
    </motion.div>
  );
}

export function InfluencerSection() {
  const { profile }                   = useAuth();
  const [activePlatform, setActivePlatform] = useState<Platform | 'All'>('All');
  const [activeTier, setActiveTier]         = useState<TikTokTier | 'All'>('All');
  const [search, setSearch]                 = useState('');
  const [showUpgrade, setShowUpgrade]       = useState(false);
  const [outreachTarget, setOutreachTarget] = useState<OutreachTarget | null>(null);

  const isGmailConnected = !!(profile as any)?.gmail_refresh_token;

  const isPro = profile?.plan_tier === 'pro' || profile?.plan_tier === 'growth';

  const filtered = useMemo(() => {
    let list = INFLUENCERS;
    if (activePlatform !== 'All') list = list.filter(i => i.platform === activePlatform);
    if (activePlatform === 'TikTok' && activeTier !== 'All') list = list.filter(i => i.tier === activeTier);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.handle.toLowerCase().includes(q) ||
        i.niche.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activePlatform, activeTier, search]);

  const unlocked = isPro ? filtered : filtered.slice(0, FREE_ROW_LIMIT);
  const locked   = isPro ? []       : filtered.slice(FREE_ROW_LIMIT);

  return (
    <>
      <AnimatePresence>
        {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
      </AnimatePresence>

      {/* Outreach slide-in panel */}
      <OutreachPanel target={outreachTarget} onClose={() => setOutreachTarget(null)} />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-2">Influencer Network</h1>
            <p className="text-white/30 text-sm font-bold">Our curated network of creators, curators, and culture drivers.</p>
          </div>
          {!isPro && (
            <button
              onClick={() => setShowUpgrade(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] font-black text-[10px] uppercase tracking-widest hover:bg-[#FFD700]/20 transition-all shrink-0"
            >
              <Crown size={12} /> Upgrade
            </button>
          )}
        </div>

        {/* Gmail connection banner */}
        <div className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border ${
          isGmailConnected
            ? 'bg-green-500/5 border-green-500/15'
            : 'bg-white/[0.03] border-white/8'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isGmailConnected ? 'bg-green-500/15' : 'bg-white/5'
            }`}>
              {isGmailConnected
                ? <Check size={14} className="text-green-400" />
                : <Mail size={14} className="text-white/30" />}
            </div>
            <div>
              <p className="text-white font-black text-[11px] uppercase tracking-widest leading-none">
                {isGmailConnected ? 'Gmail connected' : 'Connect Gmail to pitch directly'}
              </p>
              <p className="text-white/25 text-[10px] font-medium mt-0.5">
                {isGmailConnected
                  ? 'Click any influencer card to open an auto-filled outreach draft.'
                  : 'Link your email and send pitches to any influencer without leaving GrounduP.'}
              </p>
            </div>
          </div>
          {!isGmailConnected && <GmailConnectButton className="flex-shrink-0" />}
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total',       value: NETWORK_STATS.total.toLocaleString(),       color: 'text-[#FFD700]' },
            { label: 'TikTok',      value: NETWORK_STATS.tiktok.toLocaleString(),      color: 'text-sky-400' },
            { label: 'Twitter / X', value: NETWORK_STATS.twitter.toLocaleString(),     color: 'text-blue-400' },
            { label: 'Spotify',     value: NETWORK_STATS.spotify.toLocaleString(),     color: 'text-green-400' },
            { label: 'YouTube',     value: NETWORK_STATS.youtube.toLocaleString(),     color: 'text-red-400' },
            { label: 'SoundCloud',  value: NETWORK_STATS.soundcloud.toLocaleString(),  color: 'text-orange-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4">
              <p className={`font-black text-2xl ${stat.color}`}>{stat.value}</p>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Platform tabs */}
        <div className="flex flex-wrap gap-2">
          {PLATFORM_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActivePlatform(tab.id); setActiveTier('All'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                activePlatform === tab.id
                  ? 'bg-[#FFD700] border-transparent text-black'
                  : 'bg-zinc-900/40 border-white/5 text-white/40 hover:text-white hover:border-white/10'
              }`}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* TikTok tier filter */}
        {activePlatform === 'TikTok' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
            {TIKTOK_TIERS.map(tier => (
              <button
                key={tier.id}
                onClick={() => setActiveTier(tier.id)}
                className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTier === tier.id
                    ? 'bg-zinc-800 border-white/20 text-white'
                    : 'border-white/5 text-white/25 hover:text-white/50'
                }`}
              >
                {tier.label}{tier.range && <span className="ml-1.5 opacity-50">{tier.range}</span>}
              </button>
            ))}
          </motion.div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            placeholder="Search by name, handle, or niche..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-zinc-900/40 border border-white/5 rounded-2xl pl-10 pr-5 py-3.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/15 transition-colors"
          />
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-white/25 text-[10px] font-black uppercase tracking-widest">
            {isPro
              ? `Showing all ${filtered.length} influencers`
              : `Showing ${unlocked.length} of ${filtered.length} — ${locked.length} locked`}
          </p>
          {activePlatform === 'TikTok' && (
            <p className="text-white/20 text-[10px] font-medium">
              Largest: {fmtFollowers(NETWORK_STATS.topFollowers)} followers
            </p>
          )}
        </div>

        {/* Influencer grid — unlocked */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {unlocked.map((inf, i) => (
            <motion.div
              key={inf.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center font-black text-white/60 text-sm border border-white/5 shrink-0">
                    {inf.name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-black text-sm leading-none truncate">{inf.name}</p>
                    <p className="text-white/30 text-[10px] font-mono mt-0.5">{inf.handle}</p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/25 hover:text-white">
                  <ExternalLink size={13} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${PLATFORM_COLORS[inf.platform]}`}>
                  {inf.platform}
                </span>
                {inf.tier && (
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${TIER_COLORS[inf.tier]}`}>
                    {inf.tier}
                  </span>
                )}
                {inf.category && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400">
                    {inf.category}
                  </span>
                )}
              </div>

              <p className="text-white/40 text-[11px] font-medium mb-3">{inf.niche}</p>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div>
                  <p className="text-white font-black text-base leading-none">{fmtFollowers(inf.followers)}</p>
                  <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-0.5">Followers</p>
                </div>
                <div className="text-right">
                  <p className={`font-black text-base leading-none ${inf.engagementRate >= 10 ? 'text-[#FFD700]' : 'text-white'}`}>
                    {inf.engagementRate}%
                  </p>
                  <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-0.5">Eng. Rate</p>
                </div>
                {inf.avgViews && (
                  <div className="text-right">
                    <p className="text-white font-black text-base leading-none">{fmtFollowers(inf.avgViews)}</p>
                    <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-0.5">Avg Views</p>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <button
                  onClick={() => setOutreachTarget({
                    name: inf.name,
                    handle: inf.handle,
                    platform: inf.platform,
                    niche: inf.niche,
                    email: inf.email,
                    instagram: inf.instagram,
                  })}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-[#FFD700]/30 hover:bg-[#FFD700]/8 transition-all font-black text-[10px] uppercase tracking-widest"
                >
                  <Mail size={12} /> Email
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Paywall banner + locked cards */}
        {locked.length > 0 && (
          <div className="relative">
            {/* Upgrade CTA banner */}
            <div className="relative z-10 rounded-3xl border border-[#FFD700]/20 bg-gradient-to-r from-[#FFD700]/8 to-transparent p-6 mb-4 flex items-center justify-between gap-4 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD700]/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-[#FFD700]/15 border border-[#FFD700]/25 flex items-center justify-center shrink-0">
                  <Lock size={16} className="text-[#FFD700]" />
                </div>
                <div>
                  <p className="text-white font-black text-sm uppercase tracking-widest">
                    {locked.length} more influencers locked
                  </p>
                  <p className="text-white/30 text-[11px] font-medium mt-0.5">
                    Upgrade to Pro to unlock the full network with contact info and priority tiers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgrade(true)}
                className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest hover:bg-[#FFD700]/90 transition-all"
              >
                <Crown size={12} /> Unlock All
              </button>
            </div>

            {/* Locked cards (blurred) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {locked.map((inf, i) => (
                <motion.div
                  key={inf.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group"
                  onClick={() => setShowUpgrade(true)}
                >
                  {/* Blurred card content */}
                  <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 select-none pointer-events-none blur-[3px]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 shrink-0" />
                        <div>
                          <div className="h-3 w-24 bg-white/10 rounded" />
                          <div className="h-2 w-16 bg-white/5 rounded mt-1.5" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5 mb-3">
                      <div className="h-4 w-14 bg-white/5 rounded-full" />
                      <div className="h-4 w-10 bg-white/5 rounded-full" />
                    </div>
                    <div className="h-2 w-32 bg-white/5 rounded mb-3" />
                    <div className="flex justify-between pt-3 border-t border-white/5">
                      <div className="h-5 w-12 bg-white/10 rounded" />
                      <div className="h-5 w-12 bg-white/10 rounded" />
                    </div>
                  </div>

                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl group-hover:bg-black/50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center mb-2">
                      <Lock size={15} className="text-[#FFD700]" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#FFD700]/80">Pro</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Fade-out gradient at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none rounded-b-2xl" />
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <Users size={32} className="text-white/10 mb-4" />
            <p className="text-white/20 font-black text-sm uppercase tracking-widest">No influencers match your filters</p>
          </div>
        )}
      </div>
    </>
  );
}
