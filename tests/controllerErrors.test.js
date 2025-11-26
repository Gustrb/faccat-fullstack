jest.mock('../src/services/OrderService');
jest.mock('../src/services/SupplierService');

const orderService = require('../src/services/OrderService');
const supplierService = require('../src/services/SupplierService');
const orderController = require('../src/controllers/OrderController');
const supplierController = require('../src/controllers/SupplierController');
const cartService = require('../src/services/CartService');
const productService = require('../src/services/ProductService');
const cartController = require('../src/controllers/CartController');
const productController = require('../src/controllers/ProductController');

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Controller error paths', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('OrderController getUserOrders handles service error', async () => {
    orderService.getUserOrders.mockRejectedValue(new Error('Falha'));
    const req = { user: { userId: 1 } };
    const res = mockResponse();
    await orderController.getUserOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Falha' });
  });

  test('OrderController getAllOrders handles service error', async () => {
    orderService.getAllOrders.mockRejectedValue(new Error('Falha geral'));
    const res = mockResponse();
    await orderController.getAllOrders({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('OrderController updateOrderStatus handles service error', async () => {
    orderService.updateOrderStatus.mockRejectedValue(new Error('Erro status'));
    const req = { params: { id: 1 }, body: { status: 'cancelled' } };
    const res = mockResponse();
    await orderController.updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('OrderController createOrder handles service error', async () => {
    orderService.createOrder.mockRejectedValue(new Error('Falha criação'));
    const req = { user: { userId: 1 } };
    const res = mockResponse();
    await orderController.createOrder(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('OrderController getDashboardMetrics handles service error', async () => {
    orderService.getDashboardMetrics.mockRejectedValue(new Error('Falha dashboard'));
    const res = mockResponse();
    await orderController.getDashboardMetrics({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('OrderController getSalesReport handles service error', async () => {
    orderService.getSalesReport.mockRejectedValue(new Error('Falha relatório vendas'));
    const req = { query: { months: '6' } };
    const res = mockResponse();
    await orderController.getSalesReport(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('OrderController getFinancialReport handles service error', async () => {
    orderService.getFinancialReport.mockRejectedValue(new Error('Falha relatório financeiro'));
    const res = mockResponse();
    await orderController.getFinancialReport({}, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('SupplierController show handles not found', async () => {
    supplierService.getSupplierById.mockRejectedValue(new Error('Fornecedor não encontrado'));
    const req = { params: { id: 123 } };
    const res = mockResponse();
    await supplierController.show(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('SupplierController create handles validation error', async () => {
    supplierService.createSupplier.mockRejectedValue(new Error('Dados inválidos'));
    const req = { body: {} };
    const res = mockResponse();
    await supplierController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('CartController getCart handles internal error', async () => {
    jest.spyOn(cartService, 'getCart').mockRejectedValue(new Error('Erro interno'));
    const req = { user: { userId: 1 } };
    const res = mockResponse();
    await cartController.getCart(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('ProductController createProduct handles service error', async () => {
    jest.spyOn(productService, 'createProduct').mockRejectedValue(new Error('Falha produto'));
    const req = { body: {}, file: null };
    const res = mockResponse();
    await productController.createProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

