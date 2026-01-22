export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

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

    console.log('Received POST request with data:', { selections, userId, menuId });

    if (!selections || !userId || !menuId) {
      return NextResponse.json(
        { message: 'selections, userId, and menuId are required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const insertedSelections: any[] = [];

      const activeMenu = await client.query(
        'SELECT week_start FROM menus WHERE id = $1',
        [menuId]
      );

      if (!activeMenu.rows.length) {
        throw new Error('Active menu not found');
      }

      const weekStart = activeMenu.rows[0].week_start;

      for (const day in selections) {
        const menuItemId = selections[day];
        if (!menuItemId) continue;

        const today = new Date().toISOString().split('T')[0];
        const selectionDate = new Date(weekStart);

        // Adjust selectionDate based on the day selected
        const dayOffset = daysOfWeek.indexOf(day);
        if (dayOffset >= 0) {
          selectionDate.setDate(selectionDate.getDate() + dayOffset);
        }

        const formattedDate = selectionDate.toISOString().split('T')[0];

        console.log(`Processing selection: Day - ${day}, MenuItemId - ${menuItemId}, SelectionDate - ${formattedDate}`);

        // Check if selection already exists for this user and day
        const existing = await client.query(
          'SELECT id FROM selections WHERE user_id = $1 AND selection_date = $2',
          [userId, formattedDate]
        );

        console.log('Existing selection query result:', existing.rows);

        if (existing.rows.length > 0) {
          console.log(`Updating existing selection for Day - ${day}, UserId - ${userId}`);
          const result = await client.query(
            'UPDATE selections SET menu_item_id = $1 WHERE user_id = $2 AND selection_date = $3 RETURNING *',
            [menuItemId, userId, formattedDate]
          );
          console.log('Update query result:', result.rows);
          if (result.rows.length > 0) insertedSelections.push(result.rows[0]);
        } else {
          console.log(`Inserting new selection for Day - ${day}, UserId - ${userId}`);
          const result = await client.query(
            'INSERT INTO selections (user_id, menu_item_id, selection_date) VALUES ($1, $2, $3) RETURNING *',
            [userId, menuItemId, formattedDate]
          );
          console.log('Insert query result:', result.rows);
          if (result.rows.length > 0) insertedSelections.push(result.rows[0]);
        }
      }

      console.log('Final inserted selections:', insertedSelections);
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