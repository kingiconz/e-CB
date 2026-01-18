export type User = {
  id: string;
  name: string;
  staff_id: string;
  department: string;
  email: string;
  role: 'admin' | 'staff';
};

export type MenuItem = {
  id: string;
  menu_id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  food_name: string;
};

export type Menu = {
  id: string;
  week_start_date: Date;
  week_end_date: Date;
  items: MenuItem[];
};

export type FoodSelection = {
  id: string;
  user_id: string;
  menu_item_id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  week: string; // e.g., "2024-W21"
  selected_at: Date;
};


// Mock Data

export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    staff_id: 'A001',
    department: 'IT',
    email: 'admin@example.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Staff User 1',
    staff_id: 'S001',
    department: 'HR',
    email: 'staff1@example.com',
    role: 'staff',
  },
    {
    id: '3',
    name: 'Staff User 2',
    staff_id: 'S002',
    department: 'Finance',
    email: 'staff2@example.com',
    role: 'staff',
  },
];

export const menus: Menu[] = [
  {
    id: 'menu-1',
    week_start_date: new Date('2024-05-20'),
    week_end_date: new Date('2024-05-24'),
    items: [
      { id: 'item-1-mon', menu_id: 'menu-1', day: 'Monday', food_name: 'Chicken Rice' },
      { id: 'item-1-tue', menu_id: 'menu-1', day: 'Tuesday', food_name: 'Nasi Lemak' },
      { id: 'item-1-wed', menu_id: 'menu-1', day: 'Wednesday', food_name: 'Spaghetti Bolognese' },
      { id: 'item-1-thu', menu_id: 'menu-1', day: 'Thursday', food_name: 'Fish and Chips' },
      { id: 'item-1-fri', menu_id: 'menu-1', day: 'Friday', food_name: 'Pizza' },
    ],
  },
];

export const foodSelections: FoodSelection[] = [];