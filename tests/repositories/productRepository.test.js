const productRepository = require('../../src/repositories/ProductRepository');
const supplierRepository = require('../../src/repositories/SupplierRepository');
const { truncateTables } = require('../utils/database');

describe('ProductRepository', () => {
  let supplierId;

  beforeEach(async () => {
    await truncateTables();
    supplierId = await supplierRepository.create({
      name: 'Fornecedor Repo',
      email: 'repo@supplier.com',
      phone: '11999999999',
      address: 'Rua Repo',
      cnpj: '00.000.000/0001-00'
    });
  });

  const createProduct = async (overrides = {}) =>
    productRepository.create({
      name: overrides.name || 'Produto Repo',
      description: overrides.description || '',
      price: overrides.price || 100,
      original_price: overrides.original_price || null,
      condition_description: overrides.condition_description || '',
      image_url: overrides.image_url || null,
      stock: overrides.stock ?? 5,
      supplier_id: overrides.supplier_id ?? supplierId
    });

  test('should create, find and update products with supplier info', async () => {
    const productId = await createProduct();
    const product = await productRepository.findById(productId);
    expect(product.supplier_id).toBe(supplierId);
    expect(product.supplier.name).toBe('Fornecedor Repo');

    await productRepository.update(productId, {
      price: 120,
      stock: 3,
      supplier_id: null
    });

    const updated = await productRepository.findById(productId);
    expect(updated.price).toBe(120);
    expect(updated.supplier_id).toBeNull();
  });

  test('should list products and handle stock operations', async () => {
    const productId = await createProduct({ stock: 10 });
    const list = await productRepository.findAll();
    expect(list.length).toBe(1);

    await productRepository.updateStock(productId, 8);
    await productRepository.reduceStock(productId, 3);
    await productRepository.restoreStock(productId, 2);

    const product = await productRepository.findById(productId);
    expect(product.stock).toBe(7);
  });

  test('should fetch low stock products and detach supplier', async () => {
    const lowId = await createProduct({ name: 'Critico', stock: 1 });
    const lowStock = await productRepository.findLowStockProducts(2);
    expect(lowStock.map((p) => p.id)).toContain(lowId);

    await productRepository.detachSupplierFromProducts(supplierId);
    const product = await productRepository.findById(lowId);
    expect(product.supplier_id).toBeNull();
  });

  test('should delete product', async () => {
    const productId = await createProduct();
    await productRepository.delete(productId);
    expect(await productRepository.findById(productId)).toBeNull();
  });

  test('update with no fields returns false', async () => {
    const productId = await createProduct();
    const result = await productRepository.update(productId, {});
    expect(result).toBe(false);
  });

  test('update handles all optional fields', async () => {
    const productId = await createProduct();
    await productRepository.update(productId, {
      description: 'Nova descrição',
      original_price: 150,
      condition_description: 'Usado',
      image_url: '/fake/path.jpg',
      name: 'Atualizado'
    });
    const product = await productRepository.findById(productId);
    expect(product.description).toBe('Nova descrição');
    expect(product.original_price).toBe(150);
    expect(product.condition_description).toBe('Usado');
    expect(product.image_url).toBe('/fake/path.jpg');
  });
});

