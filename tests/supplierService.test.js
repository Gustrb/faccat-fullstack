const supplierService = require('../src/services/SupplierService');
const productRepository = require('../src/repositories/ProductRepository');
const { truncateTables } = require('./utils/database');

describe('SupplierService', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  test('should perform CRUD operations and detach products on delete', async () => {
    const supplierId = await supplierService.createSupplier({
      name: 'Fornecedor Teste',
      email: 'contato@fornecedor.com',
      phone: '11999999999',
      address: 'Rua Teste, 123',
      cnpj: '12.345.678/0001-90'
    });

    let suppliers = await supplierService.getAllSuppliers();
    expect(suppliers).toHaveLength(1);
    expect(suppliers[0].id).toBe(supplierId);

    await supplierService.updateSupplier(supplierId, {
      phone: '11888888888'
    });

    const individualSupplier = await supplierService.getSupplierById(supplierId);
    expect(individualSupplier.phone).toBe('11888888888');

    const productId = await productRepository.create({
      name: 'Produto Vinculado',
      description: 'Produto para testar vínculo',
      price: 1000,
      original_price: 1200,
      condition_description: '',
      image_url: null,
      stock: 2,
      supplier_id: supplierId
    });

    await supplierService.deleteSupplier(supplierId);

    suppliers = await supplierService.getAllSuppliers();
    expect(suppliers).toHaveLength(0);

    const product = await productRepository.findById(productId);
    expect(product?.supplier_id).toBeNull();
  });

  test('should validate supplier payload', async () => {
    await expect(
      supplierService.createSupplier({
        name: '',
        email: '',
        phone: '',
        address: '',
        cnpj: ''
      })
    ).rejects.toThrow('Nome do fornecedor é obrigatório');
  });
});

