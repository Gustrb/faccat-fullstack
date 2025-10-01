const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Rotas protegidas
router.post('/', authenticateToken, orderController.createOrder);
router.get('/', authenticateToken, orderController.getUserOrders);

// Rotas de admin
router.get('/admin', authenticateToken, requireAdmin, orderController.getAllOrders);
router.put('/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);

module.exports = router;

