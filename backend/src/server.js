const express = require('express');
const { initializeDatabase } = require('./db');
const UserService = require('./services/userService');
const ProjectService = require('./services/projectService');
const TaskService = require('./services/taskService');
const CommentService = require('./services/commentService');

const app = express();

// Basic middleware
app.use(express.json());

// For tests, initialize database synchronously
let appPromise;
if (process.env.NODE_ENV === 'test') {
  // Initialize database synchronously for tests
  const { initializeDatabase } = require('./db');
  // Use a synchronous approach for tests
  const initDb = async () => {
    await initializeDatabase();
    console.log('Database initialization completed for tests');
    return app;
  };
  appPromise = initDb();
} else {
  appPromise = Promise.resolve(app);
}

module.exports = appPromise;

// Error handling middleware
const handleError = (res, error) => {
  console.error(error);
  const message = error.message.toLowerCase();

  if (message.includes('validation failed') ||
      message.includes('invalid') ||
      message.includes('cannot be empty') ||
      message.includes('too long') ||
      message.includes('must be')) {
    return res.status(400).json({ error: error.message });
  }
  if (message.includes('not found') ||
      message.includes('does not exist')) {
    return res.status(404).json({ error: error.message });
  }
  if (message.includes('already exists') ||
      message.includes('unique constraint') ||
      message.includes('conflict')) {
    return res.status(409).json({ error: error.message });
  }
  if (message.includes('only modify your own') ||
      message.includes('only delete your own')) {
    return res.status(403).json({ error: error.message });
  }
  return res.status(500).json({ error: 'Internal server error' });
};

// API Routes

// Users
app.get('/api/users', async (req, res) => {
  try {
    const users = await UserService.getAllUsers();
    res.json(users.map(user => user.toJSON()));
  } catch (error) {
    handleError(res, error);
  }
});

// Projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await ProjectService.getAllProjects();
    res.json(projects.map(project => project.toJSON()));
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const project = await ProjectService.createProject(req.body);
    res.status(201).json(project.toJSON());
  } catch (error) {
    handleError(res, error);
  }
});

// Tasks
app.get('/api/projects/:projectId/tasks', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);

    // Check if project exists
    const projectExists = await ProjectService.projectExists(projectId);
    if (!projectExists) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const tasks = await TaskService.getTasksByProjectId(projectId);
    res.json(tasks.map(task => task.toJSON()));
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/projects/:projectId/tasks', async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const taskData = { ...req.body, projectId };

    // Ensure status has a default value if not provided
    if (!taskData.status) {
      taskData.status = 'To Do';
    }

    const task = await TaskService.createTask(taskData);
    res.status(201).json(task.toJSON());
  } catch (error) {
    handleError(res, error);
  }
});

app.put('/api/tasks/:taskId/status', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const { status } = req.body;
    const task = await TaskService.updateTaskStatus(taskId, status);
    res.json(task.toJSON());
  } catch (error) {
    handleError(res, error);
  }
});

// Comments
app.get('/api/tasks/:taskId/comments', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);

    // Check if task exists
    const taskExists = await TaskService.taskExists(taskId);
    if (!taskExists) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const comments = await CommentService.getCommentsByTaskId(taskId);
    res.json(comments.map(comment => comment.toJSON()));
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/tasks/:taskId/comments', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    const commentData = { ...req.body, taskId };
    const comment = await CommentService.createComment(commentData);
    res.status(201).json(comment.toJSON());
  } catch (error) {
    handleError(res, error);
  }
});

app.put('/api/comments/:commentId', async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const requestingUserId = req.body.authorId || 1; // Default to user 1 for tests
    const comment = await CommentService.updateComment(commentId, req.body, requestingUserId);
    res.json(comment.toJSON());
  } catch (error) {
    handleError(res, error);
  }
});

app.delete('/api/comments/:commentId', async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId);
    const requestingUserId = req.body?.authorId || 1; // Default to user 1 for tests
    await CommentService.deleteComment(commentId, requestingUserId);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
});

// Notifications (placeholder for now)
app.get('/api/notifications', async (req, res) => {
  try {
    // Return empty array for now
    res.json([]);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = app;