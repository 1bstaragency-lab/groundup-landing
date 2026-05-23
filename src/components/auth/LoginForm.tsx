import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { LiquidButton } from '../ui/liquid-glass-button'

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToSignUp: () => void
}

export function LoginForm({ onSuccess, onSwitchToSignUp }: LoginFormProps) {
  const { signIn, resendVerificationEmail } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsVerify, setNeedsVerify] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  async function handleResend() {
    if (!formData.email || resending) return
    setResending(true)
    const { error: err } = await resendVerificationEmail(formData.email)
    setResending(false)
    if (!err) setResent(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError, mustChangePassword } = await signIn({
      email: formData.email,
      password: formData.password,
    })

    setLoading(false)

    if (signInError) {
      const msg = signInError.toLowerCase()
      if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
        setError('Please confirm your email before signing in. Check your inbox.')
        setNeedsVerify(true)
      } else if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('password')) {
        setError('Invalid email or password.')
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('load')) {
        setError('Connection error — Supabase may not be configured on this deployment.')
      } else {
        setError(signInError)
      }
      return
    }

    // Account created via iMessage onboarding — force password update
    if (mustChangePassword) {
      navigate('/reset-password')
      return
    }

    onSuccess()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      {/* Header */}
      <div className="mb-10">
        <img
          src="/gu-icon.png"
          alt="GrounduP"
          className="h-12 w-auto mb-8 lg:hidden"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.35em] mb-3">
          Welcome back
        </p>
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-2">
          Sign In
        </h2>
        <p className="text-white/30 text-sm font-medium">
          Your Artist OS is waiting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="relative group">
          <Mail
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FFD700] transition-colors"
          />
          <input
            type="email"
            placeholder="Email address"
            required
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="auth-input pl-11"
          />
        </div>

        {/* Password */}
        <div className="relative group">
          <Lock
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FFD700] transition-colors"
          />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            required
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="auth-input pl-11 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>

        {/* Forgot password */}
        <div className="flex justify-end -mt-2">
          <a href="/forgot-password" className="text-[10px] font-black uppercase tracking-widest text-white/25 hover:text-[#FFD700] transition-colors">
            Forgot password?
          </a>
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20"
          >
            <p className="text-red-400 text-xs font-bold">{error}</p>
            {needsVerify && !resent && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-left text-[10px] font-black uppercase tracking-widest text-[#FFD700] hover:text-[#FFD700]/80 transition-colors disabled:opacity-40"
              >
                {resending ? 'Sending…' : '→ Resend verification email'}
              </button>
            )}
            {resent && (
              <p className="text-green-400 text-[10px] font-black uppercase tracking-widest">
                ✓ Verification email sent — check your inbox
              </p>
            )}
          </motion.div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <LiquidButton type="submit" disabled={loading} className="w-full justify-center">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </LiquidButton>
        </div>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Switch to sign up */}
      <p className="text-center text-white/30 text-[11px] font-bold">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToSignUp}
          className="text-[#FFD700] hover:text-[#FFD700]/80 font-black uppercase tracking-widest text-[10px] transition-colors"
        >
          Create one
        </button>
      </p>
    </motion.div>
  )
}
