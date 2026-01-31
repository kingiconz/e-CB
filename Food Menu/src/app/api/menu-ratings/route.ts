import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          mi.name, 
          COALESCE(AVG(r.rating), 0) as average_rating,
          COUNT(r.rating) as total_ratings
        FROM menu_items mi
        LEFT JOIN ratings r ON mi.id = r.menu_item_id
        GROUP BY mi.name
        ORDER BY average_rating DESC
      `);
      return NextResponse.json(result.rows, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching menu ratings:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching menu ratings.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { menu_id, user_id, rating, comment } = await req.json();

    if (!menu_id || !user_id || !rating) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `
      INSERT INTO menu_ratings (menu_id, user_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (menu_id, user_id)
      DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, created_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [menu_id, user_id, rating, comment]
    );

    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}