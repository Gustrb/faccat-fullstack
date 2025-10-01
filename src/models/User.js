class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || 'client';
    this.created_at = data.created_at;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      created_at: this.created_at
    };
  }

  static fromDatabase(data) {
    return new User(data);
  }
}

module.exports = User;

