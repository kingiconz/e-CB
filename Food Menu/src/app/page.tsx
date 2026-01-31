/* eslint-disable react/no-unescaped-entities */
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const images = ['/food1.png', '/food2.png', '/food3.png', '/food4.png'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [images.length]);

  const handleStartSelecting = () => {
    if (user?.role === 'staff') {
      router.push('/dashboard/staff');
    } else {
      router.push('/signup');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 -z-30">
        <Image
          src="/food-pattern.jpg"
          alt="Food pattern background"
          fill
          className="object-cover opacity-[0.06]"
          priority
        />
      </div>

      {/* Decorative blobs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute top-1/3 -right-48 w-[700px] h-[700px] rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="absolute bottom-[-300px] left-1/4 w-[800px] h-[800px] rounded-full bg-sky-200/30 blur-3xl" />

      {/* ================= HEADER ================= */}
      <header className="relative z-20 py-5 px-6 flex justify-between items-center backdrop-blur-md bg-white/60">
        <div className="flex items-center gap-2">
          <Image src="/favicon.png" alt="Logo" width={50} height={50} />
          <span
            className="text-lg sm:text-2xl font-bold text-blue-500 whitespace-nowrap"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            Staff Meal Planner
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex gap-4">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100 transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white shadow-md transition"
          >
            Sign Up
          </Link>
        </nav>

        {/* Hamburger for mobile */}
        <button
          className="sm:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden absolute top-20 right-6 bg-white/90 backdrop-blur-md rounded-lg shadow-md flex flex-col gap-3 p-4 z-30">
          <Link href="/login" className="hover:text-blue-500 transition">Sign In</Link>
          <Link href="/signup" className="hover:text-blue-500 transition">Sign Up</Link>
        </div>
      )}

      {/* ================= MAIN ================= */}
      <main className="relative z-10 flex-1 flex items-center px-4 sm:px-6 lg:px-12">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row-reverse items-center justify-between gap-12">

          {/* ================= SLIDESHOW ================= */}
          <div className="w-full lg:w-1/2 flex justify-center relative">
            {/* Ambient glow */}
            <div className="absolute -right-40 top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-100/60 blur-3xl animate-pulse" />

            {/* Gradient ring */}
            <div className="relative rounded-full p-[6px] bg-gradient-to-tr from-blue-500 via-blue-300 to-indigo-400 shadow-[0_30px_80px_rgba(59,130,246,0.35)]">

              {/* Glass shell */}
              <div className="rounded-full bg-white/60 backdrop-blur-xl p-2 hover:scale-105 transition-transform duration-500">

                {/* ROUND SLIDESHOW */}
                <div className="relative w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full overflow-hidden">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                        index === currentImage
                          ? 'opacity-100 scale-105 z-10'
                          : 'opacity-0 scale-95 z-0'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`Food ${index + 1}`}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  ))}

                  {/* Inner shadow */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              </div>
            </div>

            {/* Slide indicators */}
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 flex gap-3">
              {images.map((_, index) => (
                <span
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`h-2.5 rounded-full cursor-pointer transition-all ${
                    index === currentImage
                      ? 'w-10 bg-blue-500 shadow-md'
                      : 'w-2.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ================= TEXT ================= */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Freshness <br />
              <span className="text-blue-500 italic">in every bite</span>
            </h1>

            <p className="mt-5 text-lg text-gray-700 max-w-lg mx-auto lg:mx-0">
              Healthy sashimi tuna bites prepared with premium ingredients — only 110 calories and 13g of protein per serving.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={handleStartSelecting}
                className="bg-blue-500 hover:bg-blue-600 text-white px-7 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition"
              >
                Start Selecting →
              </button>

              <Link
                href="/menu"
                className="bg-white/80 backdrop-blur hover:bg-white px-7 py-3 rounded-xl font-semibold text-gray-800 shadow-md hover:shadow-lg transition"
              >
                View This Week's Menu
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-5 justify-center lg:justify-start">
              {[
                ['500+', 'Meals Served Daily'],
                ['Fresh', 'Local Ingredients'],
                ['4.9/5', 'Staff Satisfaction'],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="text-center bg-white/70 backdrop-blur p-4 rounded-xl shadow-sm hover:shadow-md transition"
                >
                  <p className="text-3xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-600">{label}</p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs italic text-red-400 max-w-lg mx-auto lg:mx-0">
              Disclaimer: Menu images are for illustrative purposes only. Actual food presentation may vary.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
