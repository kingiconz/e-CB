"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import NavHeader from '@/components/NavHeader';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated, redirect to admin login
    if (!user) {
      router.push('/admin/login');
      return;
    }

    // Authenticated but not an admin, redirect to admin login (not staff dashboard)
    if (user.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const isOverview = pathname === '/dashboard/admin/overview';
  const isMenu = pathname === '/dashboard/admin/menu';
  const isSelections = pathname === '/dashboard/admin/selections';
  const isManage = pathname === '/dashboard/admin';

  return (
    <div className="min-h-screen bg-gray-50 pt-16 sm:pt-20">
      <NavHeader />
      
      {/* Fixed Tabs */}
      <div className="sticky top-16 sm:top-20 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex overflow-x-auto">
              <Link href="/dashboard/admin/overview" className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${isOverview ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                Overview
              </Link>
              <Link href="/dashboard/admin/menu" className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${isMenu ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                Menu
              </Link>
              <Link href="/dashboard/admin/selections" className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${isSelections ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                Selections
              </Link>
              <Link href="/dashboard/admin" className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${isManage ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                Manage
              </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}