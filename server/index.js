import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
    host: 'localhost',
    port: 2000,
    user: 'root',
    // password: 'dimitriskopsidas',
    database: 'crystal_v1'
};

const pool = mysql.createPool(dbConfig);

// Test connection on startup
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection successful big boss');
        connection.release();
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}

// Test endpoint
app.get('/api/test', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1');
        res.json({ message: 'Database connection successful boss', data: rows });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database error' });
    }
});

// Types endpoint with error logging
app.get('/api/types', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM type');
        console.log('Retrieved types:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching types:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch types',
            details: error.message 
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    testConnection();
});