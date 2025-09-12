const { getAllRows, getRow, runQuery } = require('../db');
const User = require('../models/user');

class UserService {
  // Get all users
  static async getAllUsers() {
    try {
      const rows = await getAllRows('SELECT * FROM users ORDER BY name');
      return rows.map(row => User.fromDatabaseRow(row));
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid user ID');
      }

      const row = await getRow('SELECT * FROM users WHERE id = ?', [id]);
      if (!row) {
        return null;
      }

      return User.fromDatabaseRow(row);
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  // Create a new user
  static async createUser(userData) {
    try {
      // Validate user data
      const validation = User.validate(userData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await runQuery(
        'INSERT INTO users (name, role) VALUES (?, ?)',
        [userData.name.trim(), userData.role]
      );

      // Get the created user
      const createdUser = await this.getUserById(result.id);
      return createdUser;
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('User with this name already exists');
      }
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Update user
  static async updateUser(id, userData) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid user ID');
      }

      // Check if user exists
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Validate update data
      const validation = User.validate({ ...existingUser, ...userData });
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      await runQuery(
        'UPDATE users SET name = ?, role = ? WHERE id = ?',
        [userData.name.trim(), userData.role, id]
      );

      // Get updated user
      return await this.getUserById(id);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('User with this name already exists');
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Delete user
  static async deleteUser(id) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid user ID');
      }

      // Check if user exists
      const existingUser = await this.getUserById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      await runQuery('DELETE FROM users WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Check if user exists
  static async userExists(id) {
    try {
      const user = await this.getUserById(id);
      return user !== null;
    } catch (error) {
      return false;
    }
  }
}

module.exports = UserService;