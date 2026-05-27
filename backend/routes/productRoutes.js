const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');
// GUNAKAN KURUNG KURAWAL DISINI:
const { uploadProduct } = require('../middleware/uploadMiddleware');

router.post('/', verifyToken, verifyRole('seller'), uploadProduct, productController.createProduct);
router.get('/', productController.getAllProducts);


router.put('/:id', verifyToken, verifyRole('seller'), productController.updateProduct);
router.delete('/:id', verifyToken, verifyRole('seller'), productController.deleteProduct);

module.exports = router;

module.exports = router;