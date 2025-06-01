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
        console.log("Connected to the mainframe. I'm in!");
        connection.release();
    } catch (error) {
        console.error('Mainframe did not connect!', error);
        process.exit(1);
    }
}
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    testConnection();
});

// Types endpoint with error logging
app.get('/api/getTypes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM type ORDER BY CODE ASC');
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

app.get('/api/getMakers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM maker ORDER BY CODE ASC');
        console.log('Retrieved makers:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching makers:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch makers',
            details: error.message 
        });
    }
});

app.get('/api/getAllProducts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM product');
        console.log('Retrieved products:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch products',
            details: error.message 
        });
    }
});

app.get('/api/getParts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM product WHERE type IN (3,4,5)');
        console.log('Retrieved parts:', rows);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching parts:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch parts',
            details: error.message 
        });
    }
});

app.get('/api/getCarouselImages/:url', async (req, res) => {
    try {
        const url = req.params.url;
        const [rows] = await pool.query('CALL getCarouselImages(?)', [url]);
        
        // Extract only the product column from results
        const products = rows[0].map(row => row.PRODUCT);
        
        console.log(`Retrieved carousel images for URL ${url}:`, products);
        res.json(products);
    } catch (error) {
        console.error('Error fetching carousel images:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch carousel images',
            details: error.message 
        });
    }
});

