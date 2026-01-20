'use client';

import { useState, useMemo } from 'react';
import { FoodSelection, MenuItem, User, Day } from '@/lib/data';

type SelectionReportProps = {
  selections: FoodSelection[];
  users: User[];
  menuItems: MenuItem[];
};

// 🔑 Normalize string/number IDs safely (DB unchanged)
const normalizeId = (id: string | number) => Number(id);

export default function SelectionReport({
  selections,
  users,
  menuItems,
}: SelectionReportProps) {
  const [filterDay, setFilterDay] = useState<Day | ''>('');
  const [filterUser, setFilterUser] = useState<string | ''>('');

  const daysOfWeek: Day[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
  ];

  // ⚡ Build user lookup map once
  const userMap = useMemo(() => {
    return new Map<number, User>(
      users.map((u) => [normalizeId(u.id), u])
    );
  }, [users]);

  const getFoodName = (menuItemId: number) =>
    menuItems.find((item) => item.id === menuItemId)?.name || 'Unknown';

  // 🔍 Filter selections safely
  const filteredSelections = useMemo(() => {
    return selections.filter((selection) => {
      const dayMatch = !filterDay || selection.day === filterDay;
      const userMatch =
        !filterUser ||
        selection.user_id === normalizeId(filterUser);

      return dayMatch && userMatch;
    });
  }, [selections, filterDay, filterUser]);

  // 📤 CSV Export
  const exportToCSV = () => {
    const headers = [
      'Staff Name',
      'Department',
      'Day',
      'Food',
      'Selected At',
    ];

    const rows = filteredSelections.map((selection) => {
      const user = userMap.get(selection.user_id);
      const selectedDate = new Date(
        selection.selected_at
      ).toLocaleString();

      return [
        user?.name || 'Unknown',
        user?.department || 'Unknown',
        selection.day,
        getFoodName(selection.menu_item_id),
        selectedDate,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'food_selections.csv';
    link.click();
  };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Selection Report
      </h2>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">All Staff</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>

        <select
          value={filterDay}
          onChange={(e) =>
            setFilterDay(e.target.value as Day | '')
          }
          className="border rounded px-2 py-1"
        >
          <option value="">All Days</option>
          {daysOfWeek.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={exportToCSV}
        className="mb-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
      >
        Export to CSV
      </button>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">
                Staff Name
              </th>
              <th className="py-2 px-4 border-b">
                Department
              </th>
              <th className="py-2 px-4 border-b">
                Day
              </th>
              <th className="py-2 px-4 border-b">
                Food
              </th>
              <th className="py-2 px-4 border-b">
                Selected At
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredSelections.map((selection) => {
              const user = userMap.get(selection.user_id);

              return (
                <tr key={selection.id}>
                  <td className="py-2 px-4 border-b">
                    {user?.name || 'Unknown'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {user?.department || 'Unknown'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {selection.day}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {getFoodName(selection.menu_item_id)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {new Date(
                      selection.selected_at
                    ).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
