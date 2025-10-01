class Product {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.original_price = data.original_price;
    this.condition_description = data.condition_description;
    this.image_url = data.image_url;
    this.stock = data.stock || 0;
    this.created_at = data.created_at;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      original_price: this.original_price,
      condition_description: this.condition_description,
      image_url: this.image_url,
      stock: this.stock,
      created_at: this.created_at
    };
  }

  static fromDatabase(data) {
    return new Product(data);
  }
}

module.exports = Product;

