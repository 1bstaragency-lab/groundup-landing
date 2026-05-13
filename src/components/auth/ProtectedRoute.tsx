import type { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 bg-[#FFD700] rounded-2xl animate-pulse" />
      </div>
    );
  }

  return user ? <>{children}</> : <>{fallback}</>;
}
