"use client";

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface OverviewData {
  totalStaff: number;
  totalMenuItems: number;
  totalSelections: number;
  completeProfiles: number;
  progressPercentage: number;
  staffSelections: Array<{
    userId: number;
    username: string;
    selections: (string | null)[];
    progress: string;
  }>;
  maxPossibleSelections: number;
}

const StatCard = ({ value, label }: { value: number; label: string }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5">
    <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">{label}</p>
    <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
  </div>
);

const StaffRow = ({ username, selections, progress }: { username: string; selections: (string | null)[]; progress: string }) => (
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
  </tr>
);

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/overview');
      if (!response.ok) throw new Error('Failed to fetch overview data');
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load overview data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;
    
    const headers = ['Username', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Progress'];
    const rows = data.staffSelections.map(staff => [
      staff.username,
      ...staff.selections.map(s => s || ''),
      staff.progress
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `overview-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading overview data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 text-sm mt-1">Summary of selections and staff progress</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={data?.totalStaff || 0} label="Total Staff" />
        <StatCard value={data?.totalMenuItems || 0} label="Menu Items" />
        <StatCard value={data?.totalSelections || 0} label="Selections Made" />
        <StatCard value={data?.completeProfiles || 0} label="Complete Profiles" />
      </div>

      {/* Progress Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Selection Completion</h2>
        <p className="text-gray-600 text-sm mb-4">Overall progress towards target completion</p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${data?.progressPercentage || 0}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          {data?.totalSelections || 0} of {data?.maxPossibleSelections || 0} selections ({data?.progressPercentage || 0}%)
        </p>
      </div>

      {/* Staff Selections Table */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Staff Selections</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Staff Member</th>
                  <th className="text-center font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Monday</th>
                  <th className="text-center font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Tuesday</th>
                  <th className="text-center font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Wednesday</th>
                  <th className="text-center font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Thursday</th>
                  <th className="text-center font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Friday</th>
                  <th className="text-center font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.staffSelections && data.staffSelections.length > 0 ? (
                  data.staffSelections.map((staff, index) => (
                    <StaffRow key={index} {...staff} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500 text-sm">
                      No staff members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}