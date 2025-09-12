const request = require('supertest');
const appPromise = require('../../src/server');

describe('PUT /api/tasks/:id/status', () => {
  let app;

  beforeAll(async () => {
    app = await appPromise;
    
    // Wait for database to be ready
    let retries = 10;
    while (retries > 0) {
      try {
        const response = await request(app).get('/api/projects');
        if (response.status === 200 && response.body.length > 0) {
          console.log('Database ready with projects:', response.body.length);
          break;
        }
      } catch (error) {
        console.log('Database not ready yet, retrying...');
      }
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Also check that tasks exist
    try {
      const tasksResponse = await request(app).get('/api/projects/1/tasks');
      console.log('Tasks in project 1:', tasksResponse.body.length);
    } catch (error) {
      console.log('Error checking tasks:', error.message);
    }
  });

  it('should update task status to In Progress', async () => {
    const taskId = 1;
    const statusData = {
      status: 'In Progress'
    };

    const response = await request(app)
      .put(`/api/tasks/${taskId}/status`)
      .send(statusData)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('status');
    expect(response.body.status).toBe('In Progress');
  });

  it('should update task status to Done', async () => {
    const taskId = 1;
    const statusData = {
      status: 'Done'
    };

    const response = await request(app)
      .put(`/api/tasks/${taskId}/status`)
      .send(statusData)
      .expect(200);

    expect(response.body.status).toBe('Done');
  });

  it('should return 400 for missing status', async () => {
    const taskId = 1;
    const response = await request(app)
      .put(`/api/tasks/${taskId}/status`)
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for invalid status', async () => {
    const taskId = 1;
    const response = await request(app)
      .put(`/api/tasks/${taskId}/status`)
      .send({ status: 'Invalid Status' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for non-existent task', async () => {
    const nonExistentTaskId = 9999;
    const response = await request(app)
      .put(`/api/tasks/${nonExistentTaskId}/status`)
      .send({ status: 'In Progress' })
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  it('should allow all valid status transitions', async () => {
    const taskId = 1;
    const validStatuses = ['To Do', 'In Progress', 'In Review', 'Done'];

    for (const status of validStatuses) {
      const response = await request(app)
        .put(`/api/tasks/${taskId}/status`)
        .send({ status })
        .expect(200);

      expect(response.body.status).toBe(status);
    }
  });
});