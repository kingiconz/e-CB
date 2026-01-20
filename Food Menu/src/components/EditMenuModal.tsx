"use client";

import { useState, useEffect } from "react";
import { Menu, MenuItem, Day } from "@/lib/data";

interface EditMenuModalProps {
  menu: Menu;
  onClose: () => void;
  onSave: (updatedMenu: Menu) => void;
}

export default function EditMenuModal({ menu, onClose, onSave }: EditMenuModalProps) {
  const [menuItems, setMenuItems] = useState<Record<Day, MenuItem[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodDesc, setNewFoodDesc] = useState("");
  const [newDessertName, setNewDessertName] = useState("");
  const [newDessertDesc, setNewDessertDesc] = useState("");
  const [newDay, setNewDay] = useState<Day>("Monday");

  const days: Day[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Fetch existing menu items
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/menu-items?menuId=${menu.id}`);
        if (!res.ok) throw new Error("Failed to fetch menu items");
        const items: MenuItem[] = await res.json();

        const grouped: Record<Day, MenuItem[]> = {
          Monday: [],
          Tuesday: [],
          Wednesday: [],
          Thursday: [],
          Friday: [],
        };
        items.forEach((item) => {
          grouped[item.day].push(item);
        });
        setMenuItems(grouped);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, [menu.id]);

  // Add new food/dessert
  const handleAddItem = async () => {
    if (!newFoodName.trim() && !newDessertName.trim()) return;

    const itemsToAdd: Omit<MenuItem, "id">[] = [];

    if (newFoodName.trim()) {
      itemsToAdd.push({
        menu_id: menu.id,
        day: newDay,
        name: newFoodName,
        description: newFoodDesc || null,
      });
    }

    if (newDessertName.trim()) {
      itemsToAdd.push({
        menu_id: menu.id,
        day: newDay,
        name: newDessertName,
        description: newDessertDesc || null,
      });
    }

    try {
      const res = await fetch("/api/menu-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menu_id: menu.id, items: itemsToAdd }), // Include menu_id at the top level
      });

      if (!res.ok) throw new Error("Failed to add menu items");

      const savedItems: MenuItem[] = await res.json();

      setMenuItems((prev) => ({
        ...prev,
        [newDay]: [...prev[newDay], ...savedItems],
      }));

      setNewFoodName("");
      setNewFoodDesc("");
      setNewDessertName("");
      setNewDessertDesc("");
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  // Delete menu item
  const handleDeleteItem = async (day: Day, itemId: number) => {
    try {
      const res = await fetch(`/api/menu-items?itemId=${itemId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete item");

      setMenuItems((prev) => ({
        ...prev,
        [day]: prev[day].filter((item) => item.id !== itemId),
      }));
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Menu</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {isLoading ? <p>Loading menu items...</p> : null}

        {/* Add new item */}
        <div className="mb-6 border p-4 rounded bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Day</label>
            <select value={newDay} onChange={(e) => setNewDay(e.target.value as Day)} className="w-full border px-2 py-1 rounded">
              {days.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Food Name</label>
            <input type="text" value={newFoodName} onChange={(e) => setNewFoodName(e.target.value)} className="w-full border px-2 py-1 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Food Description</label>
            <input type="text" value={newFoodDesc} onChange={(e) => setNewFoodDesc(e.target.value)} className="w-full border px-2 py-1 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dessert Name</label>
            <input type="text" value={newDessertName} onChange={(e) => setNewDessertName(e.target.value)} className="w-full border px-2 py-1 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Dessert Description</label>
            <input type="text" value={newDessertDesc} onChange={(e) => setNewDessertDesc(e.target.value)} className="w-full border px-2 py-1 rounded" />
          </div>
          <div className="flex items-end">
            <button onClick={handleAddItem} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">Add</button>
          </div>
        </div>

        {/* Menu items per day */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {days.map((day) => (
            <div key={day} className="border rounded p-3">
              <h4 className="font-semibold mb-2">{day}</h4>
              {menuItems[day].length === 0 ? (
                <p className="text-sm text-gray-500">No items</p>
              ) : (
                <ul className="space-y-2">
                  {menuItems[day].map((item) => (
                    <li key={item.id} className="flex justify-between items-center border rounded p-2 bg-gray-50">
                      <div>
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
                      </div>
                      <button onClick={() => handleDeleteItem(day, item.id)} className="text-red-600 hover:text-red-800">Delete</button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Close</button>
          <button onClick={() => onSave(menu)} className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
