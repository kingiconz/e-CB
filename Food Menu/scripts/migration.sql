-- Migration: Update menu_items table to link with menus and add day column

-- Drop the selections table first (since it references menu_items)
DROP TABLE IF EXISTS selections;

-- Drop the old menu_items table
DROP TABLE IF EXISTS menu_items;

-- Recreate menu_items with the new schema
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    day VARCHAR(20) NOT NULL, -- Monday, Tuesday, Wednesday, Thursday, Friday
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recreate selections table
CREATE TABLE selections (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
    selection_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, selection_date)
);

-- Add is_active column to menus table
ALTER TABLE menus ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
