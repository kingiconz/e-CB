import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    return NextResponse.json({
      message: 'Database connection successful!',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { message: 'Database connection failed.', error: (error as Error).message },
      { status: 500 }
    );
  }
}