const db = require('../src/config/database');

afterAll(() => {
  db.close();
});

