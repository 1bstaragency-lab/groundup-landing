import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { TeamDashboardMockup } from './components/ui/TeamDashboardMockup';
import ShaderShowcase from './components/ui/hero';
import { LiquidButton } from './components/ui/liquid-glass-button';
import { BentoPricing } from './components/ui/bento-pricing';
import { GlobeLive } from './components/ui/cobe-globe-live';
import { SupportBot } from './components/ui/support-bot';
import { CinematicFooter } from './components/ui/motion-footer';
import { AwardBadge } from './components/ui/award-badge';
import { OnboardingFlow } from './components/ui/OnboardingFlow';
import { UpBot } from './components/ui/UpBot';
import { SignUpPage } from './pages/SignUp';
import { LoginPage } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { JoinPage } from './pages/JoinPage';
import { useAuth } from './hooks/useAuth';
import { supabase } from './supabaseClient';
import './App.css';

// Loading spinner shown while session is resolving
function AuthLoader() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="w-12 h-12 bg-[#FFD700] rounded-2xl animate-pulse" />
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
    body: 'Start free forever. Pro and Agency plans unlock advanced AI tools, unlimited team seats, and priority support. Lock in founder pricing before launch.',
  },
  waitlist: {
    label: 'Waitlist',
    heading: 'Get early access',
    body: 'Join 1,000+ artists already on the list. Early members get founder pricing, exclusive features, and direct input on the roadmap.',
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setReferredBy(ref);
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
      <nav className="nav-container">
        <div className="nav-logo">
          <img src="/logo.png" alt="GrounduP" className="h-12 md:h-16" />
        </div>

        {/* Centered nav links (absolute so they're truly centered regardless of logo/CTA widths) */}
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
                    {/* arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-900/95 border-l border-t border-white/10 rotate-45" />
                    <p className="text-[#FFD700] text-[9px] font-black uppercase tracking-[0.3em] mb-1">{item.label}</p>
                    <p className="text-white font-black text-sm uppercase tracking-tight leading-tight mb-2">{item.heading}</p>
                    <p className="text-white/40 text-[11px] font-medium leading-relaxed">{item.body}</p>
                    <a
                      href={`#${key}`}
                      onClick={() => setActivePopup(null)}
                      className="inline-block mt-3 text-[9px] font-black uppercase tracking-widest text-[#FFD700] hover:text-[#FFD700]/70 transition-colors"
                    >
                      Learn more →
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <button className="nav-cta" onClick={() => navigate('/login')}>
            Sign In
          </button>
          <button
            className="nav-cta"
            style={{ background: '#FFD700', color: '#000' }}
            onClick={() => navigate('/signup')}
          >
            Join Now
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        <ShaderShowcase />
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 md:px-12 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">
              Built for the <br/><span className="text-[#FFD700]">Next Generation</span>
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium">
              The most advanced OS for music management, production tracking, and team scaling ever built.
            </p>
          </div>
          <TeamDashboardMockup />
        </div>
      </section>

      {/* Meet uP — badge removed from image overlay */}
      <section className="py-32 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter leading-none">
                Meet uP.<br/><span className="text-white/40">Your Music Concierge.</span>
              </h3>
              <ul className="text-white/60 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 lg:w-[65%] text-[14px] font-bold">
                {[
                  'Standard Management OS',
                  'Content Bundle (6 Content, 2 Viz, 2 Lyric)',
                  'Personalized Rollout Strategy',
                  'Real-time Performance Data',
                  'Priority AI Processing',
                  '35 Infrastructure Credits'
                ].map((f, i) => (
                  <li key={i} className="flex items-center gap-2"><span>•</span> {f}</li>
                ))}
              </ul>
              <div className="flex gap-4 pt-10">
                <LiquidButton onClick={() => navigate('/signup')}>Start Chatting</LiquidButton>
              </div>
            </div>
            <div className="relative">
              <img
                src="/assets/up_assistant_chat_ui_1778628229052.png"
                alt="uP Assistant"
                className="w-full rounded-3xl shadow-[0_0_50px_rgba(255,215,0,0.1)] border border-white/5"
              />
            </div>
          </div>
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
              Scaling<br/><span className="text-[#FFD700]">Everywhere.</span>
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
          <div className="relative">
            <div className="absolute inset-0 bg-[#FFD700]/5 blur-[120px] rounded-full" />
            <GlobeLive className="w-full max-w-2xl mx-auto relative z-10" />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-none">
              Simple Pricing.<br/><span className="text-[#FFD700]">Unlimited Growth.</span>
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
              From rising stars to global powerhouses, GrounduP is built to scale with your velocity.
            </p>
          </div>
          <BentoPricing onSelect={() => navigate('/signup')} />
        </div>
      </section>

      {/* Waitlist */}
      <section id="signup" className="py-40 px-6 relative bg-black border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)]" />
        <div className="container mx-auto max-w-xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
              Claim your <br/><span className="text-[#FFD700]">Early Spot.</span>
            </h2>
            <p className="text-white/40 text-lg font-medium">Join the next generation of industry management.</p>
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
                  <LiquidButton type="submit" className="w-full">GET EARLY ACCESS</LiquidButton>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-center p-12 bg-zinc-900/40 rounded-3xl border border-[#FFD700]/30 backdrop-blur-xl animate-in zoom-in-95 duration-500">
              <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter leading-none">You're on the list!</h3>
              <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em] mb-3">Your Referral Code</p>
              <div className="bg-black/50 p-4 rounded-xl border border-white/10 mb-8 select-all">
                <code className="text-white text-sm font-mono tracking-wider">{referralCode}</code>
              </div>
              <LiquidButton onClick={() => navigate('/signup')} className="w-full">Create Your Account</LiquidButton>
            </div>
          )}
        </div>
      </section>

      <CinematicFooter />
      <UpBot />
    </div>
  );
}

// ─── Onboarding (legacy preview flow) ────────────────────────────────────────
function OnboardingPage() {
  const navigate = useNavigate();
  return <OnboardingFlow onComplete={() => navigate('/dashboard')} />;
}

// ─── Root Router ─────────────────────────────────────────────────────────────
function App() {
  return (
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
      />
      {/* Team invite accept — public, no auth required */}
      <Route path="/join/:token" element={<JoinPage />} />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
