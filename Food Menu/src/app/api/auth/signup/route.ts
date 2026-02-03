export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '@/lib/config';

export async function POST(request: Request) {
  let client;

  try {
    if (!config.jwtSecret) {
      throw new Error('JWT secret not configured');
    }

    const body = await request.json();

    const rawName = String(body.username || '');
    const password = String(body.password || '');

    const username = rawName.trim().toLowerCase();

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Invalid signup request.' },
        { status: 400 }
      );
    }

    // Strong password (signup only)
    const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;


    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { message: 'Password does not meet security requirements.' },
        { status: 400 }
      );
    }

    client = await pool.connect();

    /**
     * Eligibility check
     * Normalize full_name comparison to avoid case/space bypass
     * No data leakage
     */
    const staffCheck = await client.query(
      `
      SELECT 1
      FROM staff_directory
      WHERE LOWER(TRIM(full_name)) = $1
      `,
      [username]
    );

    if (staffCheck.rowCount === 0) {
      return NextResponse.json(
        { message: 'Signup not permitted.' },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let newUser;

    try {
      const result = await client.query(
        `
        INSERT INTO users (username, password, role)
        VALUES ($1, $2, 'staff')
        RETURNING id, username, role
        `,
        [username, hashedPassword]
      );

      newUser = result.rows[0];
    } catch (err: any) {
      /**
       * Covers:
       * - Duplicate usernames
       * - Race conditions
       */
      if (err.code === '23505') {
        return NextResponse.json(
          { message: 'Signup not permitted.' },
          { status: 409 }
        );
      }
      throw err;
    }

    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Signup failed');

    return NextResponse.json(
      { message: 'Unable to process signup request.' },
      { status: 500 }
    );
  } finally {
    client?.release();
  }
}
