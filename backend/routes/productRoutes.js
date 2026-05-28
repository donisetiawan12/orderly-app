const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
const { uploadProduct } = require('../middleware/uploadMiddleware');

// 1. Public Routes (Bisa diakses siapa saja)
router.get('/', productController.getAllProducts);
// Taruh get detail di sini agar tidak tertukar dengan route lain
router.get('/:id', productController.getProductDetail); 

// 2. Seller Routes (Memerlukan login & role seller)
router.post('/', verifyToken, verifyRole('seller'), uploadProduct, productController.createProduct);
router.put('/:id', verifyToken, verifyRole('seller'), productController.updateProduct);
router.delete('/:id', verifyToken, verifyRole('seller'), productController.deleteProduct);

module.exports = router;