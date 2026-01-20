/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NavHeader from "@/components/NavHeader";
import { Menu, MenuItem, FoodSelection, Day } from "@/lib/data";
import { CheckCircle2, Circle } from "lucide-react";

interface PairedMeal {
  mealId: number;
  mainCourse: MenuItem;
  dessert: MenuItem | null;
}

const daysOfWeek: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const DaySelectionCard = ({
  day,
  foodName,
  isSelected,
}: {
  day: Day;
  foodName?: string;
  isSelected: boolean;
}) => {
  return (
    <div
      className={`p-3 rounded border transition-all ${
        isSelected ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-medium text-gray-900 text-sm">{day}</p>
          {foodName ? (
            <p className="text-xs text-gray-600 mt-1">{foodName}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-1">Not selected</p>
          )}
        </div>
        {isSelected ? (
          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
        ) : (
          <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
        )}
      </div>
    </div>
  );
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<Menu | null>(null);

  // Initialize with all days as empty arrays
  const [menuItems, setMenuItems] = useState<Record<Day, MenuItem[]>>(() =>
    daysOfWeek.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {} as Record<Day, MenuItem[]>)
  );

  const [selections, setSelections] = useState<Record<Day, number>>(() =>
    daysOfWeek.reduce((acc, day) => {
      acc[day] = 0;
      return acc;
    }, {} as Record<Day, number>)
  );

  const [userSelections, setUserSelections] = useState<Record<Day, FoodSelection>>(
    () =>
      daysOfWeek.reduce((acc, day) => {
        acc[day] = {} as FoodSelection;
        return acc;
      }, {} as Record<Day, FoodSelection>)
  );

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch active menu and selections
  useEffect(() => {
    fetchActiveMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchActiveMenu = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/menus?active=true");
      if (!res.ok) throw new Error("Failed to fetch menus");
      const menus: Menu[] = await res.json();
      if (menus.length === 0) {
        setActiveMenu(null);
        return;
      }

      const menu = menus[0];
      setActiveMenu(menu);

      // Fetch menu items
      const itemsRes = await fetch(`/api/menu-items?menuId=${menu.id}`);
      if (itemsRes.ok) {
        const items: MenuItem[] = await itemsRes.json();
        const grouped: Record<Day, MenuItem[]> = daysOfWeek.reduce((acc, day) => {
          acc[day] = items.filter((item) => item.day === day);
          return acc;
        }, {} as Record<Day, MenuItem[]>);
        setMenuItems(grouped);
      }

      if (user?.id) fetchUserSelections(menu.id);
    } catch (err) {
      console.error(err);
      setError("An error occurred while loading the active menu.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSelections = async (menuId: number) => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/selections?userId=${user.id}&menuId=${menuId}`);
      if (!res.ok) return;
      const data: FoodSelection[] = await res.json();
      const grouped: Record<Day, FoodSelection> = {} as Record<Day, FoodSelection>;
      const selectionMap: Record<Day, number> = {} as Record<Day, number>;

      data.forEach((sel) => {
        grouped[sel.day] = sel;
        if (sel.menu_item_id) selectionMap[sel.day] = sel.menu_item_id;
      });

      setUserSelections(grouped);
      setSelections(selectionMap);
    } catch (err) {
      console.error("Error fetching user selections:", err);
    }
  };

  const getPairedMeals = (): Record<Day, PairedMeal[]> => {
    const paired: Record<Day, PairedMeal[]> = {} as Record<Day, PairedMeal[]>;
    daysOfWeek.forEach((day) => {
      paired[day] = [];
      const items = menuItems[day] || [];
      // Pair every 2 items: first is main, second is dessert
      for (let i = 0; i < items.length; i += 2) {
        paired[day].push({
          mealId: items[i].id,
          mainCourse: items[i],
          dessert: items[i + 1] || null,
        });
      }
    });
    return paired;
  };

  const handleSelection = (day: Day, itemId: number) => {
    setSelections((prev) => ({ ...prev, [day]: itemId }));
  };

  const handleSubmitSelections = async () => {
    if (!user?.id) return setSubmitMessage("User not authenticated");
    if (!activeMenu) return setSubmitMessage("No active menu");
    if (Object.keys(selections).length === 0)
      return setSubmitMessage("Please select at least one item");

    try {
      setIsSubmitting(true);
      setSubmitMessage("");

      const response = await fetch("/api/selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selections,
          userId: user.id,
          menuId: activeMenu.id,
        }),
      });

      if (response.ok) {
        setSubmitMessage("✓ Selections saved successfully!");
        await fetchUserSelections(activeMenu.id);
      } else {
        const data = await response.json();
        setSubmitMessage(data.message || "Failed to save selections");
      }
    } catch (err) {
      console.error(err);
      setSubmitMessage("An error occurred while saving selections");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16 sm:pt-20">
      <NavHeader />
      <main className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-2 border-gray-200 border-t-gray-600 mb-2 sm:mb-3"></div>
                <p className="text-gray-600 text-xs sm:text-sm">Loading menu...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
              <p className="text-red-700 font-medium text-sm">Unable to load menu</p>
              <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
            </div>
          ) : !activeMenu ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sm:p-12 text-center">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                No Active Menu
              </h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">
                No menu available for selection. Check back later.
              </p>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  This Week's Menu
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">{`Week of ${new Date(
                  activeMenu.week_start
                ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}</p>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
                {daysOfWeek.map((day) => {
                  const pairedMeals = getPairedMeals()[day];
                  return (
                    <div
                      key={day}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col"
                    >
                      {/* Day Header */}
                      <div className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">
                          {day}
                        </h3>
                      </div>

                      {/* Meal Options */}
                      <div className="p-2 sm:p-4 space-y-1 sm:space-y-2 flex-1">
                        {pairedMeals && pairedMeals.length > 0 ? (
                          pairedMeals.map((meal, mealIndex) => (
                            <label
                              key={meal.mealId}
                              className="cursor-pointer block p-1.5 sm:p-2 bg-gray-50 rounded border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all relative"
                            >
                              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-xs font-bold">
                                {mealIndex + 1}
                              </span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={day}
                                  value={meal.mealId}
                                  checked={selections[day] === meal.mealId}
                                  onChange={() =>
                                    handleSelection(day, meal.mealId)
                                  }
                                  className="w-4 h-4 text-blue-600 accent-blue-600 flex-shrink-0 cursor-pointer"
                                />
                                <div className="flex-1 min-w-0 text-xs sm:text-sm">
                                  <div className="mb-2">
                                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700 mb-1">
                                      Main Course
                                    </span>
                                    <p className="font-medium text-gray-900">
                                      {meal.mainCourse.name}
                                    </p>
                                  </div>
                                  {meal.dessert && (
                                    <div>
                                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700 mb-1">
                                        Dessert
                                      </span>
                                      <p className="text-gray-600">
                                        {meal.dessert.name}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))
                        ) : (
                          <div className="bg-gray-50 rounded p-2 sm:p-3 text-center border border-dashed border-gray-300">
                            <p className="text-xs text-gray-500">No items</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                {submitMessage && (
                  <div
                    className={`p-3 rounded-lg text-xs sm:text-sm font-medium mb-4 ${
                      submitMessage.includes("successfully")
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {submitMessage}
                  </div>
                )}
                <button
                  onClick={handleSubmitSelections}
                  disabled={isSubmitting || Object.keys(selections).length === 0}
                  className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                >
                  {isSubmitting ? "Submitting..." : "Submit Selections"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
