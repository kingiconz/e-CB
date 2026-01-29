export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT id, username FROM users WHERE role = 'staff' ORDER BY username");
      const users = result.rows;
      return NextResponse.json(users);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching staff users:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching staff users.' },
      { status: 500 }
    );
  }
}