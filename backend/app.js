const express = require('express');
const mysql = require('mysql2/promise'); // Using promise-based version
const app = express();
const PORT = 3000;

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // Default XAMPP password is empty
    database: 'sample'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Test database connection
app.get('/api/test-connection', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        connection.release();
        res.json({ message: 'Database connection successful!' });
    } catch (error) {
        res.status(500).json({ error: 'Database connection failed', details: error.message });
    }
});

// Get all users
app.get('/api/user', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users', details: error.message });
    }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user', details: error.message });
    }
});

// Create new user
app.post('/api/users', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, password]
        );
        res.status(201).json({
            message: 'User created successfully',
            userId: result.insertId
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user', details: error.message });
    }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
    try {
        const { name, email } = req.body;
        const [result] = await pool.query(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, req.params.id]
        );
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user', details: error.message });
    }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});