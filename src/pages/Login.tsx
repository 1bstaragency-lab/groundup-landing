import { LoginForm } from '../components/auth/LoginForm'
import { AuthOrbitPanel } from '../components/auth/AuthOrbitPanel'

interface LoginPageProps {
  onSuccess: () => void
  onSwitchToSignUp: () => void
}

export function LoginPage({ onSuccess, onSwitchToSignUp }: LoginPageProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-black flex">
      {/* Left — orbiting platforms (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] h-full border-r border-white/5">
        <AuthOrbitPanel />
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <div className="absolute inset-0 lg:hidden bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10 w-full max-w-md">
          <LoginForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />
        </div>
      </div>
    </div>
  )
}
