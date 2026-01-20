"use client";

import { useEffect, useState } from "react";
import NavHeader from "@/components/NavHeader";
import EditMenuModal from "@/components/EditMenuModal";
import { Menu } from "@/lib/data";

interface EditMenuPageProps {
  params: {
    menuId: string;
  };
}

export default function EditMenuPage({ params }: EditMenuPageProps) {
  const [menu, setMenu] = useState<Menu | null>(null);

  // Fetch menu details on mount
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`/api/menus/${params.menuId}`);
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data: Menu = await res.json();
        setMenu(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMenu();
  }, [params.menuId]);

  const handleSave = (updatedMenu: Menu) => {
    setMenu(updatedMenu);
    alert("Menu updated successfully!");
  };

  const handleClose = () => {
    alert("Modal closed.");
  };

  if (!menu) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <NavHeader />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EditMenuModal
          menu={menu}
          onClose={handleClose}
          onSave={handleSave}
        />
      </main>
    </div>
  );
}
