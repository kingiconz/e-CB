// app/api/admin/selections/route.ts

// ✅ Explicitly mark this API route as dynamic (correct for APIs)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    // ✅ Safe URL usage for App Router
    const { searchParams } = new URL(req.url);
    const menuId = searchParams.get('menuId'); // optional / future use

    // 1️⃣ Get all staff users
    const allUsersQuery = `
      SELECT u.id, u.username
      FROM users u
      WHERE u.role = 'staff'
      ORDER BY u.username
    `;

    const allUsersResult = await pool.query(allUsersQuery);

    // 2️⃣ Get selections for active menus (or users with no selections)
    const selectionsQuery = `
      SELECT 
        u.id AS user_id,
        u.username,
        mi.day,
        mi.name AS food_name
      FROM selections s
      RIGHT JOIN users u ON s.user_id = u.id
      LEFT JOIN menu_items mi ON s.menu_item_id = mi.id
      LEFT JOIN menus m ON mi.menu_id = m.id
      WHERE u.role = 'staff'
        AND (m.is_active = true OR m.id IS NULL)
      ORDER BY u.username, mi.day
    `;

    const selectionsResult = await pool.query(selectionsQuery);

    // 3️⃣ Group selections by username
    const selectionsMap: Record<
      string,
      {
        userId: number;
        username: string;
        selections: Record<string, string>;
      }
    > = {};

    selectionsResult.rows.forEach((row) => {
      if (!selectionsMap[row.username]) {
        selectionsMap[row.username] = {
          userId: row.user_id,
          username: row.username,
          selections: {},
        };
      }

      if (row.day && row.food_name) {
        selectionsMap[row.username].selections[row.day] =
          row.food_name;
      }
    });

    // 4️⃣ Ensure every staff member appears in the response
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ];

    const staffSelections = allUsersResult.rows.map(
      (user) => {
        const userData =
          selectionsMap[user.username] || {
            userId: user.id,
            username: user.username,
            selections: {},
          };

        const selectionsArray = days.map(
          (day) => userData.selections[day] || null
        );

        const selectedCount = Object.keys(
          userData.selections
        ).length;

        return {
          userId: userData.userId,
          username: userData.username,
          selections: selectionsArray,
          progress: `${selectedCount}/5`,
        };
      }
    );

    return Response.json(staffSelections);
  } catch (error) {
    console.error('Error fetching selections:', error);
    return Response.json(
      { message: 'Error fetching selections' },
      { status: 500 }
    );
  }
}
