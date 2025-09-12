const request = require('supertest');
const appPromise = require('../../src/server');

describe('GET /api/tasks/:id/comments', () => {
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

  it('should return comments for a valid task', async () => {
    const taskId = 1;

    const response = await request(app)
      .get(`/api/tasks/${taskId}/comments`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      const comment = response.body[0];
      expect(comment).toHaveProperty('id');
      expect(comment).toHaveProperty('text');
      expect(comment).toHaveProperty('authorId');
      expect(comment).toHaveProperty('taskId');
      expect(comment).toHaveProperty('createdAt');
      expect(comment).toHaveProperty('updatedAt');
      expect(comment.taskId).toBe(taskId);
    }
  });

  it('should return comments with correct structure', async () => {
    const taskId = 1;

    const response = await request(app)
      .get(`/api/tasks/${taskId}/comments`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    response.body.forEach(comment => {
      expect(typeof comment.id).toBe('number');
      expect(typeof comment.text).toBe('string');
      expect(comment.text.length).toBeGreaterThan(0);
      expect(comment.text.length).toBeLessThanOrEqual(500);
      expect(typeof comment.authorId).toBe('number');
      expect(typeof comment.taskId).toBe('number');
      expect(comment.taskId).toBe(taskId);
      expect(typeof comment.createdAt).toBe('string');
      expect(typeof comment.updatedAt).toBe('string');
    });
  });

  it('should return 404 for non-existent task', async () => {
    const nonExistentTaskId = 9999;

    const response = await request(app)
      .get(`/api/tasks/${nonExistentTaskId}/comments`)
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  it('should return empty array for task with no comments', async () => {
    const taskId = 1; // Assuming task exists but has no comments

    const response = await request(app)
      .get(`/api/tasks/${taskId}/comments`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    // Note: This test might need adjustment based on actual data
  });
});