const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const app = require('../src/server');
const userRepository = require('../src/repositories/UserRepository');
const productRepository = require('../src/repositories/ProductRepository');
const { truncateTables } = require('./utils/database');

const createAdminToken = async () => {
  const email = `admin-${Date.now()}@test.com`;
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminId = await userRepository.create({
    name: 'Admin Controller Test',
    email,
    password: passwordHash,
    role: 'admin'
  });

  const token = jwt.sign(
    { userId: adminId, email, role: 'admin' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );

  return token;
};

describe('Products controller (integration)', () => {
  let adminToken;
  const dummyFile = path.join(__dirname, 'fixtures', 'dummy.txt');

  beforeEach(async () => {
    await truncateTables();
    adminToken = await createAdminToken();
    if (fs.existsSync('uploads')) {
      fs.rmSync('uploads', { recursive: true, force: true });
    }
  });

  const createProductViaApi = async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('name', 'Produto Controller')
      .field('description', 'Descrição')
      .field('price', '199.90')
      .field('original_price', '250')
      .field('condition_description', 'Quase novo')
      .field('stock', '5')
      .attach('image', dummyFile);

    return response.body.id;
  };

  test('should reject creation when no token is provided', async () => {
    const response = await request(app)
      .post('/api/products')
      .field('name', 'Sem Token')
      .field('price', '50')
      .field('stock', '2');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token de acesso necessário');
  });

  test('should create, retrieve and update a product', async () => {
    const productId = await createProductViaApi();
    expect(productId).toBeDefined();

    const getResponse = await request(app).get('/api/products');
    expect(getResponse.status).toBe(200);
    expect(
      getResponse.body.some((product) => product.id === productId && product.name === 'Produto Controller')
    ).toBe(true);

    const updateResponse = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .field('price', '149.90')
      .field('stock', '8');

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.message).toBe('Produto atualizado com sucesso');

    const storedProduct = await productRepository.findById(productId);
    expect(storedProduct.price).toBe(149.9);
    expect(storedProduct.stock).toBe(8);
  });

  test('should update stock through dedicated endpoint', async () => {
    const productId = await createProductViaApi();

    const response = await request(app)
      .put(`/api/products/${productId}/stock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: 12 });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Estoque atualizado com sucesso');

    const product = await productRepository.findById(productId);
    expect(product.stock).toBe(12);
  });

  test('should delete product', async () => {
    const productId = await createProductViaApi();

    const response = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Produto excluído com sucesso');

    const product = await productRepository.findById(productId);
    expect(product).toBeNull();
  });

  test('should return error when updating nonexistent product', async () => {
    const response = await request(app)
      .put('/api/products/9999')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('price', '10');

    expect(response.status).toBe(400);
    expect(response.body.message).toBeDefined();
  });
});

