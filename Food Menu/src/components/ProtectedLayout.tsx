"use client";

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedLayoutProps {
  children: ReactNode;
  requiredRole: 'admin' | 'staff';
}

export default function ProtectedLayout({ children, requiredRole }: ProtectedLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      // Not authenticated, redirect to appropriate login
      if (requiredRole === 'admin') {
        router.push('/auth/admin/login');
      } else {
        router.push('/auth/login');
      }
      return;
    }

    if (user.role !== requiredRole) {
      // Authenticated but wrong role, redirect to appropriate dashboard or login
      if (user.role === 'admin') {
        router.push('/dashboard/admin');
      } else {
        router.push('/dashboard/staff');
      }
      return;
    }
  }, [user, isLoading, router, requiredRole]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Show nothing while redirecting unauthenticated users
  if (!user || user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
