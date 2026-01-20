'use client';

import { useState } from 'react';
import { Menu, MenuItem, User, Day } from '@/lib/data';
import MenuCard from './MenuCard';

type MenuListProps = {
  menu: Menu & { items: MenuItem[] }; // Include items for this menu
  currentUser: User;
};

const daysOfWeek: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function MenuList({ menu, currentUser }: MenuListProps) {
  // Initialize all days with 0 (no selection)
  const initialSelections: Record<Day, number> = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
  };

  const [selections, setSelections] = useState<Record<Day, number>>(initialSelections);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);

  const handleSelection = (day: Day, itemId: number) => {
    setSelections((prev) => ({ ...prev, [day]: itemId }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Filter out unselected days
    const filteredSelections: Record<Day, number> = {} as Record<Day, number>;
    daysOfWeek.forEach((day) => {
      if (selections[day] && selections[day] !== 0) {
        filteredSelections[day] = selections[day];
      }
    });

    if (Object.keys(filteredSelections).length === 0) {
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/selections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selections: filteredSelections,
          userId: currentUser.id,
          menuId: menu.id,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Optionally refresh page or fetch updated selections
        window.location.reload();
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Failed to submit selections:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemsByDay = (day: Day): MenuItem[] => {
    return menu.items.filter((item) => item.day === day);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Weekly Menu</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {daysOfWeek.map((day) => (
          <MenuCard
            key={day}
            day={day}
            items={itemsByDay(day)}
            onSelection={handleSelection}
            selectedItem={selections[day] !== 0 ? selections[day] : undefined} // undefined if not selected
          />
        ))}
      </div>

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
        onClick={handleSubmit}
        disabled={isSubmitting || Object.values(selections).every((id) => id === 0)}
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
