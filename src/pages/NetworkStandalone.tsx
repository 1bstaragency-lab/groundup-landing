/**
 * Public Network page — the full creator/curator directory GrounduP
 * artists get access to, shown as a real, browsable list instead of a
 * marketing claim. Every stat on this page is computed live from
 * `INFLUENCERS`, not hardcoded, so it can't drift out of sync with the
 * actual data the way `NETWORK_STATS` has in the past.
 *
 * Public, unauthenticated — same header pattern as PricingStandalone.
 */
import { useMemo, useState } from 'react';
import { Search, ArrowUpDown, Mail, AtSign } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { WAITLIST_MODE } from '../lib/featureFlags';
import { openWaitlistModal } from '../components/ui/WaitlistModal';
import { INFLUENCERS, type Platform, type Influencer } from '../data/influencers';

const PLATFORMS: Platform[] = ['TikTok', 'Twitter', 'Spotify', 'Instagram', 'YouTube', 'SoundCloud'];

const PLATFORM_COLOR: Record<Platform, string> = {
  TikTok:     '#FF3B5C',
  Twitter:    '#1DA1F2',
  Spotify:    '#1DB954',
  Instagram:  '#E1306C',
  YouTube:    '#FF0000',
  SoundCloud: '#FF7700',
  Blog:       '#FFD700',
};

