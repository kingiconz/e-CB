"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface EditMenuModalProps {
  menu: {
    id: string;
    weekRange?: string;
    is_active?: boolean;
    isActive?: boolean;
  };
  onClose: () => void;
  onSave: (data: any) => void;
}

interface FoodItem {
  id: number;
  day: string;
  name: string;
  description: string | null;
}

interface DessertItem {
  id: number;
  day: string;
  name: string;
  description: string | null;
}

export default function EditMenuModal({
  menu,
  onClose,
  onSave,
}: EditMenuModalProps) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [desserts, setDesserts] = useState<DessertItem[]>([]);
  const [menuItems, setMenuItems] = useState<Record<string, FoodItem[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!menu) {
      console.log("Menu object is null or undefined");
      return;
    }

    console.log("Menu object:", menu);

    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        const itemsRes = await fetch(`/api/menu-items?menuId=${menu.id}`);
        console.log("API Response Status:", itemsRes.status);
        if (itemsRes.ok) {
          const items = await itemsRes.json();
          console.log("Fetched Items:", items);
          const grouped = items.reduce(
            (acc: Record<string, FoodItem[]>, item: FoodItem) => {
              acc[item.day] = acc[item.day] || [];
              acc[item.day].push(item);
              return acc;
            },
            {}
          );
          setMenuItems(grouped);
        } else {
          console.error("Failed to fetch menu items", await itemsRes.text());
        }
      } catch (err: any) {
        console.error("Error fetching menu items:", err);
        setError(err.message || "Failed to load menu items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [menu]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const getPairedMeals = (dayItems: FoodItem[]) => {
    const pairs: { mainCourse: FoodItem; dessert?: FoodItem }[] = [];
    for (let i = 0; i < dayItems.length; i += 2) {
      pairs.push({
        mainCourse: dayItems[i],
        dessert: dayItems[i + 1],
      });
    }
    return pairs;
  };

  const handleDelete = (day: string, itemId: number) => {
    setMenuItems((prev) => {
      const updatedDayItems =
        prev[day]?.filter((item) => item.id !== itemId) || [];
      return { ...prev, [day]: updatedDayItems };
    });
  };

  const [newFoodDay, setNewFoodDay] = useState("Monday");
  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodDescription, setNewFoodDescription] = useState("");
  const [newDessertName, setNewDessertName] = useState("");
  const [newDessertDescription, setNewDessertDescription] = useState("");

  const handleAddFoodItem = async () => {
    if (!newFoodName.trim() && !newDessertName.trim()) return;

    try {
      const newItems = [];

      if (newFoodName.trim()) {
        newItems.push({
          day: newFoodDay,
          name: newFoodName,
          description: newFoodDescription,
        });
      }

      if (newDessertName.trim()) {
        newItems.push({
          day: newFoodDay,
          name: newDessertName,
          description: newDessertDescription,
        });
      }

      const response = await fetch(`/api/menu-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menu_id: menu.id, // Corrected key from menuId to menu_id
          items: newItems,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save new food items to the database");
      }

      const savedItems = await response.json();

      setMenuItems((prev) => {
        const updatedDayItems = [...(prev[newFoodDay] || []), ...savedItems];
        return { ...prev, [newFoodDay]: updatedDayItems };
      });

      // Clear input fields
      setNewFoodName("");
      setNewFoodDescription("");
      setNewDessertName("");
      setNewDessertDescription("");
    } catch (error) {
      console.error("Error adding food item:", error);
      setError("Failed to add food item. Please try again.");
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p>Loading...</p>;
    }

    if (error) {
      return <p>Error: {error}</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {days.map((day) => (
          <div
            key={day}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md"
          >
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm">{day}</h3>
            </div>
            <div className="p-4 space-y-2">
              {menuItems[day] && menuItems[day].length > 0 ? (
                getPairedMeals(menuItems[day]).map((meal, index) => (
                  <div
                    key={`${meal.mainCourse.id}-${meal.dessert?.id || "none"}`}
                    className="bg-gray-50 rounded p-2 border border-gray-200 hover:bg-blue-50 transition-all flex justify-between items-start"
                  >
                    <div>
                      <div className="mb-2">
                        <span className="inline-block mb-1 px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                          Main Course
                        </span>
                        <p className="font-medium text-gray-900 text-sm">
                          {meal.mainCourse.name}
                        </p>
                        {meal.mainCourse.description && (
                          <p className="text-xs text-gray-600">
                            {meal.mainCourse.description}
                          </p>
                        )}
                      </div>
                      {meal.dessert && (
                        <div>
                          <span className="inline-block mb-1 px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700">
                            Dessert
                          </span>
                          <p className="font-medium text-gray-900 text-sm">
                            {meal.dessert.name}
                          </p>
                          {meal.dessert.description && (
                            <p className="text-xs text-gray-600">
                              {meal.dessert.description}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(day, meal.mainCourse.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500">No items available</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-8 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Menu</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            &times;
          </button>
        </div>

        {/* Add Food Option Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Add Food Option
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-center">
            <div className="bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
              <label
                htmlFor="day"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Day
              </label>
              <select
                id="day"
                value={newFoodDay}
                onChange={(e) => setNewFoodDay(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
              <label
                htmlFor="foodName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Food Name
              </label>
              <input
                id="foodName"
                type="text"
                value={newFoodName}
                onChange={(e) => setNewFoodName(e.target.value)}
                placeholder="e.g., Grilled Chicken"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
              <label
                htmlFor="dessertName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Dessert Name
              </label>
              <input
                id="dessertName"
                type="text"
                value={newDessertName}
                onChange={(e) => setNewDessertName(e.target.value)}
                placeholder="e.g., Chocolate Cake"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
              <label
                htmlFor="foodDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Food Description (Optional)
              </label>
              <textarea
                id="foodDescription"
                value={newFoodDescription}
                onChange={(e) => setNewFoodDescription(e.target.value)}
                placeholder="e.g., Fresh greens with grilled chicken breast and balsamic vinaigrette"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-20"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow border border-gray-200">
              <label
                htmlFor="dessertDescription"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Dessert Description (Optional)
              </label>
              <textarea
                id="dessertDescription"
                value={newDessertDescription}
                onChange={(e) => setNewDessertDescription(e.target.value)}
                placeholder="e.g., Rich chocolate cake with chocolate ganache"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-20"
              />
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={handleAddFoodItem}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {renderContent()}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-300"
          >
            Close
          </button>
          <button
            onClick={() => onSave(menuItems)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
