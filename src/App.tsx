import { useState, useEffect } from 'react';
import { motion, AnimatePresence as AP } from 'framer-motion';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { HomeSection } from './pages/dashboard/HomeSection';
import { LearnSection } from './components/dashboard/LearnSection';
import { SchedulerSection } from './components/dashboard/SchedulerSection';
import { StudioSection } from './components/dashboard/StudioSection';
import { ProfileSection } from './components/dashboard/ProfileSection';
import { RolloutsSection } from './components/dashboard/RolloutsSection';
import { AnalyticsSection } from './components/dashboard/AnalyticsSection';
import { TeamSection } from './components/dashboard/TeamSection';
import { CuratorSection } from './components/dashboard/CuratorSection';
import { InfluencerSection } from './components/dashboard/InfluencerSection';
import { TeamDashboardMockup } from './components/ui/TeamDashboardMockup';
import ShaderShowcase from './components/ui/hero';
import { LiquidButton } from './components/ui/liquid-glass-button';
import { PricingPage } from './components/ui/pricing-page';
import { MarketingBadges } from './components/ui/marketing-badges';
import { MagnifiedBento } from './components/ui/magnified-bento';
import { InfiniteBentoPan } from './components/ui/infinite-bento-pan';
import { GlobeLive } from './components/ui/cobe-globe-live';
import { SupportBot } from './components/ui/support-bot';
import { CinematicFooter } from './components/ui/motion-footer';
import { DemoModal } from './components/ui/DemoModal';
import { AwardBadge } from './components/ui/award-badge';
import { OnboardingFlow } from './components/ui/OnboardingFlow';
import { UpBot } from './components/ui/UpBot';
import { AnimatePresence } from 'framer-motion';

// ─── Page-level splash (shows once per session for 1.5s) ──────────────────────
const SPLASH_KEY = 'gup_splash_shown';

function PageSplash({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center gap-8"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
    >
      <Loader />
      <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">GrounduP Artist OS</p>
    </motion.div>
  );
}
import { UpChatMockup, UpOrbMascot } from './components/ui/UpChatMockup';
import { SignUpPage } from './pages/SignUp';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { JoinPage } from './pages/JoinPage';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import { ResetPasswordPage } from './pages/ResetPassword';
import { MarkerHighlight } from './components/ui/marker-highlight';
import { Loader } from './components/ui/loader';
import { useAuth } from './hooks/useAuth';
import { supabase } from './supabaseClient';
import './App.css';

// Loading spinner shown while session is resolving
function AuthLoader() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <Loader />
    </div>
  );
}

// Guard: redirect to /login if not authenticated
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Guard: redirect to /dashboard if already authenticated
function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

const NAV_POPUPS = {
  features: {
    label: 'Features',
    heading: 'Everything in one place',
    body: 'AI-powered rollout planning, content scheduling, streaming analytics, team collaboration tools, and a smart inbox — built exclusively for artists and their teams.',
  },
  pricing: {
    label: 'Pricing',
    heading: 'Simple. Transparent.',
    body: 'Pro starts at $29/mo with a 7-day free trial. Growth at $55/mo. Plant is custom for managers scaling a roster. No credit card required to start.',
  },
  signup: {
    label: 'Get Started',
    heading: 'Launch your Artist OS',
    body: 'Create your account in under 2 minutes. Your releases, calendar, AI assistant, and team — all in one place from day one.',
  },
} as const;
type NavKey = keyof typeof NAV_POPUPS;

