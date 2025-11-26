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

describe('OrderService reports', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  const setupOrders = async () => {
    const userId = await insertUser();
    const supplierId = await insertSupplier();

    const phoneId = await productRepository.create({
      name: 'Telefone',
      description: '',
      price: 800,
      original_price: 1000,
      condition_description: '',
      image_url: null,
      stock: 10,
      supplier_id: supplierId
    });

    const laptopId = await productRepository.create({
      name: 'Notebook',
      description: '',
      price: 2000,
      original_price: 2500,
      condition_description: '',
      image_url: null,
      stock: 10,
      supplier_id: supplierId
    });

    // Mes atual - completed
    const order1 = await insertOrder(userId, 2800, 'delivered');
    await insertOrderItem(order1, phoneId, 1, 800);
    await insertOrderItem(order1, laptopId, 1, 2000);

    // Mes anterior - pending
    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);
    const formatted = pastDate.toISOString().replace('T', ' ').replace('Z', '');
    const order2 = await runQuery(
      'INSERT INTO orders (user_id, total, status, created_at) VALUES (?, ?, ?, ?)',
      [userId, 1000, 'pending', formatted]
    );
    await insertOrderItem(order2, phoneId, 2, 500);

    // Cancelado não deve contar
    const cancelled = await insertOrder(userId, 500, 'cancelled');
    await insertOrderItem(cancelled, laptopId, 1, 500);

    return { phoneId, laptopId };
  };

  test('getSalesReport should include monthly totals and top products', async () => {
    await setupOrders();

    const report = await orderService.getSalesReport(6);

    expect(report.monthly.length).toBeGreaterThan(0);
    expect(report.monthly[0]).toHaveProperty('period');
    expect(report.top_products[0].total_quantity).toBeGreaterThanOrEqual(
      report.top_products[1]?.total_quantity || 0
    );
  });

  test('getFinancialReport should summarize revenue, ticket and statuses', async () => {
    await setupOrders();

    const report = await orderService.getFinancialReport();

    expect(report.lifetime_revenue).toBe(3800);
    expect(report.lifetime_orders).toBe(2);
    expect(report.average_ticket).toBeGreaterThan(0);
    expect(report.status_totals.find((row) => row.status === 'pending')).toBeDefined();
    expect(report.cashflow.delivered.total).toBeGreaterThan(0);
  });

  test('getFinancialReport should handle empty dataset', async () => {
    const report = await orderService.getFinancialReport();
    expect(report.lifetime_revenue).toBe(0);
    expect(report.lifetime_orders).toBe(0);
    expect(report.status_totals).toEqual([]);
  });
});

describe('OrderService stock helpers', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  test('restoreOrderStock re-adds quantities', async () => {
    const userId = await insertUser();
    const supplierId = await insertSupplier();
    const productId = await productRepository.create({
      name: 'Item restaurar',
      description: '',
      price: 10,
      original_price: null,
      condition_description: '',
      image_url: null,
      stock: 1,
      supplier_id: supplierId
    });

    const orderId = await insertOrder(userId, 20, 'cancelled');
    await insertOrderItem(orderId, productId, 1, 10);
    await productRepository.updateStock(productId, 0);

    await orderService.restoreOrderStock(orderId);
    const product = await productRepository.findById(productId);
    expect(product.stock).toBe(1);
  });

  test('reduceOrderStock throws when insufficient stock', async () => {
    const userId = await insertUser();
    const supplierId = await insertSupplier();
    const productId = await productRepository.create({
      name: 'Item reduzir',
      description: '',
      price: 10,
      original_price: null,
      condition_description: '',
      image_url: null,
      stock: 0,
      supplier_id: supplierId
    });

    const orderId = await insertOrder(userId, 10, 'pending');
    await insertOrderItem(orderId, productId, 1, 10);

    await expect(orderService.reduceOrderStock(orderId)).rejects.toThrow(
      'Estoque insuficiente para reativar pedido'
    );
  });
});

describe('OrderService updateOrderStatus branches', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  const createOrderWithItem = async (status, stock = 5, quantity = 1) => {
    const userId = await insertUser();
    const supplierId = await insertSupplier();
    const productId = await productRepository.create({
      name: `Produto ${status}`,
      description: '',
      price: 10,
      original_price: null,
      condition_description: '',
      image_url: null,
      stock,
      supplier_id: supplierId
    });

    const orderId = await insertOrder(userId, 10 * quantity, status);
    await insertOrderItem(orderId, productId, quantity, 10);
    return { orderId, productId };
  };

  test('updates from pending to cancelled and restores stock', async () => {
    const { orderId } = await createOrderWithItem('pending');
    const result = await orderService.updateOrderStatus(orderId, 'cancelled');
    expect(result.message).toContain('estoque restaurado');
  });

  test('updates from cancelled to delivered and reduces stock', async () => {
    const { orderId } = await createOrderWithItem('cancelled', 10);
    const result = await orderService.updateOrderStatus(orderId, 'delivered');
    expect(result.message).toContain('estoque reduzido');
  });

  test('updates between non-cancelled statuses without stock changes', async () => {
    const { orderId } = await createOrderWithItem('pending');
    const result = await orderService.updateOrderStatus(orderId, 'delivered');
    expect(result.message).toBe('Status do pedido atualizado');
  });
});

