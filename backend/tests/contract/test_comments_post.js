const request = require('supertest');
const appPromise = require('../../src/server');

describe('POST /api/tasks/:id/comments', () => {
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

  it('should create a new comment with valid data', async () => {
    const taskId = 1;
    const commentData = {
      text: 'This is a test comment',
      authorId: 1
    };

    const response = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .send(commentData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('text');
    expect(response.body).toHaveProperty('authorId');
    expect(response.body).toHaveProperty('taskId');
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
    expect(response.body.text).toBe(commentData.text);
    expect(response.body.authorId).toBe(commentData.authorId);
    expect(response.body.taskId).toBe(taskId);
  });

  it('should return 400 for missing text', async () => {
    const taskId = 1;
    const response = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .send({ authorId: 1 })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for missing authorId', async () => {
    const taskId = 1;
    const response = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .send({ text: 'Test comment' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for empty text', async () => {
    const taskId = 1;
    const response = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .send({ text: '', authorId: 1 })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for text too long', async () => {
    const taskId = 1;
    const longText = 'a'.repeat(501);
    const response = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .send({ text: longText, authorId: 1 })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for non-existent task', async () => {
    const nonExistentTaskId = 9999;
    const response = await request(app)
      .post(`/api/tasks/${nonExistentTaskId}/comments`)
      .send({ text: 'Test comment', authorId: 1 })
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for non-existent author', async () => {
    const taskId = 1;
    const response = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .send({ text: 'Test comment', authorId: 9999 })
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });
});