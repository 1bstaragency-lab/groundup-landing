import { motion } from 'framer-motion';
import { TrendingUp, Music2, Share2, Play, ExternalLink, BarChart2, Headphones, Mic2, MessageCircle, Radio } from 'lucide-react';
import { PlatformStreamOverview } from '../ui/platform-stream-overview';
import { SpotifyDataCard } from './SpotifyDataCard';
import { useAuth } from '../../hooks/useAuth';

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  color: string;
}

function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
      <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-3 ${color}`}>{label}</p>
      <p className="text-white font-black text-4xl tracking-tighter mb-1">{value}</p>
      <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">{sub}</p>
    </div>
  );
}

let chartCounter = 0;
function EmptyChart({ label }: { label: string }) {
  const gradId = `chartGrad-${++chartCounter}`;
  const points = [40, 35, 45, 30, 50, 38, 55, 42, 60, 48, 65, 52];
  const max = 80;
  const w = 400;
  const h = 100;
  const step = w / (points.length - 1);
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${h - (p / max) * h}`)
    .join(' ');

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.02)_0%,transparent_70%)]" />
      <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-4">{label}</p>
      <div className="relative">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full opacity-10" preserveAspectRatio="none" style={{ height: '80px' }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${pathD} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${gradId})`} />
          <path d={pathD} fill="none" stroke="#FFD700" strokeWidth="2" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white/30 text-xs font-black uppercase tracking-widest">No data yet</p>
        </div>
      </div>
    </div>
  );
}

const PLATFORMS = [
  {
    name: 'Spotify',
    icon: <Music2 size={20} />,
    color: 'text-green-400',
    bg: 'bg-green-400/10 border-green-400/20',
    description: 'Stream counts, monthly listeners, playlist adds, saves',
  },
  {
    name: 'Apple Music',
    icon: <Headphones size={20} />,
    color: 'text-pink-300',
    bg: 'bg-pink-300/10 border-pink-300/20',
    description: 'Plays, listeners, Shazam data, radio airplay',
  },
  {
    name: 'TikTok',
    icon: <Mic2 size={20} />,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/20',
    description: 'Sound uses, video views, followers, trending data',
  },
  {
    name: 'Instagram',
    icon: <Share2 size={20} />,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10 border-pink-400/20',
    description: 'Reach, story views, engagement rate, follower growth',
  },
  {
    name: 'YouTube',
    icon: <Play size={20} />,
    color: 'text-red-400',
    bg: 'bg-red-400/10 border-red-400/20',
    description: 'Views, watch time, subscribers, shorts performance',
  },
  {
    name: 'SoundCloud',
    icon: <Radio size={20} />,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10 border-orange-400/20',
    description: 'Plays, reposts, comments, follower activity',
  },
  {
    name: 'Twitter / X',
    icon: <MessageCircle size={20} />,
    color: 'text-white',
    bg: 'bg-white/5 border-white/10',
    description: 'Mentions, impressions, song-link shares, growth',
  },
];

export function AnalyticsSection() {
  const { user } = useAuth()
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter uppercase mb-2">Analytics</h1>
          <p className="text-white/30 text-sm font-bold">Paste your platform link → we pull live public data.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/60 border border-white/5 rounded-2xl">
          <BarChart2 size={14} className="text-[#FFD700]" />
          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Spotify link → public data */}
      {user && <SpotifyDataCard userId={user.id} />}

      {/* Platform Stream Overview */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
        <PlatformStreamOverview />
      </div>

      {/* Stat Cards — top 4 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Streams" value="—" sub="Connect Spotify" color="text-green-400" />
        <StatCard label="Monthly Listeners" value="—" sub="Connect Spotify" color="text-[#FFD700]" />
        <StatCard label="IG Followers" value="—" sub="Connect Instagram" color="text-pink-400" />
        <StatCard label="YT Views" value="—" sub="Connect YouTube" color="text-red-400" />
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="TikTok Sound Uses" value="—" sub="Connect TikTok" color="text-sky-400" />
        <StatCard label="Apple Music Plays" value="—" sub="Connect Apple Music" color="text-pink-300" />
        <StatCard label="SoundCloud Plays" value="—" sub="Connect SoundCloud" color="text-orange-400" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EmptyChart label="Stream Trend (30 days)" />
        <EmptyChart label="Follower Growth (30 days)" />
      </div>

      {/* Connect Platforms */}
      <div>
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Connect Platforms</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORMS.map(platform => (
            <motion.div
              key={platform.name}
              whileHover={{ scale: 1.02 }}
              className={`border rounded-3xl p-6 cursor-pointer transition-all group ${platform.bg}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-black/20 ${platform.color}`}>
                  {platform.icon}
                </div>
                <ExternalLink size={14} className="text-white/20 group-hover:text-white/60 transition-colors" />
              </div>
              <p className={`font-black text-sm uppercase tracking-tight mb-1 ${platform.color}`}>{platform.name}</p>
              <p className="text-white/30 text-[11px] font-medium leading-relaxed">{platform.description}</p>
              <button className={`mt-4 text-[10px] font-black uppercase tracking-widest ${platform.color} hover:underline flex items-center gap-1`}>
                <TrendingUp size={10} /> Connect →
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
