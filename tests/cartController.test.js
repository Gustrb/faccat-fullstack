const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const userRepository = require('../src/repositories/UserRepository');
const productRepository = require('../src/repositories/ProductRepository');
const { truncateTables } = require('./utils/database');

const createClientToken = async () => {
  const email = `client-${Date.now()}@test.com`;
  const passwordHash = await bcrypt.hash('client123', 10);
  const userId = await userRepository.create({
    name: 'Cliente API',
    email,
    password: passwordHash,
    role: 'client'
  });

  const token = jwt.sign(
    { userId, email, role: 'client' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );

  return { token, userId };
};

describe('Cart controller', () => {
  let clientToken;
  let userId;
  let productId;

  beforeEach(async () => {
    await truncateTables();
    const client = await createClientToken();
    clientToken = client.token;
    userId = client.userId;
    productId = await productRepository.create({
      name: 'Produto carrinho',
      description: '',
      price: 99.9,
      original_price: null,
      condition_description: '',
      image_url: null,
      stock: 10
    });
  });

  const addToCart = () =>
    request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ productId, quantity: 2 });

  test('should require authentication for cart routes', async () => {
    const response = await request(app).get('/api/cart');
    expect(response.status).toBe(401);
  });

  test('should add, update and remove items from cart', async () => {
    const addResponse = await addToCart();
    expect(addResponse.status).toBe(200);

    const getResponse = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(getResponse.status).toBe(200);
    expect(Array.isArray(getResponse.body)).toBe(true);
    expect(getResponse.body.length).toBe(1);

    const updateResponse = await request(app)
      .put('/api/cart/update')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ productId, quantity: 4 });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.message).toBe('Carrinho atualizado');

    const removeResponse = await request(app)
      .delete('/api/cart/remove')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ productId });
    expect(removeResponse.status).toBe(200);

    const finalCart = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(finalCart.body.length || finalCart.body.items?.length || 0).toBe(0);
  });

  test('should handle stock validation errors', async () => {
    const limitedProductId = await productRepository.create({
      name: 'Limitado',
      description: '',
      price: 10,
      original_price: null,
      condition_description: '',
      image_url: null,
      stock: 1
    });

    const response = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ productId: limitedProductId, quantity: 5 });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Estoque insuficiente/);
  });
});

