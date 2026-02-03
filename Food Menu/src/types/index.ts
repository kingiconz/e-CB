export interface Menu {
  id: string | number;
  week_start: string;
  deadline: string;
  is_active?: boolean;
}

export interface MenuItem {
  id: string | number;
  menu_id: string | number;
  name: string;
  description: string | null;
  day: string;
  type: 'main_course' | 'dessert';
}