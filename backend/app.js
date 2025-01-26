require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const nodemailer = require("nodemailer");
const upload = multer({ storage: multer.memoryStorage() });
const app = express();
const PORT = 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10),
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT, 10)
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

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

app.post('/api/monthly-members', 
    upload.fields([
        { name: 'school_id_picture', maxCount: 1 },
        { name: 'profile_picture', maxCount: 1 }
    ]), 
    async (req, res) => {
        try {
            const { member_name, status, type, start_date, end_date } = req.body;
            
            // Validate required fields
            if (!member_name || !status || !type || !start_date || !end_date) {
                return res.status(400).json({ 
                    error: 'All fields are required' 
                });
            }

            // Validate profile picture
            if (!req.files || !req.files.profile_picture) {
                return res.status(400).json({
                    error: 'Profile picture is required for new members'
                });
            }

            // Validate school ID picture only if the type is "Student"
            if (type === 'Student' && (!req.files || !req.files.school_id_picture)) {
                return res.status(400).json({
                    error: 'School ID picture is required for Student members'
                });
            }

            const school_id_path = req.files.school_id_picture ? req.files.school_id_picture[0].filename : null;
            const profile_picture_path = req.files.profile_picture[0].filename;

            const result = await handleDatabaseOperation(async (connection) => {
                const [insertResult] = await connection.query(
                    `INSERT INTO monthly_members 
                    (member_name, status, type, start_date, end_date, school_id_picture, profile_picture) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [member_name, status, type, start_date, end_date, school_id_path, profile_picture_path]
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
    }
);

app.put('/api/monthly-members/:id', 
    upload.fields([
        { name: 'school_id_picture', maxCount: 1 },
        { name: 'profile_picture', maxCount: 1 }
    ]), 
    async (req, res) => {
        try {
            const { id } = req.params;
            const { member_name, status, type, start_date, end_date } = req.body;
            
            if (!member_name || !status || !type || !start_date || !end_date) {
                return res.status(400).json({ 
                    error: 'All fields are required' 
                });
            }

            const updateQuery = `UPDATE monthly_members 
                               SET member_name = ?, status = ?, type = ?, 
                                   start_date = ?, end_date = ?
                               WHERE id = ?`;

            const updateFields = [member_name, status, type, start_date, end_date, id];

            const result = await handleDatabaseOperation(async (connection) => {
                const [updateResult] = await connection.query(updateQuery, updateFields);
                return updateResult;
            });

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    error: 'Member not found'
                });
            }

            res.json({
                message: 'Member updated successfully',
                memberId: id
            });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Failed to update member' });
        }
    }
);

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
        res.status(500).json({ error: 'Failed to delete member' });
    }
});

app.put('/api/monthly-members/:id/update-status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }

        const result = await handleDatabaseOperation(async (connection) => {
            const [updateResult] = await connection.query(
                'UPDATE monthly_members SET status = ? WHERE id = ?',
                [status, id]
            );
            return updateResult;
        });

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json({ message: 'Status updated successfully' });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});




// Monthly Members Customer Routes
// fixed
app.post('/api/monthly-members/customer', upload.fields([
    { name: 'school_id_picture', maxCount: 1 },
    { name: 'profile_picture', maxCount: 1 }
]), async (req, res) => {
    try {
        const { member_name, type, start_date, end_date, gcash_ref, gcash_name, amount_paid, email } = req.body;
        const school_id_picture = req.files['school_id_picture'] ? req.files['school_id_picture'][0].buffer : null;
        const profile_picture = req.files['profile_picture'] ? req.files['profile_picture'][0].buffer : null;

        if (!member_name || !type || !start_date || !end_date || !gcash_ref || !gcash_name || !amount_paid || !email) {
            return res.status(400).json({ 
                error: 'Member name, type, start date, end date, GCash reference number, account name, amount paid, and email are required' 
            });
        }

        const finalStatus = 'Pending';

        const result = await handleDatabaseOperation(async (connection) => {
            const [insertResult] = await connection.query(
                'INSERT INTO monthly_members (member_name, status, type, start_date, end_date, school_id_picture, profile_picture, gcash_ref, gcash_name, amount_paid, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [member_name, finalStatus, type, start_date, end_date, school_id_picture, profile_picture, gcash_ref, gcash_name, amount_paid, email]
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

app.put('/api/monthly-members/:id/verify-payment', async (req, res) => {
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
            message: 'Payment verified and member status updated to Active'
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
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

        // Fetch the email address of the member
        const [member] = await handleDatabaseOperation(async (connection) => {
            return connection.query(
                'SELECT email FROM monthly_members WHERE id = ?',
                [id]
            );
        });

        const email = member[0].email;

        // Send email notification
        await transporter.sendMail({
            from: '"Fitworx Gym" <fitworxgym082@gmail.com>',
            to: email,
            subject: 'Membership Verified',
            text: 'Your membership has been verified and is now active.',
            html: '<b>Your membership has been verified and is now active.</b>'
        });

        res.status(200).json({
            message: 'Member verified successfully'
        });
    } catch (error) { 
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to verify member' });
    }
});

app.post('/api/monthly-members/:id/send-email', async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the email address and other details of the member
        const [member] = await handleDatabaseOperation(async (connection) => {
            return connection.query(
                'SELECT email, member_name, type, amount_paid, gcash_ref, gcash_name FROM monthly_members WHERE id = ?',
                [id]
            );
        });

        if (!member || member.length === 0) {
            console.error(`Member with ID ${id} not found.`);
            return res.status(404).json({ error: 'Member not found' });
        }

        const email = member[0].email;
        const memberName = member[0].member_name;
        const membershipType = member[0].type;
        const amountPaid = member[0].amount_paid;
        const gcashRef = member[0].gcash_ref;
        const gcashName = member[0].gcash_name;

        // Send email notification
        await transporter.sendMail({
            from: '"Fitworx Gym" <fitworxgym082@gmail.com>',
            to: email,
            subject: 'Your Monthly Pass Membership is Now Active!',
            text: `Dear ${memberName},\n\nWe are pleased to inform you that your monthly pass membership at Fitworx Gym is now active. Enjoy your workouts!\n\nBest regards,\nFitworx Gym Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h2 style="color: #1a1a1a;">Dear ${memberName},</h2>
                    <p style="font-size: 16px; line-height: 1.6;">We are pleased to confirm that your monthly pass membership at Fitworx Gym is now active.</p>
                    
                    <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Membership Details</h3>
                        <ul style="list-style-type: none; padding: 0;">
                            <li><strong>Membership Type:</strong> ${membershipType}</li>
                            <li><strong>Amount Paid:</strong> ₱${amountPaid}</li>
                            <li><strong>GCash Reference Number:</strong> ${gcashRef}</li>
                            <li><strong>GCash Account Name:</strong> ${gcashName}</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 10px;">Membership Perks</h3>
                        <ul style="color: #333; padding-left: 20px;">
                            <li>24/7 Gym Access</li>
                            <li>Access to All Equipment</li>
                        </ul>
                    </div>

                    <p style="line-height: 1.6;">We look forward to supporting your fitness journey and helping you achieve your health goals at Fitworx Gym.</p>

                    <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                        <a href="https://www.facebook.com/fitworxgymph" style="display: inline-block; padding: 10px 20px; background-color: #2c3e50; color: #fff; text-decoration: none; border-radius: 4px;">Visit Our Facebook Page</a>
                        <a href="mailto:support@fitworxgym.com" style="display: inline-block; padding: 10px 20px; background-color: #34495e; color: #fff; text-decoration: none; border-radius: 4px;">Contact Support</a>
                    </div>

                    <p style="margin-top: 20px; color: #666;">Best regards,<br>Fitworx Gym Team</p>

                    <footer style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666;">
                        <p>Fitworx Gym &copy; ${new Date().getFullYear()}. All rights reserved.</p>
                        <p>Contact us at <a href="mailto:support@fitworxgym.com" style="color: #2c3e50; text-decoration: none;">support@fitworxgym.com</a></p>
                    </footer>
                </div>
            `
        });

        res.status(200).json({
            message: 'Email notification sent successfully'
        });
    } catch (error) { 
        console.error('Error sending email notification:', error);
        res.status(500).json({ error: 'Failed to send email notification' });
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

app.get('/api/monthly-members/:id/profile-picture', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await handleDatabaseOperation(async (connection) => {
            const [rows] = await connection.query(
                'SELECT profile_picture FROM monthly_members WHERE id = ?',
                [id]
            );
            return rows[0];
        });

        if (!result || !result.profile_picture) {
            return res.status(404).json({ error: 'Profile picture not found' });
        }

        res.contentType('image/jpeg'); // Adjust the content type based on your image format
        res.send(result.profile_picture);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to retrieve profile picture' });
    }
});

app.put('/api/monthly-members/:id/renew', async (req, res) => {
    try {
        const { id } = req.params;
        const { start_date, end_date } = req.body;

        if (!start_date || !end_date) {
            return res.status(400).json({ error: 'Start date and end date are required' });
        }

        const result = await handleDatabaseOperation(async (connection) => {
            // Fetch the member details
            console.log('Fetching member details for ID:', id);
            const [memberRows] = await connection.query(
                'SELECT type FROM monthly_members WHERE id = ?',
                [id]
            );

            if (memberRows.length === 0) {
                console.log('Member not found for ID:', id);
                return res.status(404).json({ error: 'Member not found' });
            }

            const memberType = memberRows[0].type;
            let renewalAmount = 0;

            // Calculate the renewal amount based on the member type
            if (memberType === 'student') {
                renewalAmount = 850;
            } else if (memberType === 'regular') {
                renewalAmount = 950;
            }

            console.log('Renewal amount calculated:', renewalAmount);

            // Update the member's renewal details
            console.log('Updating member details for ID:', id);
            const [updateResult] = await connection.query(
                'UPDATE monthly_members SET status = ?, start_date = ?, end_date = ?, renewal_date = ?, renewal_amount = ? WHERE id = ?',
                ['Active', start_date, end_date, new Date(), renewalAmount, id]
            );

            console.log('Update result:', updateResult);

            return { renewalAmount };
        });

        res.status(200).json({
            message: 'Membership renewed successfully',
            renewalAmount: result.renewalAmount
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to renew membership' });
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
                    END as amount,
                    renewal_amount
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

            // Get earnings from reservations
            // const [reservationResults] = await connection.query(
            //     'SELECT SUM(price) as total FROM reservation'
            // );
            
            // Get earnings from monthly members
            // const [monthlyResults] = await connection.query(
            //     `SELECT 
            //         (COUNT(CASE WHEN type = 'regular' AND status = 'Active' THEN 1 END) * 950) +
            //         (COUNT(CASE WHEN type = 'student' AND status = 'Active' THEN 1 END) * 850) as total 
            //     FROM monthly_members`
            // );
            
            // Get earnings from supplements
            // const [supplementResults] = await connection.query(`
            //     SELECT COALESCE(SUM(total_sales), 0) as total 
            //     FROM supplements 
            //     WHERE quantity_sold > 0
            // `);
            
            const totalEarnings = (checkInsResults[0].total || 0);
                                // (reservationResults[0].total || 0);
                                // (monthlyResults[0].total || 0) +
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

            const [reservationCount] = await connection.query(
                'SELECT COUNT(*) as count FROM reservation WHERE status = "active"'
            );
            
            return {
                regular: regularCount[0].count,
                student: studentCount[0].count,
                monthly: monthlyCount[0].count,
                reservation: reservationCount[0].count
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


// =============================== Login ===============================
app.post('/api/register', async (req, res) => {
    try {
        const { full_name, username, password } = req.body;

        // Check if all fields are provided
        if (!full_name || !username || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if username already exists
        const [existingUser] = await handleDatabaseOperation(async (connection) => {
            const [rows] = await connection.query(
                'SELECT username FROM user_sign_up WHERE username = ?',
                [username]
            );
            return rows;
        });

        if (existingUser && existingUser.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Insert new user
        await handleDatabaseOperation(async (connection) => {
            await connection.query(
                'INSERT INTO user_sign_up (full_name, username, password, created_at) VALUES (?, ?, ?, NOW())',
                [full_name, username, password]
            );
        });

        res.status(201).json({ message: 'Registration successful' });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check user credentials
        const [user] = await handleDatabaseOperation(async (connection) => {
            const [rows] = await connection.query(
                'SELECT * FROM user_sign_up WHERE username = ? AND password = ?',
                [username, password]
            );
            return rows;
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        res.json({
            message: 'Login successful',
            user: {
                id: user.user_id,
                username: user.username,
                full_name: user.full_name
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if username and password are provided
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Check admin credentials
        const [admin] = await handleDatabaseOperation(async (connection) => {
            const [rows] = await connection.query(
                'SELECT * FROM admin_sign_up WHERE username = ? AND password = ?',
                [username, password]
            );
            return rows;
        });

        if (!admin) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Store the full name in sessionStorage
        res.json({
            message: 'Admin login successful',
            admin: {
                id: admin.user_id,
                username: admin.username,
                full_name: admin.full_name
            }
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Admin login failed' });
    }
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});