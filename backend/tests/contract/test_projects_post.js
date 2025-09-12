const request = require('supertest');
const appPromise = require('../../src/server');

describe('POST /api/projects', () => {
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

  it('should create a new project with valid data', async () => {
    const projectData = {
      name: 'Unique Test Project'
    };

    const response = await request(app)
      .post('/api/projects')
      .send(projectData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('name');
    expect(response.body.name).toBe(projectData.name);
    expect(typeof response.body.id).toBe('number');
  });

  it('should return 400 for missing name', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({})
      .expect(400);

    // The exact error format will depend on implementation
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for empty name', async () => {
    const response = await request(app)
      .post('/api/projects')
      .send({ name: '' })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for name too long', async () => {
    const longName = 'a'.repeat(101);
    const response = await request(app)
      .post('/api/projects')
      .send({ name: longName })
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });
});