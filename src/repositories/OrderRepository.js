const db = require('../config/database');
const Order = require('../models/Order');

class OrderRepository {
  async create(orderData) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'INSERT INTO orders (user_id, total) VALUES (?, ?)',
        [orderData.user_id, orderData.total],
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

  async findById(id) {
    return new Promise((resolve, reject) => {
      db.getConnection().get(
        'SELECT * FROM orders WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? Order.fromDatabase(row) : null);
          }
        }
      );
    });
  }

  async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.getConnection().all(
        `SELECT o.*, u.name as user_name, u.email as user_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         WHERE o.user_id = ?
         ORDER BY o.created_at DESC`,
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => Order.fromDatabase(row)));
          }
        }
      );
    });
  }

  async findAll() {
    return new Promise((resolve, reject) => {
      db.getConnection().all(
        `SELECT o.*, u.name as user_name, u.email as user_email
         FROM orders o
         JOIN users u ON o.user_id = u.id
         ORDER BY o.created_at DESC`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => Order.fromDatabase(row)));
          }
        }
      );
    });
  }

  async updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id],
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

  async getCurrentStatus(id) {
    return new Promise((resolve, reject) => {
      db.getConnection().get(
        'SELECT status FROM orders WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.status : null);
          }
        }
      );
    });
  }

  async getOrderItems(orderId) {
    return new Promise((resolve, reject) => {
      db.getConnection().all(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [orderId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }
}

module.exports = new OrderRepository();

