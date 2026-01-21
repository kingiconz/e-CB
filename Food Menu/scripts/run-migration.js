const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:e-CBmenuplanner@db.zyhgizfsgrayfdccnhae.supabase.co:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Starting migration...');
    
    // Drop selections table
    console.log('Dropping selections table...');
    await client.query('DROP TABLE IF EXISTS selections CASCADE;');
    
    // Drop menu_items table
    console.log('Dropping menu_items table...');
    await client.query('DROP TABLE IF EXISTS menu_items CASCADE;');
    
    // Create new menu_items table
    console.log('Creating menu_items table...');
    await client.query(`
      CREATE TABLE menu_items (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        day VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Recreate selections table
    console.log('Recreating selections table...');
    await client.query(`
      CREATE TABLE selections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
        selection_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, selection_date)
      );
    `);
    
    console.log('✓ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
