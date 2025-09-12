class Comment {
  constructor(data) {
    this.id = data.id;
    this.text = data.text;
    this.authorId = data.authorId;
    this.taskId = data.taskId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Validation method
  static validate(data) {
    const errors = [];

    // Text validation
    if (!data.text || typeof data.text !== 'string') {
      errors.push('Text is required and must be a string');
    } else if (data.text.trim().length === 0) {
      errors.push('Text cannot be empty');
    } else if (data.text.length > 500) {
      errors.push('Text cannot be longer than 500 characters');
    }

    // authorId validation
    if (!data.authorId || typeof data.authorId !== 'number' || data.authorId <= 0) {
      errors.push('AuthorId is required and must be a positive number');
    }

    // taskId validation
    if (!data.taskId || typeof data.taskId !== 'number' || data.taskId <= 0) {
      errors.push('TaskId is required and must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check if user can edit/delete this comment
  canBeModifiedBy(userId) {
    return this.authorId === userId;
  }

  // Create Comment from database row
  static fromDatabaseRow(row) {
    return new Comment({
      id: row.id,
      text: row.text,
      authorId: row.authorId,
      taskId: row.taskId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }

  // Convert to plain object for API responses
  toJSON() {
    return {
      id: this.id,
      text: this.text,
      authorId: this.authorId,
      taskId: this.taskId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Comment;