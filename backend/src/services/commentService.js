const { getAllRows, getRow, runQuery } = require('../db');
const Comment = require('../models/comment');
const UserService = require('./userService');
const TaskService = require('./taskService');

class CommentService {
  // Get all comments
  static async getAllComments() {
    try {
      const rows = await getAllRows('SELECT * FROM comments ORDER BY createdAt DESC');
      return rows.map(row => Comment.fromDatabaseRow(row));
    } catch (error) {
      throw new Error(`Failed to get comments: ${error.message}`);
    }
  }

  // Get comment by ID
  static async getCommentById(id) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid comment ID');
      }

      const row = await getRow('SELECT * FROM comments WHERE id = ?', [id]);
      if (!row) {
        return null;
      }

      return Comment.fromDatabaseRow(row);
    } catch (error) {
      throw new Error(`Failed to get comment: ${error.message}`);
    }
  }

  // Get comments by task ID
  static async getCommentsByTaskId(taskId) {
    try {
      if (!taskId || typeof taskId !== 'number' || taskId <= 0) {
        throw new Error('Invalid task ID');
      }

      const rows = await getAllRows('SELECT * FROM comments WHERE taskId = ? ORDER BY createdAt ASC', [taskId]);
      return rows.map(row => Comment.fromDatabaseRow(row));
    } catch (error) {
      throw new Error(`Failed to get comments for task: ${error.message}`);
    }
  }

  // Create a new comment
  static async createComment(commentData) {
    try {
      // Validate comment data
      const validation = Comment.validate(commentData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if task exists
      const taskExists = await TaskService.taskExists(commentData.taskId);
      if (!taskExists) {
        throw new Error('Task not found');
      }

      // Check if author exists
      const authorExists = await UserService.userExists(commentData.authorId);
      if (!authorExists) {
        throw new Error('Author not found');
      }

      const result = await runQuery(
        'INSERT INTO comments (text, authorId, taskId) VALUES (?, ?, ?)',
        [commentData.text.trim(), commentData.authorId, commentData.taskId]
      );

      // Get the created comment
      const createdComment = await this.getCommentById(result.id);
      return createdComment;
    } catch (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }
  }

  // Update comment
  static async updateComment(id, commentData, requestingUserId) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid comment ID');
      }

      // Check if comment exists
      const existingComment = await this.getCommentById(id);
      if (!existingComment) {
        throw new Error('Comment not found');
      }

      // Check if user can modify this comment
      if (!existingComment.canBeModifiedBy(requestingUserId)) {
        throw new Error('You can only modify your own comments');
      }

      // Validate update data
      const validation = Comment.validate({ ...existingComment, ...commentData });
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Ensure text is provided for update
      if (!commentData.text || typeof commentData.text !== 'string') {
        throw new Error('Validation failed: Text is required and must be a string');
      }

      await runQuery(
        'UPDATE comments SET text = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [commentData.text.trim(), id]
      );

      // Get updated comment
      return await this.getCommentById(id);
    } catch (error) {
      throw new Error(`Failed to update comment: ${error.message}`);
    }
  }

  // Delete comment
  static async deleteComment(id, requestingUserId) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid comment ID');
      }

      // Check if comment exists
      const existingComment = await this.getCommentById(id);
      if (!existingComment) {
        throw new Error('Comment not found');
      }

      // Check if user can modify this comment
      if (!existingComment.canBeModifiedBy(requestingUserId)) {
        throw new Error('You can only delete your own comments');
      }

      await runQuery('DELETE FROM comments WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete comment: ${error.message}`);
    }
  }

  // Check if comment exists
  static async commentExists(id) {
    try {
      const comment = await this.getCommentById(id);
      return comment !== null;
    } catch (error) {
      return false;
    }
  }
}

module.exports = CommentService;