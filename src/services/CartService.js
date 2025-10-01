const cartRepository = require('../repositories/CartRepository');
const productService = require('./ProductService');

class CartService {
  async getCart(userId) {
    const result = await cartRepository.validateAndCleanCart(userId);
    
    if (result.removedItems.length > 0) {
      return {
        items: result.validItems,
        removedItems: result.removedItems,
        message: `Produtos removidos do carrinho (fora de estoque): ${result.removedItems.join(', ')}`
      };
    }
    
    return result.validItems;
  }

  async addToCart(userId, productId, quantity) {
    // Validar estoque
    await productService.validateStock(productId, quantity);
    
    const existingItem = await cartRepository.findExistingItem(userId, productId);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      await productService.validateStock(productId, newQuantity);
      await cartRepository.updateQuantity(userId, productId, newQuantity);
    } else {
      await cartRepository.addItem(userId, productId, quantity);
    }
    
    return { message: 'Produto adicionado ao carrinho' };
  }

  async updateCartItem(userId, productId, quantity) {
    if (quantity <= 0) {
      await cartRepository.removeItem(userId, productId);
      return { message: 'Item removido do carrinho' };
    }
    
    await productService.validateStock(productId, quantity);
    await cartRepository.updateQuantity(userId, productId, quantity);
    
    return { message: 'Carrinho atualizado' };
  }

  async removeFromCart(userId, productId) {
    await cartRepository.removeItem(userId, productId);
    return { message: 'Item removido do carrinho' };
  }

  async clearCart(userId) {
    await cartRepository.clearUserCart(userId);
    return { message: 'Carrinho limpo' };
  }
}

module.exports = new CartService();
