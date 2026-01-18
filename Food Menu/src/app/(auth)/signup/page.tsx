"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import { ArrowLeft } from "lucide-react";

interface User {
  username: string;
  role: string;
}

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("Signup successful! Redirecting...");
      const { token } = data;
      login(token);
      
      // Only redirect after successful login
      const timer = setTimeout(() => {
        router.push("/dashboard/staff");
      }, 1500);
      
      // Cleanup timeout if component unmounts
      return () => clearTimeout(timer);
    } else {
      setMessage(data.message || "An error occurred during signup.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-3 sm:p-4 md:p-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 sm:top-6 left-3 sm:left-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-medium text-xs sm:text-sm"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        Back
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
            Staff Sign Up
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">
            Weekly Menu Selection
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

          <button
            type="submit"
            className="w-full sm:w-auto sm:px-8 px-4 py-2 mt-4 sm:mt-6 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-md sm:rounded-lg transition-all text-xs sm:text-sm md:text-base"
          >
            Sign Up
          </button>
        </form>
        {message && (
          <p
            className={`mt-3 sm:mt-4 text-xs sm:text-sm text-center p-2 sm:p-3 rounded-md ${
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
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}