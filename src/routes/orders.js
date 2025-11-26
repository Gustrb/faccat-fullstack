const express = require('express');
const router = express.Router();
const orderController = require('../controllers/OrderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Rotas protegidas
router.post('/', authenticateToken, orderController.createOrder);
router.get('/', authenticateToken, orderController.getUserOrders);

// Rotas de admin
router.get('/admin', authenticateToken, requireAdmin, orderController.getAllOrders);
router.get(
  '/reports/dashboard',
  authenticateToken,
  requireAdmin,
  orderController.getDashboardMetrics
);
router.get(
  '/reports/sales',
  authenticateToken,
  requireAdmin,
  orderController.getSalesReport
);
router.get(
  '/reports/financial',
  authenticateToken,
  requireAdmin,
  orderController.getFinancialReport
);
router.put('/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);

module.exports = router;

