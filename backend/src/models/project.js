class Project {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
  }

  // Validation method
  static validate(data) {
    const errors = [];

    // Name validation
    if (!data.name || typeof data.name !== 'string') {
      errors.push('Name is required and must be a string');
    } else if (data.name.trim().length === 0) {
      errors.push('Name cannot be empty');
    } else if (data.name.length > 100) {
      errors.push('Name cannot be longer than 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create Project from database row
  static fromDatabaseRow(row) {
    return new Project({
      id: row.id,
      name: row.name
    });
  }

  // Convert to plain object for API responses
  toJSON() {
    return {
      id: this.id,
      name: this.name
    };
  }
}

module.exports = Project;