/* eslint-disable react/no-unescaped-entities */

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminRedirectPage() {
  const { user, isLoading } = useAuth(); // Corrected `loading` to `isLoading`
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user && user.role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/admin/signup");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p>Loading...</p>
    </div>
  );
}