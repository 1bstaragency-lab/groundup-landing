import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import logo from './assets/logo.png';
import './App.css';

const ROLES = ['(creator)', '(streamer)', '(content creator)'];

const WAITLIST_DATA = [
  { email: 'a****@gmail.com', listeners: '5,542' },
  { email: 'j****@icloud.com', listeners: '1,423' },
  { email: 'm****@yahoo.com', listeners: '14,441' },
  { email: 's****@gmail.com', listeners: '706' },
  { email: 'k****@outlook.com', listeners: '3,112' },
];

type LeaderboardEntry = {
  name: string;
  referrals: number;
  role?: string;
};

// Seed data merged with real DB data
const SEED_LEADERBOARD: LeaderboardEntry[] = [
  { name: 'Alex M.', referrals: 181, role: '(creator)' },
  { name: 'Jordan K.', referrals: 165, role: '(streamer)' },
  { name: 'Sarah L.', referrals: 142, role: '(content creator)' },
  { name: 'Mike D.', referrals: 128, role: '(creator)' },
  { name: 'Chris P.', referrals: 112, role: '(streamer)' },
  { name: 'Jessica W.', referrals: 95 },
  { name: 'Ryan B.', referrals: 78 },
  { name: 'Taylor S.', referrals: 62 },
  { name: 'Morgan J.', referrals: 45 },
  { name: 'Skylar R.', referrals: 28 },
];

