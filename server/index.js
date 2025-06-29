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
//CAROUSEL
app.get('/api/GetCarouselProducts/:connectkey', async (req, res) => {
    try {
        const connectkey = req.params.connectkey;
        const [rows] = await pool.query('CALL GetCarouselProducts(?)', [connectkey]);
        
        // Return all columns from the first result set
        console.log(`Retrieved carousel product data for connectKey ${connectkey}:`, rows[0]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching carousel images:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch carousel images',
            details: error.message 
        });
    }
});

app.get('/api/getCarouselSettings/:connectkey', async (req, res) => {
    try {
        const connectkey = req.params.connectkey;
        const [rows] = await pool.query('CALL GetCarouselSettings(?)', [connectkey]);
        
        // Return all columns from the first result set
        console.log(`Retrieved carousel settings for connectKey ${connectkey}:`, rows[0]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching carousel settings:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch carousel settings',
            details: error.message 
        });
    }
});

app.get('/api/updateDeviceLastPing/:connectKey', async (req, res) => {
    try {
        const connectKey = req.params.connectKey;
        const [result] = await pool.query('CALL UpdateDeviceLastPing(?)', [connectKey]);
        
        console.log(`Updated last ping for device ${connectKey}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating device last ping:', error.message);
        res.status(500).json({ 
            error: 'Failed to update device last ping',
            details: error.message 
        });
    }
});
//MINIGAME
app.get('/api/getMinigameSettings/:connectkey', async (req, res) => {
    try {
        const connectkey = req.params.connectkey;
        const [rows] = await pool.query('CALL GetMinigameSettings(?)', [connectkey]);
        
        // Return all columns from the first result set
        console.log(`Retrieved minigame settings for connectKey ${connectkey}:`, rows[0]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching minigame settings:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch minigame settings',
            details: error.message 
        });
    }
});

app.get('/api/getMinigamePromos/:connectkey', async (req, res) => {
    try {
        const connectkey = req.params.connectkey;
        const [rows] = await pool.query('CALL GetMinigamePromos(?)', [connectkey]);
        
        // Return all columns from the first result set
        console.log(`Retrieved minigame promos for connectKey ${connectkey}:`, rows[0]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching minigame promos:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch minigame promos',
            details: error.message 
        });
    }
});

app.get('/api/insertIssuedPromo/:connectKey/:redeemCode/:promoId', async (req, res) => {
    try {
        const connectKey = req.params.connectKey;
        const redeemCode = req.params.redeemCode;
        const promoId = req.params.promoId;

        const [result] = await pool.query('CALL InsertIssuedPromo(?, ?, ?)', 
            [connectKey, redeemCode, promoId]);
        
        console.log(`Inserted promo record for device ${connectKey} with code ${redeemCode}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error inserting issued promo:', error.message);
        res.status(500).json({ 
            error: 'Failed to insert issued promo',
            details: error.message 
        });
    }
});
//CHECK
app.get('/api/updateRedeemed/:redeemCode', async (req, res) => {
    try {
        const redeemCode = req.params.redeemCode;
        const [result] = await pool.query('CALL UpdateRedeemed(?)', [redeemCode]);
        
        console.log(`Updated redeem code: ${redeemCode} as redeemed`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating redeem code:', error.message);
        res.status(500).json({ 
            error: 'Failed to update redeem code',
            details: error.message 
        });
    }
});

app.get('/api/getPromoStatus/:codeToCheck', async (req, res) => {
    try {
        const codeToCheck = req.params.codeToCheck;
        const [rows] = await pool.query('CALL GetPromoStatus(?)', [codeToCheck]);
        
        console.log(`Checked promo code ${codeToCheck}, status:`, rows[0][0].status);
        res.json(rows[0][0]);
    } catch (error) {
        console.error('Error checking promo status:', error.message);
        res.status(500).json({ 
            error: 'Failed to check promo status',
            details: error.message 
        });
    }
});

app.get('/api/getPromoData/:code', async (req, res) => {
    try {
        const code = req.params.code;
        const [rows] = await pool.query('CALL GetPromoData(?)', [code]);
        
        console.log(`Retrieved promo data for code ${code}:`, rows[0][0]);
        res.json(rows[0][0]);
    } catch (error) {
        console.error('Error fetching promo data:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch promo data',
            details: error.message 
        });
    }
});


