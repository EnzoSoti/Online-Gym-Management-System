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

// Check-in API Routes
router.get('/', async (req, res) => {
  try {
    const checkIns = await handleDatabaseOperation(async (connection) => {
      const [rows] = await connection.query(
        `SELECT *, 
                    CASE client_type
                        WHEN 'regular' THEN 70
                        WHEN 'student' THEN 60
                        ELSE 0
                    END as amount 
                FROM check_ins 
                ORDER BY time_in`
      );
      return rows;
    }, req.app.locals.pool);
    res.json(checkIns);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch check-ins' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { client_type, client_name, time_in } = req.body;

    if (!client_type || !client_name || !time_in) {
      return res.status(400).json({
        error: 'Client type, name, and time are required',
      });
    }

    // Calculate amount based on client_type
    const amount =
      client_type === 'regular' ? 70 : client_type === 'student' ? 60 : 0;

    const result = await handleDatabaseOperation(async (connection) => {
      const [insertResult] = await connection.query(
        'INSERT INTO check_ins (client_type, client_name, time_in, amount) VALUES (?, ?, ?, ?)',
        [client_type, client_name, time_in, amount]
      );
      return insertResult;
    }, req.app.locals.pool);

    res.status(201).json({
      message: 'Check-in recorded successfully',
      checkInId: result.insertId,
      amount: amount,
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to record check-in' });
  }
});

// Get regular check-ins
router.get('/regular', async (req, res) => {
  try {
    const regularCheckIns = await handleDatabaseOperation(
      async (connection) => {
        const [rows] = await connection.query(
          `SELECT 
                    id,
                    client_type,
                    client_name,
                    DATE_FORMAT(time_in, '%Y-%m-%d %H:%i:%s') as time_in,
                    70 as amount 
                FROM check_ins 
                WHERE client_type = 'regular'
                ORDER BY time_in`
        );
        return rows;
      }, req.app.locals.pool
    );
    res.json(regularCheckIns);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch regular check-ins' });
  }
});

// Get student check-ins
router.get('/student', async (req, res) => {
  try {
    const studentCheckIns = await handleDatabaseOperation(
      async (connection) => {
        const [rows] = await connection.query(
          `SELECT 
                    id,
                    client_type,
                    client_name,
                    DATE_FORMAT(time_in, '%Y-%m-%d %H:%i:%s') as time_in,
                    60 as amount 
                FROM check_ins 
                WHERE client_type = 'student'
                ORDER BY time_in`
        );
        return rows;
      }, req.app.locals.pool
    );
    res.json(studentCheckIns);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch student check-ins' });
  }
});

module.exports = router;