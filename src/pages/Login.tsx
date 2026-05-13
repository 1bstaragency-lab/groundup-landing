import { LoginForm } from '../components/auth/LoginForm';

interface LoginPageProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
}

export function LoginPage({ onSuccess, onSwitchToSignUp }: LoginPageProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)] pointer-events-none" />
      <div className="relative z-10 w-full flex justify-center">
        <LoginForm onSuccess={onSuccess} onSwitchToSignUp={onSwitchToSignUp} />
      </div>
    </div>
  );
}
