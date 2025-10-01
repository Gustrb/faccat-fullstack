const express = require('express');
const router = express.Router();
const cartController = require('../controllers/CartController');
const { authenticateToken } = require('../middleware/auth');

// Todas as rotas do carrinho requerem autenticação
router.use(authenticateToken);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/update', cartController.updateCartItem);
router.delete('/remove', cartController.removeFromCart);

module.exports = router;
