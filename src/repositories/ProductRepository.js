const db = require('../config/database');
const Product = require('../models/Product');

class ProductRepository {
  async create(productData) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        `INSERT INTO products (
          name,
          description,
          price,
          original_price,
          condition_description,
          image_url,
          stock,
          supplier_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productData.name,
          productData.description,
          productData.price,
          productData.original_price,
          productData.condition_description,
          productData.image_url,
          productData.stock,
          productData.supplier_id || null
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
        `SELECT 
          p.*,
          s.name AS supplier_name,
          s.email AS supplier_email,
          s.phone AS supplier_phone,
          s.address AS supplier_address,
          s.cnpj AS supplier_cnpj
        FROM products p
        LEFT JOIN suppliers s ON s.id = p.supplier_id
        ORDER BY p.created_at DESC`,
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
        `SELECT 
          p.*,
          s.name AS supplier_name,
          s.email AS supplier_email,
          s.phone AS supplier_phone,
          s.address AS supplier_address,
          s.cnpj AS supplier_cnpj
        FROM products p
        LEFT JOIN suppliers s ON s.id = p.supplier_id
        WHERE p.id = ?`,
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
      if (productData.supplier_id !== undefined) {
        fields.push('supplier_id = ?');
        values.push(productData.supplier_id || null);
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

  async findLowStockProducts(threshold = 5, limit = 5) {
    return new Promise((resolve, reject) => {
      db.getConnection().all(
        `SELECT 
          p.*,
          s.name AS supplier_name,
          s.email AS supplier_email,
          s.phone AS supplier_phone,
          s.address AS supplier_address,
          s.cnpj AS supplier_cnpj
        FROM products p
        LEFT JOIN suppliers s ON s.id = p.supplier_id
        WHERE p.stock <= ?
        ORDER BY p.stock ASC
        LIMIT ?`,
        [threshold, limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row) => Product.fromDatabase(row)));
          }
        }
      );
    });
  }

  async detachSupplierFromProducts(supplierId) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'UPDATE products SET supplier_id = NULL WHERE supplier_id = ?',
        [supplierId],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes >= 0);
          }
        }
      );
    });
  }
}

module.exports = new ProductRepository();
