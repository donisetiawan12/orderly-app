const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const multer = require('multer'); // <-- 1. PASTIKAN MULTER SUDAH DI-REQUIRE

// 2. Setting konfigurasi penyimpanan file gambar (jika belum ada)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products/'); // arahkan ke folder upload lu
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// ================= 1. GET ALL PRODUCTS =================
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

// ================= 2. POST: TAMBAH PRODUK BARU =================
// FIXED: Tambahkan `upload.single('image')` sebagai middleware di sini!
router.post('/', upload.single('image'), async (req, res) => {
    try {
        // Sekarang req.body DIJAMIN gak bakal undefined lagi karena udah di-parse Multer
        const { name, price, quantity, description, seller_id, po_quota, po_deadline, category_id } = req.body;
        
        const image = req.file ? req.file.filename : null; 
        
        // Validasi data kosong agar presisi masuk ke MySQL
        const finalDeadline = (!po_deadline || po_deadline === "" || po_deadline === "undefined") ? null : po_deadline;
        const finalCategory = (!category_id || category_id === "" || category_id === "undefined") ? null : parseInt(category_id);
        const finalQuota = (!po_quota || po_quota === "" || po_quota === "undefined") ? 0 : parseInt(po_quota);
        const finalStock = (!quantity || quantity === "" || quantity === "undefined") ? 0 : parseInt(quantity);

        const sql = `
            INSERT INTO products (name, price, quantity, description, seller_id, image, po_quota, po_deadline, category_id, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `;
        
        await db.query(sql, [name, price, finalStock, description, seller_id, image, finalQuota, finalDeadline, finalCategory]);

        res.status(201).json({
            status: "success",
            message: "🚀 Produk baru berhasil dimasukkan ke database!"
        });
    } catch (err) {
        console.error("🔥 INSERT ERROR ASLI DARI DATABASE:", err.message);
        res.status(500).json({ message: 'Gagal menyimpan produk ke database: ' + err.message });
    }
});

// ================= 3. PUT: EDIT DATA PRODUK =================
// FIXED: Tambahkan juga `upload.single('image')` di sini!
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, price, quantity, description, po_quota, po_deadline, category_id } = req.body;
        
        const finalDeadline = (!po_deadline || po_deadline === "" || po_deadline === "undefined") ? null : po_deadline;
        const finalCategory = (!category_id || category_id === "" || category_id === "undefined") ? null : parseInt(category_id);
        const finalQuota = (!po_quota || po_quota === "" || po_quota === "undefined") ? 0 : parseInt(po_quota);
        const finalStock = (!quantity || quantity === "" || quantity === "undefined") ? 0 : parseInt(quantity);

        let sql = `UPDATE products SET name = ?, price = ?, quantity = ?, description = ?, po_quota = ?, po_deadline = ?, category_id = ?`;
        let params = [name, price, finalStock, description, finalQuota, finalDeadline, finalCategory];

        if (req.file) {
            sql += `, image = ?`;
            params.push(req.file.filename);
        }

        sql += ` WHERE id = ?`;
        params.push(id);

        await db.query(sql, params);

        res.json({
            status: "success",
            message: "✨ Data produk berhasil diperbarui!"
        });
    } catch (err) {
        console.error("🔥 UPDATE ERROR ASLI DARI DATABASE:", err.message);
        res.status(500).json({ message: 'Gagal memperbarui data produk: ' + err.message });
    }
});

// ================= 4. DELETE: HAPUS PRODUK =================
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({
            status: "success",
            message: "🗑️ Produk berhasil dihapus dari sistem!"
        });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: 'Gagal menghapus produk' });
    }
});

module.exports = router;