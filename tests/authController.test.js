const request = require('supertest');
const app = require('../src/server');
const { truncateTables } = require('./utils/database');

describe('Auth controller', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  const registerUser = async (payload = {}) => {
    const body = {
      name: payload.name || 'Usuário Teste',
      email: payload.email || `user${Date.now()}@teste.com`,
      password: payload.password || 'senha123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(body);

    return { response, email: body.email, password: body.password };
  };

  test('should register and login user, returning token and profile', async () => {
    const { response: registerResponse, email, password } = await registerUser();
    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app).post('/api/auth/login').send({ email, password });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
    expect(loginResponse.body.user.email).toBe(email);

    const token = loginResponse.body.token;
    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user.email).toBe(email);
  });

  test('should reject duplicate registration', async () => {
    const email = `dup-${Date.now()}@teste.com`;
    await registerUser({ email });

    const { response } = await registerUser({ email });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Email já cadastrado');
  });

  test('should reject login with invalid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'naoexiste@teste.com',
      password: '123456'
    });
    expect(response.status).toBe(401);
  });

  test('should allow updating authenticated profile', async () => {
    const uniqueEmail = `profile-${Date.now()}@teste.com`;
    await registerUser({ email: uniqueEmail });

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'senha123' });

    const token = loginResponse.body.token;
    const newEmail = `updated-${Date.now()}@teste.com`;
    const updateResponse = await request(app)
      .put('/api/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Nome Atualizado', email: newEmail });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.message).toBe('Usuário atualizado com sucesso');

    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(meResponse.body.user.email).toBe(newEmail);
  });
});

