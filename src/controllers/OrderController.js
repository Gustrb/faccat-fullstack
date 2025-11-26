const orderService = require('../services/OrderService');

class OrderController {
  async createOrder(req, res) {
    try {
      const result = await orderService.createOrder(req.user.userId);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getUserOrders(req, res) {
    try {
      const orders = await orderService.getUserOrders(req.user.userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAllOrders(req, res) {
    try {
      const orders = await orderService.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const result = await orderService.updateOrderStatus(req.params.id, status);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getDashboardMetrics(req, res) {
    try {
      const metrics = await orderService.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getSalesReport(req, res) {
    try {
      const months = req.query.months ? parseInt(req.query.months, 10) : 6;
      const report = await orderService.getSalesReport(months);
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getFinancialReport(req, res) {
    try {
      const report = await orderService.getFinancialReport();
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new OrderController();

