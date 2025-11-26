const db = require('../config/database');
const Supplier = require('../models/Supplier');

class SupplierRepository {
  async create(supplierData) {
    return new Promise((resolve, reject) => {
      db.getConnection().run(
        `INSERT INTO suppliers (name, email, phone, address, cnpj)
         VALUES (?, ?, ?, ?, ?)`,
        [
          supplierData.name,
          supplierData.email,
          supplierData.phone,
          supplierData.address,
          supplierData.cnpj
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
        'SELECT * FROM suppliers ORDER BY created_at DESC',
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows.map((row) => Supplier.fromDatabase(row)));
          }
        }
      );
    });
  }

  async findById(id) {
    return new Promise((resolve, reject) => {
      db.getConnection().get(
        'SELECT * FROM suppliers WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? Supplier.fromDatabase(row) : null);
          }
        }
      );
    });
  }

  async update(id, supplierData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      ['name', 'email', 'phone', 'address', 'cnpj'].forEach((field) => {
        if (supplierData[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(supplierData[field]);
        }
      });

      if (!fields.length) {
        resolve(false);
        return;
      }

      values.push(id);

      db.getConnection().run(
        `UPDATE suppliers SET ${fields.join(', ')} WHERE id = ?`,
        values,
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
        'DELETE FROM suppliers WHERE id = ?',
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

module.exports = new SupplierRepository();

