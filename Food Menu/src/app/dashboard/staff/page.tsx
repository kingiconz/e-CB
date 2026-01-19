"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import NavHeader from '@/components/NavHeader';
import { CheckCircle2, Circle } from 'lucide-react';

interface Selection {
  id: string | number;
  day: string;
  name: string;
  description: string | null;
}

const DaySelectionCard = ({ day, status, foodName }: { day: string; status: string; foodName?: string }) => {
  const isSelected = status === 'Selected';
  return (
    <div className={`p-3 rounded border transition-all ${
      isSelected 
        ? 'border-blue-200 bg-blue-50' 
        : 'border-gray-200 bg-white'
    }`}>
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
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuItems, setMenuItems] = useState({});
  const [selections, setSelections] = useState({});
  const [userSelections, setUserSelections] = useState<Record<string, Selection>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchActiveMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchActiveMenu = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/menus?active=true');
      if (!res.ok) throw new Error('Failed to fetch menus');
      const menus = await res.json();
      if (menus.length === 0) {
        setActiveMenu(null);
        return;
      }
      const menu = menus[0];
      setActiveMenu(menu);

      const itemsRes = await fetch(`/api/menu-items?menuId=${menu.id}`);
      if (itemsRes.ok) {
        const items = await itemsRes.json();
        const grouped = items.reduce((acc, item) => {
          acc[item.day] = acc[item.day] || [];
          acc[item.day].push(item);
          return acc;
        }, {});
        setMenuItems(grouped);
      }

      if (user && user.id) {
        fetchUserSelections(menu.id);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading the active menu.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSelections = async (menuId: string | number) => {
    try {
      if (!user || !user.id) return;
      const res = await fetch(`/api/selections?userId=${user.id}&menuId=${menuId}`);
      if (res.ok) {
        const data = await res.json();
        const grouped: Record<string, Selection> = {};
        data.forEach((sel: Selection) => {
          grouped[sel.day] = sel;
        });
        setUserSelections(grouped);
        const selectionsMap: Record<string, string> = {};
        data.forEach((sel: Selection) => {
          selectionsMap[sel.day] = String(sel.menu_item_id);
        });
        setSelections(selectionsMap);
      }
    } catch (err) {
      console.error('Error fetching user selections:', err);
    }
  };

  // Group items by day with main course and dessert paired
  const getPairedMeals = () => {
    const paired: Record<string, { mealId: string; mainCourse: any; dessert: any }[]> = {};
    
    daysOfWeek.forEach(day => {
      paired[day] = [];
      const dayItems = menuItems[day] || [];
      
      // Separate main courses and desserts
      const mainCourses = dayItems.filter((_, idx) => idx % 2 === 0);
      const desserts = dayItems.filter((_, idx) => idx % 2 === 1);
      
      // Pair them together
      for (let i = 0; i < mainCourses.length; i++) {
        paired[day].push({
          mealId: String(mainCourses[i].id),
          mainCourse: mainCourses[i],
          dessert: desserts[i] || null
        });
      }
    });
    
    return paired;
  };

  const handleSelection = (day, itemId) => {
    console.log(`Selection made: Day - ${day}, Item ID - ${itemId}`);
    setSelections(prev => {
      const updatedSelections = { ...prev, [day]: itemId };
      console.log('Updated selections:', updatedSelections);
      return updatedSelections;
    });
  };

  const handleSubmitSelections = async () => {
    if (!user || !user.id) {
      setSubmitMessage('User not authenticated');
      return;
    }

    if (!activeMenu) {
      setSubmitMessage('No active menu');
      return;
    }

    const selectedDays = Object.keys(selections);
    if (selectedDays.length === 0) {
      setSubmitMessage('Please select at least one item');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitMessage('');
      const response = await fetch('/api/selections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selections,
          userId: user.id,
          menuId: activeMenu.id,
        }),
      });

      if (response.ok) {
        setSubmitMessage('✓ Selections saved successfully!');
        await fetchUserSelections(activeMenu.id);
      } else {
        const data = await response.json();
        setSubmitMessage(data.message || 'Failed to save selections');
      }
    } catch (err) {
      console.error(err);
      setSubmitMessage('An error occurred while saving selections');
    } finally {
      setIsSubmitting(false);
    }
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Active Menu</h2>
            <p className="text-gray-600 text-xs sm:text-sm mt-1">No menu available for selection. Check back later.</p>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">This Week's Menu</h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-1">{`Week of ${new Date(activeMenu.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}</p>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-4 mb-6 sm:mb-8">
              {daysOfWeek.map(day => {
                const pairedMeals = getPairedMeals();
                
                return (
                  <div key={day} className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                    {/* Day Header */}
                    <div className="bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm">{day}</h3>
                    </div>

                    {/* Meal Options */}
                    <div className="p-2 sm:p-4 space-y-1 sm:space-y-2 flex-1">
                      {pairedMeals[day] && pairedMeals[day].length > 0 ? (
                        pairedMeals[day].map((meal, mealIndex) => (
                          <label key={meal.mealId} className="cursor-pointer block p-1.5 sm:p-2 bg-gray-50 rounded border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-all relative">
                            {/* Number badge at top */}
                            <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-xs font-bold">
                              {mealIndex + 1}
                            </span>

                            <div className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={day}
                                  value={meal.mealId}
                                  checked={selections[day] === meal.mealId}
                                  onChange={() => handleSelection(day, meal.mealId)}
                                 className="w-4 h-4 text-blue-600 accent-blue-600 flex-shrink-0 cursor-pointer"
                                />
                              <div className="flex-1 min-w-0 text-xs sm:text-sm">
                                <div className="mb-2">
                                  <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700 mb-1">
                                    Main Course
                                  </span>
                                  <p className="font-medium text-gray-900">{meal.mainCourse.name}</p>
                                </div>
                                {meal.dessert && (
                                  <div>
                                    <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-700 mb-1">
                                      Dessert
                                    </span>
                                    <p className="text-gray-600">{meal.dessert.name}</p>
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
                <div className={`p-3 rounded-lg text-xs sm:text-sm font-medium mb-4 ${
                  submitMessage.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {submitMessage}
                </div>
              )}
              <button
                onClick={handleSubmitSelections}
                disabled={isSubmitting || Object.keys(selections).length === 0}
                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Selections'}
              </button>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}