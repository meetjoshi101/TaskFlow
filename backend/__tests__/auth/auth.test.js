const request = require('supertest');
const app = require('../../src/app');
const { sequelize } = require('../../src/models');

describe('Authentication API', () => {
  beforeAll(async () => {
    // Sync database without dropping tables since they already exist
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

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      password: 'Password123',
      teamName: 'Test Team'
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Account created successfully. Please check your email for verification.');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('teamId');
      expect(response.body.data.email).toBe(validRegistrationData.email);
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          email: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject duplicate email registration', async () => {
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...validRegistrationData,
          firstName: 'Jane'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });
  });

  describe('POST /api/auth/login', () => {
    let userData;
    
    beforeEach(async () => {
      // Create a verified user for login tests
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'Password123',
          teamName: 'Test Team'
        });
      
      userData = response.body.data;
      
      // Verify the user's email
      const user = await sequelize.models.User.findByPk(userData.userId);
      await user.update({ isEmailVerified: true });
    });

    it('should login verified user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@test.com',
          password: 'Password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('john@test.com');
    });

    it('should reject login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@test.com',
          password: 'wrongPassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject login for unverified email', async () => {
      // Update user to be unverified
      await sequelize.models.User.update(
        { isEmailVerified: false },
        { where: { id: userData.userId } }
      );

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@test.com',
          password: 'Password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('verify');
    });
  });

  describe('POST /api/auth/verify-email', () => {
    let userData, user;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'Password123',
          teamName: 'Test Team'
        });
      
      userData = response.body.data;
      user = await sequelize.models.User.findByPk(userData.userId);
    });

    it('should verify email with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: user.emailVerificationToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('verified');
    });

    it('should reject invalid verification token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: 'invalid-token'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject expired verification token', async () => {
      // Set token as expired
      await user.update({
        emailVerificationExpires: new Date(Date.now() - 1000) // 1 second ago
      });

      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: user.emailVerificationToken
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('expired');
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    let userData;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'Password123',
          teamName: 'Test Team'
        });
      
      userData = response.body.data;
    });

    it('should resend verification email for unverified user', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({
          email: 'john@test.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('sent');
    });

    it('should reject resend for already verified user', async () => {
      // Verify the user first
      const user = await sequelize.models.User.findByPk(userData.userId);
      await user.update({ isEmailVerified: true });

      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({
          email: 'john@test.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already verified');
    });

    it('should reject resend for non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .send({
          email: 'nonexistent@test.com'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    let userData;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'Password123',
          teamName: 'Test Team'
        });
      
      userData = response.body.data;
      
      // Verify the user
      const user = await sequelize.models.User.findByPk(userData.userId);
      await user.update({ isEmailVerified: true });
    });

    it('should send password reset email for valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'john@test.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('sent');
    });

    it('should handle non-existent email gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@test.com'
        });

      // Should still return success for security reasons
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let userData, user;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'Password123',
          teamName: 'Test Team'
        });
      
      userData = response.body.data;
      user = await sequelize.models.User.findByPk(userData.userId);
      await user.update({ isEmailVerified: true });

      // Trigger password reset to get token
      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'john@test.com' });

      // Reload user to get reset token
      await user.reload();
    });

    it('should reset password with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: user.passwordResetToken,
          newPassword: 'NewPassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset');
    });

    it('should reject invalid reset token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          password: 'NewPassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should reject weak new password', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: user.passwordResetToken,
          newPassword: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let userData, refreshToken;

    beforeEach(async () => {
      // Register and verify user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'Password123',
          teamName: 'Test Team'
        });
      
      userData = registerResponse.body.data;
      
      const user = await sequelize.models.User.findByPk(userData.userId);
      await user.update({ isEmailVerified: true });

      // Login to get refresh token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@test.com',
          password: 'Password123'
        });

      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZXN0IjoiaW52YWxpZCIsImlhdCI6MTc1Mzg2OTMzMH0.3h_qYQQVvrEA8rOu00PRnBoBluPTBNbtUGqvtvAKUR4'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject expired refresh token', async () => {
      // Set refresh token as expired in database
      await sequelize.models.RefreshToken.update(
        { expiresAt: new Date(Date.now() - 1000) },
        { where: { token: refreshToken } }
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let userData, accessToken, refreshToken;

    beforeEach(async () => {
      // Register and verify user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'Password123',
          teamName: 'Test Team'
        });
      
      userData = registerResponse.body.data;
      
      const user = await sequelize.models.User.findByPk(userData.userId);
      await user.update({ isEmailVerified: true });

      // Login to get tokens
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@test.com',
          password: 'Password123'
        });

      accessToken = loginResponse.body.data.accessToken;
      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('should logout user and invalidate refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          refreshToken: refreshToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
    });

    it('should reject logout without access token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send({
          refreshToken: refreshToken
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let userData, accessToken;

    beforeEach(async () => {
      // Register and verify user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          password: 'Password123',
          teamName: 'Test Team'
        });
      
      userData = registerResponse.body.data;
      
      const user = await sequelize.models.User.findByPk(userData.userId);
      await user.update({ isEmailVerified: true });

      // Login to get access token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@test.com',
          password: 'Password123'
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      expect(response.body.data.user.email).toBe('john@test.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject request without access token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid access token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
