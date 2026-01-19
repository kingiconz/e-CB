"use client";

import { useEffect, useState } from "react";
import NavHeader from "@/components/NavHeader";
import EditMenuModal from "@/components/EditMenuModal";

interface EditMenuPageProps {
  params: {
    menuId: string;
  };
}

export default function EditMenuPage({ params }: EditMenuPageProps) {
  const [menu, setMenu] = useState({
    id: params.menuId,
    weekRange: "Week of January 12, 2026",
    isActive: true,
  });

  const handleSave = (updatedMenu: any) => {
    setMenu(updatedMenu);
    alert("Menu updated successfully!");
  };

  const handleClose = () => {
    alert("Modal closed.");
  };

  useEffect(() => {
    // Fetch menu details if needed
    // Example: fetch(`/api/menus/${params.menuId}`).then(...)
  }, [params.menuId]);

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
