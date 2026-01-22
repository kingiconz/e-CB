export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    const client = await pool.connect();
    try {
      let query = 'SELECT id, week_start, deadline, created_at, is_active FROM menus';
      const params: any[] = [];
      if (active === 'true') {
        query += ' WHERE is_active = $1';
        params.push(true);
      }
      query += ' ORDER BY week_start DESC';
      const result = await client.query(query, params);
      return NextResponse.json(result.rows, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json(
      { message: 'An error occurred while fetching menus.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { week_start, deadline, is_active } = await request.json();

    if (!week_start || !deadline) {
      return NextResponse.json(
        { message: 'Week start and deadline are required.' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO menus (week_start, deadline, is_active) VALUES ($1, $2, $3) RETURNING *',
        [week_start, deadline, typeof is_active === 'boolean' ? is_active : true]
      );
      const newMenu = result.rows[0];
      return NextResponse.json(newMenu, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Menu creation error:', error);
    return NextResponse.json(
      { message: 'An error occurred during menu creation.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get('menuId');
    if (!menuId) {
      return NextResponse.json({ message: 'menuId is required' }, { status: 400 });
    }

    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json({ message: 'is_active must be boolean' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'UPDATE menus SET is_active = $1 WHERE id = $2 RETURNING *',
        [is_active, menuId]
      );
      return NextResponse.json(result.rows[0], { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Menu update error:', error);
    return NextResponse.json({ message: 'An error occurred while updating menu' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get('menuId');
    
    if (!menuId) {
      return NextResponse.json({ message: 'menuId is required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Delete related menu_items first (cascade)
      await client.query('DELETE FROM menu_items WHERE menu_id = $1', [menuId]);
      
      // Delete related selections
      await client.query(
        'DELETE FROM selections WHERE menu_item_id IN (SELECT id FROM menu_items WHERE menu_id = $1)',
        [menuId]
      );
      
      // Delete the menu
      const result = await client.query('DELETE FROM menus WHERE id = $1 RETURNING *', [menuId]);
      
      if (result.rows.length === 0) {
        return NextResponse.json({ message: 'Menu not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Menu deleted successfully', menu: result.rows[0] }, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Menu deletion error:', error);
    return NextResponse.json({ message: 'An error occurred while deleting menu' }, { status: 500 });
  }
}