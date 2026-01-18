"use client";

import { useState } from 'react';

export default function MenuManager({ onMenuCreated }) {
  const [weekStart, setWeekStart] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState('');

  const handleCreateMenu = async () => {
    setMessage('');
    if (!weekStart || !deadlineDate || !deadlineTime) {
      setMessage('Please fill all fields');
      return;
    }

    const deadline = new Date(`${deadlineDate}T${deadlineTime}`);

    const response = await fetch('/api/menus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        week_start: weekStart,
        deadline: deadline.toISOString(),
        is_active: isActive,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage('Menu created successfully!');
      onMenuCreated(data);
      setWeekStart('');
      setDeadlineDate('');
      setDeadlineTime('');
      setIsActive(true);
    } else {
      setMessage(data.message || 'An error occurred during menu creation.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-lg font-semibold mb-4">Create New Weekly Menu</h3>
      {message && (
        <p
          className={`mb-4 text-sm text-center ${
            message.includes('successfully')
              ? 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="week-start" className="block text-sm font-medium text-gray-700 mb-1">
            Week Start (Monday)
          </label>
          <input
            type="date"
            id="week-start"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selection Deadline
          </label>
          <div className="flex space-x-2">
            <input
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center space-x-4">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} className="form-checkbox h-5 w-5 text-blue-500" />
          <span className="text-sm text-gray-700">Active</span>
        </label>
      </div>
      <div className="mt-6 flex items-center space-x-4">
        <button 
          onClick={handleCreateMenu}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Create Menu
        </button>
        <button className="text-gray-600 hover:text-gray-800">
          Cancel
        </button>
      </div>
    </div>
  );
}