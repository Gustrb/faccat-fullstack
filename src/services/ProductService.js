const productRepository = require('../repositories/ProductRepository');
const supplierRepository = require('../repositories/SupplierRepository');

class ProductService {
  async createProduct(productData) {
    const supplierId = this.normalizeSupplierId(productData.supplier_id);
    await this.ensureSupplierExists(supplierId);
    return await productRepository.create({
      ...productData,
      supplier_id: supplierId
    });
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
    const supplierId =
      productData.supplier_id !== undefined
        ? this.normalizeSupplierId(productData.supplier_id)
        : undefined;

    if (supplierId !== undefined) {
      await this.ensureSupplierExists(supplierId);
    }

    const updated = await productRepository.update(id, {
      ...productData,
      supplier_id: supplierId
    });
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

  async ensureSupplierExists(supplierId) {
    if (!supplierId) {
      return;
    }

    const supplier = await supplierRepository.findById(supplierId);
    if (!supplier) {
      throw new Error('Fornecedor informado não existe');
    }
  }

  normalizeSupplierId(value) {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new Error('Fornecedor inválido');
    }

    return parsed;
  }
}

module.exports = new ProductService();

