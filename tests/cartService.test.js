const cartService = require('../src/services/CartService');
const cartRepository = require('../src/repositories/CartRepository');
const productRepository = require('../src/repositories/ProductRepository');
const userRepository = require('../src/repositories/UserRepository');
const { truncateTables } = require('./utils/database');

describe('CartService', () => {
  let userId;
  let productId;

  const createUser = async () => {
    return userRepository.create({
      name: `Cliente ${Date.now()}`,
      email: `cliente${Date.now()}@teste.com`,
      password: 'hash',
      role: 'client'
    });
  };

  const createProduct = async (overrides = {}) => {
    return productRepository.create({
      name: overrides.name || `Produto ${Date.now()}`,
      description: overrides.description || '',
      price: overrides.price || 100,
      original_price: overrides.original_price || null,
      condition_description: overrides.condition_description || '',
      image_url: overrides.image_url || null,
      stock: overrides.stock ?? 10,
      supplier_id: overrides.supplier_id || null
    });
  };

  beforeEach(async () => {
    await truncateTables();
    userId = await createUser();
    productId = await createProduct();
  });

  test('addToCart should insert new item and increment quantity when already in cart', async () => {
    await cartService.addToCart(userId, productId, 2);
    let item = await cartRepository.findExistingItem(userId, productId);
    expect(item.quantity).toBe(2);

    await cartService.addToCart(userId, productId, 1);
    item = await cartRepository.findExistingItem(userId, productId);
    expect(item.quantity).toBe(3);
  });

  test('addToCart should reject when resulting quantity exceeds stock', async () => {
    const limitedProductId = await createProduct({ stock: 2, name: 'Limitado' });

    await cartService.addToCart(userId, limitedProductId, 1);
    await expect(
      cartService.addToCart(userId, limitedProductId, 2)
    ).rejects.toThrow('Estoque insuficiente');
  });

  test('updateCartItem should remove item when quantity becomes zero or negative', async () => {
    await cartService.addToCart(userId, productId, 2);

    const response = await cartService.updateCartItem(userId, productId, 0);
    expect(response.message).toBe('Item removido do carrinho');

    const item = await cartRepository.findExistingItem(userId, productId);
    expect(item).toBeNull();
  });

  test('updateCartItem should validate stock and update quantity', async () => {
    await cartService.addToCart(userId, productId, 1);

    const response = await cartService.updateCartItem(userId, productId, 5);
    expect(response.message).toBe('Carrinho atualizado');

    const item = await cartRepository.findExistingItem(userId, productId);
    expect(item.quantity).toBe(5);

    await expect(
      cartService.updateCartItem(userId, productId, 500)
    ).rejects.toThrow('Estoque insuficiente');
  });

  test('getCart should remove items that are out of stock and report message', async () => {
    const outOfStockProductId = await createProduct({ stock: 0, name: 'Esgotado' });
    await cartRepository.addItem(userId, outOfStockProductId, 1);

    const result = await cartService.getCart(userId);

    expect(Array.isArray(result.items)).toBe(true);
    expect(result.removedItems).toContain('Esgotado');
    expect(result.message).toMatch(/Produtos removidos do carrinho/);

    const remaining = await cartRepository.findExistingItem(userId, outOfStockProductId);
    expect(remaining).toBeNull();
  });

  test('removeFromCart and clearCart should empty cart entries', async () => {
    const anotherProductId = await createProduct({ name: 'Outro', stock: 3 });
    await cartService.addToCart(userId, productId, 1);
    await cartService.addToCart(userId, anotherProductId, 1);

    await cartService.removeFromCart(userId, productId);
    expect(await cartRepository.findExistingItem(userId, productId)).toBeNull();

    await cartService.clearCart(userId);
    expect(await cartRepository.findExistingItem(userId, anotherProductId)).toBeNull();
  });
});

