"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';

export default function LandingHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (pathname.startsWith('/dashboard/admin')) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#fdfdfd] border-b border-gray-200 shadow-sm z-50">
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
              <Image
                src="/favicon.png"
                alt="Favicon"
                width={50}
                height={50}
                className="sm:w-[70px] sm:h-[70px]"
              />
              <span className="text-lg sm:text-2xl font-bold text-blue-500" style={{ fontFamily: "var(--font-montserrat)" }}>
              Meal Planner
              </span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-2 md:space-x-4">
            <Link
              href="/login"
              className="text-gray-800 hover:bg-gray-100 px-3 md:px-4 py-2 rounded text-xs md:text-sm font-medium border border-gray-300"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-white bg-blue-500 hover:bg-blue-600 px-3 md:px-4 py-2 rounded text-xs md:text-sm font-medium"
            >
              Sign Up
            </Link>
          </nav>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-800 p-2">
              {isMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <nav className="md:hidden fixed top-16 right-3 flex flex-col gap-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-40">
            <Link
              href="/login"
              className="text-center text-gray-700 hover:text-gray-900 hover:bg-gray-50 px-4 py-2 rounded text-sm font-medium border border-gray-300 transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-center text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap"
            >
              Sign Up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}