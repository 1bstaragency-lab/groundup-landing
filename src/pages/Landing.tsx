import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Music2, Newspaper, Trophy, ListMusic } from 'lucide-react';
import { PIXEL, SCRIPT, BG, INK, DIM, FAINT, GOLD, GOLDD, BLUE } from '../lib/brand-tokens';
import { WAITLIST_MODE } from '../lib/featureFlags';
import { PricingSection } from '../components/ui/pricing-section';
import DisplayCards from '../components/ui/display-cards';
import { GradientButton } from '../components/ui/gradient-button';
import { SupportBot } from '../components/ui/support-bot';
import { InfiniteBentoPan } from '../components/ui/infinite-bento-pan';
import { CinematicFooter } from '../components/ui/motion-footer';
import { GetStartedModal, GET_STARTED_EVENT } from '../components/ui/GetStartedModal';
import { DemoModal } from '../components/ui/DemoModal';
import { UpBot } from '../components/ui/UpBot';
import { handlePricingClick } from '../lib/pricingCheckout';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../supabaseClient';

const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&family=Instrument+Serif:ital@0;1&display=swap';

const GRAIN =
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`;

const TICKER = [
  'RELEASE PLANNING', 'PLAYLIST PITCHING', 'CURATOR OUTREACH',
  'A MANAGER IN YOUR IMESSAGE', 'STREAMING ANALYTICS', 'AD CAMPAIGNS',
  'SYNC OPPORTUNITIES', 'BUILT FOR INDEPENDENTS',
];

const LOOP = [
  { word: 'PLAN',     note: 'YOUR ROLLOUT, START TO FINISH' },
  { word: 'PITCH',    note: '600+ CURATORS, PITCHES WRITTEN FOR YOU' },
  { word: 'POST',     note: 'A CONTENT CALENDAR THAT RUNS ITSELF' },
  { word: 'GET PAID', note: 'ADS, SYNC, STREAMS — TRACKED DAILY' },
];

const FEATURES = [
  { n: '01', t: 'RELEASES',  d: 'PLAN THE DROP. EVERY DEADLINE, ASSET, AND TASK — ONE TIMELINE.' },
  { n: '02', t: 'SCHEDULER', d: 'YOUR CONTENT CALENDAR BUILDS AND POSTS ITSELF AROUND EACH RELEASE.' },
  { n: '03', t: 'OUTREACH',  d: 'CURATORS, BLOGS, PLAYLISTS. PITCHES WRITTEN, SENT, AND TRACKED.' },
  { n: '04', t: 'ANALYTICS', d: 'SPOTIFY, YOUTUBE, SOUNDCLOUD — YOUR NUMBERS EVERY MORNING.' },
  { n: '05', t: 'STUDIO',    d: 'COVERS, VISUALIZERS, AD CREATIVE. MADE IN MINUTES, ON BRAND.' },
  { n: '06', t: 'TEAM',      d: 'MANAGER, PRODUCER, DESIGNER — YOUR WHOLE CIRCLE, ONE LOGIN.' },
];

const STATS = [
  { v: '12M+',   l: 'MONTHLY REACH' },
  { v: '2,000+', l: 'ARTISTS TRUSTED' },
  { v: '60+',    l: 'TERRITORIES' },
  { v: '627',    l: 'CURATORS ON CALL' },
];

const QUOTES = [
  { q: '“UP PITCHED THE PLAYLIST SLOT I’D BEEN CHASING FOR A YEAR. IT TEXTS ME MY NUMBERS EVERY MORNING.”', a: 'VELVET K.', m: 'INDIE R&B · ATLANTA' },
  { q: '“FIRST TIME I’VE EVER PAID MYSELF FOR MUSIC. THE AD RAN $20 A DAY AND BROUGHT LISTENERS DAILY.”',   a: 'MARS LO',   m: 'ALT-POP · BROOKLYN' },
];

const NAV_LINKS = ['FEATURES', 'PRICING', 'FAQ'];

/* ── tiny building blocks ─────────────────────────────────────────────── */

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-8 mb-8 flex items-center gap-4">
      <span style={{ fontFamily: PIXEL, fontSize: 12, letterSpacing: '0.12em', color: DIM }}>{children}</span>
      <span className="flex-1 h-px" style={{ background: FAINT }} />
      <span aria-hidden style={{ color: DIM, fontSize: 14 }}>✛</span>
    </div>
  );
}

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Same stagger-fade look as Reveal, but animates on mount instead of on
 * scroll-into-view. Used for content that must always be visible (real CTAs,
 * not just decorative below-the-fold flourishes) — sidesteps any edge case
 * where a grid/items-center layout repositions an element without the
 * IntersectionObserver re-crossing its threshold.
 */
function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Floating 3D keycap */
function Keycap({ label, sub, className, delay = 0, rotate = -8 }: {
  label: string; sub?: string; className?: string; delay?: number; rotate?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, rotate }}
      animate={{ opacity: 1, y: [0, -10, 0], rotate }}
      transition={{ opacity: { duration: 0.6, delay }, y: { duration: 5, delay, repeat: Infinity, ease: 'easeInOut' } }}
      className={`absolute z-20 select-none pointer-events-none ${className ?? ''}`}
      aria-hidden="true"
    >
      <div className="flex flex-col items-start justify-between px-4 py-3 rounded-2xl"
        style={{ width: 118, height: 96, background: GOLD, color: INK, boxShadow: `0 10px 0 ${GOLDD}, 0 22px 34px rgba(0,0,0,0.22)` }}>
        {sub && <span className="text-[11px] font-bold opacity-70">{sub}</span>}
        <span className="font-black text-lg tracking-tight leading-none">{label}</span>
      </div>
    </motion.div>
  );
}

/* ── iPhone auto-demo ─────────────────────────────────────────────────────
   Scripted loop the visitor watches on landing:
   Messages: schedule a release → uP builds the campaign →
   close to home screen → tap GrounduP icon → tour 4 app screens → repeat */

const SCENE_MS = [1600, 1200, 1600, 1700, 1400, 1500, 1900, 1900, 1800, 1100, 2400, 2400, 2400, 2400, 2600];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 w-fit" style={{ background: '#E9E9EB', borderRadius: 18 }}>
      {[0, 1, 2].map(i => (
        <motion.span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: '#8E8E93' }}
          animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }} />
      ))}
    </div>
  );
}

function MsgIn({ children, show }: { children: React.ReactNode; show: boolean }) {
  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="flex justify-start">
      <span className="px-3.5 py-2 font-bold text-[11px] leading-snug max-w-[85%]" style={{ background: '#E9E9EB', color: INK, borderRadius: 16 }}>
        {children}
      </span>
    </motion.div>
  );
}

// Outgoing image attachment bubble — user sending their own cover art
function MsgOutImage({ show, src }: { show: boolean; src: string }) {
  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="flex justify-end">
      <div className="overflow-hidden" style={{ width: 96, height: 96, borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.18)' }}>
        <img src={src} alt="" className="w-full h-full object-cover block" />
      </div>
    </motion.div>
  );
}

function AppIcon({ label, hue, img, ring, contain }: { label: string; hue?: string; img?: string; ring?: boolean; contain?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1 relative">
      {ring && (
        <motion.span
          className="absolute -inset-1 rounded-[18px] border-2"
          style={{ borderColor: GOLD }}
          animate={{ scale: [1, 1.18], opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
      <div className="w-11 h-11 rounded-[13px] overflow-hidden flex items-center justify-center"
        style={{ background: hue ?? '#2C2C2E' }}>
        {img ? <img src={img} alt="" className={contain ? 'w-full h-full object-contain p-1' : 'w-full h-full object-cover'} /> : null}
      </div>
      <span className="text-[6px] font-bold text-white/70 tracking-wide">{label}</span>
    </div>
  );
}

const APP_TABS = ['HOME', 'ROLLOUT', 'REACH', 'TIKTOK', 'STATS'];

function IPhoneDemo() {
  const [scene, setScene] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setScene(s => (s + 1) % SCENE_MS.length), SCENE_MS[scene]);
    return () => clearTimeout(t);
  }, [scene]);

  const inMessages = scene <= 7;
  const inHome     = scene === 8 || scene === 9;
  const inApp      = scene >= 10;
  const appPage    = Math.max(0, Math.min(4, scene - 10));

  return (
    <div className="relative mx-auto" style={{ width: 300 }}>
      <div className="relative rounded-[48px] p-[10px]" style={{ background: '#111', boxShadow: '0 40px 80px rgba(0,0,0,0.28), inset 0 0 0 2px #333' }}>
        <div className="relative rounded-[38px] overflow-hidden" style={{ height: 596, background: '#000' }}>

          <div className="absolute left-1/2 -translate-x-1/2 top-2.5 z-40 rounded-full" style={{ width: 86, height: 24, background: '#000' }} />

          <AnimatePresence mode="wait">
            {inMessages && (
              <motion.div key="messages" className="absolute inset-0 flex flex-col"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0, borderRadius: 60 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: '#fff' }}>
                <div className="pt-10 pb-2.5 px-4 flex flex-col items-center gap-1" style={{ background: 'rgba(246,246,248,0.95)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-[10px]" style={{ background: GOLD, color: INK }}>UP</div>
                  <span className="font-semibold text-[10px]" style={{ color: INK }}>uP</span>
                </div>
                <div className="flex-1 px-3 py-3 space-y-2 overflow-hidden">
                  <span className="block text-center text-[7px] font-bold tracking-wide" style={{ color: '#8E8E93' }}>IMESSAGE · TODAY 9:41 AM</span>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.3 }} className="flex justify-end">
                    <span className="px-3.5 py-2 font-bold text-[11px] leading-snug text-white max-w-[85%]" style={{ background: BLUE, borderRadius: 16 }}>
                      SCHEDULE MY SINGLE “MIDNIGHT” FOR FRIDAY 🌙
                    </span>
                  </motion.div>
                  {scene === 1 && <TypingDots />}
                  <MsgIn show={scene >= 2}>LOCKED IN 🔒 “MIDNIGHT” DROPS FRI, JUL 17.</MsgIn>
                  <MsgIn show={scene >= 3}>GOT COVER ART? I CAN MAKE SOME FROM SCRATCH IF YOU DON’T 🎨</MsgIn>
                  <MsgOutImage show={scene >= 4} src="/demo/cover-art-demo.jpg" />
                  <MsgIn show={scene >= 5}>SYNCED ✅ USING YOUR ART FOR THE RELEASE.</MsgIn>
                  <MsgIn show={scene >= 6}>
                    CAMPAIGN LIVE:<br />✦ 14 CURATORS PITCHED<br />✦ $20/DAY AD RUNNING<br />✦ 6 POSTS QUEUED
                  </MsgIn>
                  <MsgIn show={scene >= 7}>I’LL TEXT YOUR NUMBERS EVERY MORNING. GO CREATE 🚀</MsgIn>
                </div>
                <div className="px-3 pb-5">
                  <div className="h-8 rounded-full px-3 flex items-center text-[9px] font-semibold" style={{ border: '1px solid rgba(0,0,0,0.15)', color: '#8E8E93' }}>
                    iMessage
                  </div>
                </div>
              </motion.div>
            )}

            {inHome && (
              <motion.div key="home" className="absolute inset-0 flex flex-col justify-between px-5 pt-14 pb-5"
                initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: 'radial-gradient(circle at 30% 20%, #2a2413 0%, #000 60%)' }}>
                <div className="grid grid-cols-4 gap-y-5">
                  <AppIcon label="Music"    hue="linear-gradient(135deg,#FA5A70,#FA2D48)" />
                  <AppIcon label="Photos"   hue="#FFFFFF" />
                  <AppIcon label="Mail"     hue="linear-gradient(180deg,#1FB6FF,#0A84FF)" />
                  <AppIcon label="Camera"   hue="#3A3A3C" />
                  <AppIcon label="GrounduP" hue="#0A0A0F" img="/logo.webp" contain ring={scene === 9} />
                  <AppIcon label="Spotify"  hue="#1DB954" />
                  <AppIcon label="TikTok"   hue="#000000" />
                  <AppIcon label="Notes"    hue="#FFD60A" />
                </div>
                <div className="rounded-3xl p-2.5 grid grid-cols-4 gap-2" style={{ background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(20px)' }}>
                  <div className="w-11 h-11 rounded-[13px]" style={{ background: 'linear-gradient(180deg,#5AC8FA,#0A84FF)' }} />
                  <div className="w-11 h-11 rounded-[13px]" style={{ background: 'linear-gradient(180deg,#34E77E,#30D158)' }} />
                  <div className="w-11 h-11 rounded-[13px]" style={{ background: '#fff' }} />
                  <div className="w-11 h-11 rounded-[13px] overflow-hidden flex items-center justify-center" style={{ background: '#0A0A0F' }}>
                    <img src="/logo.webp" alt="" className="w-full h-full object-contain p-1" />
                  </div>
                </div>
              </motion.div>
            )}

            {inApp && (
              <motion.div key="app" className="absolute inset-0 flex flex-col"
                initial={{ scale: 0.35, opacity: 0, borderRadius: 60 }} animate={{ scale: 1, opacity: 1, borderRadius: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ background: '#0A0A0F' }}>

                <div className="pt-11 pb-2.5 px-4 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <img src="/logo.webp" alt="GrounduP" className="h-5" />
                  <span className="w-6 h-6 rounded-full flex items-center justify-center font-black text-[8px]" style={{ background: GOLD, color: INK }}>S</span>
                </div>

                <div className="flex-1 overflow-hidden">
                  <motion.div className="flex h-full" animate={{ x: `-${appPage * 20}%` }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} style={{ width: '500%' }}>

                    <div className="w-1/5 h-full shrink-0 px-4 pt-3 pb-2 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-white text-sm tracking-tight">YO, STASH 👋</span>
                        <span className="px-2 py-1 rounded-full font-black text-[8px]" style={{ background: 'rgba(255,215,0,0.15)', color: GOLD }}>🔥 12-DAY STREAK</span>
                      </div>
                      <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.25)' }}>
                        <span className="block text-[8px] font-black tracking-widest mb-1" style={{ color: GOLD }}>NEXT RELEASE</span>
                        <span className="block font-black text-white text-base tracking-tight mb-2">MIDNIGHT — FRI JUL 17</span>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <motion.div className="h-full rounded-full" style={{ background: GOLD }} initial={{ width: 0 }} animate={{ width: '80%' }} transition={{ duration: 1, delay: 0.4 }} />
                        </div>
                        <span className="block text-[8px] font-bold mt-1.5 text-white/50">ROLLOUT 80% READY</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['PITCH CURATORS', 'POST CONTENT', 'CHECK STATS', 'ASK UP'].map(x => (
                          <div key={x} className="rounded-xl p-2.5 text-[8px] font-black text-white/80 tracking-widest" style={{ background: 'rgba(255,255,255,0.05)' }}>{x}</div>
                        ))}
                      </div>
                      <div className="rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background: 'rgba(10,132,255,0.12)', border: '1px solid rgba(10,132,255,0.3)' }}>
                        <span className="text-[10px]">💬</span>
                        <span className="text-[8px] font-black tracking-wide" style={{ color: '#6CB4FF' }}>UP: “AD IS OUTPERFORMING — WANT ME TO SCALE IT?”</span>
                      </div>
                    </div>

                    <div className="w-1/5 h-full shrink-0 px-4 pt-3 pb-2 flex flex-col gap-2">
                      <span className="font-black text-white text-sm tracking-tight">MIDNIGHT — ROLLOUT</span>
                      {[
                        ['COVER ART', 'DONE', true], ['PRE-SAVE LINK', 'LIVE', true],
                        ['CURATOR PITCHES', '14 SENT', true], ['TIKTOK TEASER', 'QUEUED', false], ['RELEASE DAY POST', 'DRAFT', false],
                      ].map(([t, st, done]) => (
                        <div key={t as string} className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
                              style={{ background: done ? GOLD : 'rgba(255,255,255,0.12)', color: done ? INK : 'rgba(255,255,255,0.4)' }}>
                              {done ? '✓' : ''}
                            </span>
                            <span className="text-[9px] font-black text-white/85 tracking-wide">{t}</span>
                          </div>
                          <span className="text-[7px] font-black tracking-widest" style={{ color: done ? GOLD : 'rgba(255,255,255,0.35)' }}>{st}</span>
                        </div>
                      ))}
                    </div>

                    <div className="w-1/5 h-full shrink-0 px-4 pt-3 pb-2 flex flex-col gap-2">
                      <span className="font-black text-white text-sm tracking-tight">CURATOR OUTREACH</span>
                      {[
                        ['NEON WAVES PLAYLIST', '128K FOLLOWERS', 'REPLIED ✓', '#30D158'],
                        ['LATE NIGHT R&B', '86K FOLLOWERS', 'OPENED', '#FFD700'],
                        ['FRESH FINDS WEEKLY', '54K FOLLOWERS', 'SENT', 'rgba(255,255,255,0.45)'],
                        ['UNDERGROUND HEAT', '39K FOLLOWERS', 'QUEUED', 'rgba(255,255,255,0.35)'],
                      ].map(([n, f, st, c]) => (
                        <div key={n as string} className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white/90 tracking-wide">{n}</span>
                            <span className="text-[7px] font-bold text-white/35 tracking-widest">{f}</span>
                          </div>
                          <span className="text-[7px] font-black tracking-widest" style={{ color: c as string }}>{st}</span>
                        </div>
                      ))}
                      <div className="rounded-xl px-3 py-2 text-center" style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.25)' }}>
                        <span className="text-[8px] font-black tracking-widest" style={{ color: GOLD }}>+ 613 MORE CURATORS AVAILABLE</span>
                      </div>
                    </div>

                    <div className="w-1/5 h-full shrink-0 px-4 pt-3 pb-2 flex flex-col gap-2">
                      <span className="font-black text-white text-sm tracking-tight">TIKTOK SOUND</span>
                      <div className="rounded-2xl p-3.5 grid grid-cols-2 gap-3" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,215,0,0.2)' }}>
                        <div>
                          <span className="block text-[7px] font-black tracking-widest text-white/40 mb-1">VIDEOS MADE</span>
                          <span className="block font-black text-white text-lg tracking-tight">312</span>
                        </div>
                        <div>
                          <span className="block text-[7px] font-black tracking-widest text-white/40 mb-1">SOUND VIEWS</span>
                          <span className="block font-black text-white text-lg tracking-tight">2.4M</span>
                        </div>
                      </div>
                      {[
                        ['@rainwontmiss', '842K views', '#30D158'],
                        ['@dielikejay', '410K views', '#FFD700'],
                        ['@micchekmondays', '205K views', 'rgba(255,255,255,0.45)'],
                        ['@unsignedhype', '98K views', 'rgba(255,255,255,0.35)'],
                      ].map(([handle, views, c]) => (
                        <div key={handle as string} className="rounded-xl px-2.5 py-2 flex items-center gap-2.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="w-6 h-8 rounded-md shrink-0 flex items-center justify-center text-[9px]" style={{ background: 'linear-gradient(160deg,#2a2a2f,#0A0A0F)' }}>♪</div>
                          <div className="flex-1 min-w-0">
                            <span className="block text-[9px] font-black text-white/90 tracking-wide truncate">{handle as string}</span>
                            <span className="text-[7px] font-black tracking-widest" style={{ color: c as string }}>{views as string}</span>
                          </div>
                        </div>
                      ))}
                      <span className="text-[7px] font-bold text-white/30 tracking-widest text-center mt-auto">UP TRACKS EVERY VIDEO USING YOUR SOUND</span>
                    </div>

                    <div className="w-1/5 h-full shrink-0 px-4 pt-3 pb-2 flex flex-col gap-2.5">
                      <span className="font-black text-white text-sm tracking-tight">YOUR NUMBERS</span>
                      <div className="rounded-2xl p-3.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <span className="block text-[8px] font-black tracking-widest text-white/40 mb-1">MONTHLY LISTENERS</span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-black text-white text-2xl tracking-tight">14,203</span>
                          <span className="font-black text-[9px]" style={{ color: '#30D158' }}>↑ 32%</span>
                        </div>
                      </div>
                      <div className="rounded-2xl p-3.5 flex-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <span className="block text-[8px] font-black tracking-widest text-white/40 mb-2">LAST 7 DAYS</span>
                        <div className="flex items-end gap-1.5 h-20">
                          {[35, 48, 42, 60, 72, 66, 92].map((h, i) => (
                            <motion.div key={i} className="flex-1 rounded-t"
                              style={{ background: i === 6 ? GOLD : 'rgba(255,215,0,0.35)' }}
                              initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.6, delay: 0.3 + i * 0.06 }} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[7px] font-bold text-white/30 tracking-widest text-center">UP TEXTS YOU THIS EVERY MORNING</span>
                    </div>
                  </motion.div>
                </div>

                <div className="shrink-0 px-4 pt-2 pb-6 grid grid-cols-5 gap-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.4)' }}>
                  {APP_TABS.map((t, i) => (
                    <div key={t} className="flex flex-col items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: i === appPage ? GOLD : 'rgba(255,255,255,0.15)' }} />
                      <span className="text-[7px] font-black tracking-widest" style={{ color: i === appPage ? GOLD : 'rgba(255,255,255,0.35)' }}>{t}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-40 rounded-full" style={{ width: 90, height: 4, background: inMessages ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>

      <p className="text-center mt-5" style={{ fontFamily: PIXEL, fontSize: 10, letterSpacing: '0.12em', color: DIM }}>
        LIVE DEMO — TEXT UP, DROP, REPEAT
      </p>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────────── */

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', socialHandle: '', role: 'Artist'
  });
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [inviteCopied, setInviteCopied] = useState(false);
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [getStartedOpen, setGetStartedOpen] = useState(false);

  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS_HREF}"]`)) return;
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = FONTS_HREF;
    document.head.appendChild(l);
  }, []);

  // Listen for the global "open the Get Started modal" event — any CTA can
  // trigger it via window.dispatchEvent(new CustomEvent('gup:get-started')).
  // During WAITLIST_MODE this routes to the waitlist instead of the modal.
  useEffect(() => {
    const h = () => { if (WAITLIST_MODE) { scrollToWaitlist(); } else { setGetStartedOpen(true); } };
    window.addEventListener(GET_STARTED_EVENT, h);
    return () => window.removeEventListener(GET_STARTED_EVENT, h);
  }, []);

  function scrollToWaitlist() {
    document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const openGetStarted = () => {
    if (WAITLIST_MODE) { scrollToWaitlist(); return; }
    setGetStartedOpen(true);
  };

  async function onPlanSelect(planName: string) {
    if (WAITLIST_MODE) { scrollToWaitlist(); return; }
    setPricingError(null);
    const result = await handlePricingClick({
      planName,
      userId:   user?.id ?? null,
      navigate,
    });
    if (result?.message) setPricingError(result.message);
  }

  // Scroll to hash anchor on mount (handles /#pricing navigation from
  // anywhere in the app). Defers slightly so the section's been laid out.
  useEffect(() => {
    if (!window.location.hash) return;
    const id = window.location.hash.slice(1);
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    setTimeout(tryScroll, 100);
    setTimeout(tryScroll, 400);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferredBy(ref);
      try { localStorage.setItem('gup_ref_code', ref) } catch { /* noop */ }
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRefCode = btoa(formData.email).substring(0, 8);
    setReferralCode(newRefCode);
    try {
      const { error } = await supabase.from('waitlist').insert([{
        email: formData.email, phone: formData.phone, artist_name: formData.name,
        role: formData.role, social_handle: formData.socialHandle,
        referral_code: newRefCode, referred_by: referredBy,
        source: 'homepage',
      }]);
      if (error) console.warn('Waitlist insert failed, proceeding anyway:', error);

      if (formData.phone) {
        fetch('/.netlify/functions/waitlist-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: formData.phone, name: formData.name }),
        }).catch(() => {/* swallow — SMS is best-effort */});
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Waitlist error:', err);
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen font-sans overflow-x-hidden relative" style={{ background: BG, color: INK }}>

      {/* film grain */}
      <div className="fixed inset-0 pointer-events-none z-[60]" aria-hidden="true">
        <div className="absolute -inset-[100px]" style={{ backgroundImage: GRAIN, opacity: 0.06, animation: 'gup-grain 0.9s steps(4) infinite' }} />
      </div>
      <style>{`
        @keyframes gup-grain   { 0%{transform:translate(0,0)} 25%{transform:translate(-40px,30px)} 50%{transform:translate(30px,-45px)} 75%{transform:translate(-25px,-20px)} 100%{transform:translate(0,0)} }
        @keyframes gup-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>

      {/* ── NAV ── */}
      <div className="relative z-30 flex items-center justify-between px-6 md:px-8 pt-7 pb-2">
        <a href="/" className="shrink-0">
          <img src="/logo.webp" alt="GrounduP" className="h-9" style={{ filter: 'invert(1) brightness(0.2)', opacity: 0.92 }} />
        </a>
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(x => (
            <a key={x} href={`#${x.toLowerCase().replace(' ', '-')}`} className="font-black text-[11px] tracking-[0.2em] cursor-pointer hover:opacity-60 transition-opacity" style={{ color: INK }}>
              {x}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-4">
          <button onClick={() => navigate('/login')} className="font-black text-[11px] uppercase tracking-widest cursor-pointer hover:opacity-60 transition-opacity" style={{ color: DIM }}>
            Sign In
          </button>
          <button onClick={openGetStarted} className="px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-widest cursor-pointer" style={{ background: GOLD, color: INK }}>
            {WAITLIST_MODE ? 'Join Waitlist' : 'Get In'}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-xl"
          style={{ border: `1px solid ${FAINT}` }}
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open menu"
        >
          <span className="w-5 h-0.5 rounded-full" style={{ background: INK }} />
          <span className="w-5 h-0.5 rounded-full" style={{ background: INK }} />
          <span className="w-3.5 h-0.5 rounded-full" style={{ background: DIM }} />
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <>
          <div className="fixed inset-0 z-[180] bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileNavOpen(false)} />
          <div className="fixed top-0 left-0 right-0 z-[190] rounded-b-3xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] md:hidden" style={{ background: BG }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${FAINT}` }}>
              <img src="/logo.webp" alt="GrounduP" className="h-9" style={{ filter: 'invert(1) brightness(0.2)', opacity: 0.92 }} />
              <button
                onClick={() => setMobileNavOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full"
                style={{ border: `1px solid ${FAINT}`, color: DIM }}
                aria-label="Close menu"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            <div className="px-6 pt-5 pb-4 flex gap-3">
              <button
                className="flex-1 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest"
                style={{ border: `1px solid ${FAINT}`, color: INK }}
                onClick={() => { navigate('/login'); setMobileNavOpen(false) }}
              >
                Sign In
              </button>
              <button
                className="flex-1 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest"
                style={{ background: GOLD, color: INK }}
                onClick={() => { setMobileNavOpen(false); openGetStarted(); }}
              >
                {WAITLIST_MODE ? 'Join Waitlist' : 'Get In'}
              </button>
            </div>

            <div className="px-6 pb-6 space-y-1 pt-4" style={{ borderTop: `1px solid ${FAINT}` }}>
              {NAV_LINKS.map(x => (
                <a
                  key={x}
                  href={`#${x.toLowerCase().replace(' ', '-')}`}
                  onClick={() => setMobileNavOpen(false)}
                  className="flex items-center w-full px-4 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest"
                  style={{ color: INK }}
                >
                  {x}
                </a>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── HERO — type left, live iPhone demo right ── */}
      <div className="relative z-10 px-6 md:px-8 pt-12 pb-16 grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
        <div className="relative">
          <span aria-hidden className="absolute right-4 -top-4 hidden lg:inline" style={{ color: DIM, fontSize: 18 }}>✛</span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="m-0 leading-[0.95] select-none"
          >
            <span className="block" style={{ fontFamily: PIXEL, fontWeight: 700, fontSize: 'clamp(40px, 6.5vw, 96px)', letterSpacing: '-0.02em' }}>
              NO LABEL.
            </span>
            <span className="block font-black tracking-tighter" style={{ fontSize: 'clamp(40px, 6.5vw, 96px)' }}>
              NO MANAGER.
            </span>
            <span className="block" style={{ fontFamily: SCRIPT, fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(46px, 7.5vw, 108px)', letterSpacing: '-0.02em', color: GOLDD }}>
              NO PROBLEM.
            </span>
          </motion.h1>

          <p className="max-w-md text-[13px] font-bold leading-relaxed tracking-wide mt-10" style={{ color: DIM }}>
            GROUNDUP IS THE ARTIST-RUN BACKEND FOR YOUR CAREER — PLAN DROPS, PITCH PLAYLISTS,
            RUN ADS, READ YOUR NUMBERS. YOUR MUSIC, YOUR MOVES, YOUR MONEY.
          </p>
          <div className="flex items-center gap-3 mt-8 flex-wrap">
            <GradientButton onClick={openGetStarted}>{WAITLIST_MODE ? 'JOIN WAITLIST →' : 'START FREE →'}</GradientButton>
            <button onClick={() => setShowDemo(true)} className="px-8 py-4 rounded-full font-black text-[12px] uppercase tracking-widest cursor-pointer border bg-transparent" style={{ borderColor: FAINT, color: INK }}>
              WATCH 60S DEMO
            </button>
          </div>
        </div>

        {/* live phone demo */}
        <div className="relative hidden lg:block">
          <Keycap label="DROP IT" sub="♪" className="-left-10 top-[8%]" delay={0.8} rotate={-11} />
          <IPhoneDemo />
        </div>
      </div>

      {/* ── TICKER ── */}
      <div className="relative z-10 overflow-hidden py-3.5 select-none" style={{ background: INK }}>
        <div className="flex whitespace-nowrap" style={{ animation: 'gup-marquee 28s linear infinite', width: 'max-content' }}>
          {[0, 1].map(dup => (
            <div key={dup} className="flex items-center">
              {TICKER.map(t => (
                <span key={`${dup}-${t}`} className="flex items-center">
                  <span className="font-black text-sm uppercase tracking-[0.15em] px-6" style={{ color: BG }}>{t}</span>
                  <span style={{ color: GOLD }}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── THE LOOP (word rows) ── */}
      <div className="relative z-10 mt-24">
        <Label>THE LOOP — HOW ARTISTS RUN IT</Label>
        {LOOP.map((r, i) => (
          <Reveal key={r.word} delay={i * 0.05}>
            <div className="group px-6 md:px-8 py-1 flex items-baseline justify-between gap-8 cursor-pointer transition-colors duration-300"
              style={{ borderTop: `1px solid ${FAINT}`, borderBottom: i === LOOP.length - 1 ? `1px solid ${FAINT}` : 'none' }}>
              <span className="tracking-tight transition-colors duration-300 group-hover:text-[#B8860B]"
                style={{ fontSize: 'clamp(36px, 8vw, 104px)', lineHeight: 1.2, fontWeight: 300 }}>
                {r.word}
              </span>
              <span className="hidden md:flex items-baseline gap-3 shrink-0">
                <span className="font-bold text-[12px] tracking-[0.15em]" style={{ color: DIM }}>{r.note}</span>
                <span style={{ fontFamily: PIXEL, fontSize: 11, color: DIM }}>0{i + 1}</span>
              </span>
            </div>
          </Reveal>
        ))}
      </div>

      {/* ── FEATURES (ecosystem grid) ── */}
      <div className="relative z-10 mt-28" id="features">
        <Label>THE ECOSYSTEM — EVERYTHING IN ONE PLACE</Label>
        <div className="px-6 md:px-8 mb-12">
          <Reveal>
            <h2 className="m-0 font-black tracking-tighter" style={{ fontSize: 'clamp(32px, 5.5vw, 72px)', lineHeight: 1 }}>
              BUILT FOR THE
              <span style={{ fontFamily: SCRIPT, fontStyle: 'italic', fontWeight: 400, color: GOLDD }}> NEXT </span>
              GENERATION
            </h2>
          </Reveal>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3" style={{ borderTop: `1px solid ${FAINT}` }}>
          {FEATURES.map((f, i) => (
            <Reveal key={f.t} delay={(i % 3) * 0.06}>
              <div className="group p-8 h-full cursor-pointer transition-colors duration-300 hover:bg-black/[0.03]"
                style={{ borderBottom: `1px solid ${FAINT}`, borderRight: `1px solid ${FAINT}` }}>
                <div className="flex items-center justify-between mb-10">
                  <span style={{ fontFamily: PIXEL, fontSize: 12, color: DIM }}>{f.n}</span>
                  <span className="w-2.5 h-2.5 rounded-full transition-colors duration-300 group-hover:bg-[#FFD700]" style={{ background: FAINT }} />
                </div>
                <h3 className="m-0 mb-4 font-black tracking-tight text-3xl">{f.t}</h3>
                <p className="m-0 text-[12px] font-bold leading-relaxed tracking-wide" style={{ color: DIM }}>{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── METRICS BAND — live moving tiles, on-brand black/gold ── */}
      <div className="relative z-10 mt-28 py-20 px-6 md:px-8 hidden md:block overflow-hidden" style={{ background: INK }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="block mb-3" style={{ fontFamily: PIXEL, fontSize: 12, letterSpacing: '0.15em', color: 'rgba(244,241,236,0.4)' }}>
              LIVE, NOT STATIC
            </span>
            <h2 className="m-0 font-black tracking-tighter uppercase" style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1, color: BG }}>
              YOUR CAREER, <span style={{ fontFamily: SCRIPT, fontStyle: 'italic', fontWeight: 400, textTransform: 'none', color: GOLD }}>in numbers.</span>
            </h2>
            <p className="mt-3 text-[12px] font-bold tracking-[0.15em] uppercase" style={{ color: 'rgba(244,241,236,0.4)' }}>
              Real-time metrics powering your Artist OS
            </p>
          </div>
          <InfiniteBentoPan />
        </div>
      </div>

      {/* ── NUMBERS ── */}
      <div className="relative z-10 mt-28">
        <Label>THE NUMBERS — SCALING EVERYWHERE</Label>
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ borderTop: `1px solid ${FAINT}`, borderBottom: `1px solid ${FAINT}` }}>
          {STATS.map((s, i) => (
            <Reveal key={s.l} delay={i * 0.05}>
              <div className="p-8 text-center" style={{ borderRight: i < STATS.length - 1 ? `1px solid ${FAINT}` : 'none' }}>
                <p className="m-0 font-black tracking-tighter" style={{ fontSize: 'clamp(36px, 5vw, 72px)', lineHeight: 1 }}>{s.v}</p>
                <p className="m-0 mt-2" style={{ fontFamily: PIXEL, fontSize: 11, letterSpacing: '0.12em', color: DIM }}>{s.l}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* ── PROOF — stacked receipts on a black band ── */}
      <div className="relative z-10 mt-28 py-24 overflow-hidden" style={{ background: INK }}>
        <div className="px-6 md:px-8 mb-9 text-center">
          <span className="block mb-3" style={{ fontFamily: PIXEL, fontSize: 12, letterSpacing: '0.15em', color: 'rgba(244,241,236,0.4)' }}>
            THE RECEIPTS
          </span>
          <h2 className="font-black tracking-tighter" style={{ fontSize: 'clamp(28px, 5vw, 64px)', lineHeight: 1, color: BG }}>
            NOT PROMISES. <span style={{ fontFamily: SCRIPT, fontStyle: 'italic', fontWeight: 400, color: GOLD }}>Proof.</span>
          </h2>
        </div>
        <div className="flex justify-center pb-20">
          {/* Cards fan rightward+downward from the base card, so the true
              visual centroid sits half the max horizontal offset (176px) to
              the right of center — shift left to compensate. */}
          <div className="w-full max-w-3xl -translate-x-[88px]">
            <DisplayCards
              cards={[
                {
                  icon: <TrendingUp className="size-3.5" style={{ color: GOLD }} />,
                  title: 'CAMPAIGN RESULTS',
                  description: '38K STREAMS IN 30 DAYS',
                  date: 'MIDNIGHT ROLLOUT',
                  className:
                    "[grid-area:stack] hover:-translate-y-6 before:absolute before:w-[100%] before:outline-1 before:rounded-2xl before:outline-white/10 before:h-[100%] before:content-[''] before:bg-black/40 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
                },
                {
                  icon: <Music2 className="size-3.5" style={{ color: GOLD }} />,
                  title: 'SOUND ON TIKTOK',
                  description: '1,204 VIDEOS TO YOUR SOUND',
                  date: 'LAST 7 DAYS',
                  className:
                    "[grid-area:stack] translate-x-[44px] translate-y-[26px] hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-2xl before:outline-white/10 before:h-[100%] before:content-[''] before:bg-black/40 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
                },
                {
                  icon: <Newspaper className="size-3.5" style={{ color: GOLD }} />,
                  title: 'BLOG COVERAGE',
                  description: '12 FEATURES ACROSS BLOGS',
                  date: 'THIS RELEASE',
                  className:
                    "[grid-area:stack] translate-x-[88px] translate-y-[52px] hover:translate-y-6 before:absolute before:w-[100%] before:outline-1 before:rounded-2xl before:outline-white/10 before:h-[100%] before:content-[''] before:bg-black/40 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
                },
                {
                  icon: <Trophy className="size-3.5" style={{ color: GOLD }} />,
                  title: 'BILLBOARD CHARTED',
                  description: '#17 EMERGING R&B/HIP-HOP',
                  date: 'BILLBOARD.COM',
                  className:
                    "[grid-area:stack] translate-x-[132px] translate-y-[78px] hover:translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-2xl before:outline-white/10 before:h-[100%] before:content-[''] before:bg-black/40 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
                },
                {
                  icon: <ListMusic className="size-3.5" style={{ color: GOLD }} />,
                  title: 'APPLE MUSIC CHART',
                  description: '#9 ON NEW MUSIC DAILY',
                  date: 'APPLE MUSIC',
                  className: '[grid-area:stack] translate-x-[176px] translate-y-[104px] hover:translate-y-14',
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div className="relative z-10 mt-28">
        <Label>ARTISTS ON UP — IN THEIR WORDS</Label>
        <div className="px-6 md:px-8 grid lg:grid-cols-2 gap-12">
          {QUOTES.map((t, i) => (
            <Reveal key={t.a} delay={i * 0.08}>
              <figure className="m-0 p-10 h-full flex flex-col justify-between gap-10" style={{ border: `1px solid ${FAINT}`, background: '#fff' }}>
                <blockquote className="m-0" style={{ fontFamily: SCRIPT, fontStyle: 'italic', fontSize: 'clamp(20px, 2.4vw, 32px)', lineHeight: 1.25 }}>
                  {t.q}
                </blockquote>
                <figcaption className="flex items-center justify-between">
                  <span className="font-black text-sm tracking-[0.1em]">{t.a}</span>
                  <span style={{ fontFamily: PIXEL, fontSize: 10, letterSpacing: '0.1em', color: DIM }}>{t.m}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="px-6 md:px-8 mt-6 text-[10px] font-bold tracking-wide" style={{ color: DIM }}>
          COMPOSITE OUTCOMES FROM ARTISTS RUNNING CAMPAIGNS THROUGH UP. RESULTS VARY.
        </p>
      </div>

      {/* ── PRICING ── */}
      <div className="relative z-10 mt-28" id="pricing">
        <Label>THE PRICE — SIMPLE, TRANSPARENT</Label>
        <PricingSection onSelect={onPlanSelect} />
        {pricingError && (
          <p className="text-center text-xs font-bold mt-6 max-w-md mx-auto" style={{ color: GOLDD }}>
            {pricingError}
          </p>
        )}
      </div>

      {/* ── FAQ — real interactive uP concierge, needs a dark backdrop ── */}
      <div className="relative z-10 mt-28 py-24" id="faq" style={{ background: INK }}>
        <SupportBot />
      </div>

      {/* ── SIGNUP — real waitlist form ── */}
      <div className="relative z-10 mt-28 px-6 md:px-8" id="signup">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[40px] px-6 md:px-8 py-20" style={{ background: INK, color: BG }}>
            <span aria-hidden className="absolute left-8 top-8 hidden sm:inline" style={{ fontFamily: PIXEL, fontSize: 11, color: 'rgba(244,241,236,0.35)' }}>READY?</span>
            <span aria-hidden className="absolute right-8 top-8 hidden sm:inline" style={{ color: 'rgba(244,241,236,0.35)' }}>✛</span>

            <div className="text-center mb-12">
              <h2 className="m-0 mb-4 font-black tracking-tighter" style={{ fontSize: 'clamp(40px, 7vw, 96px)', lineHeight: 0.95 }}>
                {WAITLIST_MODE ? (
                  <>GET ON<span style={{ fontFamily: SCRIPT, fontStyle: 'italic', fontWeight: 400, color: GOLD }}> THE LIST.</span></>
                ) : (
                  <>YOUR<span style={{ fontFamily: SCRIPT, fontStyle: 'italic', fontWeight: 400, color: GOLD }}> MOVE.</span></>
                )}
              </h2>
              <p className="m-0 text-[12px] font-bold tracking-[0.15em]" style={{ color: 'rgba(244,241,236,0.5)' }}>
                {WAITLIST_MODE
                  ? "LIMITED EARLY ACCESS. WE'RE APPROVING ARTISTS IN WAVES — JOIN NOW TO GET IN EARLY."
                  : 'THE ARTIST OS. FREE TO START. TWO MINUTES TO SET UP.'}
              </p>
            </div>

            <div className="max-w-xl mx-auto relative z-10">
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="space-y-4" onSubmit={handleJoin}
                  >
                    <input
                      type="text" placeholder="ARTIST NAME" required
                      value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full h-14 px-6 rounded-full font-bold text-sm outline-none"
                      style={{ background: 'rgba(244,241,236,0.08)', border: '1px solid rgba(244,241,236,0.2)', color: BG }}
                    />
                    <input
                      type="email" placeholder="EMAIL ADDRESS" required
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full h-14 px-6 rounded-full font-bold text-sm outline-none"
                      style={{ background: 'rgba(244,241,236,0.08)', border: '1px solid rgba(244,241,236,0.2)', color: BG }}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}
                        className="w-full h-14 px-6 rounded-full font-bold text-sm outline-none"
                        style={{ background: 'rgba(244,241,236,0.08)', border: '1px solid rgba(244,241,236,0.2)', color: BG }}
                      >
                        <option value="Artist" style={{ color: INK }}>ARTIST</option>
                        <option value="Manager" style={{ color: INK }}>MANAGER</option>
                        <option value="Label" style={{ color: INK }}>LABEL</option>
                      </select>
                      <input
                        type="tel" placeholder="PHONE"
                        value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full h-14 px-6 rounded-full font-bold text-sm outline-none"
                        style={{ background: 'rgba(244,241,236,0.08)', border: '1px solid rgba(244,241,236,0.2)', color: BG }}
                      />
                    </div>
                    <input
                      type="text" placeholder="SOCIAL HANDLE (@...)"
                      value={formData.socialHandle} onChange={e => setFormData({ ...formData, socialHandle: e.target.value })}
                      className="w-full h-14 px-6 rounded-full font-bold text-sm outline-none"
                      style={{ background: 'rgba(244,241,236,0.08)', border: '1px solid rgba(244,241,236,0.2)', color: BG }}
                    />
                    <div className="pt-2">
                      <GradientButton type="submit" className="w-full h-14 min-w-0">{WAITLIST_MODE ? 'JOIN WAITLIST →' : 'GET IN →'}</GradientButton>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-10 rounded-3xl"
                    style={{ background: 'rgba(244,241,236,0.06)', border: '1px solid rgba(255,215,0,0.3)' }}
                  >
                    <h3 className="m-0 mb-5 font-black uppercase tracking-tighter" style={{ fontSize: 28 }}>
                      {WAITLIST_MODE ? "YOU'RE ON THE LIST." : "YOU'RE IN. LET'S GO."}
                    </h3>
                    <p className="m-0 mb-3 text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: GOLD }}>
                      {WAITLIST_MODE ? 'YOUR INVITE CODE' : 'YOUR ACCESS CODE'}
                    </p>
                    <div className="rounded-xl px-4 py-3 mb-6 select-all" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(244,241,236,0.15)' }}>
                      <code className="text-sm font-mono tracking-wider" style={{ color: BG }}>{referralCode}</code>
                    </div>
                    {WAITLIST_MODE ? (
                      <>
                        <p className="m-0 mb-4 text-[11px] font-bold leading-relaxed" style={{ color: 'rgba(244,241,236,0.5)' }}>
                          WE'LL TEXT YOU WHEN YOUR SPOT OPENS. SHARE YOUR CODE — EVERY ARTIST WHO JOINS WITH IT MOVES YOU UP THE LIST.
                        </p>
                        <GradientButton
                          onClick={() => {
                            navigator.clipboard.writeText(`https://groundupapp.com/?ref=${referralCode}`).catch(() => {});
                            setInviteCopied(true);
                            setTimeout(() => setInviteCopied(false), 2000);
                          }}
                          className="w-full h-14 min-w-0"
                        >
                          {inviteCopied ? 'COPIED ✓' : 'COPY INVITE LINK'}
                        </GradientButton>
                      </>
                    ) : (
                      <GradientButton onClick={() => navigate('/signup')} className="w-full h-14 min-w-0">CREATE YOUR ACCOUNT</GradientButton>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* ── FOOTER — real footer, already gold/black-branded ── */}
      <div className="relative z-10 mt-8">
        <CinematicFooter onViewDemo={() => setShowDemo(true)} />
      </div>

      {/* Global overlays */}
      <GetStartedModal open={getStartedOpen} onClose={() => setGetStartedOpen(false)} />
      <UpBot onViewDemo={() => setShowDemo(true)} />
      <AnimatePresence>
        {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default LandingPage;
