const orderRepository = require('../repositories/OrderRepository');
const productRepository = require('../repositories/ProductRepository');
const cartService = require('./CartService');
const productService = require('./ProductService');

const toSQLiteDate = (date) =>
  date.toISOString().replace('T', ' ').replace('Z', '');

class OrderService {
  async createOrder(userId) {
    const cartItems = await cartService.getCart(userId);
    
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error('Carrinho vazio');
    }
    
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Criar pedido
    const orderId = await orderRepository.create({
      user_id: userId,
      total: total
    });
    
    // Criar itens do pedido e reduzir estoque
    const db = require('../config/database');
    const promises = cartItems.map(item => {
      return new Promise((resolve, reject) => {
        db.getConnection().run(
          'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.product_id, item.quantity, item.price],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
    });
    
    await Promise.all(promises);
    
    // Reduzir estoque de cada produto
    for (const item of cartItems) {
      await productService.reduceStock(item.product_id, item.quantity);
    }
    
    // Limpar carrinho
    await cartService.clearCart(userId);
    
    return { orderId, message: 'Pedido criado com sucesso' };
  }

  async getUserOrders(userId) {
    return await orderRepository.findByUserId(userId);
  }

  async getAllOrders() {
    return await orderRepository.findAll();
  }

  async updateOrderStatus(orderId, status) {
    const currentStatus = await orderRepository.getCurrentStatus(orderId);
    if (!currentStatus) {
      throw new Error('Pedido não encontrado');
    }
    
    await orderRepository.updateStatus(orderId, status);
    
    // Lógica de restauração/redução de estoque
    if (status === 'cancelled' && currentStatus !== 'cancelled') {
      await this.restoreOrderStock(orderId);
      return { message: 'Status do pedido atualizado e estoque restaurado' };
    } else if (currentStatus === 'cancelled' && status !== 'cancelled') {
      await this.reduceOrderStock(orderId);
      return { message: 'Status do pedido atualizado e estoque reduzido' };
    }
    
    return { message: 'Status do pedido atualizado' };
  }

  async restoreOrderStock(orderId) {
    const items = await orderRepository.getOrderItems(orderId);
    
    for (const item of items) {
      await productService.restoreStock(item.product_id, item.quantity);
    }
  }

  async reduceOrderStock(orderId) {
    const items = await orderRepository.getOrderItems(orderId);
    
    for (const item of items) {
      try {
        await productService.validateStock(item.product_id, item.quantity);
        await productService.reduceStock(item.product_id, item.quantity);
      } catch (error) {
        throw new Error('Estoque insuficiente para reativar pedido');
      }
    }
  }

  async getDashboardMetrics() {
    const { start, end } = this.getCurrentMonthRange();

    const [monthTotals, bestSeller, lowStock] = await Promise.all([
      orderRepository.getTotalsBetween(start, end),
      orderRepository.getBestSellingProduct(start, end),
      productRepository.findLowStockProducts(5, 5)
    ]);

    return {
      month: {
        total_sales: monthTotals?.total_sales || 0,
        orders_count: monthTotals?.orders_count || 0
      },
      best_seller: bestSeller,
      low_stock: lowStock
    };
  }

  async getSalesReport(months = 6) {
    const [monthly, topProducts] = await Promise.all([
      orderRepository.getMonthlySalesSummary(months),
      orderRepository.getTopProducts(5)
    ]);

    return {
      monthly,
      top_products: topProducts
    };
  }

  async getFinancialReport() {
    const [statusTotals, averageTicket, lifetimeTotals] = await Promise.all([
      orderRepository.getStatusTotals(),
      orderRepository.getAverageTicket(),
      orderRepository.getTotalsBetween()
    ]);

    const cashflow = statusTotals.reduce(
      (acc, row) => {
        acc[row.status] = {
          orders: row.orders_count,
          total: row.total_amount
        };
        return acc;
      },
      {}
    );

    return {
      lifetime_revenue: lifetimeTotals?.total_sales || 0,
      lifetime_orders: lifetimeTotals?.orders_count || 0,
      average_ticket: averageTicket || 0,
      status_totals: statusTotals,
      cashflow
    };
  }

  getCurrentMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    return {
      start: toSQLiteDate(start),
      end: toSQLiteDate(end)
    };
  }
}

module.exports = new OrderService();

