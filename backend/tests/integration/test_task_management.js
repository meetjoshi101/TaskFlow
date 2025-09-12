const request = require('supertest');
const appPromise = require('../../src/server');

describe('Task Management Integration', () => {
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

  it('should handle complete task lifecycle: create, update, comment, complete', async () => {
    // Step 1: Get existing project or create one
    let projectId;
    const projectsResponse = await request(app)
      .get('/api/projects')
      .expect(200);

    if (projectsResponse.body.length > 0) {
      projectId = projectsResponse.body[0].id;
    } else {
      // Create a project if none exist
      const createProjectResponse = await request(app)
        .post('/api/projects')
        .send({ name: 'Task Management Test Project' })
        .expect(201);
      projectId = createProjectResponse.body.id;
    }

    // Step 2: Create a task
    const taskData = {
      title: 'Task Management Integration Test',
      description: 'Testing complete task lifecycle',
      status: 'To Do'
    };

    const createTaskResponse = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send(taskData)
      .expect(201);

    const taskId = createTaskResponse.body.id;

    // Step 3: Update task status to In Progress
    const updateStatusResponse = await request(app)
      .put(`/api/tasks/${taskId}/status`)
      .send({ status: 'In Progress' })
      .expect(200);

    expect(updateStatusResponse.body.status).toBe('In Progress');

    // Step 4: Add a comment to the task
    const commentData = {
      text: 'Starting work on this task',
      authorId: 1 // Assuming user with ID 1 exists
    };

    const createCommentResponse = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .send(commentData)
      .expect(201);

    const commentId = createCommentResponse.body.id;

    // Step 5: Get comments for the task
    const commentsResponse = await request(app)
      .get(`/api/tasks/${taskId}/comments`)
      .expect(200);

    expect(commentsResponse.body.length).toBeGreaterThan(0);
    const comment = commentsResponse.body.find(c => c.id === commentId);
    expect(comment).toBeDefined();
    expect(comment.text).toBe(commentData.text);

    // Step 6: Update the comment
    const updatedCommentData = {
      text: 'Updated comment - making progress'
    };

    const updateCommentResponse = await request(app)
      .put(`/api/comments/${commentId}`)
      .send(updatedCommentData)
      .expect(200);

    expect(updateCommentResponse.body.text).toBe(updatedCommentData.text);

    // Step 7: Update task status to Done
    const completeTaskResponse = await request(app)
      .put(`/api/tasks/${taskId}/status`)
      .send({ status: 'Done' })
      .expect(200);

    expect(completeTaskResponse.body.status).toBe('Done');

    // Step 8: Verify final state
    const finalTasksResponse = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .expect(200);

    const finalTask = finalTasksResponse.body.find(t => t.id === taskId);
    expect(finalTask).toBeDefined();
    expect(finalTask.status).toBe('Done');
  });

  it('should handle task status transitions correctly', async () => {
    // Get existing project
    const projectsResponse = await request(app)
      .get('/api/projects')
      .expect(200);

    if (projectsResponse.body.length === 0) {
      // Skip test if no projects exist
      return;
    }

    const projectId = projectsResponse.body[0].id;

    // Create a task
    const taskData = {
      title: 'Status Transition Test',
      status: 'To Do'
    };

    const createTaskResponse = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .send(taskData)
      .expect(201);

    const taskId = createTaskResponse.body.id;

    // Test all status transitions
    const statuses = ['In Progress', 'In Review', 'Done', 'To Do'];

    for (const status of statuses) {
      const response = await request(app)
        .put(`/api/tasks/${taskId}/status`)
        .send({ status })
        .expect(200);

      expect(response.body.status).toBe(status);
    }

    // Verify final status
    const finalResponse = await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .expect(200);

    const task = finalResponse.body.find(t => t.id === taskId);
    expect(task.status).toBe('To Do');
  });
});