const express = require('express');
const router = express.Router();

// Enhanced error handling for database operations
const handleDatabaseOperation = async (operation, pool) => {
  const connection = await pool.getConnection();
  try {
    const result = await operation(connection);
    return result;
  } catch (error) {
    throw error;
  } finally {
    connection.release();
  }
};

// Dashboard API Routes
router.get('/total-earnings', async (req, res) => {
  try {
    const result = await handleDatabaseOperation(async (connection) => {
      // Get earnings from check-ins
      const [checkInsResults] = await connection.query(
        'SELECT SUM(amount) as total FROM check_ins'
      );

      const totalEarnings = checkInsResults[0].total || 0;

      return { total: totalEarnings };
    }, req.app.locals.pool);

    res.json(result);
  } catch (error) {
    console.error('Error fetching total earnings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attendance counts
router.get('/attendance-counts', async (req, res) => {
  try {
    const result = await handleDatabaseOperation(async (connection) => {
      // Get regular attendance count
      const [regularCount] = await connection.query(
        'SELECT COUNT(*) as count FROM check_ins WHERE client_type = "regular"'
      );

      // Get student attendance count
      const [studentCount] = await connection.query(
        'SELECT COUNT(*) as count FROM check_ins WHERE client_type = "student"'
      );

      // Get monthly members count
      const [monthlyCount] = await connection.query(
        'SELECT COUNT(*) as count FROM monthly_members WHERE status = "Active"'
      );

      const [reservationCount] = await connection.query(
        'SELECT COUNT(*) as count FROM reservation WHERE status = "active"'
      );

      return {
        regular: regularCount[0].count,
        student: studentCount[0].count,
        monthly: monthlyCount[0].count,
        reservation: reservationCount[0].count,
      };
    }, req.app.locals.pool);

    res.json(result);
  } catch (error) {
    console.error('Error fetching attendance counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chart API Routes
router.get('/monthly-members-chart', async (req, res) => {
  try {
    const members = await handleDatabaseOperation(async (connection) => {
      const [rows] = await connection.query(`
                SELECT 
                    DATE_FORMAT(start_date, '%Y-%m') as month, 
                    COUNT(*) as count 
                FROM monthly_members 
                GROUP BY month 
                ORDER BY month
            `);
      return rows;
    }, req.app.locals.pool);

    const labels = members.map((row) => row.month);
    const data = members.map((row) => row.count);

    res.json({ labels, data });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// Pie Chart API Routes
router.get('/member-counts', async (req, res) => {
  try {
    const result = await handleDatabaseOperation(async (connection) => {
      const [regularCount] = await connection.query(
        'SELECT COUNT(*) as count FROM check_ins WHERE client_type = "regular"'
      );

      const [studentCount] = await connection.query(
        'SELECT COUNT(*) as count FROM check_ins WHERE client_type = "student"'
      );

      return {
        regular: regularCount[0].count,
        student: studentCount[0].count,
      };
    }, req.app.locals.pool);

    res.json(result);
  } catch (error) {
    console.error('Error fetching member counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;