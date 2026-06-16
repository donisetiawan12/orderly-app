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
router.post('/', upload.single('image'), async (req, res) => {
    try {
        // 🚀 AMBIL VARIABEL 'location' DARI req.body
        const { name, price, quantity, description, seller_id, po_quota, po_deadline, category_id, location } = req.body;
        
        const image = req.file ? req.file.filename : null; 
        
        // Validasi data kosong agar presisi masuk ke MySQL
        const finalDeadline = (!po_deadline || po_deadline === "" || po_deadline === "undefined") ? null : po_deadline;
        const finalCategory = (!category_id || category_id === "" || category_id === "undefined") ? null : parseInt(category_id);
        const finalQuota = (!po_quota || po_quota === "" || po_quota === "undefined") ? 0 : parseInt(po_quota);
        const finalStock = (!quantity || quantity === "" || quantity === "undefined") ? 0 : parseInt(quantity);
        
        // 🚀 DAFTARKAN KOLOM 'location' KE QUERY INSERT INTO
        const sql = `
            INSERT INTO products (name, price, quantity, description, seller_id, image, po_quota, po_deadline, category_id, location, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `;
        
        // 🚀 MASUKKAN DATA LOCATION (fallback ke 'Kampus A' kalau kosong)
        await db.query(sql, [name, price, finalStock, description, seller_id, image, finalQuota, finalDeadline, finalCategory, location || 'Kampus A']);

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
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        // 🚀 AMBIL VARIABEL 'location' DARI req.body SAAT UPDATE
        const { name, price, quantity, description, po_quota, po_deadline, category_id, location } = req.body;
        
        const finalDeadline = (!po_deadline || po_deadline === "" || po_deadline === "undefined") ? null : po_deadline;
        const finalCategory = (!category_id || category_id === "" || category_id === "undefined") ? null : parseInt(category_id);
        const finalQuota = (!po_quota || po_quota === "" || po_quota === "undefined") ? 0 : parseInt(po_quota);
        const finalStock = (!quantity || quantity === "" || quantity === "undefined") ? 0 : parseInt(quantity);

        // 🚀 MASUKKAN 'location = ?' KE DALAM STRING UPDATE SQL
        let sql = `UPDATE products SET name = ?, price = ?, quantity = ?, description = ?, po_quota = ?, po_deadline = ?, category_id = ?, location = ?`;
        let params = [name, price, finalStock, description, finalQuota, finalDeadline, finalCategory, location || 'Kampus A'];

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

// =========================================================================
// 🚀 5. GET: AMBIL SEMUA ULASAN PEMBELI KHUSUS UNTUK PRODUK MILIK SELLER
// =========================================================================
router.get('/seller/reviews/:seller_id', async (req, res) => {
    try {
        const { seller_id } = req.params;

        // Query sakti JOIN 3 tabel menggunakan db.query() async/await
        const sql = `
            SELECT 
                r.id AS review_id,
                r.rating,
                r.comment,
                r.created_at,
                p.name AS product_name,
                p.image AS product_image,
                u.name AS buyer_name
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            JOIN users u ON r.buyer_id = u.id
            WHERE p.seller_id = ? 
            ORDER BY r.created_at DESC
        `;

        const [results] = await db.query(sql, [seller_id]);

        res.json({
            status: "success",
            data: results
        });
    } catch (err) {
        console.error("🔥 GET REVIEWS ERROR ASLI:", err.message);
        res.status(500).json({ message: 'Gagal memuat ulasan produk: ' + err.message });
    }
});

// =========================================================================
// 🚀 6. GET: AMBIL ULASAN PER PRODUK UNTUK NESTED POP-UP BUYER (TERBARU)
// =========================================================================
router.get('/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT 
                r.id,
                r.rating,
                r.comment,
                r.created_at,
                u.name AS buyer_name
            FROM reviews r
            JOIN users u ON r.buyer_id = u.id
            WHERE r.product_id = ?
            ORDER BY r.created_at DESC
        `;

        const [results] = await db.query(sql, [id]);

        // Mengikuti standard response object file lu: { status: "success", data: ... }
        res.json({
            status: "success",
            data: results
        });
    } catch (err) {
        console.error("🔥 GET PRODUCT REVIEWS ERROR:", err.message);
        res.status(500).json({ message: 'Gagal memuat ulasan produk bray: ' + err.message });
    }
});

module.exports = router;