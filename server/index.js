import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json());

// #region BASIC CONFIGS
const dbConfig = {
    host: 'localhost',
    port: 2000,
    user: 'root',
    // password: 'dimitriskopsidas',
    database: 'crystal_v1'
};
const pool = mysql.createPool(dbConfig);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
// #endregion BASIC CONFIGS

// #region ACTIVECAROUSEL
app.get('/api/GetCarouselProductsConnect/:connectkey', async (req, res) => {
    try {
        const connectkey = req.params.connectkey;
        const [rows] = await pool.query('CALL GetCarouselProductsConnect(?)', [connectkey]);
        
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

app.get('/api/getCarouselSettingsConnect/:connectkey', async (req, res) => {
    try {
        const connectkey = req.params.connectkey;
        const [rows] = await pool.query('CALL GetCarouselSettingsConnect(?)', [connectkey]);
        
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
// #endregion ACTIVECAROUSEL

// #region MINIGAME
app.get('/api/getMinigameSettingsConnect/:connectkey', async (req, res) => {
    try {
        const connectkey = req.params.connectkey;
        const [rows] = await pool.query('CALL GetMinigameSettingsConnect(?)', [connectkey]);
        
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

app.get('/api/getMinigamePromosConnect/:connectkey', async (req, res) => {
    try {
        const connectkey = req.params.connectkey;
        const [rows] = await pool.query('CALL GetMinigamePromosConnect(?)', [connectkey]);
        
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
// #endregion MINIGAME

// #region CHECK
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
// #endregion CHECK

// #region PRODUCTS
app.get('/api/getFilteredProducts/:type/:maker', async (req, res) => {
    try {
        const type = !req.params.type || req.params.type === 'All' ? null : req.params.type;
        const maker = !req.params.maker || req.params.maker === 'All' ? null : req.params.maker;

        const [rows] = await pool.query('CALL GetFilteredProducts(?, ?)', [type, maker]);
        
        console.log('Retrieved filtered products:', {
            typeFilter: type || 'NULL',
            makerFilter: maker || 'NULL',
            count: rows[0].length
        });
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching filtered products:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch filtered products',
            details: error.message 
        });
    }
});

app.get('/api/getTypes', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL GetTypes()');
        console.log('Retrieved types:', {
            count: rows[0].length,
            types: rows[0]
        });
        res.json(rows[0]);
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
        const [rows] = await pool.query('CALL GetMakers()');
        console.log('Retrieved makers:', {
            count: rows[0].length,
            makers: rows[0]
        });
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching makers:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch makers',
            details: error.message 
        });
    }
});

app.get('/api/getNextProductId', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL GetNextProductId()');
        console.log('Retrieved next product ID:', rows[0][0]);
        res.json(rows[0][0]);
    } catch (error) {
        console.error('Error fetching next product ID:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch next product ID',
            details: error.message 
        });
    }
});

app.get('/api/getNextCarouselId', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL GetNextCarouselId()');
        console.log('Retrieved next carousel ID:', rows[0][0]);
        res.json(rows[0][0]);
    } catch (error) {
        console.error('Error fetching next carousel ID:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch next carousel ID',
            details: error.message 
        });
    }
});

app.get('/api/getNextPromoId', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL GetNextPromoId()');
        console.log('Retrieved next promo ID:', rows[0][0]);
        res.json(rows[0][0]);
    } catch (error) {
        console.error('Error fetching next promo ID:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch next promo ID',
            details: error.message 
        });
    }
});

app.get('/api/getNextProductCode', async (req, res) => {
    try {
        console.log('Fetching next product code...');
        
        const [rows] = await pool.execute('CALL GetNextProductCode()');
        
        if (rows && rows[0] && rows[0].length > 0) {
            const nextCode = rows[0][0].NEXTPRODUCTCODE;
            console.log('Next product code:', nextCode);
            res.json({ NEXTPRODUCTCODE: nextCode });
        } else {
            // If no products exist, return 1 as the first code
            console.log('No products found, returning default code 1');
            res.json({ NEXTPRODUCTCODE: 1 });
        }
    } catch (error) {
        console.error('Error fetching next product code:', error);
        res.status(500).json({ error: 'Failed to fetch next product code' });
    }
});

