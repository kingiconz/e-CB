"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      const storedRole = localStorage.getItem('role');
      setUsername(storedUsername);
      setRole(storedRole);
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUsername(null);
    setRole(null);
    router.push('/');
  };

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isStaffDashboard = pathname === '/dashboard/staff';
  const isAdminDashboard = pathname.startsWith('/dashboard/admin');

  if (isAdminDashboard) {
    return null;
  }

  if (isStaffDashboard && role === 'staff') {
    return (
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <Image
                  src="/favicon.png"
                  alt="Favicon"
                  width={40}
                  height={40}
                />
                <span className="text-2xl font-bold text-blue-500">
                  e-Crime Menu
                </span>
              </Link>
            </div>
           
            <div className="flex items-center space-x-4">
              {username && (
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-500">{username}</div>
                  <div className="text-xs text-gray-500">Staff Member</div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H9m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h6a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-[#fdfdfd]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/favicon.png"
                alt="Favicon"
                width={40}
                height={40}
              />
              <span className="text-2xl font-bold text-blue-500 italic">
                e-Crime Menu
              </span>
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            {username ? (
              <>
                <span className="text-gray-800 font-medium">Welcome, {username} ({role})</span>
                <button
                  onClick={handleLogout}
                  className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              !isAuthPage && (
                <>
                  <Link
                    href="/login"
                    className="text-gray-800 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium border border-gray-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}