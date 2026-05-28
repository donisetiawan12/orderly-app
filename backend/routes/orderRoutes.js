const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
// Tambahkan verifyRole ke sini agar bisa dipakai
const { verifyToken, verifyRole } = require('../middleware/authMiddleware'); 
const { uploadPayment } = require('../middleware/uploadMiddleware');

// 1. Stats (Harus di atas agar tidak dianggap sebagai ID)
router.get('/stats', verifyToken, verifyRole('seller'), orderController.getSellerStats);

// 2. Transaksi Dasar
router.post('/', verifyToken, orderController.createOrder);
router.get('/', verifyToken, orderController.getMyOrders);

// 3. Update Status (Upload Bukti Bayar oleh Buyer)
router.put('/:id/payment', verifyToken, uploadPayment, orderController.uploadPaymentProof);

// 4. Update Status (Proses oleh Seller: confirmed, shipped, completed)
router.put('/:id/status', verifyToken, verifyRole('seller'), orderController.updateOrderStatus);

// Tambahkan ini di orderRoutes.js
router.post('/review', verifyToken, orderController.addReview);

module.exports = router;