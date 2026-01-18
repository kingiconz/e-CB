"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated, redirect to staff login
    if (!user) {
      router.push('/login');
      return;
    }

    // Authenticated but not staff, redirect to staff login (not admin dashboard)
    if (user.role !== 'staff') {
      router.push('/login');
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'staff') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
