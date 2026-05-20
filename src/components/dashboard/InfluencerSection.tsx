import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, TrendingUp, Music2, Globe, ExternalLink, Zap, Play, Radio,
  Lock, Crown, X, Mail, Check, Sparkles, ArrowRight, ArrowLeft,
  Flame, BarChart2, Star, ChevronDown, ChevronUp, Users,
} from 'lucide-react';
import { CampaignBuilder } from './CampaignBuilder';
import { INFLUENCERS, NETWORK_STATS, type Platform, type TikTokTier, type Influencer } from '../../data/influencers';
import { useAuth } from '../../hooks/useAuth';
import { GlassCheckoutCard } from '../ui/glass-checkout-card';
import { OutreachPanel, GmailConnectButton, type OutreachTarget } from '../ui/GmailCompose';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type FlowStep    = 'setup' | 'curated' | 'browse'
type CampaignGoal = 'viral' | 'growth' | 'credibility'

const FREE_ROW_LIMIT = 6;

// ─────────────────────────────────────────────────────────────────────────────
// Static config
// ─────────────────────────────────────────────────────────────────────────────
const GOALS: { id: CampaignGoal; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'viral',       label: 'Go Viral',       desc: 'High engagement, TikTok first',  icon: <Flame size={13} /> },
  { id: 'growth',      label: 'Build Audience', desc: 'Biggest reach across platforms', icon: <BarChart2 size={13} /> },
  { id: 'credibility', label: 'Credibility',    desc: 'Curators & music tastemakers',   icon: <Star size={13} /> },
]

const PLATFORM_FOCUS: { id: Platform | 'All'; label: string; icon: React.ReactNode; activeClass: string }[] = [
  { id: 'All',        label: 'All',        icon: <Globe size={12} />,      activeClass: 'bg-[#FFD700] border-transparent text-black' },
  { id: 'TikTok',     label: 'TikTok',     icon: <Zap size={12} />,        activeClass: 'bg-sky-500 border-transparent text-white' },
  { id: 'Twitter',    label: 'Twitter',    icon: <TrendingUp size={12} />, activeClass: 'bg-blue-500 border-transparent text-white' },
  { id: 'YouTube',    label: 'YouTube',    icon: <Play size={12} />,       activeClass: 'bg-red-500 border-transparent text-white' },
  { id: 'Spotify',    label: 'Spotify',    icon: <Music2 size={12} />,     activeClass: 'bg-green-600 border-transparent text-white' },
  { id: 'SoundCloud', label: 'SoundCloud', icon: <Radio size={12} />,      activeClass: 'bg-orange-500 border-transparent text-white' },
]

const PLATFORM_TABS = PLATFORM_FOCUS; // reuse in browse view

const TIKTOK_TIERS: { id: TikTokTier | 'All'; label: string; range: string }[] = [
  { id: 'All',   label: 'All Tiers', range: '' },
  { id: 'Mega',  label: 'Mega',      range: '500K+' },
  { id: 'Macro', label: 'Macro',     range: '50K–500K' },
  { id: 'Micro', label: 'Micro',     range: '1K–50K' },
]

const TIER_COLORS: Record<TikTokTier, string> = {
  Mega:  'bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30',
  Macro: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Micro: 'bg-green-500/15 text-green-400 border-green-500/25',
}

// Platform badge colors (shared with CampaignBuilder)
const PLATFORM_COLORS: Record<Platform, string> = {
  TikTok:     'bg-sky-500/15 text-sky-400',
  Twitter:    'bg-blue-500/15 text-blue-400',
  Spotify:    'bg-green-500/15 text-green-400',
  Blog:       'bg-purple-500/15 text-purple-400',
  YouTube:    'bg-red-500/15 text-red-400',
  SoundCloud: 'bg-orange-500/15 text-orange-400',
}

// Platform-specific card avatar colors
const PLATFORM_AVATAR: Record<Platform, string> = {
  TikTok:     'bg-sky-500/20 text-sky-300',
  Twitter:    'bg-blue-500/20 text-blue-300',
  Spotify:    'bg-green-500/20 text-green-300',
  Blog:       'bg-purple-500/20 text-purple-300',
  YouTube:    'bg-red-500/20 text-red-300',
  SoundCloud: 'bg-orange-500/20 text-orange-300',
}

