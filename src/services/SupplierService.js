const supplierRepository = require('../repositories/SupplierRepository');
const productRepository = require('../repositories/ProductRepository');

class SupplierService {
  async createSupplier(data) {
    this.validatePayload(data);
    return await supplierRepository.create(this.normalizePayload(data));
  }

  async getAllSuppliers() {
    return await supplierRepository.findAll();
  }

  async getSupplierById(id) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new Error('Fornecedor não encontrado');
    }
    return supplier;
  }

  async updateSupplier(id, data) {
    this.validatePayload(data, false);
    const updated = await supplierRepository.update(
      id,
      this.normalizePayload(data)
    );

    if (!updated) {
      throw new Error('Fornecedor não encontrado ou sem alterações');
    }

    return { message: 'Fornecedor atualizado com sucesso' };
  }

  async deleteSupplier(id) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw new Error('Fornecedor não encontrado');
    }

    await productRepository.detachSupplierFromProducts(id);
    await supplierRepository.delete(id);

    return { message: 'Fornecedor removido com sucesso' };
  }

  validatePayload(data, isCreate = true) {
    if (isCreate && !data.name) {
      throw new Error('Nome do fornecedor é obrigatório');
    }
  }

  normalizePayload(data) {
    const payload = { ...data };
    ['name', 'email', 'phone', 'address', 'cnpj'].forEach((field) => {
      if (payload[field] !== undefined && payload[field] !== null) {
        payload[field] = String(payload[field]).trim();
      }
    });
    return payload;
  }
}

module.exports = new SupplierService();

