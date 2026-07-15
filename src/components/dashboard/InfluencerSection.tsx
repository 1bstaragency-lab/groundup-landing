import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, TrendingUp, Music2, Globe, ExternalLink, Zap, Play, Radio,
  Lock, Crown, X, Mail, Check, Sparkles, ArrowRight, ArrowLeft,
  Flame, BarChart2, Star, Users, Pen, MessageSquare, ListMusic,
  Info, Upload, FileAudio, Plus, XCircle,
} from 'lucide-react';
import { CampaignBuilder } from './CampaignBuilder';
import { INFLUENCERS, NETWORK_STATS, type Platform, type TikTokTier, type Influencer } from '../../data/influencers';
import { useAuth } from '../../hooks/useAuth';
import { openCheckout } from '../../lib/pricingCheckout';
import { OutreachPanel, GmailConnectButton, type OutreachTarget } from '../ui/GmailCompose';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type FlowStep = 'setup' | 'pick'
type CampaignGoal = 'viral' | 'growth' | 'credibility' | 'release_push' | 'playlist' | 'word_of_mouth' | 'custom'

const FREE_ROW_LIMIT = 6;

// ─────────────────────────────────────────────────────────────────────────────
// Campaign goals — 6 presets + custom
// ─────────────────────────────────────────────────────────────────────────────
const GOALS: {
  id: CampaignGoal;
  label: string;
  desc: string;
  hint: string;            // tooltip shown on hover
  example: string;         // small example bubble
  icon: React.ReactNode;
}[] = [
  {
    id: 'viral',
    label: 'Go Viral',
    desc: 'TikTok trends & challenges',
    hint: 'Best for tracks with a hook people can react or dance to.',
    example: '"Use this sound" POV with your drop',
    icon: <Flame size={13} />,
  },
  {
    id: 'growth',
    label: 'Build Audience',
    desc: 'Max reach across platforms',
    hint: 'Targets the largest accounts to expose you to the most new listeners.',
    example: 'Feature in a 1M+ follower music page',
    icon: <BarChart2 size={13} />,
  },
  {
    id: 'credibility',
    label: 'Credibility',
    desc: 'Curators & tastemakers',
    hint: 'Blogs, playlist curators, and respected voices in your genre.',
    example: '"Ones to watch" blog feature or review',
    icon: <Star size={13} />,
  },
  {
    id: 'release_push',
    label: 'Release Week Push',
    desc: 'Coordinated multi-platform drop',
    hint: 'Hit TikTok, Twitter, and playlists in sync around your release date.',
    example: 'Day-1 posts across 5 platforms simultaneously',
    icon: <Zap size={13} />,
  },
  {
    id: 'playlist',
    label: 'Playlist Placement',
    desc: 'Spotify & SoundCloud curators',
    hint: 'Get added to playlists that drive consistent, compounding streams.',
    example: 'Added to a "Late Night R&B" playlist with 80K followers',
    icon: <ListMusic size={13} />,
  },
  {
    id: 'word_of_mouth',
    label: 'Word of Mouth',
    desc: 'Micro-influencers, real fans',
    hint: 'Authentic promotion through niche communities — higher trust, deeper impact.',
    example: 'A 5K-follower rap blog that actually moves tickets',
    icon: <MessageSquare size={13} />,
  },
  {
    id: 'custom',
    label: 'Custom',
    desc: 'Build your own strategy',
    hint: "Describe exactly what you want — we'll help you find the right creators for it.",
    example: 'e.g. "I want blogs and TikTok in NY only"',
    icon: <Pen size={13} />,
  },
]

