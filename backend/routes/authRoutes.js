const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
// GUNAKAN KURUNG KURAWAL DISINI:
const { uploadKTM } = require('../middleware/uploadMiddleware'); 

// 🔥 BARIS SAKTI: Import koneksi DB biar gak 'db is not defined' lagi abangkuh!
const db = require('../config/db'); 

// Pastikan di sini uploadKTM tidak undefined
router.post('/register', uploadKTM, authController.register);

router.post('/login', authController.login);

// 🚀 UPDATE DI FILE backend/routes/authRoutes.js
router.get('/me', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; 

        // Tarik data fresh langsung dari baris user di DB phpMyAdmin lu bray
        const sql = `
            SELECT id, name, email, role, verification_status, phone, address, profile_picture 
            FROM users 
            WHERE id = ?
        `;
        const [rows] = await db.execute(sql, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ status: 404, message: "User kagak ketemu bray!" });
        }

        return res.status(200).json({
            status: 200,
            message: "Data berhasil dimuat bray!",
            user: rows[0] // Mengirimkan seluruh objek user (termasuk email & profile_picture)
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
router.put('/admin/verify-seller/:id', verifyToken, verifyRole('admin'), authController.approveSeller);

// 🔥 SEKARANG DI SINI SUDAH DIPANGGIL LEWAT authController AGAR TIDAK REFERENCE ERROR BRAY
router.get('/admin/total-buyers', verifyToken, verifyRole('admin'), authController.getTotalBuyers);

// 🚀 UPDATE ROUTE DI backend/routes/authRoutes.js (Bisa terima upload file bray!)
router.put('/update-profile', verifyToken, uploadKTM, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, address } = req.body; 
        
        let profilePicturePath = null;
        
        // Kalau user ada nge-upload file foto baru bray
        if (req.file) {
            // Kita cuma ambil nama filenya doang (misal: ktm-1781374839347.png)
            // Sesuai config multer lu, kalau req.file.filename cuma nama file, pake itu bray.
            profilePicturePath = req.file.filename; 
        }

        if (!name) {
            return res.status(400).json({ status: 400, message: "Nama wajib diisi bray!" });
        }

        // Jalankan Query SQL pintar (kalau gak upload foto baru, jangan timpa foto lama)
        let sql = "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?";
        let params = [name, phone || null, address || null, userId];

        if (req.file) {
            sql = "UPDATE users SET name = ?, phone = ?, address = ?, profile_picture = ? WHERE id = ?";
            params = [name, phone || null, address || null, profilePicturePath, userId];
        }

        const [result] = await db.execute(sql, params);

        return res.status(200).json({
            status: 200,
            message: "Profil & Foto lu berhasil diperbarui abangkuh! 🔥"
        });
    } catch (error) {
        console.error('❌ EROR NYATA DI DATABASE LU BRAY:', error);
        return res.status(500).json({ status: 500, message: "Gagal: " + error.message });
    }
});

module.exports = router;