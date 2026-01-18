'use client';

import { useState, useMemo } from 'react';
import { FoodSelection, MenuItem, User } from '@/lib/data';

type SelectionReportProps = {
  selections: FoodSelection[];
  users: User[];
  menuItems: MenuItem[];
};

export default function SelectionReport({ selections, users, menuItems }: SelectionReportProps) {
  const [filterDay, setFilterDay] = useState('');
  const [filterUser, setFilterUser] = useState('');

  const getUserName = (userId: string) => users.find((u) => u.id === userId)?.name || 'Unknown';
  const getFoodName = (menuItemId: string) => menuItems.find((item) => item.id === menuItemId)?.food_name || 'Unknown';

  const filteredSelections = useMemo(() => {
    return selections.filter((selection) => {
      const dayMatch = !filterDay || selection.day === filterDay;
      const userMatch = !filterUser || selection.user_id === filterUser;
      return dayMatch && userMatch;
    });
  }, [selections, filterDay, filterUser]);

  const exportToCSV = () => {
    const headers = ['Staff Name', 'Department', 'Day', 'Food', 'Selected At'];
    const rows = filteredSelections.map((selection) => {
      const user = users.find((u) => u.id === selection.user_id);
      return [
        user?.name,
        user?.department,
        selection.day,
        getFoodName(selection.menu_item_id),
        selection.selected_at.toLocaleString(),
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = 'food_selections.csv';
    link.click();
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Selection Report</h2>
      <div className="flex space-x-4 mb-4">
        {/* Filtering options can be added here */}
      </div>
      <button
        onClick={exportToCSV}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
      >
        Export to CSV
      </button>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Staff Name</th>
              <th className="py-2 px-4 border-b">Department</th>
              <th className="py-2 px-4 border-b">Day</th>
              <th className="py-2 px-4 border-b">Food</th>
              <th className="py-2 px-4 border-b">Selected At</th>
            </tr>
          </thead>
          <tbody>
            {filteredSelections.map((selection) => (
              <tr key={selection.id}>
                <td className="py-2 px-4 border-b">{getUserName(selection.user_id)}</td>
                <td className="py-2 px-4 border-b">{users.find(u => u.id === selection.user_id)?.department}</td>
                <td className="py-2 px-4 border-b">{selection.day}</td>
                <td className="py-2 px-4 border-b">{getFoodName(selection.menu_item_id)}</td>
                <td className="py-2 px-4 border-b">{selection.selected_at.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}