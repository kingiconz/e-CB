"use client";

import MenuManager from "@/components/MenuManager";
import { MenuCreateResult } from "@/lib/data";

export default function CreateMenuPage() {
  const handleMenuCreated = async (newMenu: MenuCreateResult) => {
    console.log("Menu created:", newMenu);
    // Later: redirect, toast, or refresh menu list
  };

  return (
    <div className="p-6">
      <MenuManager onMenuCreated={handleMenuCreated} />
    </div>
  );
}
