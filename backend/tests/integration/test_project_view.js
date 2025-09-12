const request = require('supertest');
const appPromise = require('../../src/server');

describe('Project View Integration', () => {
  let app;

  beforeAll(async () => {
    app = await appPromise;
    
    // Wait for database to be ready
    let retries = 10;
    while (retries > 0) {
      try {
        const response = await request(app).get('/api/projects');
        if (response.status === 200) {
          break;
        }
      } catch (error) {
        // Database not ready yet
      }
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  });

  it('should allow viewing project details and associated tasks', async () => {
    // Step 1: Get all projects
    const projectsResponse = await request(app)
      .get('/api/projects')
      .expect(200);

    expect(Array.isArray(projectsResponse.body)).toBe(true);

    if (projectsResponse.body.length > 0) {
      const project = projectsResponse.body[0];

      // Step 2: Get tasks for the project
      const tasksResponse = await request(app)
        .get(`/api/projects/${project.id}/tasks`)
        .expect(200);

      expect(Array.isArray(tasksResponse.body)).toBe(true);

      // Step 3: Verify all tasks belong to the correct project
      tasksResponse.body.forEach(task => {
        expect(task.projectId).toBe(project.id);
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('status');
      });

      // Step 4: If there are tasks, get comments for the first task
      if (tasksResponse.body.length > 0) {
        const firstTask = tasksResponse.body[0];
        const commentsResponse = await request(app)
          .get(`/api/tasks/${firstTask.id}/comments`)
          .expect(200);

        expect(Array.isArray(commentsResponse.body)).toBe(true);

        // Verify all comments belong to the correct task
        commentsResponse.body.forEach(comment => {
          expect(comment.taskId).toBe(firstTask.id);
          expect(comment).toHaveProperty('text');
          expect(comment).toHaveProperty('authorId');
        });
      }
    }
  });

  it('should handle project creation and task management workflow', async () => {
    // Create a new project
    const projectData = {
      name: `Integration Test Project ${Date.now()}`
    };

    const createProjectResponse = await request(app)
      .post('/api/projects')
      .send(projectData)
      .expect(201);

    const projectId = createProjectResponse.body.id;

    // Create multiple tasks for the project
    const tasksData = [
      {
        title: 'Task 1',
        description: 'First task',
        status: 'To Do'
      },
      {
        title: 'Task 2',
        description: 'Second task',
        status: 'In Progress'
      },
      {
        title: 'Task 3',
        description: 'Third task',
        status: 'Done'
      }
    ];

    const createdTasks = [];
    for (const taskData of tasksData) {
      const createTaskResponse = await request(app)
        .post(`/api/projects/${projectId}/tasks`)
        .send(taskData)
        .expect(201);

      createdTasks.push(createTaskResponse.body);
    }

    // Verify all tasks were created and belong to the project
    const tasksResponse = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .expect(200);

    expect(tasksResponse.body.length).toBe(tasksData.length);

    // Verify task statuses
    const statusCounts = {};
    tasksResponse.body.forEach(task => {
      expect(task.projectId).toBe(projectId);
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });

    expect(statusCounts['To Do']).toBe(1);
    expect(statusCounts['In Progress']).toBe(1);
    expect(statusCounts['Done']).toBe(1);
  });
});