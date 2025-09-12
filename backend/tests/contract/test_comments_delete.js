const request = require('supertest');
const appPromise = require('../../src/server');

describe('DELETE /api/comments/:id', () => {
  let app;

  beforeAll(async () => {
    app = await appPromise;
    
    // Wait for database to be ready
    let retries = 10;
    while (retries > 0) {
      try {
        const response = await request(app).get('/api/notifications');
        if (response.status === 200) {
          console.log('Database ready via notifications endpoint');
          break;
        }
      } catch (error) {
        console.log(`Waiting for database... (${retries} retries left)`);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      retries--;
    }
    
    if (retries === 0) {
      throw new Error('Database not ready after retries');
    }
  });

  it('should delete a comment successfully', async () => {
    // Use existing seeded user (ID 1)
    const userId = 1;

    // Create a project
    const projectData = { name: 'Test Project for Comments' };
    const projectResponse = await request(app)
      .post('/api/projects')
      .send(projectData)
      .expect(201);
    const projectId = projectResponse.body.id;

    // Create a task
    const taskData = {
      title: 'Test Task',
      description: 'Task for testing comments',
      status: 'To Do',
      assignedUserId: userId
    };
    const taskResponse = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send(taskData)
      .expect(201);
    const taskId = taskResponse.body.id;

    // Create a comment
    const commentData = {
      text: 'Test comment for deletion',
      authorId: userId
    };
    const createResponse = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .send(commentData)
      .expect(201);
    const commentId = createResponse.body.id;

    // Now delete the comment
    const response = await request(app)
      .delete(`/api/comments/${commentId}`)
      .send({ authorId: userId })
      .expect(204);

    // 204 No Content means successful deletion with no response body
    expect(response.body).toEqual({});
  });

  it('should return 404 for non-existent comment', async () => {
    const nonExistentCommentId = 9999;

    const response = await request(app)
      .delete(`/api/comments/${nonExistentCommentId}`)
      .send({ authorId: 1 }) // Send authorId to match other tests
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 when trying to delete the same comment twice', async () => {
    // Use existing seeded user (ID 2)
    const userId = 2;

    // Create a project
    const projectData = { name: 'Test Project for Double Delete' };
    const projectResponse = await request(app)
      .post('/api/projects')
      .send(projectData)
      .expect(201);
    const projectId = projectResponse.body.id;

    // Create a task
    const taskData = {
      title: 'Test Task for Double Delete',
      description: 'Task for testing double delete',
      status: 'To Do',
      assignedUserId: userId
    };
    const taskResponse = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send(taskData)
      .expect(201);
    const taskId = taskResponse.body.id;

    // Create a comment
    const commentData = {
      text: 'Test comment for double deletion',
      authorId: userId
    };
    const createResponse = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .send(commentData)
      .expect(201);
    const commentId = createResponse.body.id;

    // First delete should succeed
    await request(app)
      .delete(`/api/comments/${commentId}`)
      .send({ authorId: userId });

    // Second delete should return 404 (comment no longer exists)
    const response = await request(app)
      .delete(`/api/comments/${commentId}`)
      .send({ authorId: userId })
      .expect(404);

    expect(response.body).toHaveProperty('error');
  });
});