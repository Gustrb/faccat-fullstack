const db = require('../config/database');
const Product = require('../models/Product');

class ProductRepository {
  async create(productData) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'INSERT INTO products (name, description, price, original_price, condition_description, image_url, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          productData.name,
          productData.description,
          productData.price,
          productData.original_price,
          productData.condition_description,
          productData.image_url,
          productData.stock
        ],
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

  async findAll() {
    return new Promise((resolve, reject) => {
      db.getConnection().all(
        'SELECT * FROM products ORDER BY created_at DESC',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => Product.fromDatabase(row)));
          }
        }
      );
    });
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      db.getConnection().get(
        'SELECT * FROM products WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? Product.fromDatabase(row) : null);
          }
        }
      );
    });
  }

  async update(id, productData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      if (productData.name !== undefined) {
        fields.push('name = ?');
        values.push(productData.name);
      }
      if (productData.description !== undefined) {
        fields.push('description = ?');
        values.push(productData.description);
      }
      if (productData.price !== undefined) {
        fields.push('price = ?');
        values.push(productData.price);
      }
      if (productData.original_price !== undefined) {
        fields.push('original_price = ?');
        values.push(productData.original_price);
      }
      if (productData.condition_description !== undefined) {
        fields.push('condition_description = ?');
        values.push(productData.condition_description);
      }
      if (productData.image_url !== undefined) {
        fields.push('image_url = ?');
        values.push(productData.image_url);
      }
      if (productData.stock !== undefined) {
        fields.push('stock = ?');
        values.push(productData.stock);
      }

      if (fields.length === 0) {
        resolve(false);
        return;
      }

      values.push(id);
      const query = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;

      db.getConnection().run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  async delete(id) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'DELETE FROM products WHERE id = ?',
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

  async updateStock(id, stock) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'UPDATE products SET stock = ? WHERE id = ?',
        [stock, id],
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

  async reduceStock(id, quantity) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [quantity, id, quantity],
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

  async restoreStock(id, quantity) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'UPDATE products SET stock = stock + ? WHERE id = ?',
        [quantity, id],
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

module.exports = new ProductRepository();
