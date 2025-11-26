const userRepository = require('../../src/repositories/UserRepository');
const { truncateTables } = require('../utils/database');

describe('UserRepository', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  test('should create, find, update and delete users', async () => {
    const userId = await userRepository.create({
      name: 'Repo User',
      email: `repo-${Date.now()}@test.com`,
      password: 'hash',
      role: 'client'
    });

    const byId = await userRepository.findById(userId);
    expect(byId.name).toBe('Repo User');

    const byEmail = await userRepository.findByEmail(byId.email);
    expect(byEmail.id).toBe(userId);

    await userRepository.update(userId, {
      name: 'Atualizado',
      email: `updated-${Date.now()}@test.com`
    });

    const updated = await userRepository.findById(userId);
    expect(updated.name).toBe('Atualizado');

    await userRepository.delete(userId);
    expect(await userRepository.findById(userId)).toBeNull();
  });
});

