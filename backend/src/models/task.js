class Task {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.status = data.status;
    this.assignedUserId = data.assignedUserId;
    this.projectId = data.projectId;
  }

  // Validation method
  static validate(data) {
    const errors = [];

    // Title validation
    if (!data.title || typeof data.title !== 'string') {
      errors.push('Title is required and must be a string');
    } else if (data.title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (data.title.length > 200) {
      errors.push('Title cannot be longer than 200 characters');
    }

    // Description validation (optional)
    if (data.description !== undefined && data.description !== null) {
      if (typeof data.description !== 'string') {
        errors.push('Description must be a string');
      } else if (data.description.length > 1000) {
        errors.push('Description cannot be longer than 1000 characters');
      }
    }

    // Status validation
    const validStatuses = ['To Do', 'In Progress', 'In Review', 'Done'];
    if (!data.status || typeof data.status !== 'string') {
      errors.push('Status is required and must be a string');
    } else if (!validStatuses.includes(data.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    // assignedUserId validation (optional)
    if (data.assignedUserId !== undefined && data.assignedUserId !== null) {
      if (typeof data.assignedUserId !== 'number' || data.assignedUserId <= 0) {
        errors.push('AssignedUserId must be a positive number');
      }
    }

    // projectId validation
    if (!data.projectId || typeof data.projectId !== 'number' || data.projectId <= 0) {
      errors.push('ProjectId is required and must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Check if status transition is valid
  static isValidStatusTransition(fromStatus, toStatus) {
    const validStatuses = ['To Do', 'In Progress', 'In Review', 'Done'];
    return validStatuses.includes(fromStatus) && validStatuses.includes(toStatus);
  }

  // Create Task from database row
  static fromDatabaseRow(row) {
    return new Task({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      assignedUserId: row.assignedUserId,
      projectId: row.projectId
    });
  }

  // Convert to plain object for API responses
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description || '',
      status: this.status,
      assignedUserId: this.assignedUserId,
      projectId: this.projectId
    };
  }
}

module.exports = Task;