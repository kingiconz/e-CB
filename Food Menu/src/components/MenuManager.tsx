"use client";

import { useState } from "react";
import { MenuCreateResult } from "@/lib/data";

interface MenuManagerProps {
  onMenuCreated: (menu: MenuCreateResult) => void | Promise<void>;
}

export default function MenuManager({ onMenuCreated }: MenuManagerProps) {
  const [weekStart, setWeekStart] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState("");

  const handleCreateMenu = async () => {
    setMessage("");

    if (!weekStart || !deadlineDate || !deadlineTime) {
      setMessage("Please fill all fields");
      return;
    }

    const deadline = new Date(`${deadlineDate}T${deadlineTime}`);

    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_start: weekStart,
          deadline: deadline.toISOString(),
          is_active: isActive,
        }),
      });

      const data: MenuCreateResult = await res.json();

      if (!res.ok) {
        setMessage((data as any)?.message || "Failed to create menu");
        return;
      }

      // Notify parent about the newly created menu
      await onMenuCreated(data);

      // Reset form
      setWeekStart("");
      setDeadlineDate("");
      setDeadlineTime("");
      setIsActive(true);
      setMessage("Menu created successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Unexpected error occurred");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h3 className="text-lg font-semibold mb-4">Create New Weekly Menu</h3>

      {message && (
        <p
          className={`mb-4 text-sm text-center ${
            message.includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">Week Start (Monday)</label>
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Selection Deadline</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
            <input
              type="time"
              value={deadlineTime}
              onChange={(e) => setDeadlineTime(e.target.value)}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
          />
          <span>Active</span>
        </label>
      </div>

      <div className="mt-6">
        <button
          onClick={handleCreateMenu}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Create Menu
        </button>
      </div>
    </div>
  );
}
