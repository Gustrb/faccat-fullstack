const orderService = require('../src/services/OrderService');
const productRepository = require('../src/repositories/ProductRepository');
const { truncateTables, db } = require('./utils/database');

const runQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.getConnection().run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });

const insertUser = async () =>
  runQuery('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [
    'Usuário Teste',
    `user${Date.now()}@teste.com`,
    'hash',
    'client'
  ]);

const insertSupplier = async () =>
  runQuery(
    'INSERT INTO suppliers (name, email, phone, address, cnpj) VALUES (?, ?, ?, ?, ?)',
    ['Fornecedor Dashboard', 'dash@supplier.com', '1100000000', 'Rua A, 123', '11.111.111/0001-11']
  );

const insertOrder = async (userId, total, status) => {
  const createdAt = new Date();
  const formattedDate = createdAt.toISOString().replace('T', ' ').replace('Z', '');
  return runQuery(
    'INSERT INTO orders (user_id, total, status, created_at) VALUES (?, ?, ?, ?)',
    [userId, total, status, formattedDate]
  );
};

const insertOrderItem = async (orderId, productId, quantity, price) =>
  runQuery(
    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
    [orderId, productId, quantity, price]
  );

describe('OrderService dashboard metrics', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  test('should aggregate monthly totals, best seller and low stock', async () => {
    const userId = await insertUser();
    const supplierId = await insertSupplier();

    const lowStockProductId = await productRepository.create({
      name: 'Console com poucos itens',
      description: 'Produto com estoque baixo',
      price: 1200,
      original_price: 2000,
      condition_description: '',
      image_url: null,
      stock: 2,
      supplier_id: supplierId
    });

    const regularProductId = await productRepository.create({
      name: 'Notebook disponível',
      description: 'Produto com estoque normal',
      price: 2500,
      original_price: 3000,
      condition_description: '',
      image_url: null,
      stock: 12,
      supplier_id: supplierId
    });

    const completedOrderId = await insertOrder(userId, 1000, 'completed');
    await insertOrderItem(completedOrderId, lowStockProductId, 1, 600);
    await insertOrderItem(completedOrderId, regularProductId, 2, 200);

    const pendingOrderId = await insertOrder(userId, 500, 'pending');
    await insertOrderItem(pendingOrderId, lowStockProductId, 3, 100);

    const cancelledOrderId = await insertOrder(userId, 300, 'cancelled');
    await insertOrderItem(cancelledOrderId, regularProductId, 5, 60);

    const metrics = await orderService.getDashboardMetrics();

    expect(metrics.month.total_sales).toBe(1500);
    expect(metrics.month.orders_count).toBe(2);
    expect(metrics.best_seller?.product_id).toBe(lowStockProductId);
    expect(metrics.best_seller?.total_quantity).toBe(4);
    expect(metrics.low_stock.length).toBeGreaterThanOrEqual(1);
    expect(metrics.low_stock[0].id).toBe(lowStockProductId);
    expect(metrics.low_stock[0].supplier?.name).toBe('Fornecedor Dashboard');
  });
});

