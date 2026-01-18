"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LandingHeader from "@/components/LandingHeader";

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  day: string;
}

interface Menu {
  id: number;
  week_start: string;
  deadline: string;
  is_active: boolean;
  created_at: string;
}

export default function MenuPage() {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchActiveMenu();
  }, []);

  const fetchActiveMenu = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/menus?active=true");
      if (!res.ok) throw new Error("Failed to fetch active menu");
      const menus = await res.json();
      
      if (menus.length === 0) {
        setMenu(null);
        setError("No active menu available this week");
        return;
      }

      const activeMenu = menus[0];
      setMenu(activeMenu);

      // Fetch menu items for this menu
      const itemsRes = await fetch(`/api/menu-items?menuId=${activeMenu.id}`);
      if (itemsRes.ok) {
        const items = await itemsRes.json();
        const grouped = items.reduce((acc: Record<string, MenuItem[]>, item: MenuItem) => {
          acc[item.day] = acc[item.day] || [];
          acc[item.day].push(item);
          return acc;
        }, {});
        setMenuItems(grouped);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load menu");
      setMenu(null);
    } finally {
      setIsLoading(false);
    }
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Group items into meal pairings (main course + dessert)
  const getPairedMeals = (dayItems: MenuItem[]) => {
    const pairs: { mainCourse: MenuItem; dessert?: MenuItem }[] = [];
    for (let i = 0; i < dayItems.length; i += 2) {
      pairs.push({
        mainCourse: dayItems[i],
        dessert: dayItems[i + 1]
      });
    }
    return pairs;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-2 border-gray-200 border-t-gray-600 mb-2 sm:mb-3"></div>
            <p className="text-gray-600 text-xs sm:text-sm">Loading menu...</p>
          </div>
        </div>
      );
    }

    if (error || !menu) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-12 text-center">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Menu Available</h2>
          <p className="text-gray-600 text-xs sm:text-sm">No active menu available this week. Check back later.</p>
        </div>
      );
    }

    return (
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">This Week's Menu</h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">
              Week of {new Date(menu.week_start).toLocaleDateString({"'en-US'"}, { month: {"'short'"}, day: {"'numeric'"} })}
            </p>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors text-xs sm:text-sm w-full sm:w-auto"
          >
            Make Selections
          </button>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-4">
          {days.map(day => (
            <div key={day} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
              {/* Day Header */}
              <div className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">{day}</h3>
              </div>

              {/* Food Items */}
              <div className="p-2 sm:p-4 space-y-1 sm:space-y-2 flex-1">
                {menuItems[day] && menuItems[day].length > 0 ? (
                  getPairedMeals(menuItems[day]).map((meal, mealIndex) => (
                    <div key={`${meal.mainCourse.id}-${meal.dessert?.id || 'none'}`} className="bg-gray-50 rounded p-1.5 sm:p-2 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all">
                      <div className="flex items-start gap-2">
                        <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-xs font-bold flex-shrink-0 mt-0.5">
                          {mealIndex + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="inline-block mb-1 px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                            Main Course
                          </span>
                          <p className="font-medium text-gray-900 text-xs sm:text-sm">{meal.mainCourse.name}</p>
                          {meal.mainCourse.description && (
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{meal.mainCourse.description}</p>
                          )}
                          
                          {meal.dessert && (
                            <>
                              <span className="inline-block mb-1 px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700 mt-2">
                                Dessert
                              </span>
                              <p className="font-medium text-gray-900 text-xs sm:text-sm">{meal.dessert.name}</p>
                              {meal.dessert.description && (
                                <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{meal.dessert.description}</p>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-gray-50 rounded p-2 sm:p-3 text-center border border-dashed border-gray-300">
                    <p className="text-xs text-gray-500">No items</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-6 sm:mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-8 text-center">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Ready to Make Selections?</h2>
          <p className="text-gray-600 text-xs sm:text-sm mb-4">Sign in to select your meals for the week.</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded font-medium hover:bg-blue-700 transition-colors text-xs sm:text-sm w-full sm:w-auto"
          >
            Make Selections
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white pt-16 sm:pt-20">
      <LandingHeader />
      <main className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}