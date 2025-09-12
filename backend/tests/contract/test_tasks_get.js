const request = require('supertest');
const appPromise = require('../../src/server');

describe('GET /api/projects/:projectId/tasks', () => {
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
          console.log('Database is ready with', projectResponse.body.length, 'projects');
          break;
        }
      } catch (error) {
        // Ignore errors and retry
      }
      
      retries++;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  });

  it('should return tasks for a valid project', async () => {
    const projectId = 1; // Assuming project with ID 1 exists

    const response = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      const task = response.body[0];
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('assignedUserId');
      expect(task).toHaveProperty('projectId');
      expect(task.projectId).toBe(projectId);
      expect(['To Do', 'In Progress', 'In Review', 'Done']).toContain(task.status);
    }
  });

  it('should return tasks with correct structure', async () => {
    const projectId = 1;

    const response = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    response.body.forEach(task => {
      expect(typeof task.id).toBe('number');
      expect(typeof task.title).toBe('string');
      expect(task.title.length).toBeGreaterThan(0);
      expect(task.title.length).toBeLessThanOrEqual(200);
      expect(typeof task.description).toBe('string');
      expect(task.description.length).toBeLessThanOrEqual(1000);
      expect(['To Do', 'In Progress', 'In Review', 'Done']).toContain(task.status);
      expect(typeof task.projectId).toBe('number');
      if (task.assignedUserId !== null) {
        expect(typeof task.assignedUserId).toBe('number');
      }
    });
  });

  it('should return 404 for non-existent project', async () => {
    const nonExistentProjectId = 9999;

    const response = await request(app)
      .get(`/api/projects/${nonExistentProjectId}/tasks`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });
});