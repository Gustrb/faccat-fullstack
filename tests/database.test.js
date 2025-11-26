const db = require('../src/config/database');

const delay = () => new Promise((resolve) => setTimeout(resolve, 20));

describe('Database helpers', () => {
  const conn = db.getConnection();

  afterAll(() => {
    conn.run('DROP TABLE IF EXISTS temp_table');
  });

  const getColumns = () =>
    new Promise((resolve, reject) => {
      conn.all('PRAGMA table_info(temp_table)', (err, rows) =>
        err ? reject(err) : resolve(rows)
      );
    });

  test('ensureColumnExists adds new column when missing', async () => {
    await new Promise((resolve, reject) => {
      conn.run('CREATE TABLE IF NOT EXISTS temp_table (id INTEGER)', (err) =>
        err ? reject(err) : resolve()
      );
    });

    db.ensureColumnExists('temp_table', 'extra_col', 'TEXT');
    await delay();

    const columns = await getColumns();
    expect(columns.some((col) => col.name === 'extra_col')).toBe(true);
  });

  test('ensureColumnExists does nothing when column already exists', async () => {
    db.ensureColumnExists('temp_table', 'extra_col', 'TEXT');
    await delay();
    const columns = await getColumns();
    expect(columns.filter((col) => col.name === 'extra_col').length).toBe(1);
  });
});

