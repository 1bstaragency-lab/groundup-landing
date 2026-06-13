import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight, Loader2, Zap, Users, TrendingUp, Music, Smartphone, Star } from 'lucide-react'
import { MeshGradient } from '@paper-design/shaders-react'
import { useIsMobile } from '../hooks/useIsMobile'

const PLATFORMS = ['TikTok', 'Instagram', 'YouTube', 'X / Twitter', 'Other']
const FOLLOWER_RANGES = ['Under 10K', '10K – 50K', '50K – 250K', '250K – 1M', '1M+']

const CONTENT_IDEAS = [
  {
    icon: <Smartphone size={22} />,
    title: 'App Walkthroughs',
    desc: 'Show your audience how you use GrounduP to plan releases, pitch playlists, and run outreach — real workflow, real results.',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'Before & After',
    desc: 'Document your journey — where you were before GrounduP vs. your streams, placements, and growth after 30 days.',
  },
  {
    icon: <Music size={22} />,
    title: 'Tips for Artists',
    desc: 'Create educational content around music marketing with GrounduP as your tool — "how I got 10 playlist placements in 2 weeks."',
  },
]

const BENEFITS = [
  { icon: <Zap size={18} />, label: 'Your Unique Ref Code', desc: 'Every user you bring in is tracked to you. Forever.' },
  { icon: <Star size={18} />, label: 'Creator Perks', desc: 'Early access to new features and a premium plan on us.' },
  { icon: <Users size={18} />, label: 'Join the Inner Circle', desc: 'Monthly calls, direct line to the founders, and a say in what we build.' },
]

type FormState = { name: string; email: string; platform: string; followers: string; handle: string; notes: string }

