import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Check if username already exists
      const existingUser = await client.query('SELECT * FROM users WHERE username = $1', [username]);
      if (existingUser.rows.length > 0) {
        return NextResponse.json({ message: 'Username already exists.' }, { status: 409 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const role = 'admin';

      const result = await client.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id, username, role',
        [username, hashedPassword, role]
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
    console.error('Admin signup error:', error);
    return NextResponse.json(
      { message: 'An error occurred during admin signup.' },
      { status: 500 }
    );
  }
}