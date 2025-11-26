const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const userRepository = require('../src/repositories/UserRepository');
const supplierRepository = require('../src/repositories/SupplierRepository');
const { truncateTables } = require('./utils/database');

const createAdminToken = async () => {
  const email = `admin-supplier-${Date.now()}@test.com`;
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminId = await userRepository.create({
    name: 'Admin Suppliers',
    email,
    password: passwordHash,
    role: 'admin'
  });

  return jwt.sign(
    { userId: adminId, email, role: 'admin' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
};

describe('Suppliers controller', () => {
  let adminToken;

  beforeEach(async () => {
    await truncateTables();
    adminToken = await createAdminToken();
  });

  const createSupplierViaApi = async (payload = {}) => {
    const response = await request(app)
      .post('/api/suppliers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: payload.name || 'Fornecedor API',
        email: payload.email || `supplier-${Date.now()}@email.com`,
        phone: payload.phone || '11999999999',
        address: payload.address || 'Rua Teste, 123',
        cnpj: payload.cnpj || '12.345.678/0001-90'
      });
    return response.body.id;
  };

  test('should reject supplier CRUD when not authenticated', async () => {
    const response = await request(app).get('/api/suppliers');
    expect(response.status).toBe(401);
  });

  test('should create, list, update and delete supplier', async () => {
    const supplierId = await createSupplierViaApi();
    expect(supplierId).toBeDefined();

    const listResponse = await request(app)
      .get('/api/suppliers')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.some((sup) => sup.id === supplierId)).toBe(true);

    const updateResponse = await request(app)
      .put(`/api/suppliers/${supplierId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ phone: '11888888888' });
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.message).toBe('Fornecedor atualizado com sucesso');

    const storedSupplier = await supplierRepository.findById(supplierId);
    expect(storedSupplier.phone).toBe('11888888888');

    const deleteResponse = await request(app)
      .delete(`/api/suppliers/${supplierId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteResponse.status).toBe(200);

    const supplier = await supplierRepository.findById(supplierId);
    expect(supplier).toBeNull();
  });

  test('should return 404 when supplier is not found', async () => {
    const response = await request(app)
      .get('/api/suppliers/9999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(response.status).toBe(404);
  });
});

