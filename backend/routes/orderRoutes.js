const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware'); 
const { uploadPayment } = require('../middleware/uploadMiddleware'); 

// =========================================================================
// 🔥 POSISI DI ATAS: Biar aman dari bentrok regex / ke-skip sama route generic
// =========================================================================
router.put('/:id/payment', verifyToken, uploadPayment, orderController.uploadPaymentProof);

// 🛠️ ROUTE TAMBAHAN: Update catatan (notes) pesanan sebelum dibayar oleh buyer
router.put('/:id/notes', verifyToken, orderController.updateOrderNotes);

// =========================================================================
// 📊 STATISTIK SELLER
// =========================================================================
router.get('/stats', verifyToken, verifyRole('seller'), orderController.getSellerStats);

// =========================================================================
// 🛒 TRANSAKSI DASAR (BUYER)
// =========================================================================
router.post('/', verifyToken, orderController.createOrder);
router.get('/', verifyToken, orderController.getMyOrders);

// 🛑 ROUTE BARU: Pembatalan pesanan mandiri oleh Buyer (Tanpa verifyRole seller)
router.put('/:id/cancel', verifyToken, orderController.cancelMyOrder);

// =========================================================================
// 👨‍🍳 PROSES STATUS & REVIEW (SELLER & ADMIN)
// =========================================================================
router.put('/:id/status', verifyToken, verifyRole('seller'), orderController.updateOrderStatus);
router.post('/review', verifyToken, orderController.addReview);

module.exports = router;