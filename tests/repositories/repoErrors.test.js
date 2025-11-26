const db = require('../../src/config/database');
const cartRepository = require('../../src/repositories/CartRepository');
const orderRepository = require('../../src/repositories/OrderRepository');
const productRepository = require('../../src/repositories/ProductRepository');
const supplierRepository = require('../../src/repositories/SupplierRepository');
const userRepository = require('../../src/repositories/UserRepository');

describe('Repository database error paths', () => {
  const createFailingConnection = () => {
    const error = new Error('DB error');

    const failCallback = (maybeCb, maybeCb2) => {
      const cb = typeof maybeCb === 'function' ? maybeCb : maybeCb2;
      // async-style to mimic sqlite behaviour
      setImmediate(() => cb(error));
    };

    return {
      run: (...args) => failCallback(args[args.length - 1]),
      all: (...args) => failCallback(args[args.length - 1]),
      get: (...args) => failCallback(args[args.length - 1])
    };
  };

  let getConnectionSpy;

  beforeEach(() => {
    getConnectionSpy = jest
      .spyOn(db, 'getConnection')
      .mockReturnValue(createFailingConnection());
  });

  afterEach(() => {
    getConnectionSpy.mockRestore();
  });

  test('CartRepository methods reject on DB errors', async () => {
    await expect(cartRepository.findByUserId(1)).rejects.toThrow('DB error');
  });

  test('OrderRepository methods reject on DB errors', async () => {
    await expect(
      orderRepository.create({ user_id: 1, total: 10 })
    ).rejects.toThrow('DB error');
  });

  test('ProductRepository methods reject on DB errors', async () => {
    await expect(productRepository.findById(1)).rejects.toThrow('DB error');
  });

  test('SupplierRepository methods reject on DB errors', async () => {
    await expect(supplierRepository.findById(1)).rejects.toThrow('DB error');
  });

  test('UserRepository methods reject on DB errors', async () => {
    await expect(userRepository.findByEmail('x@y.com')).rejects.toThrow(
      'DB error'
    );
  });
});


