/**
 * /internal/roster/:slug — per-artist detail for the agency roster
 * overview (see AgencyRoster.tsx). Same password gate (shared
 * "agency-roster" slug), same "this is mock data" banner. Click a song
 * in the strip to see its platform breakdown below.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Lock, Loader2, AlertTriangle, ArrowLeft, Music2, TrendingUp,
  MessageCircle, Newspaper, PlaySquare,
} from 'lucide-react';
import { ARTIST_ROSTER } from '../../data/agencyRoster/artists';
import type { RosterSong } from '../../data/agencyRoster/types';
import { TIER_STYLE, fmtNum, fmtDate, campaignWeeks, pctLift } from './AgencyRoster';

const ROSTER_SLUG = 'agency-roster';

export default function ArtistRosterDetailPage() {
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const slug = (rawSlug ?? '').toLowerCase();
  const artist = ARTIST_ROSTER.find((a) => a.slug === slug);

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

  if (!artist) {
    return (
      <Shell>
        <div className="max-w-lg mx-auto text-center py-24">
          <p className="text-white/40 text-sm">No artist found for "{rawSlug}".</p>
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
        <PasswordGate onAuthed={() => setAuthed(true)} />
      </Shell>
    );
  }

  return (
    <Shell>
      <Detail artist={artist} />
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
      <main className="px-6 py-16 max-w-4xl mx-auto">{children}</main>
    </div>
  );
}

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
function Detail({ artist }: { artist: (typeof ARTIST_ROSTER)[number] }) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(artist.songs[0]?.id);
  const selectedSong = artist.songs.find((s) => s.id === selectedId) ?? artist.songs[0];
  const tierStyle = TIER_STYLE[artist.tier];
  const weeks = campaignWeeks(artist.campaign.startDate, artist.campaign.endDate);

  return (
    <>
      <button
        onClick={() => navigate('/internal/roster')}
        className="flex items-center gap-1.5 text-white/40 text-[11px] font-bold uppercase tracking-widest mb-8 hover:text-white/70 transition-colors cursor-pointer"
      >
        <ArrowLeft size={13} /> All Artists
      </button>

      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/25 mb-10">
        <AlertTriangle size={14} className="text-[#FFD700] shrink-0 mt-0.5" />
        <p className="text-[#FFD700] text-[11px] font-bold leading-relaxed">
          Mock data for internal/demo use — not real 1BSTAR client results.
        </p>
      </div>

      {/* ── Hero ── */}
      <div className="flex flex-wrap items-center gap-5 mb-10">
        <img src={artist.image} alt={artist.name} className="w-24 h-24 rounded-2xl object-cover border border-white/10 shrink-0" />
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h1 className="font-black tracking-tighter" style={{ fontSize: 'clamp(24px, 3.5vw, 36px)' }}>{artist.name}</h1>
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{ background: tierStyle.bg, color: tierStyle.color }}
            >
              {artist.tier}
            </span>
          </div>
          <p className="text-white/40 text-[11px] font-black uppercase tracking-widest">{artist.genre}</p>
          <p className="text-white/30 text-[11px] font-medium mt-1.5">
            ${fmtNum(artist.campaign.budgetSpent)} spent · {weeks} weeks · {fmtDate(artist.campaign.startDate)} – {fmtDate(artist.campaign.endDate)}
          </p>
        </div>
      </div>

      {/* ── Before / After ── */}
      <Section title="Before / After GrounduP" icon={<TrendingUp size={14} />}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <LiftCard label="Monthly Listeners" before={artist.before.monthlyListeners} after={artist.after.monthlyListeners} />
          <LiftCard label="Instagram Followers" before={artist.before.instagramFollowers} after={artist.after.instagramFollowers} />
          <LiftCard label="TikTok Followers" before={artist.before.tiktokFollowers} after={artist.after.tiktokFollowers} />
          <LiftCard label="Spotify Followers" before={artist.before.spotifyFollowers} after={artist.after.spotifyFollowers} />
        </div>
      </Section>

      {/* ── Songs strip ── */}
      <Section title="Songs Marketed" icon={<Music2 size={14} />}>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {artist.songs.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className="shrink-0 w-40 text-left rounded-2xl border p-3 transition-colors cursor-pointer"
              style={{
                borderColor: selectedId === s.id ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.1)',
                background: selectedId === s.id ? 'rgba(255,215,0,0.06)' : 'rgba(255,255,255,0.03)',
              }}
            >
              <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-white/10 to-white/[0.02] flex items-center justify-center mb-2.5">
                <Music2 size={20} className="text-white/20" />
              </div>
              <p className="text-[12px] font-bold leading-snug truncate">{s.title}</p>
              <p className="text-white/30 text-[10px] font-bold mt-0.5">{fmtDate(s.releaseDate)}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* ── Selected song breakdown ── */}
      {selectedSong && <SongBreakdown song={selectedSong} />}
    </>
  );
}

function LiftCard({ label, before, after }: { label: string; before: number; after: number }) {
  const lift = pctLift(before, after);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2 leading-tight">{label}</p>
      <div className="flex items-baseline gap-1.5 flex-wrap">
        <span className="text-white/35 text-[12px] font-bold">{fmtNum(before)}</span>
        <span className="text-white/20 text-[11px]">→</span>
        <span className="font-black text-lg tracking-tight">{fmtNum(after)}</span>
      </div>
      <p className="text-[#34D399] text-[11px] font-black mt-1">+{Math.round(lift)}%</p>
    </div>
  );
}

function SongBreakdown({ song }: { song: RosterSong }) {
  const { data } = song;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Platform Breakdown</p>
      <h3 className="font-black text-xl tracking-tight mb-5">{song.title}</h3>

      <div className="grid sm:grid-cols-3 gap-3 mb-5">
        <PlatformTile icon={<PlaySquare size={14} />} label="TikTok Videos Created" value={fmtNum(data.tiktok.videosCreated)} sub={`${fmtNum(data.tiktok.views)} views`} />
        <PlatformTile icon={<Music2 size={14} />} label="Spotify Streams" value={fmtNum(data.spotify.streams)} />
        <PlatformTile icon={<MessageCircle size={14} />} label="Twitter Mentions" value={fmtNum(data.twitter.mentions)} sub={`${fmtNum(data.twitter.impressions)} impressions`} />
      </div>

      <div>
        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Newspaper size={11} /> PR / Blog Coverage
        </p>
        {data.pr.length === 0 ? (
          <p className="text-white/20 text-[12px]">No press coverage yet for this song.</p>
        ) : (
          <div className="space-y-2">
            {data.pr.map((f, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-1">{f.outlet}</p>
                <p className="text-[12px] font-medium text-white/80 leading-snug">{f.headline}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlatformTile({ icon, label, value, sub }: { icon: ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center gap-1.5 text-[#FFD700] mb-2">{icon}</div>
      <p className="font-black text-lg tracking-tight">{value}</p>
      <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1 leading-tight">{label}</p>
      {sub && <p className="text-white/25 text-[10px] font-bold mt-1">{sub}</p>}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#FFD700]">{icon}</span>
        <h2 className="text-[11px] font-black uppercase tracking-widest text-white/70">{title}</h2>
      </div>
      {children}
    </div>
  );
}
