class Supplier {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.cnpj = data.cnpj;
    this.created_at = data.created_at;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: this.address,
      cnpj: this.cnpj,
      created_at: this.created_at
    };
  }

  static fromDatabase(row) {
    return new Supplier(row);
  }
}

module.exports = Supplier;

