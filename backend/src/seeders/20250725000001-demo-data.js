'use strict';

const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUsers = await queryInterface.bulkInsert('users', [
      {
        email: 'admin@taskflow.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Create demo team
    const teams = await queryInterface.bulkInsert('teams', [
      {
        name: 'TaskFlow Demo Team',
        slug: 'taskflow-demo',
        description: 'Demo team for TaskFlow development and testing',
        website: 'https://taskflow.com',
        settings: JSON.stringify({
          allowPublicJoin: false,
          defaultMemberRole: 'member',
          requireEmailVerification: true
        }),
        isActive: true,
        createdBy: 1, // Admin user ID
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Add admin as team member
    await queryInterface.bulkInsert('team_members', [
      {
        userId: 1, // Admin user ID
        teamId: 1, // Demo team ID
        role: 'admin',
        status: 'active',
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create some demo users
    const demoPassword = await bcrypt.hash('demo123', 12);
    const demoUsers = await queryInterface.bulkInsert('users', [
      {
        email: 'john.doe@example.com',
        password: demoPassword,
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'jane.smith@example.com',
        password: demoPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        isEmailVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'pending.user@example.com',
        password: demoPassword,
        firstName: 'Pending',
        lastName: 'User',
        isEmailVerified: false,
        emailVerificationToken: crypto.randomBytes(32).toString('hex'),
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { returning: true });

    // Add demo users as team members
    await queryInterface.bulkInsert('team_members', [
      {
        userId: 2, // John Doe
        teamId: 1, // Demo team
        role: 'member',
        status: 'active',
        invitedBy: 1, // Admin
        invitedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        joinedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        userId: 3, // Jane Smith
        teamId: 1, // Demo team
        role: 'member',
        status: 'active',
        invitedBy: 1, // Admin
        invitedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        joinedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create a pending team invitation
    await queryInterface.bulkInsert('team_invitations', [
      {
        email: 'newmember@example.com',
        teamId: 1, // Demo team
        invitedBy: 1, // Admin
        role: 'member',
        status: 'pending',
        token: crypto.randomBytes(32).toString('hex'),
        message: 'Welcome to TaskFlow! We\'d love to have you join our team.',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create some refresh tokens for demo users
    await queryInterface.bulkInsert('refresh_tokens', [
      {
        token: crypto.randomBytes(40).toString('hex'),
        userId: 1, // Admin
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        deviceType: 'web',
        deviceId: 'browser-admin-1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ipAddress: '127.0.0.1',
        usageCount: 5,
        lastUsedAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        token: crypto.randomBytes(40).toString('hex'),
        userId: 2, // John Doe
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        deviceType: 'mobile',
        deviceId: 'iphone-john-123',
        userAgent: 'TaskFlow Mobile App 1.0 (iOS)',
        ipAddress: '192.168.1.100',
        usageCount: 2,
        lastUsedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('refresh_tokens', null, {});
    await queryInterface.bulkDelete('team_invitations', null, {});
    await queryInterface.bulkDelete('team_members', null, {});
    await queryInterface.bulkDelete('teams', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
