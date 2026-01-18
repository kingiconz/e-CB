"use client";

import { createContext, useState, useContext } from 'react';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [menus, setMenus] = useState([]);

  const addMenu = (newMenu) => {
    setMenus(prevMenus => [...prevMenus, { ...newMenu, foodItems: [], isActive: true }]);
  };

  const updateMenu = (updatedMenu) => {
    setMenus(prevMenus => prevMenus.map(menu => menu.id === updatedMenu.id ? updatedMenu : menu));
  };

  return (
    <MenuContext.Provider value={{ menus, addMenu, updateMenu }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}