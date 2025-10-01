class Order {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.total = data.total;
    this.status = data.status || 'pending';
    this.created_at = data.created_at;
    this.user_name = data.user_name;
    this.user_email = data.user_email;
    this.items = data.items || [];
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      total: this.total,
      status: this.status,
      created_at: this.created_at,
      user_name: this.user_name,
      user_email: this.user_email,
      items: this.items
    };
  }

  static fromDatabase(data) {
    return new Order(data);
  }
}

module.exports = Order;

