const express = require('express');
const mysql = require('mysql2/promise');
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
        res.status(500).json({ error: 'Failed to delete member' });
    }
});





// Sales Reports API Routes
// monthly members
// fixed
app.get('/api/sales-reports/monthly-members', async (req, res) => {
    try {
        const members = await handleDatabaseOperation(async (connection) => {
            const [rows] = await connection.query(
                'SELECT * FROM monthly_members ORDER BY start_date'
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
                SELECT * FROM supplements ORDER BY supplement_name
            `);
            return rows;
        });
        res.json(supplements);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch supplements' });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});