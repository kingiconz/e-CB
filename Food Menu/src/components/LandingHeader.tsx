"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

export default function LandingHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Hide header on admin dashboard
  if (pathname.startsWith("/dashboard/admin")) {
    return null;
  }

  return (
    <header
      className="
        fixed top-0 left-0 right-0 z-50
        bg-[#fdfdfd] border-b border-gray-200 shadow-sm
        h-16 sm:h-20
      "
    >
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/favicon.png"
              alt="Staff Meal Planner"
              width={50}
              height={50}
              className="w-10 h-10 sm:w-14 sm:h-14"
              priority
            />
            <span
              className="text-lg sm:text-2xl font-bold text-blue-500 whitespace-nowrap"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Staff Meal Planner
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="
                text-gray-800 border border-gray-300
                px-4 py-2 rounded text-sm font-medium
                hover:bg-gray-100 transition
              "
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="
                bg-blue-500 text-white
                px-4 py-2 rounded text-sm font-medium
                hover:bg-blue-600 transition
              "
            >
              Sign Up
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-800"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <nav
          className="
            md:hidden fixed right-3
            top-16 sm:top-20
            bg-white border border-gray-200
            rounded-lg shadow-lg
            p-3 flex flex-col gap-2
            z-40
          "
        >
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="
              text-center border border-gray-300
              px-4 py-2 rounded text-sm font-medium
              hover:bg-gray-50 transition
            "
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            onClick={() => setIsMenuOpen(false)}
            className="
              text-center bg-blue-500 text-white
              px-4 py-2 rounded text-sm font-medium
              hover:bg-blue-600 transition
            "
          >
            Sign Up
          </Link>
        </nav>
      )}
    </header>
  );
}
