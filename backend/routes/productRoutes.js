// 1. TAMBAHKAN DUA BARIS INI DI PALING ATAS
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Sesuaikan path ini jika perlu

// 2. BARU GUNAKAN router DI SINI
router.get('/', async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.*, 
                u.name AS seller_name,
                COALESCE(AVG(r.rating), 0) AS avg_rating, 
                COUNT(r.id) AS total_reviews
            FROM products p
            JOIN users u ON p.seller_id = u.id
            LEFT JOIN reviews r ON p.id = r.product_id
            GROUP BY p.id
        `;

        const [results] = await db.query(sql); 
        
        res.json({
            status: "success",
            data: { products: results }
        });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ message: 'Gagal mengambil data produk' });
    }
});

// 3. JANGAN LUPA EKSPOR ROUTER-NYA
module.exports = router;