export function CreatorOnboarding() {
  const isMobile = useIsMobile()
  const [form, setForm] = useState<FormState>({ name: '', email: '', platform: '', followers: '', handle: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [refCode, setRefCode] = useState<string | null>(null)

  function set(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.platform) {
      setError('Please fill in your name, email, and platform.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/.netlify/functions/creator-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.error || 'Something went wrong. Please try again.'); setSubmitting(false); return }
      setRefCode(json.ref_code)
    } catch {
      setError('Network error. Check your connection and try again.')
    }
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden">

      {/* Hero background — matches main landing page exactly */}
      <div className="fixed inset-0 pointer-events-none">
        {isMobile ? (
          <>
            <div className="absolute inset-0 w-full h-full"
              style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(184,134,11,0.18) 0%, rgba(255,215,0,0.07) 40%, transparent 70%)' }} />
            <div className="absolute inset-0 w-full h-full opacity-30"
              style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(255,215,0,0.12) 0%, transparent 65%)' }} />
          </>
        ) : (
          <>
            <MeshGradient
              className="absolute inset-0 w-full h-full"
              colors={['#000000', '#FFD700', '#B8860B', '#1A1A1A', '#000000']}
              speed={0.3}
            />
            <MeshGradient
              className="absolute inset-0 w-full h-full opacity-30"
              colors={['#000000', '#ffffff', '#FFD700', '#000000']}
              speed={0.2}
            />
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <a href="/" className="flex items-center gap-2.5 group">
          <img src="/logo.webp" alt="GrounduP" className="h-10 opacity-80 group-hover:opacity-100 transition-opacity" />
        </a>
        <a href="/" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors">
          groundupapp.com ↗
        </a>
      </nav>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center px-6 pt-14 pb-20 max-w-3xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FFD700]/20 bg-[#FFD700]/8 mb-8">
          <div className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" />
          <span className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest">Creator Program — Now Open</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-black uppercase tracking-tighter leading-[0.92] mb-6">
          Create Content.<br />
          <span className="text-[#FFD700]">Grow Artists.</span>
        </h1>

        <p className="text-white/50 text-lg font-medium leading-relaxed max-w-xl mx-auto mb-10">
          Partner with GrounduP and get rewarded for bringing independent artists onto the platform that's changing how music careers are built.
        </p>

        <a
          href="#apply"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-yellow-300 transition-colors"
        >
          Apply Now <ArrowRight size={14} />
        </a>
      </motion.section>

      {/* What is GrounduP */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 py-16 max-w-5xl mx-auto"
      >
        <div className="grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-4">What We Built</p>
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight mb-5">
              The Operating System for Independent Artists
            </h2>
            <p className="text-white/50 text-base leading-relaxed mb-4">
              GrounduP is an AI-powered platform that helps indie artists run their careers like a label — release planning, playlist pitching, curator outreach, analytics, and more. All in one place.
            </p>
            <p className="text-white/50 text-base leading-relaxed">
              We're building the tool we wish existed when we were grinding. Artists who use GrounduP get more placements, more streams, and more control over their career — without needing a manager or a label deal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { value: '10K+', label: 'Artists on waitlist' },
              { value: '50+', label: 'Features shipped' },
              { value: '3', label: 'Plans — Starter to Label' },
              { value: '∞', label: 'Upside for creators' },
            ].map(s => (
              <div key={s.label} className="bg-white/4 border border-white/8 rounded-2xl p-5 backdrop-blur-sm">
                <div className="text-3xl font-black text-[#FFD700] tracking-tighter mb-1">{s.value}</div>
                <div className="text-white/40 text-xs font-bold uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Content brief */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 py-16 max-w-5xl mx-auto"
      >
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-4 text-center">What We're Looking For</p>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-center mb-12">Content That Converts</h2>

        <div className="grid sm:grid-cols-3 gap-4">
          {CONTENT_IDEAS.map(idea => (
            <div key={idea.title} className="bg-white/4 border border-white/8 rounded-2xl p-6 hover:border-[#FFD700]/30 transition-colors backdrop-blur-sm">
              <div className="w-10 h-10 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-xl flex items-center justify-center text-[#FFD700] mb-5">
                {idea.icon}
              </div>
              <h3 className="font-black text-base uppercase tracking-tight mb-3">{idea.title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{idea.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#FFD700]/6 border border-[#FFD700]/15 rounded-2xl p-6 backdrop-blur-sm">
          <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-2">Your CTA</p>
          <p className="text-white/70 text-sm leading-relaxed">
            Every piece of content should drive viewers to <strong className="text-white">groundupapp.com</strong> or the iOS app. Use your unique ref link so every sign-up is tracked back to you.
          </p>
        </div>
      </motion.section>

      {/* Benefits */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 py-16 max-w-5xl mx-auto"
      >
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-4 text-center">What You Get</p>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-center mb-12">The Deal</h2>

        <div className="grid sm:grid-cols-3 gap-4">
          {BENEFITS.map(b => (
            <div key={b.label} className="flex flex-col items-center text-center bg-white/4 border border-white/8 rounded-2xl p-8 hover:border-[#FFD700]/30 transition-colors backdrop-blur-sm">
              <div className="w-12 h-12 bg-[#FFD700]/10 border border-[#FFD700]/20 rounded-2xl flex items-center justify-center text-[#FFD700] mb-5">
                {b.icon}
              </div>
              <h3 className="font-black text-sm uppercase tracking-tight mb-2">{b.label}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Application form */}
      <motion.section
        id="apply"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative z-10 px-6 py-20 max-w-xl mx-auto"
      >
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-4 text-center">Apply</p>
        <h2 className="text-3xl font-black uppercase tracking-tighter text-center mb-3">Join the Creator Program</h2>
        <p className="text-white/40 text-sm text-center mb-10">We review every application and respond within 48 hours.</p>

        <AnimatePresence mode="wait">
          {refCode ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 bg-[#FFD700]/15 border border-[#FFD700]/30 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={36} className="text-[#FFD700]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-3">Application Received!</h3>
              <p className="text-white/40 text-sm mb-8">
                We'll review your application and reach out within 48 hours. Here's your referral code for when you're approved:
              </p>
              <div className="bg-white/4 border border-[#FFD700]/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
                <div className="text-[#FFD700] text-[10px] font-black uppercase tracking-widest mb-2">Your Ref Code</div>
                <div className="font-mono text-white text-2xl font-black tracking-wider">{refCode}</div>
              </div>
              <p className="text-white/30 text-xs">Screenshot this — you'll need it when approved to activate your creator link.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-[#FFD700]/40 transition-colors backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-[#FFD700]/40 transition-colors backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Primary Platform *</label>
                <select
                  value={form.platform}
                  onChange={e => set('platform', e.target.value)}
                  required
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm font-medium focus:outline-none focus:border-[#FFD700]/40 transition-colors"
                >
                  <option value="" disabled className="bg-black">Select platform…</option>
                  {PLATFORMS.map(p => <option key={p} value={p} className="bg-black">{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Follower Count</label>
                <select
                  value={form.followers}
                  onChange={e => set('followers', e.target.value)}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm font-medium focus:outline-none focus:border-[#FFD700]/40 transition-colors"
                >
                  <option value="" className="bg-black">Select range…</option>
                  {FOLLOWER_RANGES.map(r => <option key={r} value={r} className="bg-black">{r}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">Social Handle</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm font-bold">@</span>
                  <input
                    type="text"
                    value={form.handle}
                    onChange={e => set('handle', e.target.value)}
                    placeholder="yourhandle"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-[#FFD700]/40 transition-colors backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/30 text-[10px] font-black uppercase tracking-widest mb-2">
                  Why do you want to partner? <span className="normal-case text-white/20">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Tell us about your audience and why you're a good fit…"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-medium placeholder-white/20 focus:outline-none focus:border-[#FFD700]/40 transition-colors resize-none backdrop-blur-sm"
                />
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs font-bold uppercase tracking-widest">
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#FFD700] text-black font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-yellow-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {submitting
                  ? <><Loader2 size={14} className="animate-spin" /> Submitting…</>
                  : <>Submit Application <ArrowRight size={14} /></>}
              </button>

              <p className="text-white/20 text-xs text-center pt-2">
                By applying you agree to create authentic content about GrounduP and comply with platform guidelines.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/6 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <img src="/logo.webp" alt="GrounduP" className="h-7 opacity-40" />
        </div>
        <p className="text-white/20 text-xs font-medium">
          © {new Date().getFullYear()} GrounduP ·{' '}
          <a href="/privacy" className="hover:text-white/40 transition-colors">Privacy Policy</a>
        </p>
      </footer>
    </div>
  )
}
