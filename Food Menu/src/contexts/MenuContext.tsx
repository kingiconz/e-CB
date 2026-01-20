"use client";

import { createContext, useState, useContext, ReactNode } from "react";

// Define your Menu type
interface Menu {
  id: string;
  name?: string;
  foodItems: any[];
  isActive: boolean;
  week_start?: string;
  deadline?: string;
}

// Define the context shape
interface MenuContextType {
  menus: Menu[];
  addMenu: (newMenu: Menu) => void;
  updateMenu: (updatedMenu: Menu) => void;
}

// Provide a type-safe default
const MenuContext = createContext<MenuContextType | undefined>(undefined);

interface MenuProviderProps {
  children: ReactNode;
}

export function MenuProvider({ children }: MenuProviderProps) {
  const [menus, setMenus] = useState<Menu[]>([]);

  const addMenu = (newMenu: Menu) => {
    setMenus(prevMenus => [...prevMenus, { ...newMenu, foodItems: [], isActive: true }]);
  };

  const updateMenu = (updatedMenu: Menu) => {
    setMenus(prevMenus =>
      prevMenus.map(menu => (menu.id === updatedMenu.id ? updatedMenu : menu))
    );
  };

  return (
    <MenuContext.Provider value={{ menus, addMenu, updateMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) throw new Error("useMenu must be used within a MenuProvider");
  return context;
}
