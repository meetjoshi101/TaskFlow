const request = require('supertest');
const appPromise = require('../../src/server');

describe('User Selection Integration', () => {
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

  it('should allow user to view available users and select one', async () => {
    // Step 1: Get all users
    const usersResponse = await request(app)
      .get('/api/users')
      .expect(200);

    expect(Array.isArray(usersResponse.body)).toBe(true);
    expect(usersResponse.body.length).toBeGreaterThan(0);

    // Step 2: Verify user structure
    const firstUser = usersResponse.body[0];
    expect(firstUser).toHaveProperty('id');
    expect(firstUser).toHaveProperty('name');
    expect(firstUser).toHaveProperty('role');

    // Step 3: Simulate user selection by getting projects (which might be filtered by user)
    const projectsResponse = await request(app)
      .get('/api/projects')
      .expect(200);

    expect(Array.isArray(projectsResponse.body)).toBe(true);

    // Step 4: If there are projects, get tasks for the first project
    if (projectsResponse.body.length > 0) {
      const firstProject = projectsResponse.body[0];
      const tasksResponse = await request(app)
        .get(`/api/projects/${firstProject.id}/tasks`)
        .expect(200);

      expect(Array.isArray(tasksResponse.body)).toBe(true);
    }
  });

  it('should handle user selection workflow', async () => {
    // Get users
    const usersResponse = await request(app)
      .get('/api/users')
      .expect(200);

    const users = usersResponse.body;
    expect(users.length).toBeGreaterThan(0);

    // Select a user (simulate by remembering user ID)
    const selectedUserId = users[0].id;

    // Get projects that this user can access
    const projectsResponse = await request(app)
      .get('/api/projects')
      .expect(200);

    // If projects exist, verify they can be accessed
    if (projectsResponse.body.length > 0) {
      const project = projectsResponse.body[0];

      // Create a task assigned to the selected user
      const taskData = {
        title: 'Integration Test Task',
        description: 'Task for integration testing',
        status: 'To Do',
        assignedUserId: selectedUserId
      };

      const createTaskResponse = await request(app)
        .post(`/api/projects/${project.id}/tasks`)
        .send(taskData)
        .expect(201);

      expect(createTaskResponse.body.assignedUserId).toBe(selectedUserId);

      // Get tasks for the project and verify the assigned user
      const tasksResponse = await request(app)
        .get(`/api/projects/${project.id}/tasks`)
        .expect(200);

      const createdTask = tasksResponse.body.find(task => task.id === createTaskResponse.body.id);
      expect(createdTask).toBeDefined();
      expect(createdTask.assignedUserId).toBe(selectedUserId);
    }
  });
});