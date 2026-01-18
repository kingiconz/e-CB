import { MenuItem } from '@/lib/data';

type MenuCardProps = {
  day: string;
  items: MenuItem[];
  onSelection: (day: string, itemId: string) => void;
  selectedItem?: string;
};

export default function MenuCard({ day, items, onSelection, selectedItem }: MenuCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-md">
      <h2 className="text-xl font-bold mb-2">{day}</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center">
            <input
              type="radio"
              id={item.id}
              name={day}
              value={item.id}
              className="mr-2"
              onChange={() => onSelection(day, item.id)}
              checked={selectedItem === item.id}
            />
            <label htmlFor={item.id}>{item.food_name}</label>
          </div>
        ))}
      </div>
    </div>
  );
}