const { RefreshToken, User, sequelize } = require('../../src/models');
const { Op } = require('sequelize');
const crypto = require('crypto');

describe('RefreshToken Model', () => {
  let testUser;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    
    testUser = await User.create({
      email: 'user@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Creation', () => {
    test('should create refresh token with valid data', async () => {
      const tokenData = {
        token: crypto.randomBytes(40).toString('hex'),
        userId: testUser.id
      };

      const refreshToken = await RefreshToken.create(tokenData);

      expect(refreshToken.id).toBeDefined();
      expect(refreshToken.token).toBe(tokenData.token);
      expect(refreshToken.userId).toBe(testUser.id);
      expect(refreshToken.isActive).toBe(true);
      expect(refreshToken.expiresAt).toBeDefined();
      expect(refreshToken.createdAt).toBeDefined();
    });

    test('should generate unique token if not provided', async () => {
      const refreshToken = await RefreshToken.create({
        userId: testUser.id
      });

      expect(refreshToken.token).toBeDefined();
      expect(refreshToken.token).toHaveLength(80); // 40 bytes = 80 hex chars
    });

    test('should set default expiration to 7 days', async () => {
      const refreshToken = await RefreshToken.create({
        userId: testUser.id
      });

      const expectedExpiry = new Date();
      expectedExpiry.setDate(expectedExpiry.getDate() + 7);

      const timeDiff = Math.abs(refreshToken.expiresAt - expectedExpiry);
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    test('should default isActive to true', async () => {
      const refreshToken = await RefreshToken.create({
        userId: testUser.id
      });

      expect(refreshToken.isActive).toBe(true);
    });

    test('should require userId', async () => {
      await expect(RefreshToken.create({})).rejects.toThrow();
      
      await expect(RefreshToken.create({
        token: 'some-token'
      })).rejects.toThrow();
    });

    test('should allow custom expiration date', async () => {
      const customExpiry = new Date();
      customExpiry.setDate(customExpiry.getDate() + 30);

      const refreshToken = await RefreshToken.create({
        userId: testUser.id,
        expiresAt: customExpiry
      });

      const timeDiff = Math.abs(refreshToken.expiresAt - customExpiry);
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    test('should store device information', async () => {
      const refreshToken = await RefreshToken.create({
        userId: testUser.id,
        deviceType: 'mobile',
        deviceId: 'device-123',
        userAgent: 'TaskFlow Mobile App 1.0',
        ipAddress: '192.168.1.100'
      });

      expect(refreshToken.deviceType).toBe('mobile');
      expect(refreshToken.deviceId).toBe('device-123');
      expect(refreshToken.userAgent).toBe('TaskFlow Mobile App 1.0');
      expect(refreshToken.ipAddress).toBe('192.168.1.100');
    });

    test('should validate device type', async () => {
      const validDeviceTypes = ['web', 'mobile', 'desktop', 'tablet'];
      
      for (const deviceType of validDeviceTypes) {
        const token = await RefreshToken.create({
          userId: testUser.id,
          deviceType: deviceType
        });
        expect(token.deviceType).toBe(deviceType);
        await token.destroy();
      }

      // Test invalid device type
      await expect(RefreshToken.create({
        userId: testUser.id,
        deviceType: 'invalid-device'
      })).rejects.toThrow();
    });

    test('should enforce unique token constraint', async () => {
      const token = 'unique-token-123';
      
      await RefreshToken.create({
        token: token,
        userId: testUser.id
      });

      const anotherUser = await User.create({
        email: 'another@example.com',
        password: 'testpassword123',
        firstName: 'Another',
        lastName: 'User'
      });

      await expect(RefreshToken.create({
        token: token,
        userId: anotherUser.id
      })).rejects.toThrow();
    });

    test('should track token usage', async () => {
      const refreshToken = await RefreshToken.create({
        userId: testUser.id
      });

      expect(refreshToken.lastUsedAt).toBeNull();
      expect(refreshToken.usageCount).toBe(0);
    });
  });

  describe('Instance Methods', () => {
    let refreshToken;

    beforeEach(async () => {
      refreshToken = await RefreshToken.create({
        userId: testUser.id
      });
    });

    test('should check if token is expired', () => {
      expect(refreshToken.isExpired()).toBe(false);

      // Set expiration to past
      refreshToken.expiresAt = new Date(Date.now() - 1000);
      expect(refreshToken.isExpired()).toBe(true);
    });

    test('should check if token is valid', () => {
      expect(refreshToken.isValid()).toBe(true);

      // Test expired token
      refreshToken.expiresAt = new Date(Date.now() - 1000);
      expect(refreshToken.isValid()).toBe(false);

      // Test inactive token
      refreshToken.expiresAt = new Date(Date.now() + 86400000); // Reset to future
      refreshToken.isActive = false;
      expect(refreshToken.isValid()).toBe(false);
    });

    test('should revoke token', async () => {
      await refreshToken.revoke();

      expect(refreshToken.isActive).toBe(false);
      expect(refreshToken.revokedAt).toBeDefined();
    });

    test('should update last used timestamp', async () => {
      expect(refreshToken.lastUsedAt).toBeNull();
      expect(refreshToken.usageCount).toBe(0);

      await refreshToken.updateLastUsed();

      expect(refreshToken.lastUsedAt).toBeDefined();
      expect(refreshToken.usageCount).toBe(1);

      // Use again
      await refreshToken.updateLastUsed();
      expect(refreshToken.usageCount).toBe(2);
    });

    test('should extend expiration', async () => {
      const originalExpiry = refreshToken.expiresAt;
      
      await refreshToken.extendExpiration(14); // 14 days

      const expectedExpiry = new Date();
      expectedExpiry.setDate(expectedExpiry.getDate() + 14);

      const timeDiff = Math.abs(refreshToken.expiresAt - expectedExpiry);
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
      expect(refreshToken.expiresAt).not.toEqual(originalExpiry);
    });

    test('should regenerate token', async () => {
      const originalToken = refreshToken.token;
      
      await refreshToken.regenerate();

      expect(refreshToken.token).not.toBe(originalToken);
      expect(refreshToken.token).toHaveLength(80);
      expect(refreshToken.isActive).toBe(true);
    });

    test('should get token age in hours', () => {
      const age = refreshToken.getAgeInHours();
      expect(typeof age).toBe('number');
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(1); // Should be less than an hour old
    });

    test('should get hours until expiration', () => {
      const hoursUntilExpiry = refreshToken.getHoursUntilExpiration();
      expect(typeof hoursUntilExpiry).toBe('number');
      expect(hoursUntilExpiry).toBeGreaterThan(167); // Should be close to 168 hours (7 days)
      expect(hoursUntilExpiry).toBeLessThanOrEqual(168);
    });

    test('should get days until expiration', () => {
      const daysUntilExpiry = refreshToken.getDaysUntilExpiration();
      expect(typeof daysUntilExpiry).toBe('number');
      expect(daysUntilExpiry).toBeGreaterThan(6.9); // Should be close to 7 days
      expect(daysUntilExpiry).toBeLessThanOrEqual(7);
    });

    test('should check if token needs renewal', () => {
      expect(refreshToken.needsRenewal()).toBe(false);

      // Set expiration to 1 day from now (should need renewal)
      refreshToken.expiresAt = new Date(Date.now() + 86400000);
      expect(refreshToken.needsRenewal()).toBe(true);

      // Set expiration to 4 days from now (should not need renewal)
      refreshToken.expiresAt = new Date(Date.now() + 86400000 * 4);
      expect(refreshToken.needsRenewal()).toBe(false);
    });

    test('should get device info summary', () => {
      refreshToken.deviceType = 'mobile';
      refreshToken.deviceId = 'device-123';
      refreshToken.userAgent = 'TaskFlow Mobile App 1.0';

      const deviceInfo = refreshToken.getDeviceInfo();

      expect(deviceInfo.type).toBe('mobile');
      expect(deviceInfo.id).toBe('device-123');
      expect(deviceInfo.userAgent).toBe('TaskFlow Mobile App 1.0');
    });
  });

  describe('Class Methods', () => {
    beforeEach(async () => {
      // Create active token
      await RefreshToken.create({
        userId: testUser.id,
        deviceType: 'web'
      });

      // Create expired token
      const expiredToken = await RefreshToken.create({
        userId: testUser.id,
        deviceType: 'mobile'
      });
      expiredToken.expiresAt = new Date(Date.now() - 1000);
      await expiredToken.save();

      // Create revoked token
      const revokedToken = await RefreshToken.create({
        userId: testUser.id,
        deviceType: 'desktop'
      });
      await revokedToken.revoke();
    });

    test('should find token by value', async () => {
      const activeToken = await RefreshToken.findOne({
        where: { deviceType: 'web' }
      });

      const found = await RefreshToken.findByToken(activeToken.token);

      expect(found).toBeDefined();
      expect(found.id).toBe(activeToken.id);
    });

    test('should return null for non-existent token', async () => {
      const found = await RefreshToken.findByToken('non-existent-token');
      expect(found).toBeNull();
    });

    test('should find valid token by value', async () => {
      const activeToken = await RefreshToken.findOne({
        where: { deviceType: 'web' }
      });

      const found = await RefreshToken.findValidByToken(activeToken.token);

      expect(found).toBeDefined();
      expect(found.id).toBe(activeToken.id);
    });

    test('should not find expired token as valid', async () => {
      const expiredToken = await RefreshToken.findOne({
        where: { deviceType: 'mobile' }
      });

      const found = await RefreshToken.findValidByToken(expiredToken.token);
      expect(found).toBeNull();
    });

    test('should not find revoked token as valid', async () => {
      const revokedToken = await RefreshToken.findOne({
        where: { deviceType: 'desktop' }
      });

      const found = await RefreshToken.findValidByToken(revokedToken.token);
      expect(found).toBeNull();
    });

    test('should get user tokens', async () => {
      const tokens = await RefreshToken.getUserTokens(testUser.id);

      expect(tokens).toHaveLength(3); // active, expired, revoked
    });

    test('should get active user tokens', async () => {
      const activeTokens = await RefreshToken.getActiveUserTokens(testUser.id);

      expect(activeTokens).toHaveLength(1);
      expect(activeTokens[0].deviceType).toBe('web');
    });

    test('should revoke user tokens', async () => {
      const revokedCount = await RefreshToken.revokeUserTokens(testUser.id);

      expect(revokedCount).toBeGreaterThan(0);

      const activeTokens = await RefreshToken.getActiveUserTokens(testUser.id);
      expect(activeTokens).toHaveLength(0);
    });

    test('should revoke user tokens by device', async () => {
      // Create another web token
      await RefreshToken.create({
        userId: testUser.id,
        deviceType: 'web'
      });

      const revokedCount = await RefreshToken.revokeUserTokensByDevice(testUser.id, 'web');

      expect(revokedCount).toBe(2); // Both web tokens

      const remainingTokens = await RefreshToken.getActiveUserTokens(testUser.id);
      expect(remainingTokens).toHaveLength(0);
    });

    test('should cleanup expired tokens', async () => {
      const cleanedUp = await RefreshToken.cleanupExpired();

      expect(cleanedUp).toBeGreaterThan(0);

      const expiredTokens = await RefreshToken.findAll({
        where: { 
          expiresAt: { [Op.lt]: new Date() },
          isActive: true
        }
      });
      expect(expiredTokens).toHaveLength(0);
    });

    test('should get tokens needing renewal', async () => {
      // Create token expiring soon
      const soonToExpire = await RefreshToken.create({
        userId: testUser.id,
        expiresAt: new Date(Date.now() + 86400000) // 1 day
      });

      const tokensNeedingRenewal = await RefreshToken.getTokensNeedingRenewal();

      expect(tokensNeedingRenewal.length).toBeGreaterThan(0);
      expect(tokensNeedingRenewal.some(token => token.id === soonToExpire.id)).toBe(true);
    });

    test('should count user active tokens', async () => {
      const count = await RefreshToken.countUserActiveTokens(testUser.id);
      expect(count).toBe(1); // Only the web token is active
    });

    test('should get token statistics for user', async () => {
      const stats = await RefreshToken.getUserTokenStats(testUser.id);

      expect(stats.total).toBe(3);
      expect(stats.active).toBe(1);
      expect(stats.expired).toBe(1);
      expect(stats.revoked).toBe(1);
    });

    test('should create token with device info', async () => {
      const deviceInfo = {
        type: 'mobile',
        id: 'device-456',
        userAgent: 'TaskFlow iOS App 2.0',
        ipAddress: '10.0.0.1'
      };

      const token = await RefreshToken.createWithDeviceInfo(testUser.id, deviceInfo);

      expect(token.deviceType).toBe('mobile');
      expect(token.deviceId).toBe('device-456');
      expect(token.userAgent).toBe('TaskFlow iOS App 2.0');
      expect(token.ipAddress).toBe('10.0.0.1');
    });

    test('should rotate token', async () => {
      const oldToken = await RefreshToken.create({
        userId: testUser.id,
        deviceType: 'web'
      });

      const newToken = await RefreshToken.rotateToken(oldToken.token);

      expect(newToken).toBeDefined();
      expect(newToken.token).not.toBe(oldToken.token);
      expect(newToken.userId).toBe(oldToken.userId);
      expect(newToken.deviceType).toBe(oldToken.deviceType);

      // Old token should be revoked
      await oldToken.reload();
      expect(oldToken.isActive).toBe(false);
    });

    test('should not rotate invalid token', async () => {
      await expect(RefreshToken.rotateToken('invalid-token')).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('Associations', () => {
    test('should have user association', async () => {
      const refreshToken = await RefreshToken.create({
        userId: testUser.id
      });

      const user = await refreshToken.getUser();
      expect(user).toBeDefined();
      expect(user.id).toBe(testUser.id);
    });
  });

  describe('Token Security', () => {
    test('should generate cryptographically secure tokens', async () => {
      const tokens = [];
      
      // Generate multiple tokens and ensure they're all unique
      for (let i = 0; i < 10; i++) {
        const token = await RefreshToken.create({
          userId: testUser.id
        });
        tokens.push(token.token);
      }

      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(10); // All tokens should be unique
    });

    test('should have sufficient token entropy', async () => {
      const token = await RefreshToken.create({
        userId: testUser.id
      });

      // Token should be 80 characters (40 bytes in hex)
      expect(token.token).toHaveLength(80);
      
      // Should contain only hex characters
      expect(/^[a-f0-9]+$/.test(token.token)).toBe(true);
    });
  });
});
