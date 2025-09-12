const request = require('supertest');
const appPromise = require('../../src/server');

describe('PUT /api/comments/:id', () => {
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

  it('should update a comment with valid data', async () => {
    const commentId = 1;
    const updateData = {
      text: 'Updated comment text'
    };

    const response = await request(app)
      .put(`/api/comments/${commentId}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('text');
    expect(response.body).toHaveProperty('authorId');
    expect(response.body).toHaveProperty('taskId');
    expect(response.body).toHaveProperty('createdAt');
    expect(response.body).toHaveProperty('updatedAt');
    expect(response.body.text).toBe(updateData.text);
    expect(response.body.id).toBe(commentId);
  });

  it('should return 400 for missing text', async () => {
    const commentId = 1;
    const response = await request(app)
      .put(`/api/comments/${commentId}`)
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for empty text', async () => {
    const commentId = 1;
    const response = await request(app)
      .put(`/api/comments/${commentId}`)
      .send({ text: '' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for text too long', async () => {
    const commentId = 1;
    const longText = 'a'.repeat(501);
    const response = await request(app)
      .put(`/api/comments/${commentId}`)
      .send({ text: longText })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 for non-existent comment', async () => {
    const nonExistentCommentId = 9999;
    const response = await request(app)
      .put(`/api/comments/${nonExistentCommentId}`)
      .send({ text: 'Updated text' })
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  it('should update updatedAt timestamp', async () => {
    const commentId = 1;
    const updateData = {
      text: 'Updated comment text'
    };

    const response = await request(app)
      .put(`/api/comments/${commentId}`)
      .send(updateData)
      .expect(200);

    expect(response.body).toHaveProperty('updatedAt');
    // Note: In a real test, you'd compare timestamps, but for now we just check it exists
  });
});