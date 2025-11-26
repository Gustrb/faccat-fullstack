const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const userRepository = require('../src/repositories/UserRepository');
const productRepository = require('../src/repositories/ProductRepository');
const { truncateTables } = require('./utils/database');

const createToken = async (role = 'client') => {
  const email = `${role}-${Date.now()}@test.com`;
  const passwordHash = await bcrypt.hash('senha123', 10);
  const userId = await userRepository.create({
    name: `${role} user`,
    email,
    password: passwordHash,
    role
  });

  const token = jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );

  return { token, userId };
};

const createProduct = async () =>
  productRepository.create({
    name: 'Produto pedido',
    description: '',
    price: 150,
    original_price: null,
    condition_description: '',
    image_url: null,
    stock: 10
  });

const addItemToCart = (token, productId, quantity = 2) =>
  request(app)
    .post('/api/cart/add')
    .set('Authorization', `Bearer ${token}`)
    .send({ productId, quantity });

const createOrderForUser = async (token, productId, quantity = 2) => {
  await addItemToCart(token, productId, quantity);
  const response = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${token}`);
  return response.body.orderId || response.body.id;
};

let clientToken;
let adminToken;
let productId;

beforeEach(async () => {
  await truncateTables();
  ({ token: clientToken } = await createToken('client'));
  ({ token: adminToken } = await createToken('admin'));
  productId = await createProduct();
});

describe('Orders controller', () => {

  test('should require authentication to create orders', async () => {
    const response = await request(app).post('/api/orders');
    expect(response.status).toBe(401);
  });

  test('client can create order and list own orders', async () => {
    const orderId = await createOrderForUser(clientToken, productId);
    expect(orderId).toBeDefined();

    const listResponse = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.length).toBe(1);
    expect(listResponse.body[0].id).toBe(orderId);
  });

  test('admin can list all orders and update status', async () => {
    const orderId = await createOrderForUser(clientToken, productId);

    const listResponse = await request(app)
      .get('/api/orders/admin')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.some((order) => order.id === orderId)).toBe(true);

    const updateResponse = await request(app)
      .put(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'cancelled' });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.message).toContain('Status do pedido atualizado');
  });

  test('non-admin cannot access admin routes', async () => {
    const response = await request(app)
      .get('/api/orders/admin')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response.status).toBe(403);
  });
});

describe('Order report endpoints', () => {
  test('should forbid access to reports for non-admin users', async () => {
    const response = await request(app)
      .get('/api/orders/reports/dashboard')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(response.status).toBe(403);
  });

  test('admin should receive dashboard metrics', async () => {
    await createOrderForUser(clientToken, productId);

    const response = await request(app)
      .get('/api/orders/reports/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('month');
    expect(response.body).toHaveProperty('best_seller');
    expect(Array.isArray(response.body.low_stock)).toBe(true);
  });

  test('admin should receive sales and financial reports', async () => {
    await createOrderForUser(clientToken, productId);

    const salesResponse = await request(app)
      .get('/api/orders/reports/sales?months=3')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(salesResponse.status).toBe(200);
    expect(Array.isArray(salesResponse.body.monthly)).toBe(true);
    expect(Array.isArray(salesResponse.body.top_products)).toBe(true);

    const financialResponse = await request(app)
      .get('/api/orders/reports/financial')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(financialResponse.status).toBe(200);
    expect(financialResponse.body).toHaveProperty('lifetime_revenue');
    expect(financialResponse.body).toHaveProperty('status_totals');
  });
});

