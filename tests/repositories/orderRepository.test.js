const orderRepository = require('../../src/repositories/OrderRepository');
const productRepository = require('../../src/repositories/ProductRepository');
const userRepository = require('../../src/repositories/UserRepository');
const { truncateTables, db } = require('../utils/database');

describe('OrderRepository', () => {
  let userId;
  let productId;

  const insertOrderWithItem = async (status, total, createdAt = null) => {
    const orderId = await orderRepository.create({
      user_id: userId,
      total
    });
    if (createdAt) {
      await new Promise((resolve, reject) => {
        db.getConnection().run(
          'UPDATE orders SET created_at = ? , status = ? WHERE id = ?',
          [createdAt, status, orderId],
          (err) => (err ? reject(err) : resolve())
        );
      });
    } else {
      await orderRepository.updateStatus(orderId, status);
    }
    await new Promise((resolve, reject) => {
      db.getConnection().run(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, productId, 2, 15],
        (err) => (err ? reject(err) : resolve())
      );
    });
    return orderId;
  };

  beforeEach(async () => {
    await truncateTables();
    userId = await userRepository.create({
      name: 'comprador',
      email: `comprador-${Date.now()}@test.com`,
      password: 'hash',
      role: 'client'
    });
    productId = await productRepository.create({
      name: 'item',
      description: '',
      price: 15,
      original_price: null,
      condition_description: '',
      image_url: null,
      stock: 10
    });
  });

  test('basic CRUD and getters', async () => {
    const orderId = await orderRepository.create({ user_id: userId, total: 30 });
    const fetched = await orderRepository.findById(orderId);
    expect(fetched.total).toBe(30);

    await orderRepository.updateStatus(orderId, 'delivered');
    expect(await orderRepository.getCurrentStatus(orderId)).toBe('delivered');
  });

  test('aggregations return valid data', async () => {
    const now = new Date();
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);

    await insertOrderWithItem('delivered', 50);
    await insertOrderWithItem('pending', 30, previousMonth.toISOString());
    await insertOrderWithItem('cancelled', 10);

    const totals = await orderRepository.getTotalsBetween();
    expect(totals.total_sales).toBeGreaterThan(0);

    const monthly = await orderRepository.getMonthlySalesSummary(6);
    expect(monthly.length).toBeGreaterThan(0);

    const bestSeller = await orderRepository.getBestSellingProduct(
      '2000-01-01 00:00:00',
      '2100-01-01 00:00:00'
    );
    expect(bestSeller.product_id).toBe(productId);

    const topProducts = await orderRepository.getTopProducts(5);
    expect(topProducts.length).toBeGreaterThan(0);

    const statusTotals = await orderRepository.getStatusTotals();
    expect(statusTotals.length).toBeGreaterThan(0);

    const avg = await orderRepository.getAverageTicket();
    expect(avg).toBeGreaterThan(0);
  });
});

