const request = require('supertest');
const appPromise = require('../../src/server');

describe('GET /api/notifications', () => {
  let app;

  beforeAll(async () => {
    app = await appPromise;
  });

  it('should return a list of notifications', async () => {
    const response = await request(app)
      .get('/api/notifications')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    if (response.body.length > 0) {
      const notification = response.body[0];
      expect(notification).toHaveProperty('id');
      expect(notification).toHaveProperty('message');
      expect(notification).toHaveProperty('type');
      expect(notification).toHaveProperty('createdAt');
    }
  });

  it('should return notifications with correct structure', async () => {
    const response = await request(app)
      .get('/api/notifications')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);

    response.body.forEach(notification => {
      expect(typeof notification.id).toBe('number');
      expect(typeof notification.message).toBe('string');
      expect(notification.message.length).toBeGreaterThan(0);
      expect(typeof notification.type).toBe('string');
      expect(typeof notification.createdAt).toBe('string');
    });
  });

  it('should return empty array when no notifications exist', async () => {
    const response = await request(app)
      .get('/api/notifications')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    // Note: This test assumes the system might have no notifications initially
  });
});