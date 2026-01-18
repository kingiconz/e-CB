"use client";

import { useState, useEffect } from 'react';

export default function EditMenuModal({ menu, onClose, onSave }) {
  const [foodItems, setFoodItems] = useState([]);
  const [desserts, setDesserts] = useState([]);
  const [day, setDay] = useState('Monday');
  const [foodName, setFoodName] = useState('');
  const [description, setDescription] = useState('');
  const [dessertName, setDessertName] = useState('');
  const [dessertDescription, setDessertDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (menu) {
      // set isActive from menu if available
      if (typeof menu.is_active === 'boolean') {
        setIsActive(menu.is_active);
      } else if (typeof menu.isActive === 'boolean') {
        setIsActive(menu.isActive);
      }
      fetchFoodItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  const fetchFoodItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/menu-items?menuId=${menu.id}`);
      if (response.ok) {
        const items = await response.json();
        setFoodItems(items);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBoth = async () => {
    const errors = [];
    
    if (!foodName) {
      errors.push('Please enter a food name.');
    }
    if (!dessertName) {
      errors.push('Please enter a dessert name.');
    }

    if (errors.length > 0) {
      setMessage(errors.join(' '));
      return;
    }

    try {
      // Add food item
      const foodResponse = await fetch('/api/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menu_id: menu.id,
          name: foodName,
          description: description || null,
          day,
        }),
      });

      if (!foodResponse.ok) {
        setMessage('Failed to add food item.');
        return;
      }

      const newFood = await foodResponse.json();
      setFoodItems([...foodItems, newFood]);

      // Add dessert item
      const dessertResponse = await fetch('/api/menu-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menu_id: menu.id,
          name: dessertName,
          description: dessertDescription || null,
          day,
        }),
      });

      if (!dessertResponse.ok) {
        setMessage('Failed to add dessert.');
        return;
      }

      const newDessert = await dessertResponse.json();
      setDesserts([...desserts, newDessert]);

      // Clear all fields
      setFoodName('');
      setDescription('');
      setDessertName('');
      setDessertDescription('');
      setMessage('');
    } catch (error) {
      console.error('Error adding items:', error);
      setMessage('An error occurred while adding items.');
    }
  };

  const handleDeleteFoodItem = async (id) => {
    try {
      const response = await fetch(`/api/menu-items?itemId=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFoodItems(foodItems.filter((item) => item.id !== id));
      } else {
        setMessage('Failed to delete food item.');
      }
    } catch (error) {
      console.error('Error deleting food item:', error);
      setMessage('An error occurred while deleting the food item.');
    }
  };

  const handleDeleteDessert = async (id) => {
    try {
      const response = await fetch(`/api/menu-items?itemId=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDesserts(desserts.filter((item) => item.id !== id));
      } else {
        setMessage('Failed to delete dessert.');
      }
    } catch (error) {
      console.error('Error deleting dessert:', error);
      setMessage('An error occurred while deleting the dessert.');
    }
  };

  const handleSave = async () => {
    try {
      // Persist isActive to the menus table
      const response = await fetch(`/api/menus?menuId=${menu.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (response.ok) {
        const updatedMenu = await response.json();
        onSave({ ...menu, foodItems, isActive: updatedMenu.is_active });
        setMessage('Saved successfully');
      } else {
        setMessage('Failed to save menu changes.');
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      setMessage('An error occurred while saving menu changes.');
    }

    onClose();
  };

  const groupedFoodItems = foodItems.reduce((acc, item) => {
    const day = item.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(item);
    return acc;
  }, {});

  const groupedDesserts = desserts.reduce((acc, item) => {
    const day = item.day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(item);
    return acc;
  }, {});

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  if (!menu) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-gray-50 rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 lg:p-8 border-b flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">{menu.weekRange}</h1>
                <p className="text-gray-500">Add food options for each day</p>
            </div>
            <div className="flex items-center">
                <span className="mr-2 text-gray-700">Active</span>
                <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
            </div>
        </div>
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
          {message && (
            <div className={`mb-4 p-3 rounded text-sm ${
              message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h3 className="text-lg font-semibold mb-4">Add Food Option</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                  Day
                </label>
                <select
                  id="day"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                </select>
              </div>
              <div>
                <label htmlFor="food-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Food Name
                </label>
                <input
                  type="text"
                  id="food-name"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="e.g., Grilled Chicken"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="dessert-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Dessert Name
                </label>
                <input
                  type="text"
                  id="dessert-name"
                  value={dessertName}
                  onChange={(e) => setDessertName(e.target.value)}
                  placeholder="e.g., Chocolate Cake"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-3">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Food Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  placeholder="e.g., Fresh greens with grilled chicken breast and balsamic vinaigrette"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <div className="md:col-span-3">
                <label htmlFor="dessert-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Dessert Description (Optional)
                </label>
                <textarea
                  id="dessert-description"
                  value={dessertDescription}
                  onChange={(e) => setDessertDescription(e.target.value)}
                  rows="2"
                  placeholder="e.g., Rich chocolate cake with chocolate ganache"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <div className="md:col-span-3">
                <button
                  onClick={handleAddBoth}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 font-medium"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            {daysOfWeek.map((day) => (
              <div key={day} className="mb-8">
                <h3 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-gray-300">{day}</h3>
                
                {/* Food Items Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold mb-3 text-blue-600">Main Courses</h4>
                  {groupedFoodItems[day] && groupedFoodItems[day].length > 0 ? (
                    <div className="space-y-2">
                      {groupedFoodItems[day].map((item) => (
                        <div key={item.id} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md shadow flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900 block">{item.name}</span>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1 italic">{item.description}</p>
                            )}
                          </div>
                          <button onClick={() => handleDeleteFoodItem(item.id)} className="text-red-500 hover:text-red-700 ml-4 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No items added yet</p>
                  )}
                </div>

                {/* Desserts Section */}
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-purple-600">Desserts</h4>
                  {groupedDesserts[day] && groupedDesserts[day].length > 0 ? (
                    <div className="space-y-2">
                      {groupedDesserts[day].map((item) => (
                        <div key={item.id} className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-md shadow flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900 block">{item.name}</span>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1 italic">{item.description}</p>
                            )}
                          </div>
                          <button onClick={() => handleDeleteDessert(item.id)} className="text-red-500 hover:text-red-700 ml-4 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No desserts added yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
        <div className="p-4 border-t flex justify-end">
            <button onClick={onClose} className="mr-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300">
                Close
            </button>
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                Save Changes
            </button>
        </div>
      </div>
    </div>
  );
}