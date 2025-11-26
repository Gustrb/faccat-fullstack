const jwt = require('jsonwebtoken');
const { authenticateToken, requireAdmin } = require('../src/middleware/auth');

const createResponse = () => {
  const res = {};
  res.statusCode = null;
  res.body = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
};

describe('Auth middleware', () => {
  test('authenticateToken should reject when header missing', () => {
    const req = { headers: {} };
    const res = createResponse();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Token de acesso necessário');
    expect(next).not.toHaveBeenCalled();
  });

  test('authenticateToken should reject when token invalid', () => {
    const req = { headers: { authorization: 'Bearer invalid' } };
    const res = createResponse();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Token inválido');
    expect(next).not.toHaveBeenCalled();
  });

  test('authenticateToken should attach user and call next', () => {
    const token = jwt.sign({ userId: 1, role: 'admin' }, process.env.JWT_SECRET || 'secret');
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = createResponse();
    const next = jest.fn();

    authenticateToken(req, res, next);

    expect(req.user.userId).toBe(1);
    expect(next).toHaveBeenCalled();
  });

  test('requireAdmin should reject non-admin users', () => {
    const req = { user: { role: 'client' } };
    const res = createResponse();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe('Acesso negado. Apenas administradores.');
    expect(next).not.toHaveBeenCalled();
  });

  test('requireAdmin should allow admins through', () => {
    const req = { user: { role: 'admin' } };
    const res = createResponse();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});

