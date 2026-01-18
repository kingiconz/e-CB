"use client";

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

interface Menu {
  id: string | number;
  week_start: string;
  deadline: string;
}

interface MenuItem {
  id: string | number;
  menu_id: string | number;
  name: string;
  description: string | null;
  day: string;
}

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMenusAndItems();
  }, []);

  const fetchMenusAndItems = async () => {
    try {
      setIsLoading(true);
      const menusResponse = await fetch('/api/menus');
      if (menusResponse.ok) {
        const menusData = await menusResponse.json();
        setMenus(menusData);

        // Fetch food items for each menu
        const allItems: Record<string, MenuItem[]> = {};
        for (const menu of menusData) {
          const itemsResponse = await fetch(`/api/menu-items?menuId=${menu.id}`);
          if (itemsResponse.ok) {
            const items = await itemsResponse.json();
            allItems[menu.id] = items;
          }
        }
        setMenuItems(allItems);
      } else {
        setError('Failed to fetch menus');
      }
    } catch (err) {
      setError('An error occurred while fetching menus');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600 mb-3"></div>
          <p className="text-gray-600 font-medium">Loading menus...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-semibold">Error</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-12 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 font-medium mb-1">No menus created yet</p>
        <p className="text-gray-500 text-sm">Go to Manage tab to create your first menu</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Weekly Menus</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">Review all menus and their daily items</p>
        </div>

        {/* Menus */}
        <div className="space-y-8">
          {menus.map((menu, index) => (
            <div key={menu.id}>
              {/* Menu Header */}
              <div className="mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Week of {formatDate(menu.week_start)}</h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Selection Deadline: {formatDate(menu.deadline)}
                </p>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-4">
                {daysOfWeek.map(day => {
                  const items = menuItems[menu.id] || [];
                  const itemsForDay = items.filter(item => item.day === day);
                  
                  return (
                    <div key={day} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                      {/* Day Header */}
                      <div className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">{day}</h3>
                      </div>

                      {/* Items */}
                      <div className="p-2 sm:p-4 space-y-1 sm:space-y-2 flex-1">
                        {itemsForDay.length > 0 ? (
                          getPairedMeals(itemsForDay).map((meal, mealIndex) => (
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}