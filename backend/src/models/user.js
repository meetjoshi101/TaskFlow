class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.role = data.role;
  }

  // Validation method
  static validate(data) {
    const errors = [];

    // Name validation
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name is required and must be a string');
    } else if (data.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    } else if (data.name.length > 50) {
      errors.push('Name cannot be longer than 50 characters');
    }

    // Role validation
    const validRoles = ['product_manager', 'engineer'];
    if (!data.role || typeof data.role !== 'string') {
      errors.push('Role is required and must be a string');
    } else if (!validRoles.includes(data.role)) {
      errors.push(`Role must be one of: ${validRoles.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create User from database row
  static fromDatabaseRow(row) {
    return new User({
      id: row.id,
      name: row.name,
      role: row.role
    });
  }

  // Convert to plain object for API responses
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role
    };
  }
}

module.exports = User;