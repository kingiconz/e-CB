import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { week_start, deadline } = await request.json();

    if (!week_start || !deadline) {
      return NextResponse.json(
        { message: 'Week start and deadline are required.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO menus (week_start, deadline) VALUES ($1, $2) RETURNING *',
        [week_start, deadline]
      );
      const newMenu = result.rows[0];
      return NextResponse.json(newMenu, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Menu creation error:', error);
    return NextResponse.json(
      { message: 'An error occurred during menu creation.' },
      { status: 500 }
    );
  }
}