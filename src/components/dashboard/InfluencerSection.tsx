import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, Users, Music2, Globe, ExternalLink, Zap } from 'lucide-react';
import { INFLUENCERS, NETWORK_STATS, type Platform, type TikTokTier } from '../../data/influencers';

const PLATFORM_TABS: { id: Platform | 'All'; label: string; icon: React.ReactNode }[] = [
  { id: 'All',     label: 'All',             icon: <Globe size={13} /> },
  { id: 'TikTok',  label: 'TikTok',          icon: <Zap size={13} /> },
  { id: 'Twitter', label: 'Twitter / X',     icon: <TrendingUp size={13} /> },
  { id: 'Spotify', label: 'Spotify Curators',icon: <Music2 size={13} /> },
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
  TikTok:  'bg-sky-500/15 text-sky-400',
  Twitter: 'bg-blue-500/15 text-blue-400',
  Spotify: 'bg-green-500/15 text-green-400',
  Blog:    'bg-purple-500/15 text-purple-400',
};

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export function InfluencerSection() {
  const [activePlatform, setActivePlatform] = useState<Platform | 'All'>('All');
  const [activeTier, setActiveTier]         = useState<TikTokTier | 'All'>('All');
  const [search, setSearch]                 = useState('');

  const filtered = useMemo(() => {
    let list = INFLUENCERS;
    if (activePlatform !== 'All') list = list.filter(i => i.platform === activePlatform);
    if (activePlatform === 'TikTok' && activeTier !== 'All') list = list.filter(i => i.tier === activeTier);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.handle.toLowerCase().includes(q) || i.niche.toLowerCase().includes(q));
    }
    return list;
  }, [activePlatform, activeTier, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-2">Influencer Network</h1>
        <p className="text-white/30 text-sm font-bold">Our curated network of creators, curators, and culture drivers.</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Influencers', value: NETWORK_STATS.total.toLocaleString(), color: 'text-[#FFD700]' },
          { label: 'TikTok Creators',   value: NETWORK_STATS.tiktok.toLocaleString(), color: 'text-sky-400' },
          { label: 'Twitter / X',        value: NETWORK_STATS.twitter.toLocaleString(), color: 'text-blue-400' },
          { label: 'Combined Reach',     value: NETWORK_STATS.totalReach, color: 'text-purple-400' },
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
          Showing {filtered.length} of {NETWORK_STATS.total} influencers
        </p>
        {activePlatform === 'TikTok' && (
          <p className="text-white/20 text-[10px] font-medium">
            Largest: {fmtFollowers(NETWORK_STATS.topFollowers)} followers
          </p>
        )}
      </div>

      {/* Influencer grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((inf, i) => (
          <motion.div
            key={inf.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group"
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* Avatar placeholder */}
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

            {/* Badges */}
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

            {/* Niche */}
            <p className="text-white/40 text-[11px] font-medium mb-3">{inf.niche}</p>

            {/* Stats */}
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
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <Users size={32} className="text-white/10 mb-4" />
          <p className="text-white/20 font-black text-sm uppercase tracking-widest">No influencers match your filters</p>
        </div>
      )}
    </div>
  );
}
