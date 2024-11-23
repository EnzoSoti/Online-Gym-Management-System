const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const PORT = 3000;

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'WJ28@krhps', 
    database: 'fitworx_gym_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connected successfully');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}
testConnection();

// Middleware
app.use(express.json());

// Basic CORS middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Enhanced error handling for database operations
const handleDatabaseOperation = async (operation) => {
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

// Supplements API Routes
app.get('/api/supplements', async (req, res) => {
    try {
        const supplements = await handleDatabaseOperation(async (connection) => {
            const [rows] = await connection.query('SELECT * FROM supplements ORDER BY supplement_name');
            return rows;
        });
        res.json(supplements);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch supplements' });
    }
});

app.post('/api/supplements', async (req, res) => {
    try {
        const { supplement_name, quantity, price } = req.body;
        
        if (!supplement_name || quantity === undefined || price === undefined) {
            return res.status(400).json({ error: 'Supplement name, quantity, and price are required' });
        }

        const result = await handleDatabaseOperation(async (connection) => {
            const [insertResult] = await connection.query(
                'INSERT INTO supplements (supplement_name, quantity, price) VALUES (?, ?, ?)',
                [supplement_name, quantity, price]
            );
            return insertResult;
        });

        res.status(201).json({
            message: 'Supplement added successfully',
            supplementId: result.insertId
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to add supplement' });
    }
});

app.put('/api/supplements/:id', async (req, res) => {
    try {
        const { supplement_name, quantity, price } = req.body;
        const { id } = req.params;

        const result = await handleDatabaseOperation(async (connection) => {
            const [updateResult] = await connection.query(
                'UPDATE supplements SET supplement_name = ?, quantity = ?, price = ? WHERE id = ?',
                [supplement_name, quantity, price, id]
            );
            return updateResult;
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Supplement not found' });
        }

        res.json({ message: 'Supplement updated successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to update supplement' });
    }
});

app.delete('/api/supplements/:id', async (req, res) => {
    try {   
        const { id } = req.params;
        
        const result = await handleDatabaseOperation(async (connection) => {
            const [deleteResult] = await connection.query(
                'DELETE FROM supplements WHERE id = ?', 
                [id]
            );
            return deleteResult;
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Supplement not found' });
        }

        res.json({ message: 'Supplement deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to delete supplement' });
    }
});


// Buy supplements API Routes
// fixed
app.get('/api/supplements', async (req, res) => {
    try {
        const supplements = await handleDatabaseOperation(async (connection) => {
            const [rows] = await connection.query('SELECT * FROM supplements ORDER BY supplement_name');
            return rows;
        });
        res.json(supplements);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch supplements' });
    }
});

app.post('/api/buy-supplement', async (req, res) => {
    try {
        const { supplementId, quantity } = req.body;

        if (!supplementId || !quantity) {
            return res.status(400).json({ error: 'Supplement ID and quantity are required' });
        }

        const result = await handleDatabaseOperation(async (connection) => {
            // First check if there's enough stock
            const [currentStock] = await connection.query(
                'SELECT quantity FROM supplements WHERE id = ?',
                [supplementId]
            );

            if (currentStock.length === 0) {
                throw new Error('Supplement not found');
            }

            if (currentStock[0].quantity < quantity) {
                throw new Error('Insufficient stock');
            }

            // Update the stock
            const [updateResult] = await connection.query(
                'UPDATE supplements SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
                [quantity, supplementId, quantity]
            );
            return updateResult;
        });

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to update stock' });
        }

        res.json({ message: 'Purchase successful' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ 
            error: error.message === 'Insufficient stock' ? 'Insufficient stock' : 'Failed to process purchase'
        });
    }
});




// Monthly Members API Routes
// fixed
app.get('/api/monthly-members', async (req, res) => {
    try {
        const members = await handleDatabaseOperation(async (connection) => {
            const [rows] = await connection.query(
                'SELECT * FROM monthly_members ORDER BY member_name'
            );
            return rows;
        });
        res.json(members);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

app.post('/api/monthly-members', async (req, res) => {
    try {
        const { member_name, status, type, start_date, end_date } = req.body;
        
        if (!member_name || !status || !type || !start_date || !end_date) {
            return res.status(400).json({ 
                error: 'Member name, status, type, start date, and end date are required' 
            });
        }

        const result = await handleDatabaseOperation(async (connection) => {
            const [insertResult] = await connection.query(
                'INSERT INTO monthly_members (member_name, status, type, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
                [member_name, status, type, start_date, end_date]
            );
            return insertResult;
        });

        res.status(201).json({
            message: 'Member added successfully',
            memberId: result.insertId
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
});

app.put('/api/monthly-members/:id', async (req, res) => {
    try {
        const { member_name, status, type, start_date, end_date } = req.body;
        const { id } = req.params;

        const result = await handleDatabaseOperation(async (connection) => {
            const [updateResult] = await connection.query(
                'UPDATE monthly_members SET member_name = ?, status = ?, type = ?, start_date = ?, end_date = ? WHERE id = ?',
                [member_name, status, type, start_date, end_date, id]
            );
            return updateResult;
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json({ message: 'Member updated successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to update member' });
    }
});

app.delete('/api/monthly-members/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await handleDatabaseOperation(async (connection) => {
            const [deleteResult] = await connection.query(
                'DELETE FROM monthly_members WHERE id = ?', 
                [id]
            );
            return deleteResult;
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json({ message: 'Member deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed tof delete member' });
    }
});




// Monthly Members Customer Routes
// fixed
app.post('/api/monthly-members/customer', upload.single('school_id_picture'), async (req, res) => {
    try {
        const { member_name, type, start_date, end_date } = req.body;
        const school_id_picture = req.file ? req.file.buffer : null;

        if (!member_name || !type || !start_date || !end_date) {
            return res.status(400).json({ 
                error: 'Member name, type, start date, and end date are required' 
            });
        }

        let finalStatus = 'Pending';
        if (type === 'Student' && school_id_picture) {
            finalStatus = 'Pending';
        } else if (type !== 'Student') {
            finalStatus = 'Active';
        }

        const result = await handleDatabaseOperation(async (connection) => {
            const [insertResult] = await connection.query(
                'INSERT INTO monthly_members (member_name, status, type, start_date, end_date, school_id_picture) VALUES (?, ?, ?, ?, ?, ?)',
                [member_name, finalStatus, type, start_date, end_date, school_id_picture]
            );
            return insertResult;
        });

        res.status(201).json({
            message: 'Member added successfully',
            memberId: result.insertId
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
});

app.put('/api/monthly-members/:id/verify', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await handleDatabaseOperation(async (connection) => {
            const [updateResult] = await connection.query(
                'UPDATE monthly_members SET status = ? WHERE id = ?',
                ['Active', id]
            );
            return updateResult;
        });

        res.status(200).json({
            message: 'Member verified successfully'
        });
    } catch (error) { 
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to verify member' });
    }
});

app.get('/api/monthly-members/:id/picture', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await handleDatabaseOperation(async (connection) => {
            const [rows] = await connection.query(
                'SELECT school_id_picture FROM monthly_members WHERE id = ?',
                [id]
            );
            return rows[0];
        });

        if (!result || !result.school_id_picture) {
            return res.status(404).json({ error: 'Picture not found' });
        }

        res.contentType('image/jpeg'); // Adjust the content type based on your image format
        res.send(result.school_id_picture);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to retrieve picture' });
    }
});





// Sales Reports API Routes
// monthly members
// fixed
app.get('/api/sales-reports/monthly-members', async (req, res) => {
    try {
        const members = await handleDatabaseOperation(async (connection) => {
            const [rows] = await connection.query(
                `SELECT *, 
                    CASE type 
                        WHEN 'regular' THEN 950 
                        WHEN 'student' THEN 850 
                        ELSE 0 
                    END as amount
                FROM monthly_members 
                ORDER BY start_date`
            );
            return rows;
        });
        res.json(members);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch monthly members' });
    }
});




// Sales Reports API Routes
// Supplements
// fixed
app.get('/api/sales-reports/supplements', async (req, res) => {
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
        });
        res.json(supplements);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch supplements' });
    }
});


// Sales Reports API Routes
// regular
// fixed
app.get('/api/check-ins/regular', async (req, res) => {
    try {
        const regularCheckIns = await handleDatabaseOperation(async (connection) => {
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
        });
        res.json(regularCheckIns);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch regular check-ins' });
    }
});

// Sales Reports API Routes
// student
// fixed
app.get('/api/check-ins/student', async (req, res) => {
    try {
        const studentCheckIns = await handleDatabaseOperation(async (connection) => {
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
        });
        res.json(studentCheckIns);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch student check-ins' });
    }
});

// Sales Reports API Routes
// reservation
// fixed
app.get('/api/reservations', async (req, res) => {
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
        });
        res.json(reservations);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});


// check in API Routes
// Fixed
// GET route
app.get('/api/check-ins', async (req, res) => {
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
        });
        res.json(checkIns);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch check-ins' });
    }
});

app.post('/api/check-ins', async (req, res) => {
    try {
        const { client_type, client_name, time_in } = req.body;
        
        if (!client_type || !client_name || !time_in) {
            return res.status(400).json({ 
                error: 'Client type, name, and time are required' 
            });
        }

        // Calculate amount based on client_type
        const amount = client_type === 'regular' ? 70 : 
                      client_type === 'student' ? 60 : 0;

        const result = await handleDatabaseOperation(async (connection) => {
            const [insertResult] = await connection.query(
                'INSERT INTO check_ins (client_type, client_name, time_in, amount) VALUES (?, ?, ?, ?)',
                [client_type, client_name, time_in, amount]
            );
            return insertResult;
        });

        res.status(201).json({
            message: 'Check-in recorded successfully',
            checkInId: result.insertId,
            amount: amount
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to record check-in' });
    }
});


// customer reservation booking API Routes
app.post('/api/reservations', async (req, res) => {
    try {
        const { 
            service_type, 
            customer_name, 
            start_time, 
            end_time, 
            reservation_date,
            additional_members = [], // Default to an empty array
            price // Add price to the request body
        } = req.body;
        
        // Validation
        if (!service_type || !customer_name || !start_time || !end_time || !reservation_date || !price) {
            return res.status(400).json({ 
                error: 'Required fields missing',
                details: 'Service type, customer name, start time, end time, date, and price are required'
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
                [reservation_date, start_time, end_time, start_time, end_time, start_time]
            );

            if (conflicts.length > 0) {
                throw new Error('Time slot conflict');
            }

            // If no conflicts, proceed with insertion
            const [insertResult] = await connection.query(
                `INSERT INTO reservation 
                 (service_type, customer_name, start_time, end_time, reservation_date, additional_members, created_at, price) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
                [service_type, customer_name, start_time, end_time, reservation_date, processedAdditionalMembers, price]
            );
            
            return insertResult;
        });

        res.status(201).json({
            success: true,
            message: 'Reservation created successfully',
            reservationId: result.insertId
        });

    } catch (error) {
        console.error('Reservation error:', error);
        
        if (error.message === 'Time slot conflict') {
            res.status(409).json({
                success: false,
                error: 'This time slot is already booked'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to create reservation',
                details: error.message
            });
        }
    }
});

app.get('/api/reservations/:date', async (req, res) => {
    try {
        const { date } = req.params;

        const result = await handleDatabaseOperation(async (connection) => {
            const [reservations] = await connection.query(
                `SELECT * FROM reservation WHERE reservation_date = ?`,
                [date]
            );
            return reservations;
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Fetch reservations by date error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch reservations by date',
            details: error.message
        });
    }
});

// Admin Reservation API Routes
// Reservation
// fixed
app.get('/api/admin/reservations', async (req, res) => {
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
        });
        res.json(reservations);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch reservations' });
    }
});

app.delete('/api/admin/reservations/:id', async (req, res) => {
    try {
        await handleDatabaseOperation(async (connection) => {
            await connection.query(
                'DELETE FROM fitworx_gym_db.reservation WHERE id = ?',
                [req.params.id]
            );
        });
        res.json({ message: 'Reservation deleted successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to delete reservation' });
    }
});


// Dashboard API Routes
app.get('/api/total-earnings', async (req, res) => {
    try {
        const result = await handleDatabaseOperation(async (connection) => {
            // Get earnings from check-ins
            const [checkInsResults] = await connection.query(
                'SELECT SUM(amount) as total FROM check_ins'
            );
            
            // Get earnings from monthly members
            const [monthlyResults] = await connection.query(
                `SELECT 
                    (COUNT(CASE WHEN type = 'regular' AND status = 'Active' THEN 1 END) * 950) +
                    (COUNT(CASE WHEN type = 'student' AND status = 'Active' THEN 1 END) * 850) as total 
                FROM monthly_members`
            );
            
            // Get earnings from reservations
            const [reservationResults] = await connection.query(
                'SELECT SUM(price) as total FROM reservation'
            );
            
            // Get earnings from supplements
            // const [supplementResults] = await connection.query(`
            //     SELECT COALESCE(SUM(total_sales), 0) as total 
            //     FROM supplements 
            //     WHERE quantity_sold > 0
            // `);
            
            const totalEarnings = (checkInsResults[0].total || 0) +
                                (monthlyResults[0].total || 0) +
                                (reservationResults[0].total || 0);
                                // (supplementResults[0].total || 0);
            
            return { total: totalEarnings };
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching total earnings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get attendance counts
app.get('/api/attendance-counts', async (req, res) => {
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
            
            return {
                regular: regularCount[0].count,
                student: studentCount[0].count,
                monthly: monthlyCount[0].count
            };
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching attendance counts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// chart API Routes
app.get('/api/monthly-members-chart', async (req, res) => {
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
        });

        const labels = members.map(row => row.month);
        const data = members.map(row => row.count);

        res.json({ labels, data });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});

// Pie Chart API Routes
app.get('/api/member-counts', async (req, res) => {
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
                student: studentCount[0].count
            };
        });
        
        res.json(result);
    } catch (error) {
        console.error('Error fetching member counts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});