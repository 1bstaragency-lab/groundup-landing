import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import logo from './assets/logo.png';
import './App.css';

const WAITLIST_DATA = [
  { email: 'a****@gmail.com', listeners: '5,542' },
  { email: 'j****@icloud.com', listeners: '1,423' },
  { email: 'm****@yahoo.com', listeners: '14,441' },
  { email: 's****@gmail.com', listeners: '706' },
  { email: 'k****@outlook.com', listeners: '3,112' },
];

const LEADERBOARD_DATA = [
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
  const [referralLink, setReferralLink] = useState('');
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    fetchCount();
    const saved = localStorage.getItem('groundup_beta_user');
    if (saved) {
      setIsJoined(true);
      const data = JSON.parse(saved);
      generateReferralLink(data.email);
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
      
      if (!error && count !== null) {
        setTotalCount(232 + count);
      }
    } catch (err) {
      console.error('Error fetching count:', err);
    }
  };

  const generateReferralLink = (emailStr: string) => {
    const hash = btoa(emailStr).substring(0, 8);
    setReferralLink(`${window.location.origin}?ref=${hash}`);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to Supabase
    const { error } = await supabase
      .from('waitlist')
      .insert([
        { 
          email: formData.email, 
          phone: formData.phone, 
          artist_name: formData.artistName, 
          platform: selectedPlatform,
          social_handle: formData.socials 
        }
      ]);

    if (error) {
      console.error('Error saving to waitlist:', error.message);
      // Even if DB fails, we let them see the dashboard for UX
    }

    localStorage.setItem('groundup_beta_user', JSON.stringify(formData));
    setIsJoined(true);
    generateReferralLink(formData.email);
    fetchCount(); // Update the number immediately
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
              <div className="logo-wrapper floating">
                <img src={logo} alt="GrounduP" className="main-logo" />
              </div>
              
              <h1 className="hero-title">
                The Future of <span className="gold-text">Artist Growth</span>
              </h1>

              <div className="artist-count-badge">
                Early Beta Access
              </div>

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
                <h3>Sign Up Now</h3>
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
                    placeholder="Email Address" 
                    className="input-field"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <input 
                    type="tel" 
                    placeholder="Phone Number" 
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
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
                  <span className="stat-value gold-text">#{totalCount}</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">Referrals</span>
                  <span className="stat-value">0</span>
                </div>
              </div>

              <div className="referral-box">
                <h3 className="referral-highlight gold-text">BUMP YOUR RANK</h3>
                <p>Refer friends to up your rank and get access earlier.</p>
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
                    {LEADERBOARD_DATA.map((entry, i) => (
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
    </div>
  );
}

export default App;
