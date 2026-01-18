"use client";

import { useState } from 'react';
import NavHeader from '@/components/NavHeader';

export default function EditMenuPage({ params }) {
  const [foodItems, setFoodItems] = useState([]);
  const [desserts, setDesserts] = useState([]);
  const [day, setDay] = useState('Monday');
  const [foodName, setFoodName] = useState('');
  const [description, setDescription] = useState('');
  const [dessertName, setDessertName] = useState('');
  const [dessertDescription, setDessertDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const handleAddFoodItem = () => {
    if (!foodName) {
      alert('Please enter a food name.');
      return;
    }

    const newFoodItem = {
      id: Date.now(),
      day,
      name: foodName,
      description,
    };

    setFoodItems([...foodItems, newFoodItem]);
    setFoodName('');
    setDescription('');
  };

  const handleAddDessert = () => {
    if (!dessertName) {
      alert('Please enter a dessert name.');
      return;
    }

    const newDessert = {
      id: Date.now(),
      day,
      name: dessertName,
      description: dessertDescription,
    };

    setDesserts([...desserts, newDessert]);
    setDessertName('');
    setDessertDescription('');
  };

  const handleDeleteFoodItem = (id) => {
    setFoodItems(foodItems.filter((item) => item.id !== id));
  };

  const handleDeleteDessert = (id) => {
    setDesserts(desserts.filter((item) => item.id !== id));
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <NavHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Week of January 12, 2026</h1>
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
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[\"\"] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-lg font-semibold mb-4">Add Food & Dessert Option</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                Day
              </label>
              <select
                id="day"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddFoodItem}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 font-medium"
              >
                Add Food
              </button>
              <button
                onClick={handleAddDessert}
                className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 font-medium"
              >
                Add Dessert
              </button>
            </div>
            <div className="md:col-span-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Food Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="2"
                placeholder="e.g., Fresh greens with grilled chicken breast and balsamic vinaigrette"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              ></textarea>
            </div>
            <div className="md:col-span-4">
              <label htmlFor="dessert-description" className="block text-sm font-medium text-gray-700 mb-1">
                Dessert Description (Optional)
              </label>
              <textarea
                id="dessert-description"
                value={dessertDescription}
                onChange={(e) => setDessertDescription(e.target.value)}
                rows="2"
                placeholder="e.g., Rich chocolate cake with chocolate ganache"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              ></textarea>
            </div>
          </div>
        </div>

        <div>
          {daysOfWeek.map((day) => (
            <div key={day} className="mb-8">
              <h3 className="text-2xl font-bold mb-4 pb-2 border-b-2 border-gray-300">{day}</h3>
              
              {/* Food Items Section */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-3 text-orange-600">🍽️ Main Courses</h4>
                {groupedFoodItems[day] && groupedFoodItems[day].length > 0 ? (
                  <div className="space-y-2">
                    {groupedFoodItems[day].map((item) => (
                      <div key={item.id} className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md shadow flex justify-between items-start">
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
                <h4 className="text-lg font-semibold mb-3 text-purple-600">🍰 Desserts</h4>
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
    </div>
  );
}