import { NextResponse } from 'next/server';
import pool  from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT
        mr.id,
        mr.rating,
        mr.comment,
        mr.created_at,
        u.username,
        m.week_start
      FROM menu_ratings mr
      LEFT JOIN users u ON mr.user_id = u.id
      LEFT JOIN menus m ON mr.menu_id = m.id
      ORDER BY mr.created_at DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching menu ratings:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching menu ratings.' },
      { status: 500 }
    );
  }
}