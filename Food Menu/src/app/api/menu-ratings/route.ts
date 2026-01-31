import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import  pool  from '@/lib/db';

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