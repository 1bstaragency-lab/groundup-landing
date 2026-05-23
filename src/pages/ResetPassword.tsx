import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { LiquidButton } from '../components/ui/liquid-glass-button'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
    setTimeout(() => navigate('/dashboard/home'), 2500)
  }

  const fields: { val: string; set: (v: string) => void; ph: string }[] = [
    { val: password, set: setPassword, ph: "New password (min 6 characters)" },
    { val: confirm,  set: setConfirm,  ph: "Confirm new password" },
  ]

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {done ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <CheckCircle2 size={52} className="text-[#FFD700] mx-auto mb-6" />
            <h2 className="text-3xl font-black text-white tracking-tight mb-3">Password Updated</h2>
            <p className="text-white/40 text-sm">Taking you to your dashboard...</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.35em] mb-3">One last step</p>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">Set Your Password</h2>
            <p className="text-white/30 text-sm mb-8">Replace your temporary password with something you'll remember.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(({ val, set, ph }, i) => (
                <div key={i} className="relative group">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FFD700] transition-colors pointer-events-none" />
                  <input
                    type={showPw ? 'text' : 'password'} required placeholder={ph}
                    value={val} onChange={e => set(e.target.value)}
                    className="w-full bg-zinc-900/60 border border-white/[0.06] rounded-2xl py-3.5 pl-11 pr-12 text-white text-sm font-medium outline-none focus:border-[#FFD700]/35 focus:bg-zinc-900/90 transition-[border-color,background] placeholder:text-white/20"
                  />
                  {i === 0 && (
                    <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
              ))}
              {error && <p className="text-red-400 text-xs font-bold px-2">{error}</p>}
              <div className="pt-2">
                <LiquidButton type="submit" disabled={loading} className="w-full justify-center">
                  {loading ? <span className="flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Updating...</span> : 'Update Password'}
                </LiquidButton>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  )
}
