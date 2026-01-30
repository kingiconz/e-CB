/* eslint-disable react/no-unescaped-entities */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import LandingHeader from '@/components/LandingHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = ['/food1.jpg', '/food2.jpg', '/food3.jpg', '/food4.jpg', '/food5.jpg'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  const handleStartSelecting = () => {
    console.log('User object:', user);
    if (user) {
      console.log('User role:', user.role);
      if (user.role === 'staff') {
        router.push('/dashboard/staff');
      } else {
        router.push('/login');
      }
    } else {
      console.log('No user found, redirecting to login');
      router.push('/signup');
    }
  };

  return (
    <div className="bg-[#fdfdfd] min-h-screen">
      <LandingHeader />
      <main className="w-full px-3 sm:px-4 md:px-6 lg:px-8 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row-reverse items-center justify-between gap-8 md:gap-12 py-8 md:py-12">
            <div className="w-full lg:w-1/2">
              <div className="relative w-full h-60 sm:h-80 md:h-86 lg:h-96 rounded-lg overflow-hidden shadow-lg group">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Food slideshow ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 ease-in-out group-hover:scale-105"
                    />
                  </div>
                ))}
                
                {/* Navigation dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-white w-6'
                          : 'bg-gray-400 hover:bg-gray-300'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/2 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-800 leading-tight">
                Daily Dining,
                <br />
                <span className="text-blue-500 italic">Elevated.</span>
              </h1>
              <p className="mt-3 md:mt-4 text-sm sm:text-base md:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                Experience our curated weekly menu designed for the modern
                workplace.
              </p>
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 md:gap-4 w-full sm:w-auto">
                <button
                  onClick={handleStartSelecting}
                  className="bg-blue-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-md font-semibold hover:bg-blue-600 transition w-full sm:w-auto text-sm md:text-base"
                >
                  Start Selecting &rarr;
                </button>
                <Link
                  href="/menu"
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-md text-sm md:text-base w-full sm:w-auto text-center"
                >
                  {`View This Week's Menu`}
                </Link>
              </div>
              <div className="mt-8 md:mt-12 flex justify-center lg:justify-start gap-4 sm:gap-6 md:gap-8 text-gray-800 flex-wrap">
                <div className="text-center">
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">500+</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Meals Served Daily</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">Fresh</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Local Ingredients</p>
                </div>
                <div className="text-center">
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold">4.9/5</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Staff Satisfaction</p>
                </div>
              </div>
              <div className="mt-4 text-center lg:text-left">
                <p className="text-red-600 text-xs italic">
                  Disclaimer: All food images shown do not depict the exact food to be served.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}