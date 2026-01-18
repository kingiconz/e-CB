import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { message: 'Username is required.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Staff login - only username required
      const result = await client.query('SELECT * FROM users WHERE username = $1 AND role = $2', [username, 'staff']);
      const user = result.rows[0];

      if (!user) {
        return NextResponse.json({ message: 'Staff user not found.' }, { status: 401 });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      return NextResponse.json({ token });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login.' },
      { status: 500 }
    );
  }
}