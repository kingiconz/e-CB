"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

const NavHeader = () => {
  const auth = useAuth();
  const router = useRouter();

  if (!auth || !auth.user) {
    return null;
  }

  const { user } = auth;

  const handleLogout = () => {
    auth.logout();
    window.location.href = "/";
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#fdfdfd] border-b border-gray-200 shadow-sm z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button 
            onClick={handleLogoClick}
            className="flex items-center space-x-2 transition cursor-pointer focus:outline-none"
          >
            <Image
              src="/favicon.png"
              alt="FoodHunt logo"
              width={70}
              height={70}
            />
            <span className="text-2xl font-bold text-blue-500" style={{ fontFamily: "var(--font-montserrat)" }}>
              Meal Planner
            </span>
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">{user.username}</span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavHeader;