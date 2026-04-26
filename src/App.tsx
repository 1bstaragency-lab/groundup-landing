import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isJoined, setIsJoined] = useState(false);
  const [position] = useState(232);
  const [referralLink, setReferralLink] = useState('');
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
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

  const generateReferralLink = (emailStr: string) => {
    const hash = btoa(emailStr).substring(0, 8);
    setReferralLink(`${window.location.origin}?ref=${hash}`);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('groundup_beta_user', JSON.stringify(formData));
    setIsJoined(true);
    generateReferralLink(formData.email);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    alert('Referral link copied!');
  };

  return (
    <div className="landing-container">
      <div className="glow top-glow"></div>
      
      <nav className="navbar">
        <img src={logo} alt="GrounduP Logo" className="nav-logo" />
      </nav>

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
                  <input 
                    type="text" 
                    placeholder="Socials (IG/TikTok/Handle)" 
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
                  <span className="stat-value gold-text">#{position}</span>
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
                  <span className="gold-text">232+ and counting</span>
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
