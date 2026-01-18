import pool from '@/lib/db';

export async function GET(req: Request) {
  try {
    // Get total staff members
    const staffCountResult = await pool.query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'staff'`
    );
    const totalStaff = parseInt(staffCountResult.rows[0].count);

    // Get active menu and its items count
    const activeMenuResult = await pool.query(
      `SELECT id FROM menus WHERE is_active = true LIMIT 1`
    );
    
    let totalMenuItems = 0;
    let activeMenuId = null;

    if (activeMenuResult.rows.length > 0) {
      activeMenuId = activeMenuResult.rows[0].id;
      const itemCountResult = await pool.query(
        `SELECT COUNT(*) as count FROM menu_items WHERE menu_id = $1`,
        [activeMenuId]
      );
      totalMenuItems = parseInt(itemCountResult.rows[0].count);
    }

    // Get total selections made
    const selectionsCountResult = await pool.query(
      `SELECT COUNT(*) as count FROM selections WHERE menu_item_id IN (
        SELECT id FROM menu_items WHERE menu_id = (
          SELECT id FROM menus WHERE is_active = true LIMIT 1
        )
      )`
    );
    const totalSelections = parseInt(selectionsCountResult.rows[0].count);

    // Get staff with complete selections (5/5 days)
    const completeProfilesResult = await pool.query(
      `SELECT COUNT(DISTINCT user_id) as count FROM selections 
       WHERE menu_item_id IN (
         SELECT id FROM menu_items WHERE menu_id = (
           SELECT id FROM menus WHERE is_active = true LIMIT 1
         )
       )
       GROUP BY user_id
       HAVING COUNT(*) = 5`
    );
    const completeProfiles = completeProfilesResult.rows.length;

    // Get selection details for the table
    const selectionsDetailsResult = await pool.query(
      `SELECT 
        u.id,
        u.username,
        mi.day,
        mi.name as food_name
      FROM selections s
      RIGHT JOIN users u ON s.user_id = u.id
      LEFT JOIN menu_items mi ON s.menu_item_id = mi.id
      LEFT JOIN menus m ON mi.menu_id = m.id
      WHERE u.role = 'staff' AND (m.is_active = true OR m.id IS NULL)
      ORDER BY u.username, mi.day`
    );

    // Transform selection details to grouped format
    const selectionsMap: Record<string, Record<string, any>> = {};
    selectionsDetailsResult.rows.forEach(row => {
      if (!selectionsMap[row.username]) {
        selectionsMap[row.username] = {
          userId: row.id,
          username: row.username,
          selections: {}
        };
      }
      if (row.day && row.food_name) {
        selectionsMap[row.username].selections[row.day] = row.food_name;
      }
    });

    // Get all staff members
    const allStaffResult = await pool.query(
      `SELECT u.id, u.username FROM users u WHERE u.role = 'staff' ORDER BY u.username`
    );

    const staffSelections = allStaffResult.rows.map(user => {
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

    // Calculate overall progress percentage
    const maxPossibleSelections = totalStaff * 5;
    const progressPercentage = maxPossibleSelections > 0 ? (totalSelections / maxPossibleSelections) * 100 : 0;

    return Response.json({
      totalStaff,
      totalMenuItems,
      totalSelections,
      completeProfiles,
      progressPercentage: Math.round(progressPercentage),
      staffSelections,
      maxPossibleSelections
    });
  } catch (error) {
    console.error('Error fetching overview data:', error);
    return Response.json(
      { message: 'Error fetching overview data' },
      { status: 500 }
    );
  }
}
