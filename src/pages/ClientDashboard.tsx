/**
 * /client/:slug — password-protected campaign dashboard for a single
 * client (e.g. /client/staybarii-bounce). Public route, but the data
 * itself is gated behind a server-side password check (see
 * netlify/functions/client-dashboard-login.ts + -session.ts) — nothing
 * in this file or the JS bundle can unlock it without that password.
 *
 * Data source: src/data/clientDashboards/registry.ts (one file per
 * client, manually edited for now — see the "After launch" plan for
 * wiring this to live Google Analytics / YouTube / Google Ads / TikTok
 * data instead).
 */
import { useEffect, useState, type ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, SquarePlay, Music2, TrendingUp, Globe, Users, Sparkles, ExternalLink, Loader2 } from 'lucide-react';
import { CLIENT_DASHBOARDS } from '../data/clientDashboards/registry';
import type { CampaignStatus, CreativeType } from '../data/clientDashboards/types';

const STATUS_STYLE: Record<CampaignStatus, { label: string; color: string; bg: string; pulse?: boolean }> = {
  scheduled:  { label: 'Scheduled',  color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
  live:       { label: 'Live',       color: '#34D399', bg: 'rgba(52,211,153,0.12)', pulse: true },
  optimizing: { label: 'Optimizing', color: '#FFD700', bg: 'rgba(255,215,0,0.12)' },
  completed:  { label: 'Completed',  color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
};

const CREATIVE_TYPE_LABEL: Record<CreativeType, string> = {
  ad: 'Ad', ugc: 'UGC', dance: 'Dance Clip', 'music-video-cut': 'Music Video Cut',
};

function fmtNum(n: number): string {
  return n.toLocaleString('en-US');
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}

/** "Last updated" shows the moment the page was opened, in Dallas
 *  (America/Chicago) time regardless of the viewer's own timezone —
 *  it's a freshness signal for the client, not a record of when the
 *  underlying data file was last edited. Computed once per page load. */
function fmtDallasNow(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
    timeZoneName: 'short',
  }).format(date);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ClientDashboardPage() {
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const slug = (rawSlug ?? '').toLowerCase();
  const data = CLIENT_DASHBOARDS[slug];

  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!data) { setChecking(false); return; }
    let cancelled = false;

    // This dashboard has no password gate — skip the check entirely.
    if (data.passwordProtected === false) {
      setAuthed(true);
      setChecking(false);
      return;
    }

    // Dev-only convenience: `?preview=1` skips the live password check so
    // the page can be visually verified without netlify functions running
    // locally. Inert in production — import.meta.env.DEV is false there.
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === '1') {
      setAuthed(true);
      setChecking(false);
      return;
    }

    fetch(`/.netlify/functions/client-dashboard-session?slug=${encodeURIComponent(slug)}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => { if (!cancelled) setAuthed(!!j.authed); })
      .catch(() => { if (!cancelled) setAuthed(false); })
      .finally(() => { if (!cancelled) setChecking(false); });

    return () => { cancelled = true; };
  }, [slug, data]);

  if (!data) {
    return (
      <Shell>
        <div className="max-w-lg mx-auto text-center py-24">
          <p className="text-white/40 text-sm">No dashboard found for "{rawSlug}".</p>
        </div>
      </Shell>
    );
  }

  if (checking) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-32">
          <Loader2 size={20} className="animate-spin text-white/30" />
        </div>
      </Shell>
    );
  }

  if (!authed) {
    return (
      <Shell>
        <PasswordGate slug={slug} clientName={data.clientName} onAuthed={() => setAuthed(true)} />
      </Shell>
    );
  }

  return (
    <Shell>
      <Dashboard data={data} />
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <a href="/" className="text-white font-black text-sm uppercase tracking-tighter">GrounduP</a>
        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Client Dashboard</span>
      </header>
      <main className="px-6 py-16 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function PasswordGate({ slug, clientName, onAuthed }: { slug: string; clientName: string; onAuthed: () => void }) {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/client-dashboard-login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, password }),
      });
      const json = await res.json();
      if (json.ok) { onAuthed(); return; }
      setError(json.error === 'not_configured' ? 'This dashboard isn’t set up yet — contact 1BSTAR.' : 'Wrong password — try again.');
    } catch {
      setError('Couldn’t reach the server. Try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto text-center py-20">
      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
        <Lock size={18} className="text-[#FFD700]" />
      </div>
      <h1 className="font-black text-2xl tracking-tight mb-2">{clientName}</h1>
      <p className="text-white/40 text-xs mb-8">This dashboard is private. Enter the password 1BSTAR gave you.</p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full h-12 px-5 rounded-full bg-white/[0.04] border border-white/10 text-sm font-medium text-center outline-none focus:border-[#FFD700]/40 transition-colors placeholder:text-white/30"
        />
        <button
          type="submit"
          disabled={submitting || !password}
          className="w-full h-12 rounded-full bg-[#FFD700] text-black text-[11px] font-black uppercase tracking-widest disabled:opacity-40 transition-opacity"
        >
          {submitting ? 'Checking…' : 'Unlock Dashboard'}
        </button>
      </form>
      {error && <p className="text-[#FF6B6B] text-xs font-medium mt-4">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Dashboard({ data }: { data: import('../data/clientDashboards/types').ClientDashboardData }) {
  const status = STATUS_STYLE[data.status];
  // Captured once when the page is opened — "Last updated" reflects the
  // moment the client is viewing, not the data file's own edit history.
  const [viewedAt] = useState(() => new Date());

  return (
    <>
      {data.isSample && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/25 mb-8">
          <Sparkles size={13} className="text-[#FFD700] shrink-0" />
          <p className="text-[#FFD700] text-[11px] font-bold">
            Sample dashboard — the video and channel are real, the numbers are illustrative until the campaign has live data.
          </p>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="flex flex-wrap items-start justify-between gap-6 mb-3">
        <div className="flex flex-wrap items-center gap-5">
          {data.videoThumbnail && (
            <a href={data.videoUrl} target="_blank" rel="noreferrer" className="shrink-0 relative block w-32 sm:w-40 rounded-xl overflow-hidden border border-white/10 group">
              <img src={data.videoThumbnail} alt={data.campaignName} className="w-full aspect-video object-cover" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <SquarePlay size={22} className="text-white drop-shadow" />
              </div>
            </a>
          )}
          <div>
            <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.25em] mb-2">{data.clientName}</p>
            <h1 className="font-black tracking-tighter" style={{ fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: 1.05 }}>
              {data.campaignName}
            </h1>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest whitespace-nowrap"
          style={{ background: status.bg, color: status.color }}
        >
          <span className="relative flex h-2 w-2">
            {status.pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: status.color }} />}
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: status.color }} />
          </span>
          {status.label}
        </span>
      </div>
      <p className="text-white/30 text-[11px] font-medium mb-12">Last updated {fmtDallasNow(viewedAt)}</p>

      {/* ── Platform launch timeline (TikTok omitted for now — see note below) ── */}
      <Section title="Platform Launch Timeline" icon={<Sparkles size={14} />}>
        <div className={data.timeline.tiktok ? 'grid sm:grid-cols-2 gap-3' : 'grid gap-3 max-w-sm'}>
          <TimelineCard icon={<SquarePlay size={16} />} platform="YouTube" entry={data.timeline.youtube} />
          {data.timeline.tiktok && (
            <TimelineCard icon={<Music2 size={16} />} platform="TikTok" entry={data.timeline.tiktok} />
          )}
        </div>
      </Section>

      {/* ── YouTube performance — only real, known stats render ── */}
      <MetricSection
        title="YouTube Performance"
        icon={<SquarePlay size={14} />}
        stats={data.youtube ? [
          num('Views', data.youtube.views),
          num('Ad Views', data.youtube.adViews),
          data.youtube.watchTimeHours != null ? { label: 'Watch Time', value: `${fmtNum(data.youtube.watchTimeHours)} hrs` } : null,
          data.youtube.avgViewDuration ? { label: 'Avg. View Duration', value: data.youtube.avgViewDuration } : null,
          num('Likes', data.youtube.likes),
          num('Comments', data.youtube.comments),
          num('Shares', data.youtube.shares),
          num('Subscribers Gained', data.youtube.subscribersGained),
        ] : []}
      />

      {/* ── Google Ads performance ── */}
      <MetricSection
        title="Google Ads Performance"
        icon={<TrendingUp size={14} />}
        stats={data.googleAds ? [
          data.googleAds.spend != null ? { label: 'Spend', value: `$${fmtNum(Math.round(data.googleAds.spend))}` } : null,
          num('Reach', data.googleAds.reach),
          num('Impressions', data.googleAds.impressions),
          num('Views', data.googleAds.views),
          num('Clicks', data.googleAds.clicks),
          data.googleAds.cpv != null ? { label: 'Cost per View', value: `$${data.googleAds.cpv.toFixed(3)}` } : null,
          data.googleAds.cpc != null ? { label: 'Cost per Click', value: `$${data.googleAds.cpc.toFixed(2)}` } : null,
          data.googleAds.viewRate != null ? { label: 'View Rate', value: `${data.googleAds.viewRate.toFixed(1)}%` } : null,
        ] : []}
      >
        {data.googleAds?.targeting && data.googleAds.targeting.length > 0 && (
          <div className="mt-4">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">What We're Targeting</p>
            <div className="flex flex-wrap gap-1.5">
              {data.googleAds.targeting.map((t) => (
                <span key={t} className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-bold text-white/70">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </MetricSection>

      {/* ── Ad placements — the specific videos the ad runs against ── */}
      {data.placements.length > 0 && (
        <Section title="Ad Placements" icon={<SquarePlay size={14} />}>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.placements.map((p) => (
              <a
                key={p.videoUrl}
                href={p.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-[#FFD700]/30 transition-colors"
              >
                <div className="aspect-video bg-white/[0.04] flex items-center justify-center relative">
                  {p.thumbnail
                    ? <img src={p.thumbnail} alt={p.videoTitle} className="w-full h-full object-cover" />
                    : <SquarePlay size={18} className="text-white/15" />}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                <div className="p-3">
                  <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-1">{p.artistName}</p>
                  <p className="text-[12px] font-bold leading-snug truncate">{p.videoTitle}</p>
                  {p.note && <p className="text-white/30 text-[10px] font-medium mt-1">{p.note}</p>}
                </div>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* ── Website analytics ── */}
      <MetricSection
        title="Website Analytics"
        icon={<Globe size={14} />}
        stats={data.website ? [
          num('Users', data.website.users),
          num('Music-Video Clicks', data.website.musicVideoClicks),
          num('Conversions', data.website.conversions),
        ] : []}
      >
        {data.website?.trafficSources && data.website.trafficSources.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Traffic Sources</p>
            {data.website.trafficSources.map((s) => {
              const max = Math.max(...data.website!.trafficSources!.map((x) => x.users), 1);
              return (
                <div key={s.source} className="flex items-center gap-3">
                  <span className="w-28 text-white/50 text-[11px] font-bold shrink-0">{s.source}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-[#FFD700]" style={{ width: `${(s.users / max) * 100}%` }} />
                  </div>
                  <span className="text-white/40 text-[11px] font-bold w-14 text-right shrink-0">{fmtNum(s.users)}</span>
                </div>
              );
            })}
          </div>
        )}
      </MetricSection>

      {/* ── TikTok — removed for now (no TikTok data on this dashboard);
           both the performance section and the creations list are fully
           hidden rather than shown empty. Re-add by populating data.tiktok
           / data.tiktokCreations in the client's data file. ── */}

      {/* ── Audience avatars ── */}
      <Section title="Audience Avatars" icon={<Users size={14} />}>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
          <div>
            <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Age Range</p>
            <p className="text-[15px] font-bold">{data.audience.ageRange || '—'}</p>
          </div>
          <ChipRow label="Locations" items={data.audience.locations} />
          <ChipRow label="Interests" items={data.audience.interests} />
          <ChipRow label="Behaviors" items={data.audience.behaviors} />
          <ChipRow label="Content Preferences" items={data.audience.contentPreferences} />
        </div>
      </Section>

      {/* ── Creative library ── */}
      <Section title="Creative Library" icon={<Sparkles size={14} />}>
        {data.creativeLibrary.length === 0 ? (
          <EmptyState text="Approved creative will appear here once it's live." />
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {data.creativeLibrary.map((c) => (
              <a
                key={c.id}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-[#FFD700]/30 transition-colors"
              >
                <div className="aspect-video bg-white/[0.04] flex items-center justify-center">
                  {c.thumbnail
                    ? <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                    : <Sparkles size={18} className="text-white/15" />}
                </div>
                <div className="p-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold truncate">{c.title}</p>
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{CREATIVE_TYPE_LABEL[c.type]}</p>
                  </div>
                  <ExternalLink size={13} className="text-white/25 shrink-0 group-hover:text-[#FFD700] transition-colors" />
                </div>
              </a>
            ))}
          </div>
        )}
      </Section>

      {/* ── What we learned ── */}
      <Section title="What We Learned" icon={<TrendingUp size={14} />} last>
        <div className="space-y-4">
          {data.insights.map((entry, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">{fmtDate(entry.date)}</p>
              <p className="text-[13px] leading-relaxed text-white/80">{entry.text}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

// ─── Reusable pieces ───────────────────────────────────────────────────────
function Section({ title, icon, children, last }: { title: string; icon: ReactNode; children: ReactNode; last?: boolean }) {
  return (
    <div className={last ? 'mb-4' : 'mb-12'}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#FFD700]">{icon}</span>
        <h2 className="text-[11px] font-black uppercase tracking-widest text-white/70">{title}</h2>
      </div>
      {children}
    </div>
  );
}

type Stat = { label: string; value: string };

/** Build a stat entry only when the value is actually known — pass the
 *  result straight into a `stats` array; `null`s are filtered out before
 *  rendering, so partial real data never forces a fabricated number. */
function num(label: string, value: number | undefined): Stat | null {
  return value != null ? { label, value: fmtNum(value) } : null;
}

/** A metric block: shows a stat grid for whatever's known, plus optional
 *  extra content (targeting chips, traffic sources), and falls back to
 *  an honest empty state only when there's truly nothing — no stats and
 *  no extra content — to show. */
function MetricSection({ title, icon, stats, children }: { title: string; icon: ReactNode; stats: (Stat | null)[]; children?: ReactNode }) {
  const known = stats.filter((s): s is Stat => s !== null);
  const hasNothing = known.length === 0 && !children;
  return (
    <Section title={title} icon={icon}>
      {hasNothing ? (
        <EmptyState text="Awaiting data — this fills in as real numbers come in." />
      ) : (
        <>
          {known.length > 0 && <StatGrid stats={known} />}
          {children}
        </>
      )}
    </Section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
      <p className="text-white/30 text-[12px] font-medium">{text}</p>
    </div>
  );
}

function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-lg font-black tracking-tight">{s.value}</p>
          <p className="text-white/35 text-[10px] font-black uppercase tracking-widest mt-1 leading-tight">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function TimelineCard({ icon, platform, entry }: { icon: ReactNode; platform: string; entry?: { startDate: string; note?: string } }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#FFD700] shrink-0">{icon}</div>
      <div>
        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{platform}</p>
        <p className="text-[15px] font-bold">{entry ? fmtDate(entry.startDate) : 'TBD'}</p>
        {entry?.note && <p className="text-white/30 text-[11px] mt-0.5">{entry.note}</p>}
      </div>
    </div>
  );
}

function ChipRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
      {items.length === 0 ? (
        <p className="text-white/20 text-[12px]">—</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((it) => (
            <span key={it} className="px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-bold text-white/70">
              {it}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
