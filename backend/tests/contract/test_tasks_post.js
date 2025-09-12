const request = require('supertest');
const appPromise = require('../../src/server');

describe('POST /api/projects/:projectId/tasks', () => {
  let app;

  beforeAll(async () => {
    app = await appPromise;
    
    // Wait for database to be ready
    let retries = 0;
    while (retries < 10) {
      try {
        const projectResponse = await request(app)
          .get('/api/projects')
          .expect(200);
        
        if (projectResponse.body.length > 0) {
          break;
        }
      } catch (error) {
        // Ignore errors and retry
      }
      
      retries++;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });

  it('should create a new task with valid data', async () => {
    const projectId = 1;
    const taskData = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'To Do',
      assignedUserId: 1
    };

    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send(taskData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('description');
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('assignedUserId');
    expect(response.body).toHaveProperty('projectId');
    expect(response.body.title).toBe(taskData.title);
    expect(response.body.description).toBe(taskData.description);
    expect(response.body.status).toBe(taskData.status);
    expect(response.body.assignedUserId).toBe(taskData.assignedUserId);
    expect(response.body.projectId).toBe(projectId);
  });

  it('should create a task with minimal required data', async () => {
    const projectId = 1;
    const taskData = {
      title: 'Minimal Task'
    };

    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send(taskData)
      .expect(201);

    expect(response.body.title).toBe(taskData.title);
    expect(response.body.status).toBe('To Do'); // Default status
    expect(response.body.projectId).toBe(projectId);
  });

  it('should return 400 for missing title', async () => {
    const projectId = 1;
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ description: 'No title' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for empty title', async () => {
    const projectId = 1;
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: '' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for title too long', async () => {
    const projectId = 1;
    const longTitle = 'a'.repeat(201);
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: longTitle })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for invalid status', async () => {
    const projectId = 1;
    const response = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send({ title: 'Test', status: 'Invalid Status' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for non-existent project', async () => {
    const nonExistentProjectId = 9999;
    const response = await request(app)
      .post(`/api/projects/${nonExistentProjectId}/tasks`)
      .send({ title: 'Test Task' })
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });
});