function App() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    artistName: '',
    socials: ''
  });
  const [selectedPlatform, setSelectedPlatform] = useState('IG');
  const [isJoined, setIsJoined] = useState(false);
  const [totalCount, setTotalCount] = useState(232);
  const [myReferralCount, setMyReferralCount] = useState(0);
  const [myPosition, setMyPosition] = useState(232);
  const [referralLink, setReferralLink] = useState('');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(SEED_LEADERBOARD);
  const [refCode, setRefCode] = useState('');
  const [showReferralPopup, setShowReferralPopup] = useState(false);

  useEffect(() => {
    // Read referral code from URL
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setRefCode(ref);
      // Show popup 2s after page load
      setTimeout(() => {
        setShowReferralPopup(true);
        // Auto-dismiss after 6s
        setTimeout(() => setShowReferralPopup(false), 6000);
      }, 2000);
    }

    fetchCount();
    fetchLeaderboard();

    const saved = localStorage.getItem('groundup_beta_user');
    if (saved) {
      const data = JSON.parse(saved);
      setIsJoined(true);
      generateReferralLink(data.email);
      fetchMyReferrals(data.email);
      fetchMyPosition(data.email);
    }

    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % WAITLIST_DATA.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchCount = async () => {
    try {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) setTotalCount(232 + count);
    } catch (err) {
      console.error('Error fetching count:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      // Get all rows, group by referral_code to count referrals
      const { data, error } = await supabase
        .from('waitlist')
        .select('artist_name, referral_code, referred_by')
        .not('referral_code', 'is', null);

      if (error || !data) return;

      // Count how many people used each referral_code as referred_by
      const countMap: Record<string, { name: string; count: number }> = {};
      data.forEach((row: { referral_code: string; artist_name: string; referred_by: string }) => {
        if (row.referral_code) {
          if (!countMap[row.referral_code]) {
            countMap[row.referral_code] = { name: row.artist_name || 'Artist', count: 0 };
          }
        }
      });
      data.forEach((row: { referral_code: string; artist_name: string; referred_by: string }) => {
        if (row.referred_by && countMap[row.referred_by]) {
          countMap[row.referred_by].count += 1;
        }
      });

      // Build real leaderboard entries from DB
      const realEntries: LeaderboardEntry[] = Object.values(countMap)
        .filter((e) => e.count > 0)
        .sort((a, b) => b.count - a.count)
        .map((e, i) => ({
          name: e.name,
          referrals: e.count,
          role: e.count >= 10 ? ROLES[i % ROLES.length] : undefined,
        }));

      // Merge: seed entries shifted down, real entries at top
      if (realEntries.length > 0) {
        const merged = [
          ...realEntries,
          ...SEED_LEADERBOARD.map((s) => ({ ...s, referrals: s.referrals - realEntries.length })),
        ]
          .filter((e) => e.referrals > 0)
          .sort((a, b) => b.referrals - a.referrals)
          .slice(0, 15);
        setLeaderboard(merged);
      }
    } catch (err) {
      console.error('Leaderboard error:', err);
    }
  };

  const fetchMyReferrals = async (email: string) => {
    try {
      const myCode = btoa(email).substring(0, 8);
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .eq('referred_by', myCode);
      if (!error && count !== null) setMyReferralCount(count);
    } catch (err) {
      console.error('Error fetching my referrals:', err);
    }
  };

  const fetchMyPosition = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('waitlist')
        .select('created_at')
        .eq('email', email)
        .single();
      if (error || !data) return;

      // Count how many signed up before this user
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', data.created_at);

      if (count !== null) setMyPosition(232 + count + 1);
    } catch (err) {
      console.error('Error fetching position:', err);
    }
  };

  const generateReferralLink = (emailStr: string) => {
    const hash = btoa(emailStr).substring(0, 8);
    setReferralLink(`${window.location.origin}?ref=${hash}`);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();

    const myCode = btoa(formData.email).substring(0, 8);

    const { error } = await supabase
      .from('waitlist')
      .insert([{
        email: formData.email,
        phone: formData.phone,
        artist_name: formData.artistName,
        platform: selectedPlatform,
        social_handle: formData.socials,
        referral_code: myCode,
        referred_by: refCode || null,  // track who referred them
      }]);

    if (error) {
      console.error('Error saving to waitlist:', error.message);
    }

    localStorage.setItem('groundup_beta_user', JSON.stringify(formData));
    setIsJoined(true);
    generateReferralLink(formData.email);
    fetchCount();
    fetchLeaderboard();
    fetchMyReferrals(formData.email);
    fetchMyPosition(formData.email);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied!');
  };

  return (
    <div className="landing-container">
      <div className="glow top-glow"></div>
      
      <main className="content">
        <AnimatePresence mode="wait">
          {!isJoined ? (
            <motion.section 
              key="signup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="hero-section"
            >
              <div className="artist-count-badge">
                Early Beta Access
              </div>

              <div className="logo-wrapper floating">
                <img src={logo} alt="GrounduP" className="main-logo" />
              </div>
              
              <h1 className="hero-title">
                The Future of <span className="gold-text">Artist Growth</span>
              </h1>

              {/* Waitlist Ticker */}
              <div className="ticker-wrapper glass">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={tickerIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="ticker-item"
                  >
                    <span className="ticker-email">{WAITLIST_DATA[tickerIndex].email}</span>
                    <span className="ticker-badge">
                      {WAITLIST_DATA[tickerIndex].listeners} monthly listeners
                    </span>
                  </motion.div>
                </AnimatePresence>
                <div className="ticker-label">Recently Joined GrounduP</div>
              </div>

              <form onSubmit={handleJoin} className="signup-form-v2 glass">
                <h3 className="form-title">Sign Up Now</h3>
                <div className="input-group">
                  <input 
                    type="text" 
                    placeholder="Artist Name" 
                    className="input-field"
                    value={formData.artistName}
                    onChange={(e) => setFormData({...formData, artistName: e.target.value})}
                    required
                  />
                  <input 
                    type="email" 
                    placeholder="Email" 
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
                <div className="social-platform-wrapper">
                  <div className="platform-selector">
                    <button 
                      type="button"
                      className={`platform-btn ig ${selectedPlatform === 'IG' ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform('IG')}
                    >IG</button>
                    <button 
                      type="button"
                      className={`platform-btn tt ${selectedPlatform === 'TikTok' ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform('TikTok')}
                    >TT</button>
                    <button 
                      type="button"
                      className={`platform-btn sp ${selectedPlatform === 'Spotify' ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform('Spotify')}
                    >SPOTIFY</button>
                  </div>
                  <input 
                    type="text" 
                    placeholder={`${selectedPlatform} Handle`} 
                    className="input-field"
                    value={formData.socials}
                    onChange={(e) => setFormData({...formData, socials: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="chrome-btn w-full">Claim Your Spot</button>
              </form>
            </motion.section>
          ) : (
            <motion.section 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="referral-dashboard glass"
            >
              <div className="dashboard-nav">
                <button 
                  onClick={() => {
                    localStorage.removeItem('groundup_beta_user');
                    window.location.reload();
                  }} 
                  className="back-btn"
                >
                  ← Back to Signup
                </button>
              </div>
              <h2 className="dashboard-title">Welcome, <span className="gold-text">{formData.artistName}</span></h2>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-label">Your Position</span>
                  <span className="stat-value gold-text">#{myPosition}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Referrals</span>
                  <span className="stat-value">{myReferralCount}</span>
                </div>
              </div>

              <div className="referral-box">
                <h3 className="referral-highlight gold-text">BUMP YOUR RANK</h3>
                <p>Refer friends to move up the list and get access earlier.</p>
                <div className="link-container">
                  <input type="text" readOnly value={referralLink} className="input-field" />
                  <button onClick={copyToClipboard} className="chrome-btn">Copy</button>
                </div>
              </div>

              <div className="leaderboard-section">
                <div className="leaderboard-header">
                  <h3>Artist Leaderboard</h3>
                  <span className="gold-text">{totalCount}+ and counting</span>
                </div>
                <div className="leaderboard-container">
                  <div className="leaderboard-scroll">
                    {leaderboard.map((entry, i) => (
                      <div key={i} className="leaderboard-row">
                        <span className="rank">#{i + 1}</span>
                        <div className="name-wrapper">
                          <span className="name">{entry.name}</span>
                          {entry.role && <span className="role">{entry.role}</span>}
                        </div>
                        <span className="referrals gold-text">{entry.referrals} referred</span>
                      </div>
                    ))}
                  </div>
                  <div className="leaderboard-blur"></div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <footer className="footer">
        <p>&copy; 2026 GrounduP Artist Platform</p>
      </footer>

      {/* Referral Popup */}
      <AnimatePresence>
        {showReferralPopup && (
          <>
            <motion.div
              className="referral-popup-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReferralPopup(false)}
            />
            <motion.div
              className="referral-popup"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              <button className="referral-popup-close" onClick={() => setShowReferralPopup(false)}>✕</button>
              <p className="referral-popup-ws">W's in the chat 🏆</p>
              <p className="referral-popup-msg">You & your friend both received extra points for this referral.</p>
              <p className="referral-popup-sub">Sign up below to lock in your spot.</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

export default App;
