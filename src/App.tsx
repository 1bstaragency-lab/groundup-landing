import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';
import { TrendingUp, CheckCircle, Globe, ChevronRight } from 'lucide-react';
import { TeamDashboardMockup } from './components/ui/TeamDashboardMockup';
import ShaderShowcase from './components/ui/hero';
import './App.css';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [formData, setFormData] = useState({
    artistName: '', email: '', phone: '', socialHandle: '', platform: 'IG'
  });
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referredBy, setReferredBy] = useState<string | null>(null);
  const [showReferralPopup, setShowReferralPopup] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferredBy(ref);
      setTimeout(() => setShowReferralPopup(true), 2000);
    }
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRefCode = btoa(formData.email).substring(0, 8);
    setReferralCode(newRefCode);

    try {
      const { error } = await supabase.from('waitlist').insert([{
        email: formData.email, phone: formData.phone, artist_name: formData.artistName,
        platform: formData.platform, social_handle: formData.socialHandle,
        referral_code: newRefCode, referred_by: referredBy
      }]);
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error('Error joining waitlist:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="app-wrapper bg-black text-white font-sans overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FFD700]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFD700]/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="nav-container">
        <div className="nav-logo">
          <img src="/logo.png" alt="GrounduP" className="h-8 md:h-10" />
        </div>
        <div className="nav-pill">
          <a href="#features" className="nav-pill-link">Features</a>
          <a href="#pricing" className="nav-pill-link">Pricing</a>
          <a href="#waitlist" className="nav-pill-link">Waitlist</a>
        </div>
        <button className="nav-cta" onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}>
          Join Now
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <ShaderShowcase />
      </section>

      {/* Real Patterns Section */}
      <section id="features" className="py-32 px-6 relative">
        <div className="container mx-auto">
          <h2 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">Real Artists.<br/>Real Patterns.</h2>
          <p className="text-gray-500 text-xl mb-20">Verified strategies from the industry, backed by data.</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'CROSS-PLATFORM', title: 'The TikTok-to-Apple Music Pipeline', stat: '87%', users: '+186 artists using', icon: <TrendingUp className="w-5 h-5 text-[#FFD700]" /> },
              { label: 'TIMING', title: "Spotify's Retention Revolution", stat: '91%', users: '+228 artists using', icon: <CheckCircle className="w-5 h-5 text-[#FFD700]" /> },
              { label: 'CROSS-PLATFORM', title: 'The Discovery Ripple Effect', stat: '84%', users: '+194 artists using', icon: <Globe className="w-5 h-5 text-[#FFD700]" /> }
            ].map((card, i) => (
              <div key={i} className="feature-card-v3 p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-[#FFD700]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-12">
                  <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase border border-white/10 px-2 py-1 rounded">{card.label}</span>
                  <div className="text-right">
                    <span className="block text-4xl font-black text-white">{card.stat}</span>
                    <span className="text-[10px] font-black text-[#FFD700] uppercase tracking-widest">Success</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 pr-10 leading-tight">{card.title}</h3>
                <p className="text-gray-500 text-sm mb-12 leading-relaxed">Verified strategies used by top teams to lock in momentum and scale audience retention.</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xs font-bold text-gray-400">{card.users}</span>
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Conversation Section */}
      <section className="py-32 px-6">
        <div className="container mx-auto grid md:grid-cols-2 items-center gap-20">
          <div className="relative order-2 md:order-1">
            <TeamDashboardMockup />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FFD700]/10 blur-[60px] rounded-full" />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">Your whole team.<br/><span className="text-gray-500 italic">One conversation.</span></h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-10">Artists, managers, and collaborators stay in sync. uP keeps everyone aligned with real-time insights and shared context.</p>
            <a href="#signup" className="text-[#FFD700] font-black tracking-widest uppercase text-sm flex items-center gap-2 group">
              Connect your team <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      {/* Meet uP Section */}
      <section className="py-32 px-6 bg-[#050505]">
        <div className="container mx-auto">
            <div className="max-w-4xl mb-20">
                <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">Built for how <br/>music gets made.</h2>
                <p className="text-gray-500 text-xl md:text-2xl leading-relaxed">uP brings together intelligence, planning, and collaboration in one seamless experience.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-20 items-center">
                <div>
                    <h3 className="text-4xl md:text-5xl font-black mb-6">Meet uP.<br/><span className="text-gray-500">Your Music Concierge.</span></h3>
                    <p className="text-gray-400 text-lg leading-relaxed mb-10">An AI that actually knows music. uP understands your career, remembers your goals, and speaks your language. Ask anything.</p>
                    <a href="#signup" className="text-[#FFD700] font-black tracking-widest uppercase text-sm flex items-center gap-2 group">
                        Start a conversation <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>
                <div className="relative">
                    <img src="/assets/up_assistant_chat_ui_1778628229052.png" alt="uP Assistant" className="w-full rounded-3xl shadow-2xl border border-white/5" />
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#FFD700]/10 blur-[100px] rounded-full" />
                </div>
            </div>
        </div>
      </section>

      {/* Proactive Section */}
      <section className="py-40 px-6 relative overflow-hidden">
        <div className="container mx-auto grid md:grid-cols-2 items-center gap-20">
            <div className="relative">
                <img src="/assets/groundup_dashboard_ui_v2_1778628772716.png" alt="uP Rollout" className="w-full rounded-3xl shadow-2xl border border-white/5" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#FFD700]/5 blur-[100px] rounded-full" />
            </div>
            <div className="text-right flex flex-col items-end">
                <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">It just works.<br/><span className="text-gray-500 italic">Proactive, not reactive.</span></h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-10 text-right">uP doesn't wait for you to ask. It builds rollout plans, schedules releases, and creates assets before you need them.</p>
                <a href="#signup" className="text-[#FFD700] font-black tracking-widest uppercase text-sm flex items-center gap-2 group">
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> See it in action
                </a>
            </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="signup" className="py-40 px-6 border-t border-white/5">
        <div className="container mx-auto max-w-xl">
            <div className="text-center mb-16">
                <h2 className="text-5xl font-black tracking-tighter mb-4">Join the early beta.</h2>
                <p className="text-gray-500">Lock in your spot for the next generation of music management.</p>
            </div>

            {!submitted ? (
              <form className="waitlist-form-v3" onSubmit={handleJoin}>
                <div className="space-y-4">
                    <input type="text" placeholder="Artist Name" required value={formData.artistName} onChange={(e) => setFormData({...formData, artistName: e.target.value})} className="wait-input" />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="email" placeholder="Email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="wait-input" />
                        <input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="wait-input" />
                    </div>
                    <input type="text" placeholder="Social Handle (@...)" value={formData.socialHandle} onChange={(e) => setFormData({...formData, socialHandle: e.target.value})} className="wait-input" />
                    <button type="submit" className="wait-submit-btn">GET EARLY ACCESS</button>
                </div>
              </form>
            ) : (
              <div className="text-center p-12 bg-zinc-900/40 rounded-3xl border border-[#FFD700]/20 backdrop-blur-xl">
                <h3 className="text-3xl font-black text-white mb-6">You're in!</h3>
                <p className="text-[#FFD700] text-xs font-black uppercase tracking-widest mb-2">Referral Link</p>
                <code className="text-white text-sm break-all font-mono">{window.location.origin}/?ref={referralCode}</code>
                <p className="text-gray-500 text-xs mt-6">Share to move up the waitlist. 🚀</p>
              </div>
            )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-10 border-t border-white/5">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <img src="/logo.png" alt="GrounduP" className="h-8 opacity-40" />
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-600">
            <a href="#" className="hover:text-white">Twitter</a>
            <a href="#" className="hover:text-white">Instagram</a>
            <a href="#" className="hover:text-white">Discord</a>
          </div>
          <p className="text-gray-600 text-xs tracking-tighter">&copy; 2026 GrounduP Artist Platform. All rights reserved.</p>
        </div>
      </footer>

      {/* Referral Popup */}
      <AnimatePresence>
        {showReferralPopup && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-zinc-900 border border-[#FFD700]/30 p-8 rounded-3xl max-w-sm text-center shadow-[0_0_50px_rgba(0,255,133,0.1)]" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <button className="absolute top-4 right-4 text-gray-500 hover:text-white" onClick={() => setShowReferralPopup(false)}>✕</button>
              <p className="text-[#FFD700] font-black text-xl mb-2">W's in the chat 🏆</p>
              <p className="text-gray-400 text-sm">Your referral reward has been applied.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