function fmtFollowers(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`;
  return String(n);
}

type SortKey = 'followers' | 'engagementRate' | 'name';

function NetworkStandalonePage() {
  const { user } = useAuth();
  const [query, setQuery]     = useState('');
  const [platform, setPlatform] = useState<Platform | 'All'>('All');
  const [sortKey, setSortKey] = useState<SortKey>('followers');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const stats = useMemo(() => {
    const totalReach = INFLUENCERS.reduce((sum, i) => sum + i.followers, 0);
    const avgEngagement = INFLUENCERS.reduce((sum, i) => sum + i.engagementRate, 0) / INFLUENCERS.length;
    const platformCounts = PLATFORMS.reduce((acc, p) => {
      acc[p] = INFLUENCERS.filter((i) => i.platform === p).length;
      return acc;
    }, {} as Record<Platform, number>);
    return { total: INFLUENCERS.length, totalReach, avgEngagement, platformCounts };
  }, []);

  const rows = useMemo(() => {
    let list: Influencer[] = INFLUENCERS;
    if (platform !== 'All') list = list.filter((i) => i.platform === platform);
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.handle.toLowerCase().includes(q) ||
        i.niche.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
      );
    }
    const dir = sortDir === 'desc' ? -1 : 1;
    return [...list].sort((a, b) => {
      if (sortKey === 'name') return a.name.localeCompare(b.name) * dir;
      return (a[sortKey] - b[sortKey]) * dir;
    });
  }, [platform, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) { setSortDir((d) => (d === 'desc' ? 'asc' : 'desc')); return; }
    setSortKey(key);
    setSortDir('desc');
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── Header — same pattern as the standalone pricing page ── */}
      <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <a href="/" className="text-white font-black text-sm uppercase tracking-tighter">GrounduP</a>
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <a href="/login" className="text-white/40 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">Sign In</a>
              {WAITLIST_MODE ? (
                <button onClick={openWaitlistModal} className="px-4 py-2 rounded-xl bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.03] transition-transform">
                  Join Waitlist
                </button>
              ) : (
                <a href="/signup" className="px-4 py-2 rounded-xl bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.03] transition-transform">
                  Get Started
                </a>
              )}
            </>
          ) : (
            <a href="/dashboard/home" className="px-4 py-2 rounded-xl bg-[#FFD700] text-black text-[10px] font-black uppercase tracking-widest hover:scale-[1.03] transition-transform">Dashboard</a>
          )}
        </div>
      </header>

      <main className="px-6 py-16 max-w-6xl mx-auto">
        {/* ── Hero ── */}
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em] mb-3">The Creator Network</p>
        <h1 className="font-black tracking-tighter mb-4" style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.02 }}>
          Every curator, blog, and page<br className="hidden sm:block" /> your music reaches.
        </h1>
        <p className="text-white/50 text-sm max-w-xl mb-10 leading-relaxed">
          The full list of creators uP can pitch on your behalf — TikTok, Twitter, Instagram,
          Spotify, YouTube, and SoundCloud. Real handles, real reach, real engagement.
        </p>

        {/* ── Live stats — computed from the data below, never hardcoded ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-2xl font-black tracking-tighter">{stats.total}</p>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Creators</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-2xl font-black tracking-tighter">{fmtFollowers(stats.totalReach)}</p>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Total Reach</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-2xl font-black tracking-tighter">{stats.avgEngagement.toFixed(1)}%</p>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Avg. Engagement</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-2xl font-black tracking-tighter">{PLATFORMS.filter((p) => stats.platformCounts[p] > 0).length}</p>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Platforms</p>
          </div>
        </div>

        {/* ── Search + platform filters ── */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search creators, niches, locations…"
              className="w-full h-11 pl-10 pr-4 rounded-full bg-white/[0.04] border border-white/10 text-sm font-medium outline-none focus:border-[#FFD700]/40 transition-colors placeholder:text-white/30"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['All', ...PLATFORMS] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className="px-4 h-11 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors"
                style={{
                  background: platform === p ? '#FFD700' : 'rgba(255,255,255,0.04)',
                  color:      platform === p ? '#000' : 'rgba(255,255,255,0.6)',
                  border:     `1px solid ${platform === p ? '#FFD700' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                {p === 'All' ? `All (${stats.total})` : `${p} (${stats.platformCounts[p] ?? 0})`}
              </button>
            ))}
          </div>
        </div>

        {/* ── Sort controls (mobile-friendly, mirrors the table's click-to-sort headers) ── */}
        <div className="flex items-center gap-2 mb-4 md:hidden">
          <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Sort by</span>
          {(['followers', 'engagementRate', 'name'] as SortKey[]).map((k) => (
            <button
              key={k}
              onClick={() => toggleSort(k)}
              className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{
                background: sortKey === k ? 'rgba(255,215,0,0.15)' : 'rgba(255,255,255,0.04)',
                color:      sortKey === k ? '#FFD700' : 'rgba(255,255,255,0.5)',
                border:     `1px solid ${sortKey === k ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {k === 'engagementRate' ? 'Engagement' : k === 'followers' ? 'Reach' : 'Name'}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[820px]">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02]">
                  <Th onClick={() => toggleSort('name')} active={sortKey === 'name'} dir={sortDir}>Creator</Th>
                  <ThPlain>Platform</ThPlain>
                  <ThPlain>Niche</ThPlain>
                  <ThPlain>Location</ThPlain>
                  <Th onClick={() => toggleSort('followers')} active={sortKey === 'followers'} dir={sortDir} align="right">Followers</Th>
                  <ThPlain align="right">Avg. Views</ThPlain>
                  <Th onClick={() => toggleSort('engagementRate')} active={sortKey === 'engagementRate'} dir={sortDir} align="right">Engagement</Th>
                  <ThPlain align="center">Contact</ThPlain>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[13px] leading-tight">{i.name}</p>
                      <p className="text-white/35 text-[11px] font-medium">{i.handle}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide whitespace-nowrap"
                        style={{ background: `${PLATFORM_COLOR[i.platform]}1A`, color: PLATFORM_COLOR[i.platform] }}
                      >
                        {i.platform}{i.tier ? ` · ${i.tier}` : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-white/60 text-[12px] font-medium whitespace-nowrap">{i.niche}</td>
                    <td className="py-3.5 px-4 text-white/40 text-[12px] font-medium whitespace-nowrap">{i.location}</td>
                    <td className="py-3.5 px-4 text-right font-black text-[13px] whitespace-nowrap">{fmtFollowers(i.followers)}</td>
                    <td className="py-3.5 px-4 text-right text-white/50 text-[12px] font-medium whitespace-nowrap">{i.avgViews ? fmtFollowers(i.avgViews) : '—'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[#FFD700] font-black text-[13px]">{i.engagementRate.toFixed(1)}%</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        {i.email && <Mail size={13} className="text-white/30" />}
                        {i.instagram && <AtSign size={13} className="text-white/30" />}
                        {!i.email && !i.instagram && <span className="text-white/15 text-[11px]">—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length === 0 && (
            <p className="text-center text-white/40 text-sm py-16">No creators match "{query}".</p>
          )}
        </div>

        <p className="text-white/25 text-[10px] font-medium mt-4">
          Showing {rows.length} of {stats.total} creators. Direct contact info is reserved for artists on a plan — join to unlock outreach.
        </p>
      </main>
    </div>
  );
}

function Th({ children, onClick, active, dir, align = 'left' }: {
  children: React.ReactNode; onClick: () => void; active: boolean; dir: 'asc' | 'desc'; align?: 'left' | 'right';
}) {
  return (
    <th
      onClick={onClick}
      className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest cursor-pointer select-none whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'}`}
      style={{ color: active ? '#FFD700' : 'rgba(255,255,255,0.4)' }}
    >
      <span className={`inline-flex items-center gap-1 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {children}
        <ArrowUpDown size={10} style={{ opacity: active ? 1 : 0.35, transform: active && dir === 'asc' ? 'scaleY(-1)' : undefined }} />
      </span>
    </th>
  );
}

function ThPlain({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <th className={`py-3 px-4 text-[10px] font-black uppercase tracking-widest text-white/40 whitespace-nowrap text-${align}`}>
      {children}
    </th>
  );
}

export default NetworkStandalonePage;
