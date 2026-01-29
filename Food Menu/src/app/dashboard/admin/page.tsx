/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import MenuManager from "@/components/MenuManager";
import EditMenuModal from "@/components/EditMenuModal";
import { Menu, MenuCreateResult } from "@/lib/data";

export default function AdminDashboard() {
  const [showMenuManager, setShowMenuManager] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMenus = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/menus");
      if (!res.ok) throw new Error("Failed to fetch menus");
      const data: Menu[] = await res.json();
      setMenus(data);
    } catch (err) {
      console.error(err);
      setError("An error occurred while fetching menus");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleMenuCreated = (menu: MenuCreateResult) => {
    const newMenu: Menu = {
      id: menu.id,
      week_start: menu.week_start,
      deadline: menu.deadline,
      is_active: menu.is_active,
    };
    setMenus((prev) => [newMenu, ...prev]);
    setShowMenuManager(false);
  };

  const handleMenuUpdate = (updatedMenu: Menu) => {
    setMenus((prev) =>
      prev.map((menu) => (menu.id === updatedMenu.id ? updatedMenu : menu))
    );
    setEditingMenu(null);
  };

  const handleDeleteMenu = async (menuId: number) => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/menus?menuId=${menuId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete menu");
      }
      setMenus((prev) => prev.filter((menu) => menu.id !== menuId));
      setDeleteConfirm(null);
      setError("");
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <>
      {showMenuManager && (
        <MenuManager onMenuCreated={handleMenuCreated} />
      )}

      {editingMenu && (
        <EditMenuModal
          menu={editingMenu}
          onClose={() => setEditingMenu(null)}
          onSave={handleMenuUpdate}
        />
      )}

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Manage Menu</h1>
            <p className="text-gray-600 text-sm mt-1">Create, edit, or delete menu</p>
          </div>
          <button
            onClick={() => setShowMenuManager(!showMenuManager)}
            className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            New Menu
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-gray-600 mb-3"></div>
              <p className="text-gray-600 text-sm">Loading menu...</p>
            </div>
          </div>
        ) : menus.length === 0 ? (
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-700 font-medium">No menu yet</p>
            <p className="text-gray-600 text-sm mt-1">Click "New Menu" to create your first menu</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Week</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Deadline</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {menus.map((menu) => (
                    <tr key={menu.id} className="hover:bg-gray-50">
                      <td onClick={() => setEditingMenu(menu)} className="px-6 py-4 cursor-pointer">
                        <p className="font-medium text-gray-900 text-sm">Week of {formatDate(menu.week_start)}</p>
                      </td>
                      <td className="px-6 py-4"><p className="text-gray-600 text-sm">{formatDate(menu.deadline)}</p></td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${menu.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                          {menu.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {deleteConfirm === menu.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleDeleteMenu(menu.id)}
                              disabled={deleting}
                              className="px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                            >
                              {deleting ? "Deleting..." : "Delete"}
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              disabled={deleting}
                              className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingMenu(menu)} className="px-3 py-1 text-blue-600 text-xs font-medium hover:bg-blue-50 rounded transition-colors">Edit</button>
                            <button onClick={() => setDeleteConfirm(menu.id)} className="px-3 py-1 text-red-600 text-xs font-medium hover:bg-red-50 rounded transition-colors">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
