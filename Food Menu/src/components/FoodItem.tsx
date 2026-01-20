"use client";

interface FoodItemProps {
  item: {
    id: string | number;
    name: string;
    day: string;
    description?: string | null;
  };
}

export default function FoodItem({ item }: FoodItemProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold">{item.name}</p>
          <p className="text-sm text-gray-500">{item.day}</p>
          {item.description && (
            <p className="text-gray-600 mt-2">{item.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
