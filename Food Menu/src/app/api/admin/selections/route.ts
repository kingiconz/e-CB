import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const menuId = searchParams.get('menuId');

    // First, get all staff users
    const allUsersQuery = `
      SELECT u.id, u.username
      FROM users u
      WHERE u.role = 'staff'
      ORDER BY u.username
    `;

    const allUsersResult = await pool.query(allUsersQuery);

    // Get all selections from active menus with food details
    let selectionsQuery = `
      SELECT 
        u.id as user_id,
        u.username,
        mi.day,
        mi.name as food_name
      FROM selections s
      RIGHT JOIN users u ON s.user_id = u.id
      LEFT JOIN menu_items mi ON s.menu_item_id = mi.id
      LEFT JOIN menus m ON mi.menu_id = m.id
      WHERE u.role = 'staff' AND (m.is_active = true OR m.id IS NULL)
      ORDER BY u.username, mi.day
    `;

    const selectionsResult = await pool.query(selectionsQuery);

    // Transform the data to group by user and day
    const selectionsMap: Record<string, Record<string, any>> = {};

    selectionsResult.rows.forEach(row => {
      if (!selectionsMap[row.username]) {
        selectionsMap[row.username] = {
          userId: row.user_id,
          username: row.username,
          selections: {}
        };
      }
      if (row.day && row.food_name) {
        selectionsMap[row.username].selections[row.day] = row.food_name;
      }
    });

    // Format the response with all staff members
    const staffSelections = allUsersResult.rows.map(user => {
      const userData = selectionsMap[user.username] || {
        userId: user.id,
        username: user.username,
        selections: {}
      };

      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const selectionsArray = days.map(day => userData.selections[day] || null);
      const selectedCount = Object.keys(userData.selections).length;

      return {
        userId: userData.userId,
        username: userData.username,
        selections: selectionsArray,
        progress: `${selectedCount}/5`
      };
    });

    return Response.json(staffSelections);
  } catch (error) {
    console.error('Error fetching selections:', error);
    return Response.json(
      { message: 'Error fetching selections' },
      { status: 500 }
    );
  }
}
