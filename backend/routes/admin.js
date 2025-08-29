const express = require('express');
const { AuthController } = require('../controllers');
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

// Admin Authentication Routes
router.post('/login', AuthController.adminLogin);
router.post('/logout', AuthController.adminLogout);

// Admin Reservation API Routes
router.get('/reservations', async (req, res) => {
  try {
    const reservations = await handleDatabaseOperation(async (connection) => {
      const [rows] = await connection.query(
        `SELECT 
                    id,
                    service_type,
                    customer_name,
                    DATE_FORMAT(start_time, '%h:%i %p') as start_time,
                    DATE_FORMAT(end_time, '%h:%i %p') as end_time,
                    DATE_FORMAT(reservation_date, '%Y-%m-%d') as reservation_date,
                    additional_members,
                    price,
                    status
                FROM fitworx_gym_db.reservation
                ORDER BY reservation_date`
      );
      return rows;
    }, req.app.locals.pool);
    res.json(reservations);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

router.delete('/reservations/:id', async (req, res) => {
  try {
    await handleDatabaseOperation(async (connection) => {
      await connection.query(
        'DELETE FROM fitworx_gym_db.reservation WHERE id = ?',
        [req.params.id]
      );
    }, req.app.locals.pool);
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to delete reservation' });
  }
});

module.exports = router;