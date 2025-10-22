import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRole: UserRole;
}

export function RoleProtectedRoute({ children, allowedRole }: RoleProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (!roleLoading && role && role !== allowedRole) {
      // Redirect to appropriate dashboard based on role
      if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (role === 'patient') {
        navigate('/patient/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, authLoading, role, roleLoading, allowedRole, navigate]);

  if (authLoading || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
