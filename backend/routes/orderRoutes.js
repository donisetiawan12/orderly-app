const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware'); 

// PENTING: Samakan namanya dengan export middleware lu yaitu uploadPayment
const { uploadPayment } = require('../middleware/uploadMiddleware'); 

// 1. Stats (Harus di atas agar tidak dianggap sebagai ID)
router.get('/stats', verifyToken, verifyRole('seller'), orderController.getSellerStats);

// 2. Transaksi Dasar
router.post('/', verifyToken, orderController.createOrder);
router.get('/', verifyToken, orderController.getMyOrders);

// 3. Update Status (Upload Bukti Bayar oleh Buyer)
// Menggunakan uploadPayment yang sudah sinkron dengan middleware lu
router.put('/:id/payment', verifyToken, uploadPayment, orderController.uploadPaymentProof);

// 4. Update Status (Proses oleh Seller: confirmed, shipped, completed)
router.put('/:id/status', verifyToken, verifyRole('seller'), orderController.updateOrderStatus);

// 5. Tambah Ulasan
router.post('/review', verifyToken, orderController.addReview);

module.exports = router;