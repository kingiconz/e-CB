export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '@/lib/config';

type Attempt = {
  count: number;
  lockedUntil: number;
};

const attempts = new Map<string, Attempt>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
  if (!config.jwtSecret) {
    console.error('JWT secret missing');
    return NextResponse.json(
      { message: 'Authentication unavailable' },
      { status: 500 }
    );
  }

  const ip = request.ip ?? 'unknown';
  const body = await request.json();

  const username = String(body.username || '')
    .trim()
    .toLowerCase();
  const password = String(body.password || '');

  if (!username || !password) {
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }

  const key = `${ip}:${username}`;
  const now = Date.now();
  const attempt = attempts.get(key);

  if (attempt && attempt.lockedUntil > now) {
    return NextResponse.json(
      { message: 'Too many attempts. Try again later.' },
      { status: 429 }
    );
  }

  try {
    const result = await pool.query(
      'SELECT id, username, password, role FROM users WHERE username = $1',
      [username]
    );

    // Constant-time behavior
    const user = result.rows[0];
    const hash = user?.password || '$2b$12$invalidinvalidinvalidinvalidinv';

    const passwordValid = await bcrypt.compare(password, hash);

    if (!user || !passwordValid) {
      recordFailure(key);
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Successful login
    attempts.delete(key);

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    return NextResponse.json({
      token,
    });
  } catch (error) {
    console.error('Login failure');
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 500 }
    );
  }
}

function recordFailure(key: string) {
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, lockedUntil: 0 };

  entry.count += 1;

  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS;
    entry.count = 0;
  }

  attempts.set(key, entry);
}
