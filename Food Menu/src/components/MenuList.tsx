'use client';

import { useState } from 'react';
import { Menu, MenuItem, User } from '@/lib/data';
import MenuCard from './MenuCard';

type MenuListProps = {
  menu: Menu;
  currentUser: User;
};

export default function MenuList({ menu, currentUser }: MenuListProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSelection = (day: string, itemId: string) => {
    setSelections((prev) => ({ ...prev, [day]: itemId }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('/api/selections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ selections, userId: currentUser.id }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Optionally, you can refresh the data here to show the updated selections
        // For now, we'll just show a success message.
        // A full page reload would also work for this mock setup.
        window.location.reload();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Failed to submit selections:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const itemsByDay = (day: string): MenuItem[] => {
    return menu.items.filter((item) => item.day === day);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Weekly Menu</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((day) => (
          <MenuCard
            key={day}
            day={day}
            items={itemsByDay(day)}
            onSelection={handleSelection}
            selectedItem={selections[day]}
          />
        ))}
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        onClick={handleSubmit}
        disabled={isSubmitting || Object.keys(selections).length === 0}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Selections'}
      </button>
      {submitStatus === 'success' && (
        <p className="text-green-600">Selections submitted successfully!</p>
      )}
      {submitStatus === 'error' && (
        <p className="text-red-600">Failed to submit selections. Please try again.</p>
      )}
    </div>
  );
}