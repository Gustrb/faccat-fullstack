const productRepository = require('../repositories/ProductRepository');

class ProductService {
  async createProduct(productData) {
    return await productRepository.create(productData);
  }

  async getAllProducts() {
    return await productRepository.findAll();
  }

  async getProductById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    return product;
  }

  async updateProduct(id, productData) {
    const updated = await productRepository.update(id, productData);
    if (!updated) {
      throw new Error('Produto não encontrado');
    }
    return { message: 'Produto atualizado com sucesso' };
  }

  async deleteProduct(id) {
    const deleted = await productRepository.delete(id);
    if (!deleted) {
      throw new Error('Produto não encontrado');
    }
    return { message: 'Produto excluído com sucesso' };
  }

  async updateStock(id, stock) {
    const updated = await productRepository.updateStock(id, stock);
    if (!updated) {
      throw new Error('Produto não encontrado');
    }
    return { message: 'Estoque atualizado com sucesso' };
  }

  async validateStock(productId, quantity) {
    const product = await productRepository.findById(productId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    
    if (product.stock < quantity) {
      throw new Error(`Estoque insuficiente. Disponível: ${product.stock}`);
    }
    
    return true;
  }

  async reduceStock(productId, quantity) {
    const success = await productRepository.reduceStock(productId, quantity);
    if (!success) {
      throw new Error('Erro ao reduzir estoque');
    }
    return true;
  }

  async restoreStock(productId, quantity) {
    const success = await productRepository.restoreStock(productId, quantity);
    if (!success) {
      throw new Error('Erro ao restaurar estoque');
    }
    return true;
  }
}

module.exports = new ProductService();
