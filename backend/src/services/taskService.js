const { getAllRows, getRow, runQuery } = require('../db');
const Task = require('../models/task');
const UserService = require('./userService');
const ProjectService = require('./projectService');

class TaskService {
  // Get all tasks
  static async getAllTasks() {
    try {
      const rows = await getAllRows('SELECT * FROM tasks ORDER BY id');
      return rows.map(row => Task.fromDatabaseRow(row));
    } catch (error) {
      throw new Error(`Failed to get tasks: ${error.message}`);
    }
  }

  // Get task by ID
  static async getTaskById(id) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid task ID');
      }

      const row = await getRow('SELECT * FROM tasks WHERE id = ?', [id]);
      if (!row) {
        return null;
      }

      return Task.fromDatabaseRow(row);
    } catch (error) {
      throw new Error(`Failed to get task: ${error.message}`);
    }
  }

  // Get tasks by project ID
  static async getTasksByProjectId(projectId) {
    try {
      if (!projectId || typeof projectId !== 'number' || projectId <= 0) {
        throw new Error('Invalid project ID');
      }

      const rows = await getAllRows('SELECT * FROM tasks WHERE projectId = ? ORDER BY id', [projectId]);
      return rows.map(row => Task.fromDatabaseRow(row));
    } catch (error) {
      throw new Error(`Failed to get tasks for project: ${error.message}`);
    }
  }

  // Create a new task
  static async createTask(taskData) {
    try {
      // Validate task data
      const validation = Task.validate(taskData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if project exists
      const projectExists = await ProjectService.projectExists(taskData.projectId);
      if (!projectExists) {
        throw new Error('Project not found');
      }

      // Check if assigned user exists (if provided)
      if (taskData.assignedUserId) {
        const userExists = await UserService.userExists(taskData.assignedUserId);
        if (!userExists) {
          throw new Error('Assigned user not found');
        }
      }

      const result = await runQuery(
        'INSERT INTO tasks (title, description, status, assignedUserId, projectId) VALUES (?, ?, ?, ?, ?)',
        [
          taskData.title.trim(),
          taskData.description ? taskData.description.trim() : null,
          taskData.status,
          taskData.assignedUserId || null,
          taskData.projectId
        ]
      );

      // Get the created task
      const createdTask = await this.getTaskById(result.id);
      return createdTask;
    } catch (error) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  // Update task
  static async updateTask(id, taskData) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid task ID');
      }

      // Check if task exists
      const existingTask = await this.getTaskById(id);
      if (!existingTask) {
        throw new Error('Task not found');
      }

      // Validate update data
      const validation = Task.validate({ ...existingTask, ...taskData });
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if assigned user exists (if provided)
      if (taskData.assignedUserId) {
        const userExists = await UserService.userExists(taskData.assignedUserId);
        if (!userExists) {
          throw new Error('Assigned user not found');
        }
      }

      await runQuery(
        'UPDATE tasks SET title = ?, description = ?, status = ?, assignedUserId = ? WHERE id = ?',
        [
          taskData.title.trim(),
          taskData.description ? taskData.description.trim() : null,
          taskData.status,
          taskData.assignedUserId || null,
          id
        ]
      );

      // Get updated task
      return await this.getTaskById(id);
    } catch (error) {
      throw new Error(`Failed to update task: ${error.message}`);
    }
  }

  // Update task status
  static async updateTaskStatus(id, status) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid task ID');
      }

      // Check if task exists
      const existingTask = await this.getTaskById(id);
      if (!existingTask) {
        throw new Error('Task not found');
      }

      // Validate status
      const validStatuses = ['To Do', 'In Progress', 'In Review', 'Done'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }

      await runQuery(
        'UPDATE tasks SET status = ? WHERE id = ?',
        [status, id]
      );

      // Get updated task
      return await this.getTaskById(id);
    } catch (error) {
      throw new Error(`Failed to update task status: ${error.message}`);
    }
  }

  // Delete task
  static async deleteTask(id) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid task ID');
      }

      // Check if task exists
      const existingTask = await this.getTaskById(id);
      if (!existingTask) {
        throw new Error('Task not found');
      }

      await runQuery('DELETE FROM tasks WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete task: ${error.message}`);
    }
  }

  // Check if task exists
  static async taskExists(id) {
    try {
      const task = await this.getTaskById(id);
      return task !== null;
    } catch (error) {
      return false;
    }
  }
}

module.exports = TaskService;