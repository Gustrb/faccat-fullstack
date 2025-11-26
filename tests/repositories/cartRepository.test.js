const cartRepository = require('../../src/repositories/CartRepository');
const productRepository = require('../../src/repositories/ProductRepository');
const userRepository = require('../../src/repositories/UserRepository');
const { truncateTables } = require('../utils/database');

describe('CartRepository', () => {
  let userId;
  let productId;

  beforeEach(async () => {
    await truncateTables();
    userId = await userRepository.create({
      name: 'Cliente',
      email: `cliente-${Date.now()}@test.com`,
      password: 'hash',
      role: 'client'
    });
    productId = await productRepository.create({
      name: 'Produto',
      description: '',
      price: 10,
      original_price: null,
      condition_description: '',
      image_url: null,
      stock: 5
    });
  });

  test('addItem/find/update/remove/clear cart items', async () => {
    await cartRepository.addItem(userId, productId, 2);
    let existing = await cartRepository.findExistingItem(userId, productId);
    expect(existing.quantity).toBe(2);

    await cartRepository.updateQuantity(userId, productId, 3);
    existing = await cartRepository.findExistingItem(userId, productId);
    expect(existing.quantity).toBe(3);

    const list = await cartRepository.findByUserId(userId);
    expect(list[0].name).toBe('Produto');

    await cartRepository.removeItem(userId, productId);
    expect(await cartRepository.findExistingItem(userId, productId)).toBeNull();

    await cartRepository.addItem(userId, productId, 1);
    await cartRepository.clearUserCart(userId);
    expect(await cartRepository.findExistingItem(userId, productId)).toBeNull();
  });

  test('validateAndCleanCart removes zero-stock and adjusts quantities', async () => {
    const zeroStockProduct = await productRepository.create({
      name: 'Sem estoque',
      description: '',
      price: 20,
      original_price: null,
      condition_description: '',
      image_url: null,
      stock: 0
    });

    await cartRepository.addItem(userId, productId, 10); // greater than stock
    await cartRepository.addItem(userId, zeroStockProduct, 1);

    const result = await cartRepository.validateAndCleanCart(userId);

    expect(result.removedItems).toContain('Sem estoque');
    expect(result.validItems[0].quantity).toBe(5); // adjusted to product stock
  });
});

