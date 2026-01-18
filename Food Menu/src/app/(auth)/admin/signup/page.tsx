"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export default function AdminSignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');

    const response = await fetch('/api/auth/admin/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Admin signup successful! Redirecting...');
      const { token } = data;
      login(token);
      
      setTimeout(() => {
        router.push('/dashboard/admin');
      }, 2000);
    } else {
      setMessage(data.message || 'An error occurred during admin signup.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-4">
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 sm:top-6 left-3 sm:left-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-medium text-xs sm:text-sm"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        Back to Home
      </button>

      <div className="w-full max-w-md space-y-4 sm:space-y-6 bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-5 sm:p-8">
        <div className="text-center">
          <Image
            src="/favicon.png"
            alt="Logo"
            width={48}
            height={48}
            className="mx-auto sm:w-16 sm:h-16"
          />
          <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold text-gray-900">
            Admin Sign Up
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
            Weekly Menu Selection Platform
          </p>
        </div>
        <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto sm:px-8 px-4 py-2 mt-6 text-white font-semibold bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-xs sm:text-sm md:text-base"
          >
            Sign Up
          </button>
        </form>
        {message && (
          <p
            className={`mt-3 sm:mt-4 text-xs sm:text-sm text-center p-2 sm:p-3 rounded-md sm:rounded-lg ${
              message.includes('successful')
                ? 'text-green-800 bg-green-50 border border-green-200'
                : 'text-red-800 bg-red-50 border border-red-200'
            }`}
          >
            {message}
          </p>
        )}
        <div className="text-center text-xs sm:text-sm text-gray-600">
          <p>
            Already have an admin account?{' '}
            <Link href=&quot;/admin/login&quot; className=&quot;font-semibold text-blue-600 hover:text-blue-700&quot;>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}