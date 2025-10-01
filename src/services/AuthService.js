const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/UserRepository');

class AuthService {
  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userId = await userRepository.create({
      ...userData,
      password: hashedPassword
    });

    return { id: userId, message: 'Usuário criado com sucesso' };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: user.toJSON()
    };
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return user.toJSON();
  }

  async updateUser(id, userData) {
    const updated = await userRepository.update(id, userData);
    if (!updated) {
      throw new Error('Erro ao atualizar usuário');
    }
    return { message: 'Usuário atualizado com sucesso' };
  }
}

module.exports = new AuthService();
