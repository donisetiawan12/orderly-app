const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Test endpoint untuk verifikasi token
router.get('/me', verifyToken, (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Token valid!",
        user: req.user
    });
});

// Test endpoint untuk role verification (seller only)
router.get('/seller-only', verifyToken, verifyRole('seller', 'admin'), (req, res) => {
    return res.status(200).json({
        status: 200,
        message: "Akses seller berhasil!",
        user: req.user
    });
});

module.exports = router;