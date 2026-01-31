"use client";
export const dynamic = 'force-dynamic';

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

  const fetchMenuRatings = async () => {
    try {
      setMenuRatingsLoading(true);
      setMenuRatingsError('');
      const response = await fetch('/api/admin/menu-ratings');
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



    

      {/* Menu Ratings Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu Feedback</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Staff Member</th>
                  <th className="text-left font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Menu Week</th>
                  <th className="text-center font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Rating</th>
                  <th className="text-left font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Comment</th>
                  <th className="text-left font-semibold py-3 px-6 text-gray-700 text-xs uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {menuRatingsLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 text-sm">
                      Loading feedback...
                    </td>
                  </tr>
                ) : menuRatingsError ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-red-600 text-sm">
                      Error: {menuRatingsError}
                    </td>
                  </tr>
                ) : menuRatings.length > 0 ? (
                  menuRatings.map((rating) => (
                    <tr key={rating.id} className="hover:bg-gray-50">
                      <td className="py-3 px-6 text-sm text-gray-900">{rating.username || 'Unknown User'}</td>
                      <td className="py-3 px-6 text-sm text-gray-700">
                        {rating.week_start_date ? new Date(rating.week_start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                      </td>
                      <td className="py-3 px-6 text-center">
                        <div className="flex items-center justify-center">
                          {[...Array(rating.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          {[...Array(5 - rating.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-gray-300" />
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-sm text-gray-700">{rating.comment || '—'}</td>
                      <td className="py-3 px-6 text-sm text-gray-700">
                        {new Date(rating.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 text-sm">
                      No menu feedback found.
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