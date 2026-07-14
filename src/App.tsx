import { useState, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { Loader } from './components/ui/loader';
import { useAuth } from './hooks/useAuth';
import { WAITLIST_MODE } from './lib/featureFlags';
import './App.css';

// ─── Route-level code splitting ───────────────────────────────────────────────
// Every page loads as its own chunk so visitors only download the code for the
// route they're on. The Suspense fallback is a black screen + loader, matching
// the existing splash/auth loaders, so transitions look seamless.
const LandingPage       = lazy(() => import('./pages/Landing'));
const PricingStandalone = lazy(() => import('./pages/PricingStandalone'));
const AppPageV1         = lazy(() => import('./pages/AppPageV1'));
const AppPageV2         = lazy(() => import('./pages/AppPageV2'));
const PrivacyPolicy     = lazy(() => import('./pages/PrivacyPolicy'));

const CampaignsPage      = lazy(() => import('./pages/Campaigns').then(m => ({ default: m.CampaignsPage })));
const Dashboard          = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const JoinPage           = lazy(() => import('./pages/JoinPage').then(m => ({ default: m.JoinPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage  = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPasswordPage })));
const ContactCardPage    = lazy(() => import('./pages/ContactCard').then(m => ({ default: m.ContactCardPage })));
const AdminDashboard     = lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const CreatorOnboarding  = lazy(() => import('./pages/CreatorOnboarding').then(m => ({ default: m.CreatorOnboarding })));
const WaitlistPage       = lazy(() => import('./pages/WaitlistPage').then(m => ({ default: m.WaitlistPage })));
const OfferPage          = lazy(() => import('./pages/offers/OfferPage').then(m => ({ default: m.OfferPage })));
const SignUpPage         = lazy(() => import('./pages/SignUp').then(m => ({ default: m.SignUpPage })));
const LoginPage          = lazy(() => import('./pages/Login').then(m => ({ default: m.LoginPage })));
const OnboardingFlow     = lazy(() => import('./components/ui/OnboardingFlow').then(m => ({ default: m.OnboardingFlow })));

// Dashboard sections — each its own chunk, loaded when the tab is opened
const HomeSection       = lazy(() => import('./pages/dashboard/HomeSection').then(m => ({ default: m.HomeSection })));
const RolloutsSection   = lazy(() => import('./components/dashboard/RolloutsSection').then(m => ({ default: m.RolloutsSection })));
const AnalyticsSection  = lazy(() => import('./components/dashboard/AnalyticsSection').then(m => ({ default: m.AnalyticsSection })));
const SchedulerSection  = lazy(() => import('./components/dashboard/SchedulerSection').then(m => ({ default: m.SchedulerSection })));
const InfluencerSection = lazy(() => import('./components/dashboard/InfluencerSection').then(m => ({ default: m.InfluencerSection })));
const LearnSection      = lazy(() => import('./components/dashboard/LearnSection').then(m => ({ default: m.LearnSection })));
const StudioSection     = lazy(() => import('./components/dashboard/StudioSection').then(m => ({ default: m.StudioSection })));
const ProfileSection    = lazy(() => import('./components/dashboard/ProfileSection').then(m => ({ default: m.ProfileSection })));
const MvpPreviewPage    = lazy(() => import('./pages/dashboard/MvpPreviewPage').then(m => ({ default: m.MvpPreviewPage })));

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

// Loading spinner shown while session resolves or a route chunk downloads
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

// ─── Onboarding (legacy preview flow) ────────────────────────────────────────
function OnboardingPage() {
  const navigate = useNavigate();
  return <OnboardingFlow onComplete={() => navigate('/dashboard')} onSkip={() => navigate('/dashboard')} />;
}

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Show once per browser session
    if (sessionStorage.getItem(SPLASH_KEY)) return false;
    sessionStorage.setItem(SPLASH_KEY, '1');
    return true;
  });

  return (
    <>
      <AnimatePresence>
        {showSplash && <PageSplash key="splash" onDone={() => setShowSplash(false)} />}
      </AnimatePresence>
      <Suspense fallback={<AuthLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingStandalone />} />
          <Route path="/app" element={<AppPageV2 />} />
          <Route path="/app-v1" element={<AppPageV1 />} />
          <Route path="/app-v2" element={<AppPageV2 />} />
          <Route path="/get-app" element={<Navigate to="/app" replace />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/signup"
            element={
              WAITLIST_MODE ? (
                <Navigate to="/waitlist" replace />
              ) : (
                <RedirectIfAuthed>
                  <SignUpPage
                    onComplete={() => window.location.replace('/dashboard')}
                    onSwitchToLogin={() => window.location.replace('/login')}
                  />
                </RedirectIfAuthed>
              )
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
            {/* MVP core surfaces (Campaigns = Scheduler component for now) */}
            <Route path="scheduler" element={<SchedulerSection />} />
            <Route path="influencers" element={<InfluencerSection />} />

            {/* Curator merged into Influencer Outreach — keep route as redirect */}
            <Route path="curator" element={<Navigate to="../influencers" replace />} />

            {/* Knowledge Base is open — Video Library free, PDFs/Articles gated to Pro+ */}
            <Route path="learn"  element={<LearnSection />} />

            {/* Preview routes (Coming Soon teaser pages) */}
            <Route path="studio" element={<StudioSection />} />
            <Route path="team"   element={<MvpPreviewPage feature="Team" />} />
            <Route path="profile" element={<ProfileSection />} />
          </Route>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          {/* Team invite accept — public, no auth required */}
          <Route path="/join/:token" element={<JoinPage />} />
          {/* Contact card — one-tap Add to Contacts for iMessage users */}
          <Route path="/contact" element={<ContactCardPage />} />
          {/* Internal admin dashboard */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* UGC creator / influencer onboarding — public link to send to creators */}
          <Route path="/creators" element={<CreatorOnboarding />} />
          {/* Legal */}
          <Route path="/privacy" element={<PrivacyPolicy />} />

          {/* Email waitlist — same iMessage mock visual, captures email */}
          <Route path="/waitlist" element={<WaitlistPage />} />

          {/* /mvp is the REAL app (Expo web build) served as static
              files from public/mvp — see public/_redirects. */}

          {/* Offer landing pages — all funnel to iMessage onboarding */}
          <Route path="/free"      element={<OfferPage offerId="free" />} />
          <Route path="/curators"  element={<OfferPage offerId="curators" />} />
          <Route path="/ads"       element={<OfferPage offerId="ads" />} />
          <Route path="/rollout"   element={<OfferPage offerId="rollout" />} />
          <Route path="/manager"   element={<OfferPage offerId="manager" />} />
          <Route path="/comeback"  element={<OfferPage offerId="comeback" />} />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
