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

// Sales Reports API Routes - Monthly Members
router.get('/monthly-members', async (req, res) => {
  try {
    const members = await handleDatabaseOperation(async (connection) => {
      const [rows] = await connection.query(
        `SELECT *, 
                    CASE type 
                        WHEN 'regular' THEN 950 
                        WHEN 'student' THEN 850 
                        ELSE 0 
                    END as amount,
                    renewal_amount
                FROM monthly_members 
                ORDER BY start_date`
      );
      return rows;
    }, req.app.locals.pool);
    res.json(members);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch monthly members' });
  }
});

// Sales Reports API Routes - Supplements
router.get('/supplements', async (req, res) => {
  try {
    const supplements = await handleDatabaseOperation(async (connection) => {
      const [rows] = await connection.query(`
                SELECT 
                    id, 
                    supplement_name, 
                    quantity, 
                    price, 
                    quantity_sold, 
                    (price * quantity_sold) AS total_sales,
                    total_sales
                FROM supplements 
                ORDER BY supplement_name
            `);
      return rows;
    }, req.app.locals.pool);
    res.json(supplements);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch supplements' });
  }
});

module.exports = router;