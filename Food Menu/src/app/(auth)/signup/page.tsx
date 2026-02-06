"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft } from "lucide-react";

interface User {
  id: number;
  username: string;
  role: string;
}

export default function SignupPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const fetchUsers = async () => {
    const response = await fetch('/api/users/eligible-staff');
    const data = await response.json();
    setUsers(data);
  };

  // Fetch eligible staff names
  useEffect(() => {
    fetchUsers();
  }, []);

  // Track password rules
  const [passwordValidity, setPasswordValidity] = useState({
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setPasswordValidity({
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&#]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!Object.values(passwordValidity).every(Boolean)) {
      setMessage("Password does not meet all security requirements.");
      return;
    }

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage("Signup successful! Redirecting...");
      const { token } = data;
      login(token);

      // Refetch users to remove the signed-up user from the list
      fetchUsers();
      setUsername('');
      setPassword('');

      const timer = setTimeout(() => {
        router.push("/dashboard/staff");
      }, 1500);

      return () => clearTimeout(timer);
    } else {
      setMessage(data.message || "An error occurred during signup.");
    }
  };

  // Subtle horizontal password rule (no borders)
  const renderRule = (isValid: boolean, text: string) => (
    <div
      className={`flex items-center gap-1 px-0.5 py-0 transition-all duration-300 transform ${
        isValid ? "opacity-100 translate-y-0" : "opacity-70 translate-y-0.5"
      }`}
    >
      <span className={`font-bold text-[10px] sm:text-[11px] ${isValid ? "text-green-600" : "text-red-600"}`}>
        {isValid ? "✅" : "❌"}
      </span>
      <span className={`text-[10px] sm:text-[11px] ${isValid ? "text-green-600" : "text-red-600"}`}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-3 sm:p-4 md:p-6">
      {/* Back button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 sm:top-6 left-3 sm:left-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-medium text-xs sm:text-sm"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        Back
      </button>

      {/* Signup card */}
      <div className="w-full max-w-md space-y-4 sm:space-y-6 bg-white rounded-lg sm:rounded-2xl shadow-md sm:shadow-lg p-5 sm:p-8">
        {/* Header */}
        <div className="text-center">
          <Image src="/favicon.png" alt="Logo" width={48} height={48} className="mx-auto sm:w-16 sm:h-16" />
          <h1 className="mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold text-gray-900">Staff Sign Up</h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600">Weekly Menu Selection</p>
        </div>

        {/* Form */}
        <form className="space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
          {/* Username select */}
          <div>
            <label htmlFor="username" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Full Name
            </label>
            <select
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="" disabled>Select your name</option>
              {users.map((user) => (
                <option key={user.id} value={user.username}>{user.username}</option>
              ))}
            </select>
          </div>

          {/* Password input */}
          <div>
            <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
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
              placeholder="Enter your password"
            />

            {/* Horizontal subtle rules */}
            <div className="mt-1 flex flex-wrap gap-1">
              {renderRule(passwordValidity.length, "8+ chars")}
              {renderRule(passwordValidity.lowercase, "lowercase")}
              {renderRule(passwordValidity.uppercase, "uppercase")}
              {renderRule(passwordValidity.number, "number")}
              {renderRule(passwordValidity.special, "special")}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full sm:w-auto sm:px-8 px-4 py-2 mt-4 sm:mt-6 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-md sm:rounded-lg transition-all text-xs sm:text-sm md:text-base"
          >
            Sign Up
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className={`mt-3 sm:mt-4 text-xs sm:text-sm text-center p-2 sm:p-3 rounded-md ${
            message.includes('successful') ? 'text-green-800 bg-green-50 border border-green-200' : 'text-red-800 bg-red-50 border border-red-200'
          }`}>
            {message}
          </p>
        )}

        {/* Login link */}
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