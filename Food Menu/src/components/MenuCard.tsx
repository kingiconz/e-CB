import { MenuItem, Day } from '@/lib/data';

type MenuCardProps = {
  day: Day;
  items: MenuItem[];
  onSelection: (day: Day, itemId: number) => void; // use number
  selectedItem?: number;
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
              id={`item-${item.id}`} // HTML id must be string
              name={day}
              value={item.id}
              className="mr-2"
              onChange={() => onSelection(day, item.id)} // pass number
              checked={selectedItem === item.id}
            />
            <label htmlFor={`item-${item.id}`}>{item.name}</label>
          </div>
        ))}
      </div>
    </div>
  );
}
