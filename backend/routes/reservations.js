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

// Customer reservation booking API Routes
router.post('/', async (req, res) => {
  try {
    const {
      service_type,
      customer_name,
      start_time,
      end_time,
      reservation_date,
      additional_members = [], // Default to an empty array
      price, // Add price to the request body
    } = req.body;

    // Validation
    if (
      !service_type ||
      !customer_name ||
      !start_time ||
      !end_time ||
      !reservation_date ||
      !price
    ) {
      return res.status(400).json({
        error: 'Required fields missing',
        details:
          'Service type, customer name, start time, end time, date, and price are required',
      });
    }

    // Process additional_members to remove square brackets and separate names with a comma
    const processedAdditionalMembers = additional_members.join(', ');

    // Check for time slot conflicts
    const result = await handleDatabaseOperation(async (connection) => {
      // First check for existing reservations in the same time slot
      const [conflicts] = await connection.query(
        `SELECT * FROM reservation 
                 WHERE reservation_date = ? 
                 AND ((start_time BETWEEN ? AND ?) 
                 OR (end_time BETWEEN ? AND ?)
                 OR (? BETWEEN start_time AND end_time))`,
        [
          reservation_date,
          start_time,
          end_time,
          start_time,
          end_time,
          start_time,
        ]
      );

      if (conflicts.length > 0) {
        throw new Error('Time slot conflict');
      }

      // If no conflicts, proceed with insertion
      const [insertResult] = await connection.query(
        `INSERT INTO reservation 
                 (service_type, customer_name, start_time, end_time, reservation_date, additional_members, created_at, price) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
          service_type,
          customer_name,
          start_time,
          end_time,
          reservation_date,
          processedAdditionalMembers,
          price,
        ]
      );

      return insertResult;
    }, req.app.locals.pool);

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservationId: result.insertId,
    });
  } catch (error) {
    console.error('Reservation error:', error);

    if (error.message === 'Time slot conflict') {
      res.status(409).json({
        success: false,
        error: 'This time slot is already booked',
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create reservation',
        details: error.message,
      });
    }
  }
});

router.get('/', async (req, res) => {
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
                    price
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

router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const result = await handleDatabaseOperation(async (connection) => {
      const [reservations] = await connection.query(
        `SELECT * FROM reservation WHERE reservation_date = ?`,
        [date]
      );
      return reservations;
    }, req.app.locals.pool);

    res.status(200).json(result);
  } catch (error) {
    console.error('Fetch reservations by date error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reservations by date',
      details: error.message,
    });
  }
});

module.exports = router;