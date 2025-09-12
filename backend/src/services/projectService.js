const { getAllRows, getRow, runQuery } = require('../db');
const Project = require('../models/project');

class ProjectService {
  // Get all projects
  static async getAllProjects() {
    try {
      const rows = await getAllRows('SELECT * FROM projects ORDER BY name');
      return rows.map(row => Project.fromDatabaseRow(row));
    } catch (error) {
      throw new Error(`Failed to get projects: ${error.message}`);
    }
  }

  // Get project by ID
  static async getProjectById(id) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid project ID');
      }

      const row = await getRow('SELECT * FROM projects WHERE id = ?', [id]);
      if (!row) {
        return null;
      }

      return Project.fromDatabaseRow(row);
    } catch (error) {
      throw new Error(`Failed to get project: ${error.message}`);
    }
  }

  // Create a new project
  static async createProject(projectData) {
    try {
      // Validate project data
      const validation = Project.validate(projectData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const result = await runQuery(
        'INSERT INTO projects (name) VALUES (?)',
        [projectData.name.trim()]
      );

      // Get the created project
      const createdProject = await this.getProjectById(result.id);
      return createdProject;
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Project with this name already exists');
      }
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  // Update project
  static async updateProject(id, projectData) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid project ID');
      }

      // Check if project exists
      const existingProject = await this.getProjectById(id);
      if (!existingProject) {
        throw new Error('Project not found');
      }

      // Validate update data
      const validation = Project.validate({ ...existingProject, ...projectData });
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      await runQuery(
        'UPDATE projects SET name = ? WHERE id = ?',
        [projectData.name.trim(), id]
      );

      // Get updated project
      return await this.getProjectById(id);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Project with this name already exists');
      }
      throw new Error(`Failed to update project: ${error.message}`);
    }
  }

  // Delete project
  static async deleteProject(id) {
    try {
      if (!id || typeof id !== 'number' || id <= 0) {
        throw new Error('Invalid project ID');
      }

      // Check if project exists
      const existingProject = await this.getProjectById(id);
      if (!existingProject) {
        throw new Error('Project not found');
      }

      await runQuery('DELETE FROM projects WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }
  }

  // Get project with tasks
  static async getProjectWithTasks(id) {
    try {
      const project = await this.getProjectById(id);
      if (!project) {
        return null;
      }

      // Get tasks for this project
      const TaskService = require('./taskService');
      const tasks = await TaskService.getTasksByProjectId(id);

      return {
        ...project.toJSON(),
        tasks: tasks.map(task => task.toJSON())
      };
    } catch (error) {
      throw new Error(`Failed to get project with tasks: ${error.message}`);
    }
  }

  // Check if project exists
  static async projectExists(id) {
    try {
      const project = await this.getProjectById(id);
      return project !== null;
    } catch (error) {
      return false;
    }
  }
}

module.exports = ProjectService;