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

  async getTotalsBetween(startDate, endDate) {
    return new Promise((resolve, reject) => {
      const params = [];
      let query = `SELECT 
        COALESCE(SUM(total), 0) AS total_sales,
        COUNT(*) AS orders_count
      FROM orders
      WHERE status != 'cancelled'`;

      if (startDate) {
        query += ' AND created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND created_at <= ?';
        params.push(endDate);
      }

      db.getConnection().get(query, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async getMonthlySalesSummary(limit = 6) {
    return new Promise((resolve, reject) => {
      db.getConnection().all(
        `SELECT 
          strftime('%Y-%m', created_at) AS period,
          COALESCE(SUM(total), 0) AS total_sales,
          COUNT(*) AS orders_count
        FROM orders
        WHERE status != 'cancelled'
        GROUP BY period
        ORDER BY period DESC
        LIMIT ?`,
        [limit],
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

  async getBestSellingProduct(startDate, endDate) {
    return new Promise((resolve, reject) => {
      db.getConnection().get(
        `SELECT 
          oi.product_id,
          p.name,
          SUM(oi.quantity) AS total_quantity,
          SUM(oi.quantity * oi.price) AS total_revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        WHERE o.status != 'cancelled'
          AND o.created_at >= ?
          AND o.created_at <= ?
        GROUP BY oi.product_id
        ORDER BY total_quantity DESC
        LIMIT 1`,
        [startDate, endDate],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  async getTopProducts(limit = 5, startDate = null, endDate = null) {
    return new Promise((resolve, reject) => {
      const params = [];
      let filter = '';

      if (startDate) {
        filter += ' AND o.created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        filter += ' AND o.created_at <= ?';
        params.push(endDate);
      }

      db.getConnection().all(
        `SELECT 
          oi.product_id,
          p.name,
          SUM(oi.quantity) AS total_quantity,
          SUM(oi.quantity * oi.price) AS total_revenue
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        WHERE o.status != 'cancelled' ${filter}
        GROUP BY oi.product_id
        ORDER BY total_quantity DESC
        LIMIT ?`,
        [...params, limit],
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

  async getStatusTotals() {
    return new Promise((resolve, reject) => {
      db.getConnection().all(
        `SELECT 
          status,
          COUNT(*) AS orders_count,
          COALESCE(SUM(total), 0) AS total_amount
        FROM orders
        GROUP BY status`,
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

  async getAverageTicket() {
    return new Promise((resolve, reject) => {
      db.getConnection().get(
        `SELECT COALESCE(AVG(total), 0) AS average_ticket
        FROM orders
        WHERE status != 'cancelled'`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row.average_ticket);
          }
        }
      );
    });
  }
}

module.exports = new OrderRepository();

