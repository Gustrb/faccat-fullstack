const db = require('../config/database');
const CartItem = require('../models/CartItem');

class CartRepository {
  async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.getConnection().all(
        `SELECT c.*, p.name, p.price, p.image_url, p.stock
         FROM cart c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = ?`,
        [userId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map(row => CartItem.fromDatabase(row)));
          }
        }
      );
    });
  }

  async addItem(userId, productId, quantity) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [userId, productId, quantity],
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

  async updateQuantity(userId, productId, quantity) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [quantity, userId, productId],
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

  async removeItem(userId, productId) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
        [userId, productId],
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

  async clearUserCart(userId) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        'DELETE FROM cart WHERE user_id = ?',
        [userId],
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

  async findExistingItem(userId, productId) {
    return new Promise((resolve, reject) => {
      db.getConnection().get(
        'SELECT * FROM cart WHERE user_id = ? AND product_id = ?',
        [userId, productId],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? CartItem.fromDatabase(row) : null);
          }
        }
      );
    });
  }

  async validateAndCleanCart(userId) {
    return new Promise((resolve, reject) => {
      db.getConnection().all(
        `SELECT c.*, p.name, p.price, p.image_url, p.stock
         FROM cart c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = ?`,
        [userId],
        (err, cartItems) => {
          if (err) {
            reject(err);
          } else {
            const validItems = [];
            const removedItems = [];
            let processedCount = 0;
            
            if (cartItems.length === 0) {
              resolve({ validItems, removedItems });
              return;
            }
            
            cartItems.forEach((item, index) => {
              if (item.stock <= 0) {
                // Produto fora de estoque - remover do carrinho
                removedItems.push(item.name);
                db.getConnection().run(
                  'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
                  [userId, item.product_id],
                  () => {
                    processedCount++;
                    if (processedCount === cartItems.length) {
                      resolve({ validItems, removedItems });
                    }
                  }
                );
              } else if (item.quantity > item.stock) {
                // Quantidade maior que estoque - ajustar para o máximo disponível
                db.getConnection().run(
                  'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
                  [item.stock, userId, item.product_id],
                  () => {
                    item.quantity = item.stock;
                    validItems.push(CartItem.fromDatabase(item));
                    processedCount++;
                    if (processedCount === cartItems.length) {
                      resolve({ validItems, removedItems });
                    }
                  }
                );
              } else {
                validItems.push(CartItem.fromDatabase(item));
                processedCount++;
                if (processedCount === cartItems.length) {
                  resolve({ validItems, removedItems });
                }
              }
            });
          }
        }
      );
    });
  }
}

module.exports = new CartRepository();
