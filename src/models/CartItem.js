class CartItem {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.product_id = data.product_id;
    this.quantity = data.quantity;
    this.name = data.name;
    this.price = data.price;
    this.image_url = data.image_url;
    this.stock = data.stock;
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      product_id: this.product_id,
      quantity: this.quantity,
      name: this.name,
      price: this.price,
      image_url: this.image_url,
      stock: this.stock
    };
  }

  static fromDatabase(data) {
    return new CartItem(data);
  }
}

module.exports = CartItem;
