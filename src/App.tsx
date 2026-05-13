import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { TeamDashboardMockup } from './components/ui/TeamDashboardMockup';
import ShaderShowcase from './components/ui/hero';
import { LiquidButton } from './components/ui/liquid-glass-button';
import { BentoPricing } from './components/ui/bento-pricing';
import { GlobeLive } from './components/ui/cobe-globe-live';
import { CinematicFooter } from './components/ui/motion-footer';
import './App.css';

// Initialize Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', socialHandle: '', role: 'Artist'
  });
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referredBy, setReferredBy] = useState<string | null>(null);

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
          <img src="/logo.png" alt="GrounduP" className="h-12 md:h-16" />
        </div>
        <nav className="hidden md:flex items-center gap-12 text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
          <a href="#features" className="hover:text-[#FFD700] transition-colors">Features</a>
          <a href="#pricing" className="hover:text-[#FFD700] transition-colors">Pricing</a>
          <a href="#waitlist" className="hover:text-[#FFD700] transition-colors">Waitlist</a>
        </nav>

        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-[#FFD700] rounded-2xl flex items-center justify-center font-black text-black text-2xl shadow-[0_0_30px_rgba(255,215,0,0.3)]">uP</div>
          <button className="nav-cta" onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}>
            Join Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <ShaderShowcase />
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 md:px-12 bg-black overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-tight">Built for the <br/><span className="text-[#FFD700]">Next Generation</span></h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium">The most advanced OS for music management, production tracking, and team scaling ever built.</p>
          </div>
          
          <TeamDashboardMockup />
        </div>
      </section>

      {/* Meet uP Section */}
      <section className="py-32 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-20 items-center">
                <div>
                    <h3 className="text-4xl md:text-5xl font-black mb-6 tracking-tighter leading-none">Meet uP.<br/><span className="text-white/40">Your Music Concierge.</span></h3>
                    <p className="text-white/40 text-lg leading-relaxed mb-10 font-medium">An AI that actually knows music. uP understands your career, remembers your goals, and speaks your language. Ask anything.</p>
                    <div className="flex gap-4">
                        <LiquidButton onClick={() => document.getElementById('signup')?.scrollIntoView({ behavior: 'smooth' })}>Start Chatting</LiquidButton>
                    </div>
                </div>
                <div className="relative">
                    <img src="/assets/up_assistant_chat_ui_1778628229052.png" alt="uP Assistant" className="w-full rounded-3xl shadow-[0_0_50px_rgba(255,215,0,0.1)] border border-white/5" />
                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#FFD700]/10 blur-[100px] rounded-full" />
                </div>
            </div>
        </div>
      </section>

      {/* Global Artist Network */}
      <section className="py-32 px-6 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-8 leading-none">Scaling<br/><span className="text-[#FFD700]">Everywhere.</span></h2>
            <p className="text-white/40 text-xl font-medium mb-10 leading-relaxed max-w-md">Our active artists are dominating global charts. Real-time career management across 60+ territories.</p>
            
            <div className="flex gap-12">
              <div>
                <p className="text-5xl font-black text-white mb-1">12M+</p>
                <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">Monthly Reach</p>
              </div>
              <div>
                <p className="text-5xl font-black text-white mb-1">2.4K</p>
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

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-none">Simple Pricing.<br/><span className="text-[#FFD700]">Unlimited Growth.</span></h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto font-medium leading-relaxed">From rising stars to global powerhouses, GrounduP is built to scale with your velocity.</p>
          </div>
          <BentoPricing />
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="signup" className="py-40 px-6 relative bg-black border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)]" />
        <div className="container mx-auto max-w-xl relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">Claim your <br/><span className="text-[#FFD700]">Early Spot.</span></h2>
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
                      <LiquidButton type="submit" className="w-full">
                        GET EARLY ACCESS
                      </LiquidButton>
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
                <LiquidButton onClick={() => setSubmitted(false)} className="w-full">Back to Site</LiquidButton>
              </div>
            )}
        </div>
      </section>

      {/* Cinematic Footer */}
      <CinematicFooter />
    </div>
  );
}

export default App;
