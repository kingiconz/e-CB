import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const menuId = searchParams.get('menuId');

    if (!userId || !menuId) {
      return NextResponse.json(
        { message: 'userId and menuId are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // Fetch selections for this user on this menu with food item details
      const result = await client.query(
        `SELECT s.id, s.user_id, s.menu_item_id, s.selection_date,
                mi.name, mi.description, mi.day
         FROM selections s
         JOIN menu_items mi ON s.menu_item_id = mi.id
         WHERE s.user_id = $1 AND mi.menu_id = $2
         ORDER BY mi.day`,
        [userId, menuId]
      );
      return NextResponse.json(result.rows, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching selections:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching selections.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { selections, userId, menuId } = await request.json();

    if (!selections || !userId || !menuId) {
      return NextResponse.json(
        { message: 'selections, userId, and menuId are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      // selections = { Monday: itemId, Tuesday: itemId, ... }
      const insertedSelections: any[] = [];

      for (const day in selections) {
        const menuItemId = selections[day];
        if (!menuItemId) continue;

        // Get today's date
        const today = new Date().toISOString().split('T')[0];

        // Check if selection already exists for this user and day
        const existing = await client.query(
          'SELECT id FROM selections WHERE user_id = $1 AND menu_item_id IN (SELECT id FROM menu_items WHERE menu_id = $2 AND day = $3)',
          [userId, menuId, day]
        );

        if (existing.rows.length > 0) {
          // Update existing
          const result = await client.query(
            'UPDATE selections SET menu_item_id = $1 WHERE user_id = $2 AND selection_date = $3 AND menu_item_id IN (SELECT id FROM menu_items WHERE day = $4) RETURNING *',
            [menuItemId, userId, today, day]
          );
          if (result.rows.length > 0) insertedSelections.push(result.rows[0]);
        } else {
          // Insert new
          const result = await client.query(
            'INSERT INTO selections (user_id, menu_item_id, selection_date) VALUES ($1, $2, $3) RETURNING *',
            [userId, menuItemId, today]
          );
          if (result.rows.length > 0) insertedSelections.push(result.rows[0]);
        }
      }

      return NextResponse.json(
        { message: 'Selections saved successfully', selections: insertedSelections },
        { status: 201 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Selections error:', error);
    return NextResponse.json(
      { message: 'An error occurred while saving selections.' },
      { status: 500 }
    );
  }
}