app.delete('/api/deleteProduct/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        await pool.query('CALL DeleteProduct(?)', [productId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.delete('/api/deleteMaker/:id', async (req, res) => {
    try {
        const makerId = req.params.id;
        await pool.query('CALL DeleteMaker(?)', [makerId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting maker:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.delete('/api/deleteType/:id', async (req, res) => {
    try {
        const typeId = req.params.id;
        await pool.query('CALL DeleteType(?)', [typeId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting type:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.delete('/api/deleteImage/:imageId', async (req, res) => {
    try {
        const imageId = req.params.imageId;
        const imagePath = path.join(__dirname, '..', 'media', `${imageId}.png`);
        
        // Check if file exists
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
            res.json({ success: true });
        } else {
            res.json({ success: true, message: 'Image not found' });
        }
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.put('/api/updateProduct/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { code, name, type, maker, price, discount, finalPrice, notes } = req.body;

        await pool.query('CALL UpdateProduct(?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            productId,
            code,
            name,
            type,
            maker,
            price,
            discount,
            finalPrice,
            notes
        ]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.post('/api/insertProduct', async (req, res) => {
    try {
        const { code, name, type, maker, price, discount, finalPrice, notes } = req.body;

        await pool.query('CALL InsertProduct(?, ?, ?, ?, ?, ?, ?, ?)', [
            code,
            name,
            type,
            maker,
            price,
            discount,
            finalPrice,
            notes
        ]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error inserting product:', error);
        // Check for duplicate entry error (MySQL error code 1062)
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ 
                success: false, 
                error: `Product code ${req.body.code} already exists. Please use a different code.`,
                isDuplicateCode: true
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        const mediaPath = path.join(__dirname, '..', 'media');
        if (!fs.existsSync(mediaPath)){
            fs.mkdirSync(mediaPath, { recursive: true });
        }
        cb(null, mediaPath);
    },
    filename: function(req, file, cb) {
        cb(null, `${req.params.productId}.png`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

app.use('/media', express.static(path.join(__dirname, '..', 'media')));

app.post('/api/uploadNewProductImage/:productId', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }

        res.json({
            success: true,
            message: 'Image uploaded successfully',
            path: `/media/${req.params.productId}.png`
        });
    } catch (error) {
        console.error('Error uploading new product image:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/insertMaker', async (req, res) => {
    try {
        const { code, name } = req.body;

        await pool.query('CALL InsertMaker(?, ?)', [code, name]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error inserting maker:', error);
        // Check for duplicate entry error (MySQL error code 1062)
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ 
                success: false, 
                error: `Maker code ${req.body.code} already exists. Please use a different code.`,
                isDuplicateCode: true
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
});

app.post('/api/insertType', async (req, res) => {
    try {
        const { code, name } = req.body;

        await pool.query('CALL InsertType(?, ?)', [code, name]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error inserting type:', error);
        // Check for duplicate entry error (MySQL error code 1062)
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ 
                success: false, 
                error: `Type code ${req.body.code} already exists. Please use a different code.`,
                isDuplicateCode: true
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
});

app.put('/api/updateMaker/:id', async (req, res) => {
    try {
        const makerId = req.params.id;
        const { code, name } = req.body;

        await pool.query('CALL UpdateMaker(?, ?, ?)', [makerId, code, name]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating maker:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.put('/api/updateType/:id', async (req, res) => {
    try {
        const typeId = req.params.id;
        const { code, name } = req.body;

        await pool.query('CALL UpdateType(?, ?, ?)', [typeId, code, name]);

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating type:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
// #endregion PRODUCTS

// #region CAROUSELS
app.get('/api/getCarouselMinigame/:carousel', async (req, res) => {
    try {
        const carousel = req.params.carousel === 'true';
        const [rows] = await pool.query('CALL GetCarouselMinigame(?)', [carousel]);
        
        console.log(`Retrieved carousel minigame data for carousel ${carousel}:`, rows[0]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching carousel minigame:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch carousel minigame',
            details: error.message 
        });
    }
});

app.get('/api/getCarouselProducts/:carousel', async (req, res) => {
    try {
        const carousel = req.params.carousel === 'true';
        const [rows] = await pool.query('CALL GetCarouselProducts(?)', [carousel]);
        
        console.log(`Retrieved carousel products for carousel ${carousel}:`, rows[0]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching carousel products:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch carousel products',
            details: error.message 
        });
    }
});

app.get('/api/getFilteredCarousels/:filterDeviceNotNull', async (req, res) => {
    try {
        const filterDeviceNotNull = req.params.filterDeviceNotNull === 'true' ? true : 
                                   req.params.filterDeviceNotNull === 'false' ? false : null;
        const [rows] = await pool.query('CALL GetFilteredCarousels(?)', [filterDeviceNotNull]);
        
        console.log(`Retrieved filtered carousel data with filter ${filterDeviceNotNull}:`, rows[0]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching filtered carousel:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch filtered carousel',
            details: error.message 
        });
    }
});

app.get('/api/getMinigamePromos/:carousel', async (req, res) => {
    try {
        const carousel = req.params.carousel === 'true';
        const [rows] = await pool.query('CALL GetMinigamePromos(?)', [carousel]);
        
        console.log(`Retrieved minigame promos for carousel ${carousel}:`, rows[0]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching minigame promos:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch minigame promos',
            details: error.message 
        });
    }
});

app.get('/api/getAllDevices', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL GetAllDevices()');
        
        console.log('Retrieved all devices:', {
            count: rows[0].length,
            devices: rows[0]
        });
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching all devices:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch all devices',
            details: error.message 
        });
    }
});

app.put('/api/updateProductLines/:id', async (req, res) => {
    try {
        const productLinesId = req.params.id;
        const { carousel, product, queue } = req.body;

        await pool.query('CALL UpdateProductlines(?, ?, ?, ?)', [
            productLinesId,
            carousel,
            product,
            queue
        ]);

        console.log(`Updated product lines with ID: ${productLinesId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating product lines:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.delete('/api/deleteProductLines/:productLinesId', async (req, res) => {
    try {
        const productLinesId = req.params.productLinesId;
        await pool.query('CALL DeleteProductlines(?)', [productLinesId]);
        
        console.log(`Deleted product lines with ID: ${productLinesId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting product lines:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.post('/api/insertProductLines', async (req, res) => {
    try {
        const { carousel, product, queue } = req.body;

        await pool.query('CALL InsertProductlines(?, ?, ?)', [
            carousel,
            product,
            queue
        ]);

        console.log('Inserted new product lines:', { carousel, product, queue });
        res.json({ success: true });
    } catch (error) {
        console.error('Error inserting product lines:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/api/getProductLinesByCarousel/:carouselId', async (req, res) => {
    try {
        const carouselId = req.params.carouselId;
        const [rows] = await pool.query('CALL GetProductLinesByCarousel(?)', [carouselId]);
        
        console.log(`Retrieved product lines for carousel ${carouselId}:`, {
            count: rows[0].length,
            productLines: rows[0]
        });
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching product lines by carousel:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch product lines by carousel',
            details: error.message 
        });
    }
});

app.get('/api/getPromoLinesByCarousel/:carouselId', async (req, res) => {
    try {
        const carouselId = req.params.carouselId;
        const [rows] = await pool.query('CALL GetPromoLinesByCarousel(?)', [carouselId]);
        
        console.log(`Retrieved promo lines for carousel ${carouselId}:`, {
            count: rows[0].length,
            promoLines: rows[0]
        });
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching promo lines by carousel:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch promo lines by carousel',
            details: error.message 
        });
    }
});
// #endregion

// #region PROMOS
app.get('/api/getFilteredPromos/:type/:maker', async (req, res) => {
    try {
        const type = !req.params.type || req.params.type === 'All' ? null : req.params.type;
        const maker = !req.params.maker || req.params.maker === 'All' ? null : req.params.maker;

        const [rows] = await pool.query('CALL GetFilteredPromos(?, ?)', [type, maker]);
        
        console.log('Retrieved filtered promos:', {
            typeFilter: type || 'NULL',
            makerFilter: maker || 'NULL',
            count: rows[0].length
        });
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching filtered promos:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch filtered promos',
            details: error.message 
        });
    }
});

app.delete('/api/deletePromo/:id', async (req, res) => {
    try {
        const promoId = req.params.id;
        await pool.query('CALL DeletePromo(?)', [promoId]);
        
        console.log(`Deleted promo with ID: ${promoId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting promo:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.post('/api/insertPromo', async (req, res) => {
    try {
        const { code, product, type, maker, notes, discount, daysToLive } = req.body;

        await pool.query('CALL InsertPromo(?, ?, ?, ?, ?, ?, ?)', [
            code,
            product,
            type,
            maker,
            notes,
            discount,
            daysToLive
        ]);

        console.log('Inserted new promo:', { code, product, type, maker });
        res.json({ success: true });
    } catch (error) {
        console.error('Error inserting promo:', error);
        // Check for duplicate entry error (MySQL error code 1062)
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ 
                success: false, 
                error: `Promo code ${req.body.code} already exists. Please use a different code.`,
                isDuplicateCode: true
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
});

app.put('/api/updatePromo/:id', async (req, res) => {
    try {
        const promoId = req.params.id;
        const { code, product, type, maker, notes, discount, daysToLive } = req.body;

        await pool.query('CALL UpdatePromo(?, ?, ?, ?, ?, ?, ?, ?)', [
            promoId,
            code,
            product,
            type,
            maker,
            notes,
            discount,
            daysToLive
        ]);

        console.log(`Updated promo with ID: ${promoId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating promo:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.put('/api/updatePromoLines/:id', async (req, res) => {
    try {
        const promoLinesId = req.params.id;
        const { promo, minigame, chance } = req.body;

        await pool.query('CALL UpdatePromoLines(?, ?, ?, ?)', [
            promoLinesId,
            promo,
            minigame,
            chance
        ]);

        console.log(`Updated promo lines with ID: ${promoLinesId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating promo lines:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.delete('/api/deletePromoLines/:id', async (req, res) => {
    try {
        const promoLinesId = req.params.id;
        await pool.query('CALL DeletePromoLines(?)', [promoLinesId]);
        
        console.log(`Deleted promo lines with ID: ${promoLinesId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting promo lines:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.post('/api/insertPromoLines', async (req, res) => {
    try {
        const { promo, minigame, chance } = req.body;

        await pool.query('CALL InsertPromoLines(?, ?, ?)', [
            promo,
            minigame,
            chance
        ]);

        console.log('Inserted new promo lines:', { promo, minigame, chance });
        res.json({ success: true });
    } catch (error) {
        console.error('Error inserting promo lines:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

app.get('/api/getIssuedCount/:promoId', async (req, res) => {
    try {
        const promoId = req.params.promoId;
        const [rows] = await pool.query('CALL GetIssuedCount(?)', [promoId]);
        
        console.log(`Retrieved issued count for promo ${promoId}:`, rows[0][0]);
        res.json(rows[0][0]);
    } catch (error) {
        console.error('Error fetching issued count:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch issued count',
            details: error.message 
        });
    }
});

app.get('/api/getAssociatedCarouselForPromo/:promoId', async (req, res) => {
    try {
        const promoId = req.params.promoId;
        const [rows] = await pool.query('CALL GetAssociatedCarouselForPromo(?)', [promoId]);
        
        console.log(`Retrieved associated carousel for promo ${promoId}:`, rows[0]);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching associated carousel for promo:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch associated carousel for promo',
            details: error.message 
        });
    }
});
// #endregion PROMOS

// #region ADMIN
app.get('/api/getIndexPromoInfo', async (req, res) => {
    try {
        const [rows] = await pool.query('CALL GetIndexPromoInfo()');
        
        console.log('Retrieved index promo info:', {
            count: rows[0].length,
            promos: rows[0]
        });
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching index promo info:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch index promo info',
            details: error.message 
        });
    }
});

app.get('/api/getIndexDeviceInfo/:device', async (req, res) => {
    try {
        const device = req.params.device && req.params.device !== 'null' ? req.params.device : null;
        const [rows] = await pool.query('CALL GetIndexDeviceInfo(?)', [device]);
        
        console.log('Retrieved index device info:', {
            deviceFilter: device || 'NULL',
            count: rows[0].length,
            devices: rows[0]
        });
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Error fetching index device info:', error.message);
        res.status(500).json({ 
            error: 'Failed to fetch index device info',
            details: error.message 
        });
    }
});
// #endregion ADMIN

// #region CAROUSELS
// Delete carousel and minigame
app.delete('/api/carousel/:id', async (req, res) => {
    try {
        const carouselId = req.params.id;
        await pool.query('CALL DeleteCarouselAndMinigame(?)', [carouselId]);
        
        console.log(`Deleted carousel and minigame with ID: ${carouselId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting carousel and minigame:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Update carousel and minigame
app.put('/api/carousel/:id', async (req, res) => {
    try {
        const carouselId = req.params.id;
        const { 
            code, name, device, autoplayWait, speed, gameCount, state = 1,
            revolutions, spinDuration, onStopTime, inactivityTime 
        } = req.body;

        await pool.query('CALL UpdateCarouselAndMinigame(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            carouselId,
            code,
            name,
            device,
            autoplayWait,
            speed,
            gameCount,
            state,
            revolutions,
            spinDuration,
            onStopTime,
            inactivityTime
        ]);

        console.log(`Updated carousel and minigame with ID: ${carouselId}`);
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating carousel and minigame:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Insert new carousel and minigame
app.post('/api/carousel', async (req, res) => {
    try {
        const { 
            code, name, device, autoplayWait, speed, gameCount, state = 1,
            revolutions, spinDuration, onStopTime, inactivityTime 
        } = req.body;

        const [result] = await pool.query('CALL InsertCarouselAndMinigame(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            code,
            name,
            device,
            autoplayWait,
            speed,
            gameCount,
            state,
            revolutions,
            spinDuration,
            onStopTime,
            inactivityTime
        ]);

        // Get the inserted carousel ID from the result
        const carouselId = result.insertId;
        
        console.log('Inserted new carousel and minigame:', { carouselId, code, name });
        res.json({ success: true, carouselId: carouselId });
    } catch (error) {
        console.error('Error inserting carousel and minigame:', error);
        // Check for duplicate entry error (MySQL error code 1062)
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(409).json({ 
                success: false, 
                error: `Carousel code ${req.body.code} already exists. Please use a different code.`,
                isDuplicateCode: true
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }
});
// #endregion CAROUSELS