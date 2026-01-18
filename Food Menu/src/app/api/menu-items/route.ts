import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get('menuId');

    if (!menuId) {
      return NextResponse.json(
        { message: 'Menu ID is required.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id, menu_id, name, description, day, created_at FROM menu_items WHERE menu_id = $1 ORDER BY day, id',
        [menuId]
      );
      return NextResponse.json(result.rows, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching menu items.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { menu_id, name, description, day } = await request.json();

    if (!menu_id || !name || !day) {
      return NextResponse.json(
        { message: 'Menu ID, name, and day are required.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO menu_items (menu_id, name, description, day) VALUES ($1, $2, $3, $4) RETURNING *',
        [menu_id, name, description || null, day]
      );
      const newItem = result.rows[0];
      return NextResponse.json(newItem, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Menu item creation error:', error);
    return NextResponse.json(
      { message: 'An error occurred during menu item creation.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { message: 'Item ID is required.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      await client.query('DELETE FROM menu_items WHERE id = $1', [itemId]);
      return NextResponse.json({ message: 'Item deleted successfully' }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Menu item deletion error:', error);
    return NextResponse.json(
      { message: 'An error occurred during menu item deletion.' },
      { status: 500 }
    );
  }
}
