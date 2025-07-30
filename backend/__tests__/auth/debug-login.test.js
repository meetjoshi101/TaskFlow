const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');

describe('Debug Login', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: false });
  });

  beforeEach(async () => {
    // Clean up test data
    await sequelize.models.RefreshToken.destroy({ where: {} });
    await sequelize.models.TeamMember.destroy({ where: {} });
    await sequelize.models.TeamInvitation.destroy({ where: {} });
    await sequelize.models.Team.destroy({ where: {} });
    await sequelize.models.User.destroy({ where: {} });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should debug login flow', async () => {
    // Register user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        password: 'Password123',
        teamName: 'Test Team'
      });

    console.log('Register Status:', registerResponse.status);
    console.log('Register Body:', registerResponse.body);

    expect(registerResponse.status).toBe(201);
    const userData = registerResponse.body.data;

    // Verify the user's email
    const user = await sequelize.models.User.findByPk(userData.userId);
    console.log('User before verification:', {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified
    });

    await user.update({ isEmailVerified: true });
    
    console.log('User after verification:', {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      isEmailVerified: user.isEmailVerified
    });

    // Debug: Check user in DB after reload
    await user.reload();
    console.log('User after reload:', {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      isEmailVerified: user.isEmailVerified
    });

    // Debug: Try to find user the same way login does
    const foundUser = await sequelize.models.User.findOne({
      where: { email: 'john@test.com' }
    });
    console.log('Found user in login lookup:', foundUser ? {
      id: foundUser.id,
      email: foundUser.email,
      emailVerified: foundUser.emailVerified,
      isEmailVerified: foundUser.isEmailVerified,
      hasPassword: !!foundUser.password,
      passwordLength: foundUser.password ? foundUser.password.length : 0
    } : null);

    // Debug: Test password comparison manually
    if (foundUser) {
      const bcrypt = require('bcrypt');
      const isValidPassword = await bcrypt.compare('Password123', foundUser.password);
      console.log('Manual password comparison result:', isValidPassword);
    }

    // Try to login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'john@test.com',
        password: 'Password123'
      });

    console.log('Login Status:', loginResponse.status);
    console.log('Login Body:', loginResponse.body);
  });
});
