const db = require('../config/database');
const User = require('../models/User');

class UserRepository {
  async create(userData) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [userData.name, userData.email, userData.password, userData.role || 'client'],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.getConnection().get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? User.fromDatabase(row) : null);
          }
        }
      );
    });
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      db.getConnection().get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? User.fromDatabase(row) : null);
          }
        }
      );
    });
  }

  async update(id, userData) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [userData.name, userData.email, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'DELETE FROM users WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }
}

module.exports = new UserRepository();

