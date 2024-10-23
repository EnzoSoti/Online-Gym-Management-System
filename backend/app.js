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

// API Routes
// Get all supplements
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

// Add new supplement
app.post('/api/supplements', async (req, res) => {
    try {
        const { supplement_name, quantity } = req.body;
        
        if (!supplement_name || quantity === undefined) {
            return res.status(400).json({ error: 'Supplement name and quantity are required' });
        }

        const result = await handleDatabaseOperation(async (connection) => {
            const [insertResult] = await connection.query(
                'INSERT INTO supplements (supplement_name, quantity) VALUES (?, ?)',
                [supplement_name, quantity]
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

// Update supplement
app.put('/api/supplements/:id', async (req, res) => {
    try {
        const { supplement_name, quantity } = req.body;
        const { id } = req.params;

        const result = await handleDatabaseOperation(async (connection) => {
            const [updateResult] = await connection.query(
                'UPDATE supplements SET supplement_name = ?, quantity = ? WHERE id = ?',
                [supplement_name, quantity, id]
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

// Delete supplement
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});