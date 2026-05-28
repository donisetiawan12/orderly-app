const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken); // Semua route di bawah ini butuh login

router.post('/', cartController.addToCart);
router.get('/', cartController.getCartItems);
router.delete('/:id', cartController.removeFromCart);

module.exports = router;