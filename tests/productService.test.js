const productService = require('../src/services/ProductService');
const productRepository = require('../src/repositories/ProductRepository');
const supplierRepository = require('../src/repositories/SupplierRepository');
const { truncateTables } = require('./utils/database');

describe('ProductService', () => {
  let supplierId;

  beforeEach(async () => {
    await truncateTables();
    supplierId = await supplierRepository.create({
      name: 'Fornecedor Principal',
      email: 'principal@supplier.com',
      phone: '11999999999',
      address: 'Rua A, 123',
      cnpj: '11.222.333/0001-44'
    });
  });

  test('should create product linked to an existing supplier', async () => {
    const productId = await productService.createProduct({
      name: 'Produto Teste',
      description: 'Descrição do produto',
      price: 199.9,
      original_price: 250,
      condition_description: 'Quase novo',
      stock: 5,
      supplier_id: supplierId
    });

    const product = await productRepository.findById(productId);
    expect(product).not.toBeNull();
    expect(product.supplier_id).toBe(supplierId);
    expect(product.supplier?.name).toBe('Fornecedor Principal');
  });

  test('should allow creating product without supplier', async () => {
    const productId = await productService.createProduct({
      name: 'Produto sem fornecedor',
      description: '',
      price: 50,
      original_price: null,
      condition_description: '',
      stock: 1
    });

    const product = await productRepository.findById(productId);
    expect(product).not.toBeNull();
    expect(product.supplier_id).toBeNull();
  });

  test('should reject creation when supplier does not exist', async () => {
    await expect(
      productService.createProduct({
        name: 'Produto inválido',
        description: '',
        price: 100,
        original_price: null,
        condition_description: '',
        stock: 2,
        supplier_id: 999 // inexistente
      })
    ).rejects.toThrow('Fornecedor informado não existe');
  });

  test('should validate supplier during update', async () => {
    const productId = await productService.createProduct({
      name: 'Produto atualizado',
      description: '',
      price: 10,
      original_price: null,
      condition_description: '',
      stock: 3,
      supplier_id: supplierId
    });

    await expect(
      productService.updateProduct(productId, {
        supplier_id: 123456 // não existe
      })
    ).rejects.toThrow('Fornecedor informado não existe');
  });

  test('should detach supplier when supplier_id is null on update', async () => {
    const productId = await productService.createProduct({
      name: 'Produto com fornecedor',
      description: '',
      price: 10,
      original_price: null,
      condition_description: '',
      stock: 3,
      supplier_id: supplierId
    });

    await productService.updateProduct(productId, {
      supplier_id: null
    });

    const product = await productRepository.findById(productId);
    expect(product.supplier_id).toBeNull();
  });

  test('should reject invalid supplier_id format', async () => {
    await expect(
      productService.createProduct({
        name: 'Produto inválido formato',
        description: '',
        price: 10,
        original_price: null,
        condition_description: '',
        stock: 1,
        supplier_id: 'abc'
      })
    ).rejects.toThrow('Fornecedor inválido');
  });

  test('should parse numeric supplier_id from string', async () => {
    const productId = await productService.createProduct({
      name: 'Produto com string',
      description: '',
      price: 10,
      original_price: null,
      condition_description: '',
      stock: 1,
      supplier_id: String(supplierId)
    });

    const product = await productRepository.findById(productId);
    expect(product.supplier_id).toBe(supplierId);
  });
});

