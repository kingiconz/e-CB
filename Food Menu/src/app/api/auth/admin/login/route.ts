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
      // Admin login - requires both username and password
      const result = await client.query('SELECT * FROM users WHERE username = $1 AND role = $2', [username, 'admin']);
      const user = result.rows[0];

      if (!user) {
        return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
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
    console.error('Admin login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login.' },
      { status: 500 }
    );
  }
}