// Card border & selected state colors per platform
const PLATFORM_CARD: Record<Platform, { border: string; borderOn: string; bgOn: string }> = {
  TikTok:     { border: 'border-sky-500/15',    borderOn: 'border-sky-400/45',    bgOn: 'bg-sky-500/8' },
  Twitter:    { border: 'border-blue-500/15',   borderOn: 'border-blue-400/45',   bgOn: 'bg-blue-500/8' },
  Spotify:    { border: 'border-green-500/15',  borderOn: 'border-green-400/45',  bgOn: 'bg-green-500/8' },
  Blog:       { border: 'border-purple-500/15', borderOn: 'border-purple-400/45', bgOn: 'bg-purple-500/8' },
  YouTube:    { border: 'border-red-500/15',    borderOn: 'border-red-400/45',    bgOn: 'bg-red-500/8' },
  SoundCloud: { border: 'border-orange-500/15', borderOn: 'border-orange-400/45', bgOn: 'bg-orange-500/8' },
}

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

// ─────────────────────────────────────────────────────────────────────────────
// Curated-picks algorithm
// ─────────────────────────────────────────────────────────────────────────────
function getCurated(platform: Platform | 'All', goal: CampaignGoal): Influencer[] {
  let pool = [...INFLUENCERS];

  if (platform !== 'All') {
    pool = pool.filter(i => i.platform === platform);
  }

  // Sort by goal metric
  switch (goal) {
    case 'viral':
      pool.sort((a, b) => b.engagementRate - a.engagementRate);
      break;
    case 'growth':
      pool.sort((a, b) => b.followers - a.followers);
      break;
    case 'credibility':
      pool.sort((a, b) => {
        const score = (p: Platform) =>
          ['Spotify', 'SoundCloud', 'Blog'].includes(p) ? 2 : p === 'YouTube' ? 1 : 0;
        const diff = score(b.platform) - score(a.platform);
        return diff !== 0 ? diff : b.followers - a.followers;
      });
      break;
  }

  // For "All" platforms, ensure diversity (max 2 per platform)
  if (platform === 'All') {
    const seen: Record<string, number> = {};
    const diverse: Influencer[] = [];
    for (const inf of pool) {
      seen[inf.platform] = (seen[inf.platform] ?? 0) + 1;
      if (seen[inf.platform] <= 2) diverse.push(inf);
      if (diverse.length >= 6) break;
    }
    return diverse;
  }

  return pool.slice(0, 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// Upgrade modal
// ─────────────────────────────────────────────────────────────────────────────
function UpgradeModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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
        <GlassCheckoutCard amount={29} planName="Pro" onSuccess={onClose} />
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shared influencer card — platform-color-coordinated
// ─────────────────────────────────────────────────────────────────────────────
function InfluencerCard({
  inf, selectable, selected, onToggle, onOutreach,
}: {
  inf: Influencer;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: () => void;
  onOutreach?: (target: OutreachTarget) => void;
}) {
  const theme = PLATFORM_CARD[inf.platform];

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border transition-all ${
        selectable
          ? selected
            ? `${theme.bgOn} ${theme.borderOn} cursor-pointer`
            : `bg-zinc-900/40 ${theme.border} hover:${theme.borderOn} cursor-pointer`
          : `bg-zinc-900/40 ${theme.border} hover:border-opacity-40 group`
      }`}
      onClick={selectable ? onToggle : undefined}
    >
      {/* Platform-colored top accent strip */}
      <div className={`h-[2px] w-full ${
        inf.platform === 'TikTok'     ? 'bg-sky-500/50'    :
        inf.platform === 'Twitter'    ? 'bg-blue-500/50'   :
        inf.platform === 'Spotify'    ? 'bg-green-500/50'  :
        inf.platform === 'YouTube'    ? 'bg-red-500/50'    :
        inf.platform === 'SoundCloud' ? 'bg-orange-500/50' :
        'bg-purple-500/50'
      }`} />

      <div className="p-4">
        {/* Selectable checkbox */}
        {selectable && (
          <div className={`absolute top-5 right-4 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            selected ? 'bg-[#FFD700] border-[#FFD700]' : 'border-white/20 bg-zinc-900/60'
          }`}>
            {selected && <Check size={10} strokeWidth={3} className="text-black" />}
          </div>
        )}

        <div className="flex items-start gap-3 mb-3">
          {/* Platform-colored avatar */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${PLATFORM_AVATAR[inf.platform]}`}>
            {inf.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white font-black text-sm leading-none truncate pr-6">{inf.name}</p>
            <p className="text-white/30 text-[10px] font-mono mt-0.5 truncate">{inf.handle}</p>
          </div>
          {!selectable && (
            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-white/25 hover:text-white shrink-0">
              <ExternalLink size={13} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2.5">
          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${PLATFORM_COLORS[inf.platform]}`}>
            {inf.platform}
          </span>
          {inf.tier && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${TIER_COLORS[inf.tier]}`}>
              {inf.tier}
            </span>
          )}
        </div>

        <p className="text-white/35 text-[11px] font-medium mb-3 line-clamp-1">{inf.niche}</p>

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

        {onOutreach && (
          <div className="mt-3">
            <button
              onClick={e => { e.stopPropagation(); onOutreach({ name: inf.name, handle: inf.handle, platform: inf.platform, niche: inf.niche, email: inf.email, instagram: inf.instagram }); }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-[#FFD700]/30 hover:bg-[#FFD700]/8 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <Mail size={12} /> Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function InfluencerSection() {
  const { profile, refreshProfile } = useAuth();

  // ── UI overlay state ───────────────────────────────────────────────────────
  const [showUpgrade, setShowUpgrade]     = useState(false);
  const [showCampaign, setShowCampaign]   = useState(false);
  const [outreachTarget, setOutreachTarget] = useState<OutreachTarget | null>(null);

  // ── Guided flow state ──────────────────────────────────────────────────────
  const [flowStep, setFlowStep]           = useState<FlowStep>('setup');
  const [campaignSong, setCampaignSong]   = useState('');
  const [campaignPlatform, setCampaignPlatform] = useState<Platform | 'All'>('All');
  const [campaignGoal, setCampaignGoal]   = useState<CampaignGoal>('viral');
  const [curatedSelected, setCuratedSelected] = useState<Record<string, boolean>>({});
  const [showMoreCreators, setShowMoreCreators] = useState(false);

  // ── Browse-mode state (mirrors existing full-grid UI) ──────────────────────
  const [activePlatform, setActivePlatform] = useState<Platform | 'All'>('All');
  const [activeTier, setActiveTier]         = useState<TikTokTier | 'All'>('All');
  const [search, setSearch]                 = useState('');

  const isPro           = profile?.plan_tier === 'pro' || profile?.plan_tier === 'growth';
  const isGmailConnected = !!(profile as any)?.gmail_refresh_token;

  // Restore outreach panel after Gmail OAuth redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('gmail_connected') !== '1') return;
    refreshProfile();
    const saved = sessionStorage.getItem('gu_outreach_return');
    if (saved) {
      try { setOutreachTarget(JSON.parse(saved)); } catch {}
      sessionStorage.removeItem('gu_outreach_return');
    }
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  // Curated picks — recomputed when platform/goal changes
  const curatedPicks = useMemo(
    () => getCurated(campaignPlatform, campaignGoal),
    [campaignPlatform, campaignGoal],
  );

  const selectedCount = Object.values(curatedSelected).filter(Boolean).length;

  // Browse filtered list
  const filtered = useMemo(() => {
    let list = INFLUENCERS;
    if (activePlatform !== 'All') list = list.filter(i => i.platform === activePlatform);
    if (activePlatform === 'TikTok' && activeTier !== 'All') list = list.filter(i => i.tier === activeTier);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.handle.toLowerCase().includes(q) ||
        i.niche.toLowerCase().includes(q),
      );
    }
    return list;
  }, [activePlatform, activeTier, search]);

  const unlocked = isPro ? filtered : filtered.slice(0, FREE_ROW_LIMIT);
  const lockedCards = isPro ? [] : filtered.slice(FREE_ROW_LIMIT);

  // ── Handlers ───────────────────────────────────────────────────────────────
  function startCurated() {
    const initial: Record<string, boolean> = {};
    getCurated(campaignPlatform, campaignGoal).forEach(inf => { initial[inf.id] = true; });
    setCuratedSelected(initial);
    setFlowStep('curated');
  }

  function launchCampaignBuilder() {
    if (!isPro) { setShowUpgrade(true); return; }
    setShowCampaign(true);
  }

  // SoundCloud: only one DJ host per campaign — radio-button behavior
  function toggleCurated(id: string) {
    const inf = INFLUENCERS.find(i => i.id === id);
    if (!inf) return;
    setCuratedSelected(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (inf.platform === 'SoundCloud' && next[id]) {
        INFLUENCERS
          .filter(i => i.platform === 'SoundCloud' && i.id !== id)
          .forEach(i => { next[i.id] = false; });
      }
      return next;
    });
  }

  const goalLabel: Record<CampaignGoal, string> = {
    viral: 'Go Viral', growth: 'Build Audience', credibility: 'Credibility',
  };
  const platformLabel = campaignPlatform === 'All' ? 'All platforms' : campaignPlatform;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        {showUpgrade  && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
        {showCampaign && (
          <CampaignBuilder
            song={campaignSong || undefined}
            preSelected={curatedSelected}
            onClose={() => setShowCampaign(false)}
          />
        )}
      </AnimatePresence>
      <OutreachPanel target={outreachTarget} onClose={() => setOutreachTarget(null)} />

      {/* ══════════════════════════════════════════════════════════════════════
          STEP: SETUP — clean campaign setup wizard
         ══════════════════════════════════════════════════════════════════════ */}
      {flowStep === 'setup' && (
        <motion.div
          key="setup"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-8"
        >
          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-2">
                Influencer Network
              </h1>
              <p className="text-white/30 text-sm font-bold">
                {NETWORK_STATS.total}+ curated creators, curators, and culture drivers.
              </p>
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

          {/* Campaign setup card */}
          <div className="w-full max-w-lg mx-auto">
            <div className="bg-zinc-900/60 border border-white/8 rounded-3xl p-7 sm:p-9 space-y-7 shadow-2xl">

              {/* Card header */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/25 flex items-center justify-center shrink-0">
                  <Sparkles size={15} className="text-[#FFD700]" />
                </div>
                <div>
                  <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest leading-none">Campaign Builder</p>
                  <h2 className="text-white font-black text-lg leading-tight mt-0.5">
                    Who's promoting your track?
                  </h2>
                </div>
              </div>

              <p className="text-white/35 text-sm font-medium -mt-3 leading-relaxed">
                Tell us your release and goal — we'll match you with the right creators.
              </p>

              {/* Song / release name */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-white/35 mb-2">
                  Song or release name
                </label>
                <input
                  type="text"
                  value={campaignSong}
                  onChange={e => setCampaignSong(e.target.value)}
                  placeholder="e.g. Sloppy Joe"
                  className="w-full bg-zinc-950 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FFD700]/30 transition-colors"
                />
              </div>

              {/* Platform focus */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-white/35 mb-2.5">
                  Focus platform
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORM_FOCUS.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setCampaignPlatform(p.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all ${
                        campaignPlatform === p.id
                          ? p.activeClass
                          : 'bg-zinc-800/60 border-white/8 text-white/40 hover:text-white hover:border-white/15'
                      }`}
                    >
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campaign goal */}
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-white/35 mb-2.5">
                  Campaign goal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {GOALS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setCampaignGoal(g.id)}
                      className={`flex flex-col items-start p-3.5 rounded-2xl border transition-all text-left ${
                        campaignGoal === g.id
                          ? 'bg-[#FFD700]/10 border-[#FFD700]/35 text-white'
                          : 'bg-zinc-800/40 border-white/6 text-white/40 hover:border-white/15 hover:text-white/70'
                      }`}
                    >
                      <span className={`mb-1.5 ${campaignGoal === g.id ? 'text-[#FFD700]' : 'text-white/30'}`}>
                        {g.icon}
                      </span>
                      <p className="font-black text-[11px] uppercase tracking-widest leading-none">{g.label}</p>
                      <p className={`text-[10px] font-medium mt-1 leading-snug ${
                        campaignGoal === g.id ? 'text-white/50' : 'text-white/25'
                      }`}>{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={startCurated}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_24px_rgba(255,215,0,0.22)]"
              >
                Find my team <ArrowRight size={14} />
              </button>

              {/* Browse link */}
              <div className="text-center -mt-2">
                <button
                  onClick={() => setFlowStep('browse')}
                  className="text-white/25 hover:text-white/50 text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  Browse all {NETWORK_STATS.total}+ creators instead
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP: CURATED — matched creators with selection
         ══════════════════════════════════════════════════════════════════════ */}
      {flowStep === 'curated' && (
        <motion.div
          key="curated"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-6"
        >
          {/* Back + context */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setFlowStep('setup')}
              className="flex items-center gap-1.5 text-white/35 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={13} /> Start over
            </button>
            {!isPro && (
              <button
                onClick={() => setShowUpgrade(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] font-black text-[10px] uppercase tracking-widest hover:bg-[#FFD700]/20 transition-all"
              >
                <Crown size={11} /> Upgrade to launch
              </button>
            )}
          </div>

          {/* Section heading */}
          <div>
            <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tighter uppercase mb-3">
              Your matched creators
            </h2>
            {/* Context chips */}
            <div className="flex flex-wrap gap-2">
              {campaignSong && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] text-[10px] font-black uppercase tracking-widest">
                  🎵 {campaignSong}
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest">
                {platformLabel}
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest">
                {goalLabel[campaignGoal]}
              </span>
            </div>
          </div>

          {/* Gmail banner */}
          <div className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border ${
            isGmailConnected ? 'bg-green-500/5 border-green-500/15' : 'bg-white/[0.03] border-white/8'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isGmailConnected ? 'bg-green-500/15' : 'bg-white/5'
              }`}>
                {isGmailConnected
                  ? <Check size={13} className="text-green-400" />
                  : <Mail size={13} className="text-white/30" />}
              </div>
              <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                {isGmailConnected
                  ? 'Gmail connected — pitch creators directly from GrounduP'
                  : 'Connect Gmail to send pitches to any creator without leaving the app'}
              </p>
            </div>
            {!isGmailConnected && <GmailConnectButton className="flex-shrink-0" />}
          </div>

          {/* Curated picks grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white/25 text-[10px] font-black uppercase tracking-widest">
                {curatedPicks.length} hand-picked · {selectedCount} selected — tap to toggle
              </p>
              {/* SoundCloud notice if any SC creators are in the picks */}
              {curatedPicks.some(i => i.platform === 'SoundCloud') && (
                <p className="text-orange-400/70 text-[9px] font-bold flex items-center gap-1">
                  <Radio size={10} /> 1 SoundCloud host max
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {curatedPicks.map((inf, i) => (
                <motion.div
                  key={inf.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <InfluencerCard
                    inf={inf}
                    selectable
                    selected={!!curatedSelected[inf.id]}
                    onToggle={() => toggleCurated(inf.id)}
                    onOutreach={isGmailConnected ? setOutreachTarget : undefined}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* "Need someone different?" — expands to full browse grid */}
          <div className="border border-white/5 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowMoreCreators(v => !v)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Users size={14} className="text-white/30" />
                <span className="text-white/50 font-black text-[10px] uppercase tracking-widest">
                  Need someone different? Browse all {NETWORK_STATS.total}+ creators
                </span>
              </div>
              {showMoreCreators
                ? <ChevronUp size={14} className="text-white/30" />
                : <ChevronDown size={14} className="text-white/30" />}
            </button>

            <AnimatePresence>
              {showMoreCreators && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-2 space-y-4">
                    {/* Mini search */}
                    <div className="relative">
                      <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                      <input
                        type="text"
                        placeholder="Search creators…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/15 transition-colors"
                      />
                    </div>

                    {/* Platform filter */}
                    <div className="flex flex-wrap gap-1.5">
                      {PLATFORM_FOCUS.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setActivePlatform(p.id)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-black text-[9px] uppercase tracking-widest transition-all ${
                            activePlatform === p.id
                              ? p.activeClass
                              : 'bg-zinc-800/60 border-white/8 text-white/35 hover:text-white'
                          }`}
                        >
                          {p.icon} {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Additional creators (not already in curated) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                      {INFLUENCERS
                        .filter(inf => !curatedPicks.find(c => c.id === inf.id))
                        .filter(inf => activePlatform === 'All' || inf.platform === activePlatform)
                        .filter(inf => {
                          if (!search.trim()) return true;
                          const q = search.toLowerCase();
                          return inf.name.toLowerCase().includes(q) || inf.handle.toLowerCase().includes(q) || inf.niche.toLowerCase().includes(q);
                        })
                        .slice(0, isPro ? 999 : FREE_ROW_LIMIT)
                        .map(inf => (
                          <InfluencerCard
                            key={inf.id}
                            inf={inf}
                            selectable
                            selected={!!curatedSelected[inf.id]}
                            onToggle={() => toggleCurated(inf.id)}
                          />
                        ))}
                    </div>

                    {!isPro && (
                      <button
                        onClick={() => setShowUpgrade(true)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#FFD700]/8 border border-[#FFD700]/20 text-[#FFD700] font-black text-[10px] uppercase tracking-widest hover:bg-[#FFD700]/15 transition-all"
                      >
                        <Lock size={12} /> Unlock all {NETWORK_STATS.total}+ creators with Pro
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sticky bottom bar */}
          <div className="sticky bottom-4 z-20">
            <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-zinc-900/95 border border-white/10 backdrop-blur-md shadow-2xl">
              <div>
                <p className="text-white font-black text-sm leading-none">
                  {selectedCount} creator{selectedCount !== 1 ? 's' : ''} selected
                </p>
                <p className="text-white/30 text-[10px] font-medium mt-0.5">
                  {selectedCount === 0 ? 'Tap a card above to select' : 'Ready to brief your campaign'}
                </p>
              </div>
              <button
                onClick={launchCampaignBuilder}
                disabled={selectedCount === 0}
                className="flex items-center gap-2 px-5 h-11 rounded-xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest disabled:opacity-40 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_18px_rgba(255,215,0,0.2)] shrink-0"
              >
                <Sparkles size={13} />
                Brief campaign
                {!isPro && <Crown size={11} />}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STEP: BROWSE — full existing influencer grid
         ══════════════════════════════════════════════════════════════════════ */}
      {flowStep === 'browse' && (
        <motion.div
          key="browse"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFlowStep('setup')}
                className="flex items-center gap-1.5 text-white/35 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors mt-1"
              >
                <ArrowLeft size={13} />
              </button>
              <div>
                <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-2">
                  Influencer Network
                </h1>
                <p className="text-white/30 text-sm font-bold">
                  Our curated network of creators, curators, and culture drivers.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { setFlowStep('setup'); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] font-black text-[10px] uppercase tracking-widest hover:bg-[#FFD700]/20 transition-all"
              >
                <Sparkles size={12} /> Build campaign
              </button>
              {!isPro && (
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 font-black text-[10px] uppercase tracking-widest hover:border-white/20 transition-all"
                >
                  <Crown size={12} /> Upgrade
                </button>
              )}
            </div>
          </div>

          {/* Gmail banner */}
          <div className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border ${
            isGmailConnected ? 'bg-green-500/5 border-green-500/15' : 'bg-white/[0.03] border-white/8'
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

          {/* Platform tabs — each platform shows its brand color when active */}
          <div className="flex flex-wrap items-center gap-2">
            {PLATFORM_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActivePlatform(tab.id); setActiveTier('All'); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                  activePlatform === tab.id
                    ? tab.activeClass
                    : 'bg-zinc-900/40 border-white/5 text-white/40 hover:text-white hover:border-white/10'
                }`}
              >
                {tab.icon} {tab.label}
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
                : `Showing ${unlocked.length} of ${filtered.length} — ${lockedCards.length} locked`}
            </p>
          </div>

          {/* Influencer grid — unlocked */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {unlocked.map((inf, i) => (
              <motion.div
                key={inf.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <InfluencerCard
                  inf={inf}
                  onOutreach={isGmailConnected ? setOutreachTarget : undefined}
                />
              </motion.div>
            ))}
          </div>

          {/* Paywall */}
          {lockedCards.length > 0 && (
            <div className="relative">
              <div className="relative z-10 rounded-3xl border border-[#FFD700]/20 bg-gradient-to-r from-[#FFD700]/8 to-transparent p-6 mb-4 flex items-center justify-between gap-4 overflow-hidden">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFD700]/15 border border-[#FFD700]/25 flex items-center justify-center shrink-0">
                    <Lock size={16} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm uppercase tracking-widest">
                      {lockedCards.length} more influencers locked
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

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {lockedCards.map((inf, i) => (
                  <motion.div
                    key={inf.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => setShowUpgrade(true)}
                  >
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl group-hover:bg-black/50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center mb-2">
                        <Lock size={15} className="text-[#FFD700]" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#FFD700]/80">Pro</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none rounded-b-2xl" />
            </div>
          )}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              <Users size={32} className="text-white/10 mb-4" />
              <p className="text-white/20 font-black text-sm uppercase tracking-widest">No influencers match your filters</p>
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}
