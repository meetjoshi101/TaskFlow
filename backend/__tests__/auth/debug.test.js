const request = require('supertest');
const { User, Team, TeamMember, RefreshToken } = require('../../src/models');
const bcrypt = require('bcrypt');
const app = require('../../src/app');

describe('Debug Authentication', () => {
  let testUser, testTeam, testMember;
  
  beforeAll(async () => {
    // Setup test database
    await require('../../src/models').sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    // Clean database before each test
    await RefreshToken.destroy({ where: {} });
    await TeamMember.destroy({ where: {} });
    await Team.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  afterAll(async () => {
    await require('../../src/models').sequelize.close();
  });

  it('should debug registration endpoint', async () => {
    const userData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@test.com',
      password: 'Password123', // Fixed: Now has uppercase, lowercase, and number
      teamName: 'Jane Team',
      teamSlug: 'jane-team'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData);
      
    console.log('Registration response status:', response.status);
    console.log('Registration response body:', response.body);
    
    // Don't expect anything, just debug
  });
});
