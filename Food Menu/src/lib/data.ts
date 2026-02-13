// src/lib/data.ts

export type User = {
  id: string;
  name: string;
  staff_id: string;
  department: string;
  email: string;
  role: "admin" | "staff";
};

export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday";

/**
 * EXACT match to menu_items table
 */
export type MenuItem = {
  id: number;
  menu_id: number;
  name: string;
  description: string | null;
  day: Day;
};

/**
 * EXACT match to menus table (joined version)
 */
export type Menu = {
  id: number;
  week_start: string;     // ISO string from API
  deadline: string;       // ISO string from API
  is_active: boolean;
};

/**
 * Used ONLY when creating a menu
 */
export type MenuCreateResult = {
  id: number;
  week_start: string;
  deadline: string;
  is_active: boolean;
};

export type FoodSelection = {
  id: number;
  user_id: number;
  menu_item_id: number;
  day: Day;
  selected_at: string;
};

