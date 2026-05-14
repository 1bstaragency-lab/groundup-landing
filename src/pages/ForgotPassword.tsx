import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { StatisticsCard } from '../components/ui/statistics-card'
import { LiquidButton } from '../components/ui/liquid-glass-button'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left — stats */}
      <div className="hidden lg:flex lg:w-1/2 h-screen items-center justify-center p-12 border-r border-white/5 bg-zinc-950">
        <StatisticsCard />
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <a href="/login" className="inline-flex items-center gap-2 text-white/30 hover:text-white text-[11px] font-black uppercase tracking-widest mb-10 transition-colors">
            <ArrowLeft size={12} /> Back to Sign In
          </a>

          {sent ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <CheckCircle2 size={48} className="text-[#FFD700] mx-auto mb-6" />
              <h2 className="text-3xl font-black text-white tracking-tight mb-3">Check Your Inbox</h2>
              <p className="text-white/40 text-sm mb-8">We sent a password reset link to <span className="text-white/70 font-bold">{email}</span>. Click the link to set a new password.</p>
              <p className="text-white/20 text-xs">Didn't get it? Check your spam folder or <button onClick={() => setSent(false)} className="text-[#FFD700] font-bold underline">try again</button>.</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.35em] mb-3">Account Recovery</p>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Reset Password</h2>
              <p className="text-white/30 text-sm mb-8">Enter your email and we'll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FFD700] transition-colors pointer-events-none" />
                  <input
                    type="email" required placeholder="Email address"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-2xl py-3.5 pl-11 pr-5 text-white text-sm font-medium outline-none focus:border-[#FFD700]/35 focus:bg-zinc-900/90 transition-[border-color,background] placeholder:text-white/20"
                  />
                </div>
                {error && <p className="text-red-400 text-xs font-bold px-2">{error}</p>}
                <div className="pt-2">
                  <LiquidButton type="submit" disabled={loading} className="w-full justify-center">
                    {loading ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Sending...</span> : 'Send Reset Link'}
                  </LiquidButton>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