// ─── Landing Page ────────────────────────────────────────────────────────────
function LandingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', socialHandle: '', role: 'Artist'
  });
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [activePopup, setActivePopup] = useState<NavKey | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [navVisible, setNavVisible] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferredBy(ref);
  }, []);

  // Fade nav out once hero scrolls off screen
  useEffect(() => {
    function onScroll() {
      const hero = document.getElementById('hero-section');
      if (!hero) return;
      const bottom = hero.getBoundingClientRect().bottom;
      setNavVisible(bottom > 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRefCode = btoa(formData.email).substring(0, 8);
    setReferralCode(newRefCode);
    try {
      const { error } = await supabase.from('waitlist').insert([{
        email: formData.email, phone: formData.phone, artist_name: formData.name,
        role: formData.role, social_handle: formData.socialHandle,
        referral_code: newRefCode, referred_by: referredBy
      }]);
      if (error) console.warn('Waitlist insert failed, proceeding anyway:', error);

      // Fire welcome SMS (non-blocking — don't await, don't fail signup if it errors)
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
    <div className="app-wrapper bg-black text-white font-sans overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FFD700]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFD700]/5 blur-[120px] rounded-full" />
      </div>

      {/* Nav popup click-away */}
      {activePopup && (
        <div className="fixed inset-0 z-[90]" onClick={() => setActivePopup(null)} />
      )}

      {/* Navigation */}
      <nav className="nav-container" style={{ opacity: navVisible ? 1 : 0, pointerEvents: navVisible ? 'auto' : 'none', transition: 'opacity 0.4s ease' }}>
        <div className="nav-logo">
          <img src="/logo.webp" alt="GrounduP" className="h-12 md:h-16" />
        </div>

        {/* Centered nav links — desktop only */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-10 pointer-events-auto">
          {(Object.keys(NAV_POPUPS) as NavKey[]).map(key => {
            const item = NAV_POPUPS[key]
            const isOpen = activePopup === key
            return (
              <div key={key} className="relative">
                <button
                  onClick={e => { e.stopPropagation(); setActivePopup(isOpen ? null : key) }}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${isOpen ? 'text-[#FFD700]' : 'text-white/40 hover:text-[#FFD700]'}`}
                >
                  {item.label}
                </button>

                {isOpen && (
                  <div
                    onClick={e => e.stopPropagation()}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[110]"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900/95 border-l border-t border-white/10 rotate-45" />
                    <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.3em] mb-1">{item.label}</p>
                    <p className="text-white font-black text-sm uppercase tracking-tight leading-tight mb-2">{item.heading}</p>
                    <p className="text-white/40 text-[11px] font-medium leading-relaxed">{item.body}</p>
                    {key === 'signup' ? (
                      <div className="mt-4 flex flex-col gap-2">
                        <button
                          onClick={() => { setActivePopup(null); navigate('/signup') }}
                          className="w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                          style={{ background: '#FFD700', color: '#000' }}
                        >
                          Create Account
                        </button>
                        <button
                          onClick={() => { setActivePopup(null); navigate('/login') }}
                          className="w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
                        >
                          Sign In
                        </button>
                      </div>
                    ) : (
                      <a
                        href={`#${key}`}
                        onClick={() => setActivePopup(null)}
                        className="inline-block mt-3 text-[9px] font-black uppercase tracking-widest text-[#FFD700] hover:text-[#FFD700]/70 transition-colors"
                      >
                        Learn more →
                      </a>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          {/* Desktop CTAs */}
          <button className="nav-cta hidden md:block" onClick={() => navigate('/login')}>Sign In</button>
          <button className="nav-cta hidden md:block" style={{ background: '#FFD700', color: '#000' }} onClick={() => navigate('/signup')}>Join Now</button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-xl border border-white/10 bg-white/5"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open menu"
          >
            <span className="w-5 h-0.5 bg-white rounded-full" />
            <span className="w-5 h-0.5 bg-white rounded-full" />
            <span className="w-3.5 h-0.5 bg-white/50 rounded-full" />
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <>
          <div className="fixed inset-0 z-[180] bg-black/70 backdrop-blur-sm md:hidden" onClick={() => setMobileNavOpen(false)} />
          <div className="fixed top-0 left-0 right-0 z-[190] bg-zinc-950 border-b border-white/10 rounded-b-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] md:hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
              <img src="/logo.webp" alt="GrounduP" className="h-10" />
              <button
                onClick={() => setMobileNavOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </div>

            {/* CTAs — top of drawer so they're immediately visible */}
            <div className="px-6 pt-5 pb-4 flex gap-3">
              <button
                className="flex-1 py-3.5 rounded-2xl border border-white/10 text-white font-black text-[11px] uppercase tracking-widest hover:border-white/25 hover:bg-white/5 transition-all"
                onClick={() => { navigate('/login'); setMobileNavOpen(false) }}
              >
                Sign In
              </button>
              <button
                className="flex-1 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]"
                style={{ background: '#FFD700', color: '#000' }}
                onClick={() => { navigate('/signup'); setMobileNavOpen(false) }}
              >
                Join Now
              </button>
            </div>

            {/* Nav links */}
            <div className="px-6 pb-6 space-y-1 border-t border-white/5 pt-4">
              {(Object.keys(NAV_POPUPS) as NavKey[]).map(key => {
                const item = NAV_POPUPS[key]
                return (
                  <a
                    key={key}
                    href={`#${key}`}
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl hover:bg-white/5 transition-colors group"
                  >
                    <div>
                      <p className="text-white font-black text-sm uppercase tracking-widest">{item.label}</p>
                      <p className="text-white/30 text-[11px] font-medium mt-0.5">{item.heading}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/20 group-hover:text-[#FFD700] transition-colors flex-shrink-0"><path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </a>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Hero */}
      <section className="relative" id="hero-section">
        <ShaderShowcase />
      </section>

      {/* Built for the Next Generation — moved above bento */}
      <section id="features" className="py-24 px-6 md:px-12 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
              Built for the <br/><span className="text-[#FFD700]">Next Generation</span>
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium">
              The most advanced OS for music management, production tracking, and team scaling ever built.
            </p>
          </div>
          {/* MarketingBadges — desktop only */}
          <div className="hidden md:block mb-20">
            <MarketingBadges label="Our Ecosystem" subtitle="Everything an artist needs, unified in one intelligent platform." />
          </div>
          <TeamDashboardMockup />
        </div>
      </section>

      {/* Infinite Bento Pan — desktop only */}
      <section className="py-20 bg-black overflow-hidden hidden md:block">
        <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Your Career, In Numbers</h2>
          <p className="text-white/30 text-sm font-medium mt-2">Real-time metrics powering your Artist OS</p>
        </div>
        <InfiniteBentoPan />
      </section>


      {/* Meet uP */}
      <section className="py-32 px-6 bg-[#050505] overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            {/* Left — orb mascot + copy */}
            <div>
              {/* Animated orb mascot */}
              <div className="mb-10">
                <UpOrbMascot />
              </div>
              <h3 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter leading-none">
                Meet uP.<br/><span className="text-white/40">Your Assistant Manager.</span>
              </h3>
              <p className="text-white/40 text-base font-medium mb-8 leading-relaxed max-w-sm">
                uP lives in your iMessage. Like having a manager in your pocket — checking in, catching deadlines, and keeping your career moving forward.
              </p>
              <ul className="text-white/60 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-5 lg:w-[75%] text-[14px] font-bold">
                {[
                  'Checks in on your release progress',
                  'Recommends next steps for your career',
                  'Alerts you before deadlines hit',
                  'Answers music industry questions',
                  'Connects your rollout to your goals',
                  'Available 24/7 over iMessage',
                ].map((f, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="text-[#FFD700] mt-0.5">•</span> {f}</li>
                ))}
              </ul>
              <div className="flex gap-4 pt-10">
                <LiquidButton onClick={() => navigate('/signup')}>Start Chatting</LiquidButton>
              </div>
            </div>

            {/* Right — live chat mockup with animated orb avatars */}
            <div className="relative">
              <UpChatMockup />
            </div>
          </div>
        </div>
      </section>

      {/* MagnifiedBento — intelligent workflows */}
      <section className="py-24 px-6 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Powered by Intelligent Workflows</h2>
          </div>
          <MagnifiedBento />
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-32 px-6 bg-black relative">
        <SupportBot />
      </section>

      {/* Global Artist Network */}
      <section className="py-32 px-6 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-none">
              Scaling<br/><MarkerHighlight delay={0.2}>Everywhere.</MarkerHighlight>
            </h2>
            <p className="text-white/40 text-xl font-medium mb-10 leading-relaxed max-w-md">
              Our active artists are dominating global charts. Real-time career management across 60+ territories.
            </p>
            <div className="flex flex-col items-center gap-4">
              <AwardBadge type="product-of-the-day" place={2} />
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em] hero-text">Trusted by 2,000+ Artists</p>
            </div>
            <div className="flex gap-12 mt-10">
              <div>
                <p className="text-5xl font-black text-white mb-1">12M+</p>
                <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">Monthly Reach</p>
                <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mt-2">Playlists, Blogs, Infrastructure</p>
              </div>
              <div>
                <p className="text-5xl font-black text-white mb-1">427</p>
                <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">Elite Artists</p>
              </div>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-[#FFD700]/5 blur-[120px] rounded-full" />
            <GlobeLive className="w-full max-w-2xl mx-auto relative z-10" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <PricingPage onSelect={() => navigate('/signup')} />
        </div>
      </section>

      {/* Signup */}
      <section id="signup" className="py-40 px-6 relative bg-black border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)]" />
        <div className="container mx-auto max-w-xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              Build your career<br/><span className="text-[#FFD700]">your way.</span>
            </h2>
            <p className="text-white/40 text-lg font-medium">The Artist OS built for the next generation.</p>
          </div>

          {!submitted ? (
            <form className="space-y-6" onSubmit={handleJoin}>
              <div className="grid gap-4">
                <input type="text" placeholder="Artist Name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="wait-input" />
                <input type="email" placeholder="Email Address" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="wait-input" />
                <div className="grid grid-cols-2 gap-4">
                  <select className="wait-input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                    <option value="Artist">Artist</option>
                    <option value="Manager">Manager</option>
                    <option value="Label">Label</option>
                  </select>
                  <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="wait-input" />
                </div>
                <input type="text" placeholder="Social Handle (@...)" value={formData.socialHandle} onChange={(e) => setFormData({...formData, socialHandle: e.target.value})} className="wait-input" />
                <div className="pt-6">
                  <LiquidButton type="submit" className="w-full">GET STARTED</LiquidButton>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center p-12 bg-zinc-900/40 rounded-3xl border border-[#FFD700]/30 backdrop-blur-xl animate-in zoom-in-95 duration-500">
              <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter leading-none">You're in. Let's go.</h3>
              <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] mb-3">Your Access Code</p>
              <div className="bg-black/50 p-4 rounded-xl border border-white/10 mb-8 select-all">
                <code className="text-white text-sm font-mono tracking-wider">{referralCode}</code>
              </div>
              <LiquidButton onClick={() => navigate('/signup')} className="w-full">Create Your Account</LiquidButton>
            </div>
          )}
        </div>
      </section>

      <CinematicFooter onViewDemo={() => setShowDemo(true)} />
      <UpBot onViewDemo={() => setShowDemo(true)} />
      <AnimatePresence>
        {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Onboarding (legacy preview flow) ────────────────────────────────────────
function OnboardingPage() {
  const navigate = useNavigate();
  return <OnboardingFlow onComplete={() => navigate('/dashboard')} onSkip={() => navigate('/dashboard')} />;
}

// ─── Root Router ─────────────────────────────────────────────────────────────
function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Show once per browser session
    if (sessionStorage.getItem(SPLASH_KEY)) return false;
    sessionStorage.setItem(SPLASH_KEY, '1');
    return true;
  });

  return (
    <>
      <AP>
        {showSplash && <PageSplash key="splash" onDone={() => setShowSplash(false)} />}
      </AP>
      <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route
        path="/signup"
        element={
          <RedirectIfAuthed>
            <SignUpPage
              onComplete={() => window.location.replace('/dashboard')}
              onSwitchToLogin={() => window.location.replace('/login')}
            />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage
              onSuccess={() => window.location.replace('/dashboard')}
              onSwitchToSignUp={() => window.location.replace('/signup')}
            />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<HomeSection />} />
        <Route path="rollouts" element={<RolloutsSection />} />
        <Route path="analytics" element={<AnalyticsSection />} />
        <Route path="learn" element={<LearnSection />} />
        <Route path="scheduler" element={<SchedulerSection />} />
        <Route path="studio" element={<StudioSection />} />
        <Route path="influencers" element={<InfluencerSection />} />
        <Route path="team" element={<TeamSection />} />
        <Route path="curator" element={<CuratorSection />} />
        <Route path="profile" element={<ProfileSection />} />
      </Route>
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      {/* Team invite accept — public, no auth required */}
      <Route path="/join/:token" element={<JoinPage />} />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}

export default App;
