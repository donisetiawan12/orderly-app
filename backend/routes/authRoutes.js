const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
// GUNAKAN KURUNG KURAWAL DISINI:
const { uploadKTM } = require('../middleware/uploadMiddleware'); 

// Pastikan di sini uploadKTM tidak undefined
router.post('/register', uploadKTM, authController.register);

router.post('/login', authController.login);

// 🚀 GANTI BLOK /me DI FILE authRoutes.js PAKAI VERSI ASYNC-AWAIT & DB.EXECUTE INI BRAY:
router.get('/me', verifyToken, async (req, res) => {
    try {
        // req.user.id dapet otomatis dari middleware verifyToken lu bray
        const userId = req.user.id; 

        // Ambil semua kolom data pembayaran yang baru kita buat bray
        const sql = "SELECT id, name, email, role, bank_name, account_name, account_number, qris_image FROM users WHERE id = ?";
        const [rows] = await db.execute(sql, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ status: 404, message: "User kagak ketemu bray!" });
        }

        return res.status(200).json({
            status: 200,
            message: "Token valid & data berhasil dimuat bray!",
            user: rows[0] // 🚀 Seluruh data bank & qris_image dari DB resmi dikirim ke frontend!
        });

    } catch (error) {
        console.error('❌ Error di route /me:', error.message);
        return res.status(500).json({ status: 500, message: "Kesalahan internal server bray" });
    }
});

// Test endpoint untuk role verification (seller only)
router.get('/seller-only', verifyToken, verifyRole('seller', 'admin'), (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Akses seller berhasil!",
        user: req.user
    });
});

// Cuma admin yang bisa akses
router.get('/admin/pending-sellers', verifyToken, verifyRole('admin'), authController.getPendingSellers);
router.put('/admin/approve-seller/:id', verifyToken, verifyRole('admin'), authController.approveSeller);

module.exports = router;