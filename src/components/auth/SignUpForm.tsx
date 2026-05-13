import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Mail, Lock, Mic2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { LiquidButton } from '../ui/liquid-glass-button'

interface SignUpFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export function SignUpForm({ onSuccess, onSwitchToLogin }: SignUpFormProps) {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({ artistName: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    const { error: signUpError } = await signUp({
      email: formData.email,
      password: formData.password,
      artistName: formData.artistName,
    })
    setLoading(false)

    if (signUpError) {
      setError(signUpError)
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
          src="/gu-logo.png"
          alt="GrounduP"
          className="h-12 w-auto mb-8 lg:hidden"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <p className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.35em] mb-3">
          Get started
        </p>
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none mb-2">
          Create Account
        </h2>
        <p className="text-white/30 text-sm font-medium">
          Join the next generation of artist OS.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Artist Name */}
        <div className="relative group">
          <Mic2
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FFD700] transition-colors"
          />
          <input
            type="text"
            placeholder="Artist name"
            required
            value={formData.artistName}
            onChange={e => setFormData({ ...formData, artistName: e.target.value })}
            className="auth-input pl-11"
          />
        </div>

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
            placeholder="Password (min 6 characters)"
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

        {/* Confirm Password */}
        <div className="relative group">
          <Lock
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#FFD700] transition-colors"
          />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirm password"
            required
            value={formData.confirmPassword}
            onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="auth-input pl-11"
          />
        </div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/20"
          >
            <p className="text-red-400 text-xs font-bold">{error}</p>
          </motion.div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <LiquidButton type="submit" disabled={loading} className="w-full justify-center">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Creating Account...
              </span>
            ) : (
              'Create Account'
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

      {/* Switch to login */}
      <p className="text-center text-white/30 text-[11px] font-bold">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-[#FFD700] hover:text-[#FFD700]/80 font-black uppercase tracking-widest text-[10px] transition-colors"
        >
          Sign In
        </button>
      </p>
    </motion.div>
  )
}
