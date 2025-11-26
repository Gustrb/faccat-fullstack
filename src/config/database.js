const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DATABASE_PATH = process.env.SQLITE_DATABASE || 'database.sqlite';

class Database {
  constructor() {
    this.db = new sqlite3.Database(DATABASE_PATH);
    this.enableForeignKeys();
    this.initializeTables();
  }

  enableForeignKeys() {
    this.db.run('PRAGMA foreign_keys = ON');
  }

  initializeTables() {
    this.db.serialize(() => {
      // Tabela de usuários
      this.db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'client',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      this.createSuppliersTable();

      // Tabela de produtos
      this.db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        original_price REAL,
        condition_description TEXT,
        image_url TEXT,
        stock INTEGER DEFAULT 0,
        supplier_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE SET NULL
      )`, (err) => {
        if (err) {
          console.error('Erro ao criar tabela products:', err);
        } else {
          this.ensureProductSupplierRelationship();
        }
      });

      // Tabela de pedidos
      this.db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Tabela de itens do pedido
      this.db.run(`CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`);

      // Tabela de carrinho (sessão)
      this.db.run(`CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        session_id TEXT,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )`);
    });
  }

  createSuppliersTable() {
    this.db.run(`CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      address TEXT,
      cnpj TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
      if (err) {
        console.error('Erro ao criar tabela suppliers:', err);
      }
    });
  }

  ensureProductSupplierRelationship() {
    this.ensureColumnExists(
      'products',
      'supplier_id',
      'INTEGER REFERENCES suppliers(id) ON DELETE SET NULL'
    );

    this.db.run(
      'CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id)'
    );
  }

  ensureColumnExists(table, column, definition) {
    this.db.all(`PRAGMA table_info(${table})`, (err, columns) => {
      if (err) {
        if (err.code === 'SQLITE_MISUSE') {
          return;
        }
        console.error(`Erro ao inspecionar tabela ${table}:`, err);
        return;
      }

      const exists = columns.some((col) => col.name === column);
      if (!exists) {
        this.db.run(
          `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
          (alterErr) => {
            if (alterErr) {
              console.error(
                `Erro ao adicionar coluna ${column} em ${table}:`,
                alterErr
              );
            }
          }
        );
      }
    });
  }

  getConnection() {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

module.exports = new Database();

