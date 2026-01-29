export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT sd.id, sd.full_name as username
        FROM staff_directory sd
        LEFT JOIN users u ON sd.full_name = u.username
        WHERE u.id IS NULL
        ORDER BY sd.full_name
      `);
      const users = result.rows;
      return NextResponse.json(users);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching eligible staff:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching eligible staff.' },
      { status: 500 }
    );
  }
}