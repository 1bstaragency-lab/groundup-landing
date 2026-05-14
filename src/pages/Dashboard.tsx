import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { DashboardShell } from '../components/layout/DashboardShell';

export function Dashboard() {
  const { emailJustConfirmed, clearEmailConfirmed } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [gmailBanner, setGmailBanner] = useState(false);

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
    <>
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

      <DashboardShell>
        <Outlet />
      </DashboardShell>
    </>
  );
}
