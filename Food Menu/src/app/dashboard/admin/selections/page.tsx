"use client";

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface StaffSelectionData {
  userId: number;
  username: string;
  selections: (string | null)[];
  progress: string;
  monthlySelections: number;
}

interface ApiResponse {
  staffSelections: StaffSelectionData[];
  week_start: string | null;
}

const StaffRow = ({ username, selections, progress, monthlySelections }: StaffSelectionData) => (
  <tr className="border-b hover:bg-gray-50">
    <td className="py-3 px-6">
      <p className="text-sm font-medium text-gray-900">{username}</p>
    </td>
    {selections.map((selection, index) => (
      <td key={index} className="py-3 px-6 text-center">
        <span className="text-sm text-gray-700">
          {selection || '—'}
        </span>
      </td>
    ))}
    <td className="py-3 px-6 text-center">
      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${
        progress === '5/5' 
          ? 'bg-green-100 text-green-800' 
          : progress === '0/5'
          ? 'bg-gray-100 text-gray-600'
          : 'bg-blue-100 text-blue-800'
      }`}>
        {progress}
      </span>
    </td>
    <td className="py-3 px-6 text-center">
      <span className="text-sm text-gray-700">{monthlySelections}</span>
    </td>
  </tr>
);

export default function SelectionsPage() {
  const [staffData, setStaffData] = useState<StaffSelectionData[]>([]);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSelections();
  }, []);

  const fetchSelections = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/selections');
      if (!response.ok) throw new Error('Failed to fetch selections');
      const data: ApiResponse = await response.json();
      setStaffData(data.staffSelections || []);
      setWeekStart(data.week_start);
    } catch (err: any) {
      setError(err.message || 'Failed to load selections');
      setStaffData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDayDate = (dayIndex: number): string => {
    if (!weekStart) return '';
    const startDate = new Date(weekStart);
    startDate.setDate(startDate.getDate() + dayIndex);
    return ` ${startDate.getDate().toString().padStart(2, '0')}-${(startDate.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const handleExportCSV = () => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const headers = [
      'Staff Member',
      ...daysOfWeek.map((day, index) => `${day}${getDayDate(index)}`),
      'Weekly Selections'
    ];

    const rows = staffData.map(staff => [
      staff.username,
      ...(staff.selections.map(s => s || 'No Selection')),
      staff.progress
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `staff-selections-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Staff Selections</h1>
          <p className="text-gray-600 text-sm mt-1">View food selections by staff members</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-600 mb-3"></div>
              <p className="text-gray-600 text-sm">Loading selections...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        ) : staffData.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-700 font-medium">No selections found</p>
            <p className="text-gray-600 text-sm mt-1">{`Staff members haven't made any selections yet`}</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Staff Member</th>
                    {daysOfWeek.map((day, index) => (
                      <th key={day} className="text-center font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">
                        {day}
                        {weekStart && <span className="block font-normal text-gray-500">{getDayDate(index)}</span>}
                      </th>
                    ))}
                    <th className="text-center font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Weekly Selections</th>
                    <th className="text-center font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Monthly Selections</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staffData.map((staff, index) => (
                    <StaffRow key={index} {...staff} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Total Staff</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">{staffData.length}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {staffData.filter(s => s.progress === '5/5').length}
                </p>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">In Progress</p>
                <p className="text-3xl font-semibold text-gray-900 mt-2">
                  {staffData.filter(s => s.progress !== '5/5' && s.progress !== '0/5').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}