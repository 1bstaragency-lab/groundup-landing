import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LiquidButton } from '../ui/liquid-glass-button';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}

export function LoginForm({ onSuccess, onSwitchToSignUp }: LoginFormProps) {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await signIn({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (signInError) {
      const msg = signInError.toLowerCase();
      if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
        setError('Please confirm your email before signing in. Check your inbox.');
      } else if (msg.includes('invalid') || msg.includes('credentials') || msg.includes('password')) {
        setError('Invalid email or password.');
      } else if (msg.includes('fetch') || msg.includes('network') || msg.includes('load')) {
        setError('Connection error — Supabase may not be configured on this deployment.');
      } else {
        setError(signInError);
      }
      return;
    }

    onSuccess();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-10">
        <img src="/gu-logo.png" alt="GrounduP" className="h-14 w-auto mx-auto mb-6" />
        <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
          Welcome Back
        </h2>
        <p className="text-white/40 font-medium text-sm">
          Your Artist OS is waiting.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          required
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          className="wait-input"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            required
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            className="wait-input pr-14"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-xs font-bold uppercase tracking-widest text-center py-2"
          >
            {error}
          </motion.p>
        )}

        <div className="pt-4">
          <LiquidButton type="submit" disabled={loading} className="w-full">
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 size={14} className="animate-spin" /> Signing In...
              </span>
            ) : (
              'Sign In'
            )}
          </LiquidButton>
        </div>
      </form>

      <p className="text-center text-white/30 text-[10px] font-black uppercase tracking-widest mt-8">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToSignUp}
          className="text-[#FFD700] hover:underline"
        >
          Sign Up
        </button>
      </p>
    </motion.div>
  );
}