// Sort influencers based on selected goal
function sortByGoal(list: Influencer[], goal: CampaignGoal): Influencer[] {
  const sorted = [...list];
  switch (goal) {
    case 'viral':
    case 'word_of_mouth':
      return sorted.sort((a, b) => b.engagementRate - a.engagementRate);
    case 'growth':
    case 'release_push':
      return sorted.sort((a, b) => b.followers - a.followers);
    case 'credibility':
    case 'playlist':
      return sorted.sort((a, b) => {
        const s = (p: Platform) => ['Spotify', 'SoundCloud', 'Blog'].includes(p) ? 2 : p === 'YouTube' ? 1 : 0;
        const d = s(b.platform) - s(a.platform);
        return d !== 0 ? d : b.followers - a.followers;
      });
    default:
      return sorted.sort((a, b) => b.followers - a.followers);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Audio-match — broad genre/mood tags an artist can pick for their track,
// matched against the free-text `niche` field on the curator dataset.
// ─────────────────────────────────────────────────────────────────────────────
const MATCH_TAG_OPTIONS = [
  'Hip-Hop', 'Rap', 'R&B', 'Pop', 'Afrobeats', 'Trap', 'Drill',
  'Indie', 'Electronic', 'Latin', 'Rock', 'Gospel', 'Jazz',
  'Neo-Soul', 'Lo-fi', 'Alternative', 'Country', 'Reggae',
];

/** Score a curator against a set of loosely-matched genre/mood tags. */
function tagMatchScore(inf: Influencer, tags: string[]): number {
  const niche = inf.niche.toLowerCase();
  return tags.reduce((score, tag) => {
    const t = tag.toLowerCase();
    return niche.includes(t) || t.includes(niche) ? score + 1 : score;
  }, 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform config with tooltips
// ─────────────────────────────────────────────────────────────────────────────
const PLATFORM_FOCUS: {
  id: Platform | 'All';
  label: string;
  icon: React.ReactNode;
  activeClass: string;
  tip: string;
}[] = [
  { id: 'All',        label: 'All',        icon: <Globe size={12} />,      activeClass: 'bg-[#FFD700] border-transparent text-black',   tip: 'Mix of creators across all platforms for full coverage.' },
  { id: 'TikTok',     label: 'TikTok',     icon: <Zap size={12} />,        activeClass: 'bg-sky-500 border-transparent text-white',     tip: 'Sound-driven. Best for trends, POVs, challenges, and viral hooks.' },
  { id: 'Twitter',    label: 'Twitter',    icon: <TrendingUp size={12} />, activeClass: 'bg-blue-500 border-transparent text-white',    tip: 'Text-first culture. Meme pages, rap blogs, and hot-take accounts.' },
  { id: 'YouTube',    label: 'YouTube',    icon: <Play size={12} />,       activeClass: 'bg-red-500 border-transparent text-white',     tip: 'Long-form & Shorts. Reactions, breakdowns, and playlist videos.' },
  { id: 'Spotify',    label: 'Spotify',    icon: <Music2 size={12} />,     activeClass: 'bg-green-600 border-transparent text-white',   tip: 'Playlist curators. Drives consistent streaming numbers over time.' },
  { id: 'SoundCloud', label: 'SoundCloud', icon: <Radio size={12} />,      activeClass: 'bg-orange-500 border-transparent text-white',  tip: 'Upload & repost placements. One DJ host per campaign.' },
]

const PLATFORM_TABS = PLATFORM_FOCUS;

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

const PLATFORM_COLORS: Record<Platform, string> = {
  TikTok:     'bg-sky-500/15 text-sky-400',
  Twitter:    'bg-blue-500/15 text-blue-400',
  Spotify:    'bg-green-500/15 text-green-400',
  Blog:       'bg-purple-500/15 text-purple-400',
  YouTube:    'bg-red-500/15 text-red-400',
  SoundCloud: 'bg-orange-500/15 text-orange-400',
}

const PLATFORM_AVATAR: Record<Platform, string> = {
  TikTok:     'bg-sky-500/20 text-sky-300',
  Twitter:    'bg-blue-500/20 text-blue-300',
  Spotify:    'bg-green-500/20 text-green-300',
  Blog:       'bg-purple-500/20 text-purple-300',
  YouTube:    'bg-red-500/20 text-red-300',
  SoundCloud: 'bg-orange-500/20 text-orange-300',
}

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
// Tooltip bubble — appears on hover, self-contained with arrow
// ─────────────────────────────────────────────────────────────────────────────
function Tooltip({ text, children, side = 'bottom' }: {
  text: string;
  children: React.ReactNode;
  side?: 'bottom' | 'top' | 'right';
}) {
  return (
    <div className="relative group/tt inline-block">
      {children}
      <div className={`pointer-events-none absolute z-50 w-52 bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-xl px-3 py-2.5 shadow-2xl
        opacity-0 group-hover/tt:opacity-100 transition-all duration-150 text-[11px] text-[rgba(var(--dash-fg),0.7)] font-medium leading-snug
        ${side === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' : ''}
        ${side === 'top'    ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : ''}
        ${side === 'right'  ? 'left-full top-1/2 -translate-y-1/2 ml-2' : ''}
      `}>
        {/* Arrow */}
        {side === 'bottom' && <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--dash-card)] border-l border-t border-[var(--dash-border)] rotate-45" />}
        {side === 'top'    && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--dash-card)] border-r border-b border-[var(--dash-border)] rotate-45" />}
        {side === 'right'  && <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-[var(--dash-card)] border-l border-b border-[var(--dash-border)] rotate-45" />}
        {text}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Example bubble — small floating callout chip
// ─────────────────────────────────────────────────────────────────────────────
function ExampleBubble({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[rgba(var(--dash-fg),0.05)] border border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.52)] text-[10px] font-medium italic">
      <span className="text-[#FFD700]/60 not-italic">e.g.</span> {text}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Upgrade modal
// ─────────────────────────────────────────────────────────────────────────────
function UpgradeModal({ userId, onClose }: { userId: string | undefined; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState<string | null>(null);

  async function handleUpgrade() {
    if (!userId) { onClose(); return; }
    setBusy(true);
    setErr(null);
    const result = await openCheckout(userId, 'pro');
    if (!result.ok) { setErr(result.message ?? 'Could not start checkout.'); setBusy(false); }
    // On success openCheckout redirects the page — nothing left to do here.
  }

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
        className="relative w-full max-w-[400px]"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full bg-[var(--dash-card)] border border-[rgba(var(--dash-fg),0.15)] flex items-center justify-center text-[rgba(var(--dash-fg),0.5)] hover:text-[rgb(var(--dash-fg))] transition-colors">
          <X size={13} />
        </button>
        <div className="relative overflow-hidden rounded-2xl bg-zinc-950/90 border border-white/10 backdrop-blur-md p-8 text-center">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/40 to-transparent" />
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center mb-5">
            <Crown size={22} className="text-[#FFD700]" />
          </div>
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em] mb-3">Pro Plan · $29/mo</p>
          <h3 className="text-white text-2xl font-black tracking-tighter mb-3">Unlock the Full Network</h3>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            Every curator, unlimited outreach, and priority placement — included with{' '}
            <span className="text-[#FFD700] font-bold">uP Pro</span>.
          </p>
          <button
            onClick={handleUpgrade}
            disabled={busy}
            className="w-full h-12 rounded-2xl font-black text-[13px] tracking-wide flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            style={{ background: '#FFD700', color: '#000', boxShadow: '0 4px 20px rgba(255,215,0,0.35), inset 0 1px 0 rgba(255,255,255,0.4)' }}
          >
            {busy ? 'Opening checkout…' : <>Continue to Stripe <ArrowRight size={16} /></>}
          </button>
          {err && <p className="mt-3 text-[10px] font-medium text-[#FFD700]/70">{err}</p>}
          <p className="mt-4 text-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
            <Lock size={10} className="inline mr-1" />
            Payments are secure and encrypted
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Audio match modal — drop a track, tag its genre/mood/niche, jump straight
// into the pick step ranked by curator fit. No audio analysis — the artist
// tags it themselves, same way they'd describe it to a real playlist rep.
// ─────────────────────────────────────────────────────────────────────────────
function AudioMatchModal({
  initialTag, onMatch, onClose,
}: {
  initialTag?: string;
  onMatch:     (tags: string[]) => void;
  onClose:     () => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [tags, setTags]         = useState<string[]>(initialTag ? [initialTag] : []);
  const [customTag, setCustomTag] = useState('');
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
  }

  function toggleTag(tag: string) {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  }

  function addCustomTag() {
    const t = customTag.trim();
    if (!t || tags.some(x => x.toLowerCase() === t.toLowerCase())) { setCustomTag(''); return; }
    setTags(prev => [...prev, t]);
    setCustomTag('');
  }

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
        className="relative w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full bg-[var(--dash-card)] border border-[rgba(var(--dash-fg),0.15)] flex items-center justify-center text-[rgba(var(--dash-fg),0.5)] hover:text-[rgb(var(--dash-fg))] transition-colors">
          <X size={13} />
        </button>

        <div className="rounded-2xl bg-zinc-950/90 border border-white/10 backdrop-blur-md p-7">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/25 flex items-center justify-center shrink-0">
              <FileAudio size={15} className="text-[#FFD700]" />
            </div>
            <div>
              <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest leading-none">Match My Track</p>
              <h3 className="text-white font-black text-lg leading-tight mt-0.5">Find curators in your niche</h3>
            </div>
          </div>

          {/* Drop zone */}
          <label
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 cursor-pointer transition-colors ${
              dragOver ? 'border-[#FFD700]/50 bg-[#FFD700]/5' : 'border-white/10 hover:border-white/20'
            }`}
          >
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={e => handleFile(e.target.files?.[0])}
            />
            <Upload size={20} className={fileName ? 'text-[#FFD700]' : 'text-white/30'} />
            {fileName ? (
              <p className="text-white text-xs font-bold truncate max-w-full">{fileName}</p>
            ) : (
              <>
                <p className="text-white/60 text-xs font-bold">Drop your audio file here</p>
                <p className="text-white/30 text-[10px] font-medium">or click to browse — mp3, wav, m4a</p>
              </>
            )}
          </label>

          {/* Tags */}
          <div className="mt-5">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">
              Tag the genre / mood / niche
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MATCH_TAG_OPTIONS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1.5 rounded-lg border font-black text-[9px] uppercase tracking-widest transition-all ${
                    tags.includes(tag)
                      ? 'bg-[#FFD700] border-transparent text-black'
                      : 'bg-white/[0.03] border-white/10 text-white/50 hover:text-white/80 hover:border-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Custom tags already added */}
            {tags.filter(t => !MATCH_TAG_OPTIONS.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.filter(t => !MATCH_TAG_OPTIONS.includes(t)).map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/25 text-[#FFD700] font-black text-[9px] uppercase tracking-widest">
                    {tag}
                    <button onClick={() => toggleTag(tag)}><XCircle size={11} /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Add custom tag */}
            <div className="flex gap-1.5 mt-2.5">
              <input
                type="text"
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTag(); } }}
                placeholder="Add a custom tag…"
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-[#FFD700]/30 transition-colors min-w-0"
              />
              <button
                onClick={addCustomTag}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.03] border border-white/10 text-white/50 hover:text-white shrink-0"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <button
            onClick={() => onMatch(tags)}
            disabled={tags.length === 0}
            className="w-full h-12 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center justify-center gap-2 mt-6 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
            style={{ background: '#FFD700', color: '#000', boxShadow: '0 4px 20px rgba(255,215,0,0.35)' }}
          >
            Find My Curators <ArrowRight size={14} />
          </button>
          <p className="text-center text-[10px] text-white/25 font-medium mt-3">
            {tags.length === 0 ? 'Pick at least one tag to match against.' : `Matching on ${tags.length} tag${tags.length > 1 ? 's' : ''}.`}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Influencer card — platform-color-coordinated
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
  const accentColor =
    inf.platform === 'TikTok'     ? 'bg-sky-500/50'    :
    inf.platform === 'Twitter'    ? 'bg-blue-500/50'   :
    inf.platform === 'Spotify'    ? 'bg-green-500/50'  :
    inf.platform === 'YouTube'    ? 'bg-red-500/50'    :
    inf.platform === 'SoundCloud' ? 'bg-orange-500/50' :
    'bg-purple-500/50';

  return (
    <div
      className={`relative rounded-2xl overflow-hidden border transition-all ${
        selectable
          ? selected
            ? `${theme.bgOn} ${theme.borderOn} cursor-pointer`
            : `bg-[var(--dash-card-alt)] ${theme.border} hover:${theme.borderOn} cursor-pointer`
          : `bg-[var(--dash-card-alt)] ${theme.border} group`
      }`}
      onClick={selectable ? onToggle : undefined}
    >
      <div className={`h-[2px] w-full ${accentColor}`} />
      <div className="p-4">
        {selectable && (
          <div className={`absolute top-5 right-4 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            selected ? 'bg-[#FFD700] border-[#FFD700]' : 'border-[rgba(var(--dash-fg),0.25)] bg-[var(--dash-card)]'
          }`}>
            {selected && <Check size={10} strokeWidth={3} className="text-black" />}
          </div>
        )}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${PLATFORM_AVATAR[inf.platform]}`}>
            {inf.name[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[rgb(var(--dash-fg))] font-black text-sm leading-none truncate pr-6">{inf.name}</p>
            <p className="text-[rgba(var(--dash-fg),0.5)] text-[10px] font-mono mt-0.5 truncate">{inf.handle}</p>
          </div>
          {!selectable && (
            <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[rgba(var(--dash-fg),0.48)] hover:text-[rgb(var(--dash-fg))] shrink-0">
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
        <p className="text-[rgba(var(--dash-fg),0.5)] text-[11px] font-medium mb-3 line-clamp-1">{inf.niche}</p>
        <div className="flex items-center justify-between pt-3 border-t border-[var(--dash-border)]">
          <div>
            <p className="text-[rgb(var(--dash-fg))] font-black text-base leading-none">{fmtFollowers(inf.followers)}</p>
            <p className="text-[rgba(var(--dash-fg),0.46)] text-[9px] font-black uppercase tracking-widest mt-0.5">Followers</p>
          </div>
          <div className="text-right">
            <p className={`font-black text-base leading-none ${inf.engagementRate >= 10 ? 'text-[#FFD700]' : 'text-[rgb(var(--dash-fg))]'}`}>
              {inf.engagementRate}%
            </p>
            <p className="text-[rgba(var(--dash-fg),0.46)] text-[9px] font-black uppercase tracking-widest mt-0.5">Eng. Rate</p>
          </div>
          {inf.avgViews && (
            <div className="text-right">
              <p className="text-[rgb(var(--dash-fg))] font-black text-base leading-none">{fmtFollowers(inf.avgViews)}</p>
              <p className="text-[rgba(var(--dash-fg),0.46)] text-[9px] font-black uppercase tracking-widest mt-0.5">Avg Views</p>
            </div>
          )}
        </div>
        {onOutreach && (
          <div className="mt-3">
            <button
              onClick={e => { e.stopPropagation(); onOutreach({ name: inf.name, handle: inf.handle, platform: inf.platform, niche: inf.niche, email: inf.email, instagram: inf.instagram }); }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[rgba(var(--dash-fg),0.05)] border border-[rgba(var(--dash-fg),0.15)] text-[rgba(var(--dash-fg),0.6)] hover:text-[rgb(var(--dash-fg))] hover:border-[#FFD700]/30 hover:bg-[#FFD700]/8 transition-all font-black text-[10px] uppercase tracking-widest"
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
  const { user, profile, refreshProfile } = useAuth();

  const [showUpgrade, setShowUpgrade]       = useState(false);
  const [showCampaign, setShowCampaign]     = useState(false);
  const [showAudioMatch, setShowAudioMatch] = useState(false);
  const [matchTags, setMatchTags]           = useState<string[]>([]);
  const [outreachTarget, setOutreachTarget] = useState<OutreachTarget | null>(null);

  // ── Guided flow ────────────────────────────────────────────────────────────
  const [flowStep, setFlowStep]           = useState<FlowStep>('setup');
  const [campaignSong, setCampaignSong]   = useState('');
  const [campaignPlatform, setCampaignPlatform] = useState<Platform | 'All'>('All');
  const [campaignGoal, setCampaignGoal]   = useState<CampaignGoal>('viral');
  const [customGoalText, setCustomGoalText] = useState('');
  const [selected, setSelected]           = useState<Record<string, boolean>>({});
  const [tipDismissed, setTipDismissed]   = useState(false);

  // ── Pick-step filters ──────────────────────────────────────────────────────
  const [pickPlatform, setPickPlatform]   = useState<Platform | 'All'>('All');
  const [pickTier, setPickTier]           = useState<TikTokTier | 'All'>('All');
  const [search, setSearch]               = useState('');
  const [showCurator, setShowCurator]     = useState(false);

  const isPro           = profile?.plan_tier === 'pro' || profile?.plan_tier === 'growth';
  const isGmailConnected = !!(profile as any)?.gmail_refresh_token;

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

  // Filtered + sorted influencer list for the pick step
  const pickList = useMemo(() => {
    let list = INFLUENCERS;
    if (pickPlatform !== 'All') list = list.filter(i => i.platform === pickPlatform);
    if (pickPlatform === 'TikTok' && pickTier !== 'All') list = list.filter(i => i.tier === pickTier);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.handle.toLowerCase().includes(q) ||
        i.niche.toLowerCase().includes(q),
      );
    }
    if (matchTags.length > 0) {
      return list
        .map(i => ({ i, score: tagMatchScore(i, matchTags) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score || b.i.engagementRate - a.i.engagementRate)
        .map(({ i }) => i);
    }
    return sortByGoal(list, campaignGoal);
  }, [pickPlatform, pickTier, search, campaignGoal, matchTags]);

  const unlocked    = isPro ? pickList : pickList.slice(0, FREE_ROW_LIMIT);
  const lockedCards = isPro ? []       : pickList.slice(FREE_ROW_LIMIT);
  const selectedCount = Object.values(selected).filter(Boolean).length;

  // SoundCloud radio-select
  function toggleCreator(id: string) {
    const inf = INFLUENCERS.find(i => i.id === id);
    if (!inf) return;
    setSelected(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (inf.platform === 'SoundCloud' && next[id]) {
        INFLUENCERS
          .filter(i => i.platform === 'SoundCloud' && i.id !== id)
          .forEach(i => { next[i.id] = false; });
      }
      return next;
    });
  }

  function enterPickStep() {
    setPickPlatform(campaignPlatform);
    setPickTier('All');
    setSearch('');
    setTipDismissed(false);
    setFlowStep('pick');
  }

  function applyTrackMatch(tags: string[]) {
    setMatchTags(tags);
    setPickPlatform('All');
    setPickTier('All');
    setSearch('');
    setTipDismissed(false);
    setShowAudioMatch(false);
    setFlowStep('pick');
  }

  function launchCampaignBuilder() {
    if (!isPro) { setShowUpgrade(true); return; }
    setShowCampaign(true);
  }

  const goalObj = GOALS.find(g => g.id === campaignGoal)!;
  const platformObj = PLATFORM_FOCUS.find(p => p.id === campaignPlatform)!;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <AnimatePresence>
        {showUpgrade  && <UpgradeModal userId={user?.id} onClose={() => setShowUpgrade(false)} />}
        {showAudioMatch && (
          <AudioMatchModal
            initialTag={(profile as any)?.genre || undefined}
            onMatch={applyTrackMatch}
            onClose={() => setShowAudioMatch(false)}
          />
        )}
        {showCampaign && (
          <CampaignBuilder
            song={campaignSong || undefined}
            preSelected={selected}
            onClose={() => setShowCampaign(false)}
          />
        )}
      </AnimatePresence>
      <OutreachPanel target={outreachTarget} onClose={() => setOutreachTarget(null)} />

      {/* ══════════════════════════════════════════════════════════════════════
          SETUP STEP
         ══════════════════════════════════════════════════════════════════════ */}
      {flowStep === 'setup' && (
        <motion.div key="setup" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

          {/* Page header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl lg:text-5xl font-black text-[rgb(var(--dash-fg))] tracking-tighter uppercase mb-2">Influencer Network</h1>
              <p className="text-[rgba(var(--dash-fg),0.5)] text-sm font-bold">{NETWORK_STATS.total}+ curated creators, curators & culture drivers.</p>
            </div>
            {!isPro && (
              <button onClick={() => setShowUpgrade(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] font-black text-[10px] uppercase tracking-widest hover:bg-[#FFD700]/20 transition-all shrink-0">
                <Crown size={12} /> Upgrade
              </button>
            )}
          </div>

          {/* Setup card */}
          <div className="w-full max-w-xl mx-auto">
            <div className="bg-[var(--dash-card)] border border-[var(--dash-border)] rounded-3xl p-7 sm:p-9 shadow-2xl space-y-7">

              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/25 flex items-center justify-center shrink-0">
                  <Sparkles size={15} className="text-[#FFD700]" />
                </div>
                <div>
                  <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-widest leading-none">Campaign Builder</p>
                  <h2 className="text-[rgb(var(--dash-fg))] font-black text-lg leading-tight mt-0.5">Who's promoting your track?</h2>
                </div>
              </div>
              <p className="text-[rgba(var(--dash-fg),0.5)] text-sm font-medium -mt-3 leading-relaxed">
                Set your goal and platform — then hand-pick the creators you believe in.
              </p>

              {/* Song name */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[rgba(var(--dash-fg),0.5)]">Song or release name</label>
                  <Tooltip text="Your track name is used to generate AI content ideas in the brief step." side="right">
                    <Info size={11} className="text-[rgba(var(--dash-fg),0.46)] cursor-default" />
                  </Tooltip>
                </div>
                <input
                  type="text"
                  value={campaignSong}
                  onChange={e => setCampaignSong(e.target.value)}
                  placeholder="e.g. Sloppy Joe"
                  className="w-full bg-[var(--dash-card-alt)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm text-[rgb(var(--dash-fg))] placeholder:text-[rgba(var(--dash-fg),0.35)] focus:outline-none focus:border-[#FFD700]/30 transition-colors"
                />
                <p className="mt-1.5 text-[rgba(var(--dash-fg),0.46)] text-[10px] font-medium">Optional — helps personalize content ideas later</p>
              </div>

              {/* Platform focus */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[rgba(var(--dash-fg),0.5)]">Focus platform</label>
                  <Tooltip text="Filter the creator list to a specific platform, or keep All for a full-coverage campaign." side="right">
                    <Info size={11} className="text-[rgba(var(--dash-fg),0.46)] cursor-default" />
                  </Tooltip>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORM_FOCUS.map(p => (
                    <Tooltip key={p.id} text={p.tip} side="bottom">
                      <button
                        onClick={() => setCampaignPlatform(p.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-black text-[9px] uppercase tracking-widest transition-all ${
                          campaignPlatform === p.id
                            ? p.activeClass
                            : 'bg-[var(--dash-card-alt)] border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.52)] hover:text-[rgb(var(--dash-fg))] hover:border-[rgba(var(--dash-fg),0.2)]'
                        }`}
                      >
                        {p.icon} {p.label}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>

              {/* Campaign goal — 6 presets + custom in a 2-col grid */}
              <div>
                <div className="flex items-center gap-2 mb-2.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[rgba(var(--dash-fg),0.5)]">Campaign goal</label>
                  <Tooltip text="Your goal determines how the creator list is sorted — not who we pick for you. You make the final call." side="right">
                    <Info size={11} className="text-[rgba(var(--dash-fg),0.46)] cursor-default" />
                  </Tooltip>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map(g => (
                    <button
                      key={g.id}
                      onClick={() => setCampaignGoal(g.id)}
                      className={`relative flex flex-col items-start p-3.5 rounded-2xl border transition-all text-left group/goal ${
                        campaignGoal === g.id
                          ? 'bg-[#FFD700]/10 border-[#FFD700]/35 text-[rgb(var(--dash-fg))]'
                          : 'bg-[var(--dash-card-alt)] border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.52)] hover:border-[rgba(var(--dash-fg),0.2)] hover:text-[rgba(var(--dash-fg),0.62)]'
                      } ${g.id === 'custom' ? 'col-span-2' : ''}`}
                    >
                      <span className={`mb-1.5 ${campaignGoal === g.id ? 'text-[#FFD700]' : 'text-[rgba(var(--dash-fg),0.5)] group-hover/goal:text-[rgba(var(--dash-fg),0.55)]'}`}>
                        {g.icon}
                      </span>
                      <p className="font-black text-[11px] uppercase tracking-widest leading-none">{g.label}</p>
                      <p className={`text-[10px] font-medium mt-1 leading-snug ${campaignGoal === g.id ? 'text-[rgba(var(--dash-fg),0.55)]' : 'text-[rgba(var(--dash-fg),0.48)]'}`}>
                        {g.desc}
                      </p>
                      {/* Hover hint bubble */}
                      <div className="mt-2 opacity-0 group-hover/goal:opacity-100 transition-opacity max-h-0 group-hover/goal:max-h-20 overflow-hidden">
                        <p className="text-[rgba(var(--dash-fg),0.52)] text-[10px] font-medium leading-snug border-t border-[var(--dash-border)] pt-2 mt-0.5">
                          {g.hint}
                        </p>
                        <ExampleBubble text={g.example} />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom goal textarea */}
                <AnimatePresence>
                  {campaignGoal === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-3"
                    >
                      <textarea
                        value={customGoalText}
                        onChange={e => setCustomGoalText(e.target.value)}
                        placeholder={'Describe your strategy — e.g. "I want TikTok creators in NY + LA who focus on drill, plus 2 Spotify playlist curators."'}
                        rows={3}
                        className="w-full bg-[var(--dash-card-alt)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm text-[rgb(var(--dash-fg))] placeholder:text-[rgba(var(--dash-fg),0.35)] focus:outline-none focus:border-[#FFD700]/30 transition-colors resize-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA */}
              <button
                onClick={enterPickStep}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_24px_rgba(255,215,0,0.22)]"
              >
                Browse creators <ArrowRight size={14} />
              </button>

              <button
                onClick={() => setShowAudioMatch(true)}
                className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl bg-[var(--dash-card-alt)] border border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.7)] font-black text-[11px] uppercase tracking-widest hover:border-[#FFD700]/30 hover:text-[rgb(var(--dash-fg))] transition-colors"
              >
                <FileAudio size={13} className="text-[#FFD700]" /> Match my track to curators
              </button>

              <div className="text-center -mt-2">
                <p className="text-[rgba(var(--dash-fg),0.42)] text-[10px] font-medium">You choose who to include — no suggestions imposed.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PICK STEP — user browses and selects on their own judgment
         ══════════════════════════════════════════════════════════════════════ */}
      {flowStep === 'pick' && (
        <motion.div key="pick" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* Back + upgrade */}
          <div className="flex items-center justify-between">
            <button onClick={() => setFlowStep('setup')} className="flex items-center gap-1.5 text-[rgba(var(--dash-fg),0.5)] hover:text-[rgb(var(--dash-fg))] text-[10px] font-black uppercase tracking-widest transition-colors">
              <ArrowLeft size={13} /> Back to setup
            </button>
            {!isPro && (
              <button onClick={() => setShowUpgrade(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] font-black text-[10px] uppercase tracking-widest hover:bg-[#FFD700]/20 transition-all">
                <Crown size={11} /> Upgrade to unlock all
              </button>
            )}
          </div>

          {/* Context chips */}
          <div>
            <h2 className="text-2xl lg:text-4xl font-black text-[rgb(var(--dash-fg))] tracking-tighter uppercase mb-3">
              {matchTags.length > 0 ? 'Matched to your track' : 'Pick your team'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {campaignSong && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] text-[10px] font-black uppercase tracking-widest">
                  🎵 {campaignSong}
                </span>
              )}
              {matchTags.length > 0 ? (
                <>
                  {matchTags.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFD700]/10 border border-[#FFD700]/20 text-[#FFD700] text-[10px] font-black uppercase tracking-widest">
                      <FileAudio size={10} /> {tag}
                    </span>
                  ))}
                  <button
                    onClick={() => setMatchTags([])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(var(--dash-fg),0.05)] border border-[rgba(var(--dash-fg),0.15)] text-[rgba(var(--dash-fg),0.6)] hover:text-[rgb(var(--dash-fg))] text-[10px] font-black uppercase tracking-widest transition-colors"
                  >
                    <XCircle size={11} /> Clear match
                  </button>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(var(--dash-fg),0.05)] border border-[rgba(var(--dash-fg),0.15)] text-[rgba(var(--dash-fg),0.6)] text-[10px] font-black uppercase tracking-widest">
                    {platformObj.label}
                  </span>
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(var(--dash-fg),0.05)] border border-[rgba(var(--dash-fg),0.15)] text-[rgba(var(--dash-fg),0.6)] text-[10px] font-black uppercase tracking-widest">
                    {goalObj.label}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Guided tip banner — dismissable */}
          <AnimatePresence>
            {!tipDismissed && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                className="flex items-start justify-between gap-3 px-4 py-3.5 rounded-2xl bg-[rgba(var(--dash-fg),0.03)] border border-[var(--dash-border)]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Info size={12} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-[rgb(var(--dash-fg))] font-black text-[11px] uppercase tracking-widest leading-none">Browse freely — you decide</p>
                    <p className="text-[rgba(var(--dash-fg),0.5)] text-[11px] font-medium mt-1 leading-snug">
                      Tap any card to add a creator to your campaign. Use the filters and search to find exactly who you want.
                      {campaignGoal !== 'custom' && ` Sorted by ${goalObj.label.toLowerCase()} relevance.`}
                    </p>
                    {campaignGoal === 'custom' && customGoalText && (
                      <p className="text-[#FFD700]/60 text-[10px] font-medium mt-1.5 italic">Your goal: "{customGoalText}"</p>
                    )}
                  </div>
                </div>
                <button onClick={() => setTipDismissed(true)} className="text-[rgba(var(--dash-fg),0.46)] hover:text-[rgba(var(--dash-fg),0.55)] transition-colors shrink-0 mt-0.5">
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gmail banner */}
          <div className={`flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border ${isGmailConnected ? 'bg-green-500/5 border-green-500/15' : 'bg-[rgba(var(--dash-fg),0.03)] border-[var(--dash-border)]'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${isGmailConnected ? 'bg-green-500/15' : 'bg-[rgba(var(--dash-fg),0.05)]'}`}>
                {isGmailConnected ? <Check size={13} className="text-green-400" /> : <Mail size={13} className="text-[rgba(var(--dash-fg),0.5)]" />}
              </div>
              <p className="text-[rgba(var(--dash-fg),0.52)] text-[10px] font-black uppercase tracking-widest">
                {isGmailConnected ? 'Gmail connected — pitch any creator directly from here' : 'Connect Gmail to send pitches without leaving GrounduP'}
              </p>
            </div>
            {!isGmailConnected && <GmailConnectButton className="flex-shrink-0" />}
          </div>

          {/* Platform tabs + Curator special tab */}
          <div className="flex flex-wrap items-center gap-2">
            {PLATFORM_TABS.map(tab => (
              <Tooltip key={tab.id} text={tab.tip} side="bottom">
                <button
                  onClick={() => { setPickPlatform(tab.id); setPickTier('All'); setShowCurator(false); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                    !showCurator && pickPlatform === tab.id
                      ? tab.activeClass
                      : 'bg-[var(--dash-card-alt)] border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.52)] hover:text-[rgb(var(--dash-fg))] hover:border-[rgba(var(--dash-fg),0.15)]'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              </Tooltip>
            ))}

            {/* Curator — coming soon */}
            <button
              onClick={() => setShowCurator(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                showCurator
                  ? 'bg-violet-500 border-transparent text-white'
                  : 'bg-[var(--dash-card-alt)] border-violet-500/25 text-violet-400/70 hover:text-violet-300 hover:border-violet-500/40'
              }`}
            >
              <ListMusic size={12} /> Curator
              <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                showCurator ? 'bg-white/20 text-white' : 'bg-violet-500/20 text-violet-400'
              }`}>Soon</span>
            </button>
          </div>

          {/* ── Curator coming-soon panel ── */}
          <AnimatePresence>
            {showCurator && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/8 overflow-hidden"
                style={{ backgroundColor: 'var(--dash-card)' }}
              >
                {/* Top accent */}
                <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 via-purple-400 to-violet-600" />

                <div className="p-8 sm:p-10 flex flex-col items-center text-center">
                  {/* Icon cluster */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center">
                      <ListMusic size={28} className="text-violet-400" />
                    </div>
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-violet-500 text-white text-[9px] font-black uppercase tracking-widest shadow-lg">
                      Coming Soon
                    </div>
                  </div>

                  {/* Heading */}
                  <h3 className="text-[rgb(var(--dash-fg))] font-black text-2xl lg:text-3xl tracking-tighter uppercase mb-3">
                    Playlist Curator
                  </h3>

                  {/* Description */}
                  <p className="text-[rgba(var(--dash-fg),0.55)] text-sm font-medium leading-relaxed max-w-md mb-6">
                    Drop any song from your catalog and we'll match it to real, active playlists that fit your sound —
                    so you can pitch directly and grow your streams through placement, not luck.
                  </p>

                  {/* Feature breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg mb-8">
                    {[
                      { icon: '🎵', title: 'Song matching', desc: 'Paste any track from your catalog' },
                      { icon: '📋', title: 'Playlist pairing', desc: 'We find playlists already playing your sound' },
                      { icon: '📈', title: 'Stream growth', desc: 'Direct pitch to active curators for placement' },
                    ].map(f => (
                      <div key={f.title} className="bg-[rgba(var(--dash-fg),0.03)] border border-[var(--dash-border)] rounded-2xl p-4 text-left">
                        <p className="text-xl mb-1.5">{f.icon}</p>
                        <p className="text-[rgb(var(--dash-fg))] font-black text-[11px] uppercase tracking-widest leading-none mb-1">{f.title}</p>
                        <p className="text-[rgba(var(--dash-fg),0.5)] text-[10px] font-medium leading-snug">{f.desc}</p>
                      </div>
                    ))}
                  </div>

                  {/* Notify CTA */}
                  <p className="text-violet-400/60 text-[10px] font-black uppercase tracking-widest">
                    This feature is in development — check back soon.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SoundCloud single-host notice */}
          {!showCurator && pickPlatform === 'SoundCloud' && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-orange-500/8 border border-orange-500/20">
              <Radio size={12} className="text-orange-400 shrink-0" />
              <p className="text-orange-300/80 text-[10px] font-bold">Only one SoundCloud DJ host can be added per campaign — selecting a new one deselects the previous.</p>
            </div>
          )}

          {/* TikTok tier filter */}
          {!showCurator && pickPlatform === 'TikTok' && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
              {TIKTOK_TIERS.map(tier => (
                <button
                  key={tier.id}
                  onClick={() => setPickTier(tier.id)}
                  className={`px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all ${
                    pickTier === tier.id ? 'bg-[rgba(var(--dash-fg),0.08)] border-[rgba(var(--dash-fg),0.25)] text-[rgb(var(--dash-fg))]' : 'border-[var(--dash-border)] text-[rgba(var(--dash-fg),0.48)] hover:text-[rgba(var(--dash-fg),0.55)]'
                  }`}
                >
                  {tier.label}{tier.range && <span className="ml-1.5 opacity-50">{tier.range}</span>}
                </button>
              ))}
            </motion.div>
          )}

          {/* Search */}
          {!showCurator && <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(var(--dash-fg),0.48)]" />
            <input
              type="text"
              placeholder="Search by name, handle, or niche..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[var(--dash-card-alt)] border border-[var(--dash-border)] rounded-2xl pl-10 pr-5 py-3.5 text-sm text-[rgb(var(--dash-fg))] placeholder:text-[rgba(var(--dash-fg),0.35)] focus:outline-none focus:border-[rgba(var(--dash-fg),0.2)] transition-colors"
            />
          </div>}

          {/* Results count */}
          {!showCurator && <p className="text-[rgba(var(--dash-fg),0.48)] text-[10px] font-black uppercase tracking-widest">
            {isPro ? `${pickList.length} creators` : `${unlocked.length} of ${pickList.length} shown`}
            {campaignGoal !== 'custom' && ` · sorted by ${goalObj.label.toLowerCase()}`}
          </p>}

          {/* Creator grid */}
          {!showCurator && <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {unlocked.map((inf, i) => (
              <motion.div key={inf.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025 }}>
                <InfluencerCard
                  inf={inf}
                  selectable
                  selected={!!selected[inf.id]}
                  onToggle={() => toggleCreator(inf.id)}
                  onOutreach={isGmailConnected ? setOutreachTarget : undefined}
                />
              </motion.div>
            ))}
          </div>}

          {/* Paywall */}
          {!showCurator && lockedCards.length > 0 && (
            <div className="relative">
              <div className="relative z-10 rounded-3xl border border-[#FFD700]/20 bg-gradient-to-r from-[#FFD700]/8 to-transparent p-6 mb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFD700]/15 border border-[#FFD700]/25 flex items-center justify-center shrink-0">
                    <Lock size={16} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <p className="text-[rgb(var(--dash-fg))] font-black text-sm uppercase tracking-widest">{lockedCards.length} more creators locked</p>
                    <p className="text-[rgba(var(--dash-fg),0.5)] text-[11px] font-medium mt-0.5">Upgrade to Pro to unlock the full network with contact info.</p>
                  </div>
                </div>
                <button onClick={() => setShowUpgrade(true)} className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FFD700] text-black font-black text-[10px] uppercase tracking-widest hover:bg-[#FFD700]/90 transition-all">
                  <Crown size={12} /> Unlock All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {lockedCards.map((inf, i) => (
                  <motion.div key={inf.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group" onClick={() => setShowUpgrade(true)}
                  >
                    <div className="bg-[var(--dash-card-alt)] border border-[var(--dash-border)] rounded-2xl p-5 select-none pointer-events-none blur-[3px]">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[rgba(var(--dash-fg),0.08)] border border-[var(--dash-border)] shrink-0" />
                        <div><div className="h-3 w-24 bg-[rgba(var(--dash-fg),0.1)] rounded" /><div className="h-2 w-16 bg-[rgba(var(--dash-fg),0.05)] rounded mt-1.5" /></div>
                      </div>
                      <div className="flex gap-1.5 mb-3"><div className="h-4 w-14 bg-[rgba(var(--dash-fg),0.05)] rounded-full" /><div className="h-4 w-10 bg-[rgba(var(--dash-fg),0.05)] rounded-full" /></div>
                      <div className="h-2 w-32 bg-[rgba(var(--dash-fg),0.05)] rounded mb-3" />
                      <div className="flex justify-between pt-3 border-t border-[var(--dash-border)]"><div className="h-5 w-12 bg-[rgba(var(--dash-fg),0.1)] rounded" /><div className="h-5 w-12 bg-[rgba(var(--dash-fg),0.1)] rounded" /></div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-2xl group-hover:bg-black/50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-[#FFD700]/15 border border-[#FFD700]/30 flex items-center justify-center mb-2"><Lock size={15} className="text-[#FFD700]" /></div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#FFD700]/80">Pro</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none rounded-b-2xl" />
            </div>
          )}

          {!showCurator && pickList.length === 0 && (
            <div className="flex flex-col items-center py-20 text-center">
              <Users size={32} className="text-[rgba(var(--dash-fg),0.4)] mb-4" />
              <p className="text-[rgba(var(--dash-fg),0.46)] font-black text-sm uppercase tracking-widest">No creators match your filters</p>
            </div>
          )}

          {/* Sticky bottom bar */}
          {!showCurator && <div className="sticky bottom-4 z-20">
            <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl bg-[var(--dash-card)] border border-[rgba(var(--dash-fg),0.15)] backdrop-blur-md shadow-2xl">
              <div>
                <p className="text-[rgb(var(--dash-fg))] font-black text-sm leading-none">
                  {selectedCount === 0 ? 'No creators selected yet' : `${selectedCount} creator${selectedCount !== 1 ? 's' : ''} selected`}
                </p>
                <p className="text-[rgba(var(--dash-fg),0.5)] text-[10px] font-medium mt-0.5">
                  {selectedCount === 0 ? 'Tap any card above to add them' : 'Ready to write your briefs'}
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
          </div>}
        </motion.div>
      )}
    </>
  );
}
