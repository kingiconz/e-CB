/* eslint-disable react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import NavHeader from "@/components/NavHeader";
import { Menu, MenuItem, FoodSelection, Day } from "@/lib/data";
import { CheckCircle2, Circle, Star } from "lucide-react";

interface PairedMeal {
  mealId: number;
  mainCourse: MenuItem;
  dessert: MenuItem | null;
}

const daysOfWeek: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const DaySelectionCard = ({
  day,
  mainCourseName,
  mainCourseDescription,
  dessertName,
  dessertDescription,
  isSelected,
}: {
  day: Day;
  mainCourseName?: string;
  mainCourseDescription?: string;
  dessertName?: string;
  dessertDescription?: string;
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
          {mainCourseName ? (
            <div className="mt-1">
              <p className="text-sm font-semibold text-gray-900">{mainCourseName}</p>
              <p className="text-xs text-gray-600">{mainCourseDescription}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-1">No main course selected</p>
          )}
          {dessertName ? (
            <div className="mt-2">
              <p className="text-sm font-semibold text-gray-900">{dessertName}</p>
              <p className="text-xs text-gray-600">{dessertDescription}</p>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-1">No dessert selected</p>
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

  const [menuRating, setMenuRating] = useState(0);
  const [menuComment, setMenuComment] = useState("");
  const [ratingSubmitMessage, setRatingSubmitMessage] = useState("");

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

  const getPairedMeals = (dayItems: MenuItem[]) => {
    const pairs: { mainCourse: MenuItem; dessert?: MenuItem }[] = [];
    for (let i = 0; i < dayItems.length; i += 2) {
      pairs.push({
        mainCourse: dayItems[i],
        dessert: dayItems[i + 1],
      });
    }
    return pairs;
  };

  const getDayDate = (day: Day) => {
    if (!activeMenu) return '';
    const weekStartDate = new Date(activeMenu.week_start);
    const dayIndex = daysOfWeek.indexOf(day);
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + dayIndex);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderMenu = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-4">
        {daysOfWeek.map((day) => (
          <div key={day} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">
                {day} - {getDayDate(day)}
              </h3>
              {selections[day] !== 0 && (
                <button
                  onClick={() => handleClearSelection(day)}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="p-2 sm:p-4 space-y-1 sm:space-y-2 flex-1">
              {menuItems[day] && menuItems[day].length > 0 ? (
                getPairedMeals(menuItems[day]).map((meal) => (
                  <div
                    key={`${meal.mainCourse.id}-${meal.dessert?.id || 'none'}`}
                    className={`bg-gray-50 rounded p-1.5 sm:p-2 border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer ${
                      selections[day] === meal.mainCourse.id ? 'border-blue-200 bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name={`selection-${day}`}
                        value={meal.mainCourse.id}
                        checked={selections[day] === meal.mainCourse.id}
                        onChange={() => handleSelection(day, meal.mainCourse.id)}
                        className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
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
    );
  };

  const handleSelection = (day: Day, itemId: number) => {
    setSelections((prev) => ({ ...prev, [day]: itemId }));
  };

  const handleClearSelection = (day: Day) => {
    setSelections((prev) => ({ ...prev, [day]: 0 }));
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

  const handleSubmitMenuRating = async () => {
    if (!user?.id || !activeMenu?.id) {
      setRatingSubmitMessage("Cannot submit rating. User or menu not identified.");
      return;
    }
    if (menuRating === 0) {
      setRatingSubmitMessage("Please select a rating before submitting.");
      return;
    }

    try {
      const response = await fetch('/api/menu-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          menu_id: activeMenu.id,
          user_id: user.id,
          rating: menuRating,
          comment: menuComment,
        }),
      });

      if (response.ok) {
        setRatingSubmitMessage("✓ Thank you for your feedback!");
        setMenuRating(0);
        setMenuComment("");
      } else {
        const data = await response.json();
        setRatingSubmitMessage(data.message || "Failed to submit your rating.");
      }
    } catch (error) {
      console.error('Failed to submit menu rating', error);
      setRatingSubmitMessage("An error occurred while submitting your rating.");
    }
  };

  return (
    <div className="min-h-screen bg-white pt-16 sm:pt-20">
      <NavHeader />
      <main className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">This Week's Menu</h1>
              {activeMenu && (
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  {`Week of ${new Date(activeMenu.week_start).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}`}
                </p>
              )}
            </div>
          </div>

          {renderMenu()}

          <div className="mt-6 text-center">
            <button
              onClick={handleSubmitSelections}
              className="bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700 transition-colors text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Submit Selections'}
            </button>
            {submitMessage && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">{submitMessage}</p>
              </div>
            )}
          </div>

          {activeMenu && (
            <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Rate This Week's Menu</h2>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-8 h-8 cursor-pointer ${
                      menuRating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                    onClick={() => setMenuRating(star)}
                  />
                ))}
              </div>
              <textarea
                className="w-full mt-4 p-3 border rounded-md text-sm"
                rows={4}
                placeholder="Add a comment about the menu for the week..."
                value={menuComment}
                onChange={(e) => setMenuComment(e.target.value)}
              />
              <button
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 transition-colors"
                onClick={handleSubmitMenuRating}
              >
                Send Feedback
              </button>
              {ratingSubmitMessage && (
                <p className="text-sm text-gray-600 mt-4">{ratingSubmitMessage}</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}