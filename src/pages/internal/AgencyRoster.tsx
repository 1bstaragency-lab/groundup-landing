/**
 * /internal/roster — agency-facing (not client-facing) overview of the
 * artist roster: tier, campaign spend/duration, and before/after growth
 * snapshots. Password-gated the same way /client/:slug is (see
 * netlify/functions/client-dashboard-login.ts + -session.ts), under the
 * shared slug "agency-roster" — set CLIENT_DASHBOARD_SECRET and
 * CLIENT_DASHBOARD_PASSWORD_AGENCY_ROSTER in Netlify to actually gate it.
 *
 * Every number in src/data/agencyRoster is invented for demo/sales
 * purposes — there is no live data source behind this page. See the
 * banner below and the comment at the top of agencyRoster/types.ts.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Loader2, AlertTriangle, TrendingUp } from 'lucide-react';
import { ARTIST_ROSTER } from '../../data/agencyRoster/artists';
import type { SubscriptionTier } from '../../data/agencyRoster/types';

const ROSTER_SLUG = 'agency-roster';

export const TIER_STYLE: Record<SubscriptionTier, { color: string; bg: string }> = {
  Pro:    { color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
  Growth: { color: '#FFD700', bg: 'rgba(255,215,0,0.12)' },
  Plant:  { color: '#C084FC', bg: 'rgba(192,132,252,0.12)' },
};

export function fmtNum(n: number): string {
  return n.toLocaleString('en-US');
}

export function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return iso; }
}

export function campaignWeeks(startDate: string, endDate: string): number {
  const ms = new Date(endDate).getTime() - new Date(startDate).getTime();
  return Math.max(1, Math.round(ms / (7 * 24 * 60 * 60 * 1000)));
}

export function pctLift(before: number, after: number): number {
  if (before <= 0) return 0;
  return ((after - before) / before) * 100;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AgencyRosterPage() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('preview') === '1') {
      setAuthed(true);
      setChecking(false);
      return;
    }
    let cancelled = false;
    fetch(`/.netlify/functions/client-dashboard-session?slug=${ROSTER_SLUG}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((j) => { if (!cancelled) setAuthed(!!j.authed); })
      .catch(() => { if (!cancelled) setAuthed(false); })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, []);

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
        <PasswordGate onAuthed={() => setAuthed(true)} />
      </Shell>
    );
  }

  return (
    <Shell>
      <RosterGrid />
    </Shell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
        <a href="/" className="text-white font-black text-sm uppercase tracking-tighter">GrounduP</a>
        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Agency Roster</span>
      </header>
      <main className="px-6 py-16 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}

function MockDataBanner() {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/25 mb-10">
      <AlertTriangle size={14} className="text-[#FFD700] shrink-0 mt-0.5" />
      <p className="text-[#FFD700] text-[11px] font-bold leading-relaxed">
        Mock data for internal/demo use. Artist names and photos are real — campaigns, spend, tiers, and every metric below are invented and do not reflect real 1BSTAR client work. Keep this page internal.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function PasswordGate({ onAuthed }: { onAuthed: () => void }) {
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
        body: JSON.stringify({ slug: ROSTER_SLUG, password }),
      });
      const json = await res.json();
      if (json.ok) { onAuthed(); return; }
      setError(json.error === 'not_configured' ? 'Not set up yet — set CLIENT_DASHBOARD_PASSWORD_AGENCY_ROSTER in Netlify.' : 'Wrong password — try again.');
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
      <h1 className="font-black text-2xl tracking-tight mb-2">Agency Roster</h1>
      <p className="text-white/40 text-xs mb-8">Internal only. Enter the password.</p>
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
          {submitting ? 'Checking…' : 'Unlock'}
        </button>
      </form>
      {error && <p className="text-[#FF6B6B] text-xs font-medium mt-4">{error}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function RosterGrid() {
  const totalBudget = ARTIST_ROSTER.reduce((sum, a) => sum + a.campaign.budgetSpent, 0);
  const avgLift = ARTIST_ROSTER.reduce((sum, a) => sum + pctLift(a.before.monthlyListeners, a.after.monthlyListeners), 0) / ARTIST_ROSTER.length;

  return (
    <>
      <MockDataBanner />

      <div className="flex items-end justify-between flex-wrap gap-6 mb-10">
        <h1 className="font-black tracking-tighter" style={{ fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: 1.05 }}>
          Artist Roster
        </h1>
        <div className="flex gap-6">
          <Stat label="Artists" value={String(ARTIST_ROSTER.length)} />
          <Stat label="Total Spend" value={`$${fmtNum(totalBudget)}`} />
          <Stat label="Avg. Listener Lift" value={`+${Math.round(avgLift)}%`} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ARTIST_ROSTER.map((a) => (
          <ArtistCard
            key={a.slug}
            slug={a.slug}
            name={a.name}
            image={a.image}
            genre={a.genre}
            tier={a.tier}
            budgetSpent={a.campaign.budgetSpent}
            weeks={campaignWeeks(a.campaign.startDate, a.campaign.endDate)}
            before={a.before.monthlyListeners}
            after={a.after.monthlyListeners}
            songCount={a.songs.length}
          />
        ))}
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="font-black text-xl tracking-tight">{value}</p>
      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  );
}

function ArtistCard({
  slug, name, image, genre, tier, budgetSpent, weeks, before, after, songCount,
}: {
  slug: string; name: string; image: string; genre: string; tier: SubscriptionTier;
  budgetSpent: number; weeks: number; before: number; after: number; songCount: number;
}) {
  const navigate = useNavigate();
  const tierStyle = TIER_STYLE[tier];
  const lift = pctLift(before, after);

  return (
    <button
      onClick={() => navigate(`/internal/roster/${slug}`)}
      className="text-left rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden hover:border-[#FFD700]/30 transition-colors group cursor-pointer"
    >
      <div className="relative aspect-square">
        <img src={image} alt={name} className="w-full h-full object-cover" />
        <span
          className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
          style={{ background: tierStyle.bg, color: tierStyle.color, backdropFilter: 'blur(6px)' }}
        >
          {tier}
        </span>
      </div>
      <div className="p-4">
        <p className="font-black text-[15px] tracking-tight truncate">{name}</p>
        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-0.5 mb-3">{genre}</p>

        <div className="flex items-center gap-1.5 mb-3">
          <TrendingUp size={12} className="text-[#34D399] shrink-0" />
          <span className="text-white/40 text-[11px] font-bold">{fmtNum(before)}</span>
          <span className="text-white/20 text-[11px]">→</span>
          <span className="text-[13px] font-black">{fmtNum(after)}</span>
          <span className="text-[#34D399] text-[10px] font-black ml-auto">+{Math.round(lift)}%</span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-bold text-white/30 uppercase tracking-widest">
          <span>${fmtNum(budgetSpent)} · {weeks} wks</span>
          <span>{songCount} {songCount === 1 ? 'song' : 'songs'}</span>
        </div>
      </div>
    </button>
  );
}
