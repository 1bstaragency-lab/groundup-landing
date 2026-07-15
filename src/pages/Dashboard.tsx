import { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DashboardShell } from '../components/layout/DashboardShell';
import { DashboardThemeProvider } from '../lib/dashboard-theme';
import { STATS_REFRESHED_EVENT } from '../lib/statsRefreshEvent';

export function Dashboard() {
  const { user, emailJustConfirmed, clearEmailConfirmed } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [gmailBanner, setGmailBanner] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const refreshedFor = useRef<string | null>(null);

  // Auto-refresh connected platform stats once per login session, then let
  // Claude summarize what changed. Rate-limited server-side too, so repeat
  // logins within the cooldown window are cheap no-ops.
  useEffect(() => {
    if (!user?.id || refreshedFor.current === user.id) return;
    refreshedFor.current = user.id;
    (async () => {
      try {
        const res = await fetch('/.netlify/functions/stats-refresh', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ userId: user.id }),
        });
        const data = await res.json().catch(() => null);
        if (data?.insight) {
          setInsight(data.insight);
          setTimeout(() => setInsight(null), 8000);
        }
        if (data?.ok && !data?.skipped) {
          window.dispatchEvent(new CustomEvent(STATS_REFRESHED_EVENT));
        }
      } catch {
        // Silent — this is a background nice-to-have, never blocks the dashboard.
      }
    })();
  }, [user?.id]);

  // Show email confirmed banner
  useEffect(() => {
    if (emailJustConfirmed) {
      setShowBanner(true);
      clearEmailConfirmed();
      const t = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(t);
    }
  }, [emailJustConfirmed, clearEmailConfirmed]);

  // Show Gmail connected banner from redirect params
  // URL cleanup is handled by the section component (InfluencerSection) so we just read here
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('gmail_connected') === '1') {
      setGmailBanner(true);
      setTimeout(() => setGmailBanner(false), 5000);
    }
  }, []);

  return (
    <DashboardThemeProvider>
      {/* Gmail connected banner */}
      <AnimatePresence>
        {gmailBanner && (
          <motion.div
            initial={{ opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -60 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3.5 bg-green-500 text-white rounded-2xl shadow-[0_20px_60px_rgba(34,197,94,0.4)] font-black text-[11px] uppercase tracking-widest whitespace-nowrap"
          >
            <CheckCircle size={16} strokeWidth={3} />
            Gmail connected — ready to send outreach emails!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email confirmed banner */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3.5 bg-[#FFD700] text-black rounded-2xl shadow-[0_20px_60px_rgba(255,215,0,0.4)] font-black text-[11px] uppercase tracking-widest whitespace-nowrap"
          >
            <CheckCircle size={16} strokeWidth={3} />
            Email confirmed — welcome to GrounduP!
            <button
              onClick={() => setShowBanner(false)}
              className="ml-2 opacity-50 hover:opacity-100 transition-opacity text-black font-black text-base leading-none"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fresh stats insight, from the auto-refresh-on-login pass */}
      <AnimatePresence>
        {insight && (
          <motion.div
            initial={{ opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -60 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3.5 bg-[#FFD700] text-black rounded-2xl shadow-[0_20px_60px_rgba(255,215,0,0.4)] font-bold text-[12px] max-w-[90vw]"
          >
            <Sparkles size={16} strokeWidth={2.5} className="shrink-0" />
            <span className="truncate">{insight}</span>
            <button
              onClick={() => setInsight(null)}
              className="ml-1 opacity-50 hover:opacity-100 transition-opacity text-black font-black text-base leading-none shrink-0"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <DashboardShell>
        <Outlet />
      </DashboardShell>
    </DashboardThemeProvider>
  );
}
