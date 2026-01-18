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
      const existingUser = await client.query('SELECT * FROM users WHERE username = $1', [username]);
      if (existingUser.rows.length > 0) {
        return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
      }

      const role = 'staff';
      // Placeholder password value since staff only need username
      const placeholderPassword = 'N/A';

      const result = await client.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
        [username, placeholderPassword, role]
      );
      const newUser = result.rows[0];

      const token = jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      return NextResponse.json({ token });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'An error occurred during signup.' },
      { status: 500 }
    );
  }
}