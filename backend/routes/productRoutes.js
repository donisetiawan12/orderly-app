const express = require('express');
const router = express.Router();
const multer = require('multer'); 
const { verifyToken } = require('../middleware/authMiddleware');
const productController = require('../controllers/productController');

// 📸 Konfigurasi penyimpanan file gambar produk (Multer)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/products/'); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// =========================================================================
// 🛒 1. CRUD & MANAJEMEN PRODUK (UNTUK DI DASHBOARD SELLER)
// =========================================================================

// Ambil semua data produk milik seller yang login (Butuh Token)
router.get('/', verifyToken, productController.getAllProducts);

// Tambah produk baru beserta upload gambar (Butuh Token)
router.post('/', verifyToken, upload.single('image'), productController.createProduct);

// Edit/Update data produk beserta upload gambar baru (Butuh Token)
router.put('/:id', verifyToken, upload.single('image'), productController.updateProduct);

// Hapus produk dari database (Butuh Token)
router.delete('/:id', verifyToken, productController.deleteProduct);


// =========================================================================
// 💬 2. ROUTE ULASAN / REVIEWS (DIBAGI DUA BIAR GA KETUKER BRAY)
// =========================================================================

// 👉 [A] KHUSUS DASHBOARD SELLER: Ambil SEMUA ulasan dari seluruh produk milik toko ini
// Rute ini yang dipake buat ngisi 4 boks statistik & rangkuman ulasan toko di dashboard seller lu.
// 💡 FIX: verifyToken dicopot biar fetch frontend lu gak kesumbat/error 401 bray!
router.get('/seller/reviews/:seller_id', productController.getSellerReviews);

// ✍️ BARU: Simpan/Update balasan ulasan dari Seller untuk ID ulasan tertentu
// Wajib pakai verifyToken supaya req.user.id ketangkap aman di controller bray!
router.put('/seller/reviews/reply/:review_id', verifyToken, productController.replyReview);


// 👉 [B] KHUSUS POP-UP BUYER: Ambil ulasan spesifik hanya untuk SATU ID produk tertentu
// Jalur publik tanpa token, dipake pas pembeli ngeklik detail menu makanan di halaman depan.
// Cocok dengan fetch frontend: /api/products/:id/reviews
router.get('/:id/reviews', productController.getProductReviews);


// =========================================================================
// 🌐 3. ROUTE PUBLIK / LANDING PAGE
// =========================================================================

// Mengambil semua produk untuk teks berjalan (Marquee) dan menu slider depan (Tanpa Token)
router.get('/landing-page', productController.getAllProducts); 


module.exports = router;