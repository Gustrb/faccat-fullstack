const db = require('../../src/config/database');

const truncateTables = () =>
  new Promise((resolve, reject) => {
    db.getConnection().serialize(() => {
      const tables = [
        'order_items',
        'orders',
        'cart',
        'products',
        'suppliers',
        'users'
      ];

      const runDelete = (index) => {
        if (index >= tables.length) {
          resolve();
          return;
        }

        db.getConnection().run(`DELETE FROM ${tables[index]}`, (err) => {
          if (err) {
            reject(err);
          } else {
            runDelete(index + 1);
          }
        });
      };

      runDelete(0);
    });
  });

module.exports = {
  db,
  truncateTables
};

