const request = require('supertest');
const appPromise = require('../../src/server');

describe('GET /api/projects', () => {
  let app;

  beforeAll(async () => {
    app = await appPromise;
    
    // Wait for database to be ready
    let retries = 10;
    while (retries > 0) {
      try {
        // Try a simple endpoint that should work once DB is initialized
        const response = await request(app).get('/api/notifications');
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

  it('should return a list of projects', async () => {
    const response = await request(app)
      .get('/api/projects')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      const project = response.body[0];
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name');
    }
  });

  it('should return projects with correct structure', async () => {
    const response = await request(app)
      .get('/api/projects')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    response.body.forEach(project => {
      expect(typeof project.id).toBe('number');
      expect(typeof project.name).toBe('string');
      expect(project.name.length).toBeGreaterThan(0);
      expect(project.name.length).toBeLessThanOrEqual(100);
    });
  });
});