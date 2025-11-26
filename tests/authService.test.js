const bcrypt = require('bcryptjs');
const authService = require('../src/services/AuthService');
const userRepository = require('../src/repositories/UserRepository');
const { truncateTables } = require('./utils/database');

describe('AuthService', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  const seedUser = async (overrides = {}) => {
    const hashedPassword = await bcrypt.hash(overrides.password || 'admin123', 10);
    return userRepository.create({
      name: overrides.name || 'Admin Teste',
      email: overrides.email || 'admin@test.com',
      password: hashedPassword,
      role: overrides.role || 'admin'
    });
  };

  test('login should return token and user info for valid credentials', async () => {
    await seedUser();

    const result = await authService.login('admin@test.com', 'admin123');

    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('admin@test.com');
    expect(result.user.role).toBe('admin');
  });

  test('login should reject when email does not exist', async () => {
    await expect(authService.login('missing@test.com', '123456')).rejects.toThrow(
      'Credenciais inválidas'
    );
  });

  test('login should reject when password is invalid', async () => {
    await seedUser();

    await expect(authService.login('admin@test.com', 'senhaErrada')).rejects.toThrow(
      'Credenciais inválidas'
    );
  });

  test('register should reject duplicated email', async () => {
    await seedUser({ email: 'dup@test.com' });

    await expect(
      authService.register({
        name: 'Outro usuário',
        email: 'dup@test.com',
        password: 'senha123'
      })
    ).rejects.toThrow('Email já cadastrado');
  });
});

