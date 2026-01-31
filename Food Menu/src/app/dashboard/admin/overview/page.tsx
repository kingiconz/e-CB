"use client";

import { useEffect, useState } from 'react';
import { Download, Star } from 'lucide-react';

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

interface MenuRating {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  username: string;
  week_start_date: string;
}

const StatCard = ({ value, label }: { value: number; label: string }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5">
    <p className="text-gray-600 text-xs font-semibold uppercase tracking-wide">{label}</p>
    <p className="text-3xl font-semibold text-gray-900 mt-2">{value}</p>
  </div>
);

export default function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuRatings, setMenuRatings] = useState<MenuRating[]>([]);
  const [menuRatingsLoading, setMenuRatingsLoading] = useState(true);
  const [menuRatingsError, setMenuRatingsError] = useState('');

  useEffect(() => {
    fetchOverviewData();
    fetchMenuRatings();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/admin/overview', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch overview data');
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load overview data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMenuRatings = async () => {
    try {
      setMenuRatingsLoading(true);
      setMenuRatingsError('');

      const response = await fetch('/api/admin/menu-ratings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch menu ratings');
      }

      const result = await response.json();
      setMenuRatings(result);
    } catch (err: any) {
      console.error('Failed to load menu ratings:', err);
      setMenuRatingsError(err.message || 'An unexpected error occurred.');
    } finally {
      setMenuRatingsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!data) return;

    const headers = ['Username', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Progress'];
    const rows = data.staffSelections.map(staff => [
      staff.username,
      ...staff.selections.map(s => s || ''),
      staff.progress,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 text-sm mt-1">
            Summary of selections and staff progress
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard value={data?.totalStaff || 0} label="Total Staff" />
        <StatCard value={data?.totalMenuItems || 0} label="Menu Items" />
        <StatCard value={data?.totalSelections || 0} label="Selections Made" />
        <StatCard value={data?.completeProfiles || 0} label="Complete Profiles" />
      </div>

      {/* Menu feedback unchanged */}
    </div>
  );
}
