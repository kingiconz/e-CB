export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  const user = (request as any).user;

  if (!user || user.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { week_start, deadline } = await request.json();

    if (!week_start || !deadline) {
      return NextResponse.json(
        { message: 'Week start and deadline are required.' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'INSERT INTO menus (week_start, deadline) VALUES ($1, $2) RETURNING *',
      [week_start, deadline]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('Menu creation error:', error);
    return NextResponse.json(
      { message: 'An error occurred during menu creation.' },
      { status: 500 }
    );
  }
}