import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: 'teacher' | 'student';
}

export default function ProtectedRoute({ children, requireRole }: ProtectedRouteProps) {
  const { session, profile, loading, effectiveRole } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;

  if (requireRole && effectiveRole !== requireRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
