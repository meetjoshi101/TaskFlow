const request = require('supertest');
const appPromise = require('../../src/server');

describe('GET /api/users', () => {
  let app;

  beforeAll(async () => {
    app = await appPromise;
    
    // Wait for database to be ready - try multiple approaches
    let retries = 15;
    while (retries > 0) {
      try {
        // First try the notifications endpoint
        const response = await request(app).get('/api/notifications');
        if (response.status === 200) {
          console.log('Database ready via notifications endpoint');
          break;
        }
      } catch (error) {
        // Try the users endpoint directly
        try {
          const userResponse = await request(app).get('/api/users');
          if (userResponse.status === 200) {
            console.log('Database ready via users endpoint');
            break;
          }
        } catch (userError) {
          // Database not ready yet
        }
      }
      retries--;
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 200));
      } else {
        console.log('Database readiness check timed out');
      }
    }
  });

  it('should return a list of users', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      const user = response.body[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('role');
      expect(['product_manager', 'engineer']).toContain(user.role);
    }
  });

  it('should return users with correct structure', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    response.body.forEach(user => {
      expect(typeof user.id).toBe('number');
      expect(typeof user.name).toBe('string');
      expect(user.name.length).toBeGreaterThan(0);
      expect(user.name.length).toBeLessThanOrEqual(50);
      expect(['product_manager', 'engineer']).toContain(user.role);
    });
  });
});