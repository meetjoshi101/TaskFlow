const { User, Team, sequelize } = require('../../src/models');
const bcrypt = require('bcrypt');

describe('User Model', () => {
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Creation', () => {
    test('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = await User.create(userData);

      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.emailVerified).toBe(false);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    test('should hash password automatically on creation', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = await User.create(userData);

      expect(user.passwordHash).toBeDefined();
      expect(user.passwordHash).not.toBe('testpassword123');
      expect(user.passwordHash.startsWith('$2b$')).toBe(true);
    });

    test('should validate email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'testpassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should require unique email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'John',
        lastName: 'Doe'
      };

      await User.create(userData);
      
      await expect(User.create(userData)).rejects.toThrow();
    });

    test('should require all mandatory fields', async () => {
      await expect(User.create({})).rejects.toThrow();
      
      await expect(User.create({
        email: 'test@example.com'
      })).rejects.toThrow();
      
      await expect(User.create({
        email: 'test@example.com',
        password: 'test123'
      })).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let user;

    beforeEach(async () => {
      user = await User.create({
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'John',
        lastName: 'Doe'
      });
    });

    test('should verify correct password', async () => {
      const isValid = await user.verifyPassword('testpassword123');
      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const isValid = await user.verifyPassword('wrongpassword');
      expect(isValid).toBe(false);
    });

    test('should generate email verification token', async () => {
      await user.generateEmailVerificationToken();

      expect(user.emailVerificationToken).toBeDefined();
      expect(user.emailVerificationToken.length).toBeGreaterThan(20);
      expect(user.emailVerificationExpires).toBeDefined();
      expect(user.emailVerificationExpires > new Date()).toBe(true);
    });

    test('should generate password reset token', async () => {
      await user.generatePasswordResetToken();

      expect(user.passwordResetToken).toBeDefined();
      expect(user.passwordResetToken.length).toBeGreaterThan(20);
      expect(user.passwordResetExpires).toBeDefined();
      expect(user.passwordResetExpires > new Date()).toBe(true);
    });

    test('should verify email with valid token', async () => {
      await user.generateEmailVerificationToken();
      const token = user.emailVerificationToken;

      const result = await user.verifyEmail(token);

      expect(result).toBe(true);
      expect(user.emailVerified).toBe(true);
      expect(user.emailVerificationToken).toBeNull();
      expect(user.emailVerificationExpires).toBeNull();
    });

    test('should reject email verification with invalid token', async () => {
      await user.generateEmailVerificationToken();

      const result = await user.verifyEmail('invalid-token');

      expect(result).toBe(false);
      expect(user.emailVerified).toBe(false);
    });

    test('should reject email verification with expired token', async () => {
      await user.generateEmailVerificationToken();
      const token = user.emailVerificationToken;
      
      // Manually set expiration to past
      user.emailVerificationExpires = new Date(Date.now() - 1000);
      await user.save();

      const result = await user.verifyEmail(token);

      expect(result).toBe(false);
      expect(user.emailVerified).toBe(false);
    });

    test('should reset password with valid token', async () => {
      await user.generatePasswordResetToken();
      const token = user.passwordResetToken;

      const result = await user.resetPassword(token, 'newpassword123');

      expect(result).toBe(true);
      expect(user.passwordResetToken).toBeNull();
      expect(user.passwordResetExpires).toBeNull();

      // Verify new password works
      const isValid = await user.verifyPassword('newpassword123');
      expect(isValid).toBe(true);
    });

    test('should get full name', () => {
      expect(user.fullName).toBe('John Doe');
    });

    test('should update last login', async () => {
      const beforeLogin = user.lastLogin;
      await user.updateLastLogin();

      expect(user.lastLogin).toBeDefined();
      expect(user.lastLogin).not.toBe(beforeLogin);
    });
  });

  describe('Class Methods', () => {
    test('should find user by email (case insensitive)', async () => {
      await User.create({
        email: 'Test@Example.Com',
        password: 'testpassword123',
        firstName: 'John',
        lastName: 'Doe'
      });

      const user = await User.findByEmail('test@example.com');
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    test('should return null for non-existent email', async () => {
      const user = await User.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });

    test('should find user by verification token', async () => {
      const createdUser = await User.create({
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'John',
        lastName: 'Doe'
      });

      await createdUser.generateEmailVerificationToken();
      const token = createdUser.emailVerificationToken;

      const user = await User.findByVerificationToken(token);
      expect(user).toBeDefined();
      expect(user.id).toBe(createdUser.id);
    });

    test('should find user by password reset token', async () => {
      const createdUser = await User.create({
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'John',
        lastName: 'Doe'
      });

      await createdUser.generatePasswordResetToken();
      const token = createdUser.passwordResetToken;

      const user = await User.findByPasswordResetToken(token);
      expect(user).toBeDefined();
      expect(user.id).toBe(createdUser.id);
    });
  });

  describe('Associations', () => {
    test('should have teams association', async () => {
      const user = await User.create({
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: 'John',
        lastName: 'Doe'
      });

      const teams = await user.getTeams();
      expect(Array.isArray(teams)).toBe(true);
    });
  });

  describe('Data Validation', () => {
    test('should enforce email length limits', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      
      await expect(User.create({
        email: longEmail,
        password: 'testpassword123',
        firstName: 'John',
        lastName: 'Doe'
      })).rejects.toThrow();
    });

    test('should enforce name length limits', async () => {
      const longName = 'a'.repeat(101);
      
      await expect(User.create({
        email: 'test@example.com',
        password: 'testpassword123',
        firstName: longName,
        lastName: 'Doe'
      })).rejects.toThrow();
    });

    test('should convert email to lowercase', async () => {
      const user = await User.create({
        email: 'Test@Example.COM',
        password: 'testpassword123',
        firstName: 'John',
        lastName: 'Doe'
      });

      expect(user.email).toBe('test@example.com');
    });
  });
});
