const cartService = require('../services/CartService');

class CartController {
  async getCart(req, res) {
    try {
      const result = await cartService.getCart(req.user.userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async addToCart(req, res) {
    try {
      const { productId, quantity } = req.body;
      const result = await cartService.addToCart(req.user.userId, productId, quantity);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateCartItem(req, res) {
    try {
      const { productId, quantity } = req.body;
      const result = await cartService.updateCartItem(req.user.userId, productId, quantity);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async removeFromCart(req, res) {
    try {
      const { productId } = req.body;
      const result = await cartService.removeFromCart(req.user.userId, productId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new CartController();
