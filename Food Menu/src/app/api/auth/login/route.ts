export const runtime = 'nodejs';


import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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
      const result = await client.query('SELECT * FROM users WHERE username = $1 AND role = $2', [username, 'staff']);
      const user = result.rows[0];

      if (!user) {
        return NextResponse.json({ message: 'Staff user not found.' }, { status: 401 });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
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