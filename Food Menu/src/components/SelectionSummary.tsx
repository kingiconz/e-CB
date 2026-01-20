import { FoodSelection, MenuItem, User } from '@/lib/data';

type SelectionSummaryProps = {
  selections: FoodSelection[];
  menuItems: MenuItem[];
  user: User;
};

// 🔑 Normalize IDs without touching DB or data.ts
const normalizeId = (id: string | number) => Number(id);

export default function SelectionSummary({
  selections,
  menuItems,
  user,
}: SelectionSummaryProps) {
  // ✅ Correct type + safe comparison
  const getMenuItemName = (menuItemId: number) => {
    const item = menuItems.find(
      (item) => item.id === normalizeId(menuItemId)
    );
    return item?.name || 'N/A';
  };

  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h2 className="text-xl font-bold mb-2">
        Your Selections for the Week
      </h2>

      {selections.length > 0 ? (
        <ul className="space-y-2">
          {selections.map((selection) => (
            <li key={selection.id}>
              <strong>{selection.day}:</strong>{' '}
              {getMenuItemName(selection.menu_item_id)}
            </li>
          ))}
        </ul>
      ) : (
        <p>You have not made any selections yet.</p>
      )}
    </div>
  );
}
