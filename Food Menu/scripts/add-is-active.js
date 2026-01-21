const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.ubwhbaeuafvhbibkvheh:ecrimemenuplanner@aws-1-eu-north-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('Adding is_active column to menus (if not exists)...');
    await client.query("ALTER TABLE menus ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;");
    console.log('Setting existing null is_active to TRUE');
    await client.query('UPDATE menus SET is_active = TRUE WHERE is_active IS NULL;');
    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
