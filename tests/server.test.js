const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../src/server');

describe('Server basic routes', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const dummyFile = path.join(fixturesDir, 'dummy.txt');
  let consoleErrorSpy;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Reorder stack so the forced-error route sits before the error/404 handlers
    const stack = app._router.stack;
    const notFoundLayer = stack.pop();
    const errorLayer = stack.pop();
    app.get('/__force-error', () => {
      throw new Error('Boom');
    });
    stack.push(errorLayer);
    stack.push(notFoundLayer);
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  test('health endpoint responds with OK status', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('OK');
  });

  test('upload endpoint accepts files', async () => {
    const response = await request(app)
      .post('/api/upload')
      .attach('image', dummyFile);

    expect(response.status).toBe(200);
    expect(response.body.imageUrl).toContain('http://localhost');

    // delete uploaded file to keep workspace clean
    const uploadedName = path.basename(response.body.imageUrl);
    const uploadedPath = path.join(process.cwd(), 'uploads', uploadedName);
    if (fs.existsSync(uploadedPath)) {
      fs.unlinkSync(uploadedPath);
    }
  });

  test('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/route-that-does-not-exist');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Rota não encontrada');
  });

  test('error middleware handles thrown errors', async () => {
    const response = await request(app).get('/__force-error');
    expect(response.status).toBe(500);
    expect(response.body.message).toBe('Erro interno do servidor');
  });
});

