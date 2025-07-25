const { TeamInvitation, User, Team, sequelize } = require('../../src/models');
const crypto = require('crypto');

describe('TeamInvitation Model', () => {
  let testUser, testTeam, inviter;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    
    testUser = await User.create({
      email: 'user@example.com',
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User'
    });

    inviter = await User.create({
      email: 'inviter@example.com',
      password: 'testpassword123',
      firstName: 'Inviter',
      lastName: 'User'
    });

    testTeam = await Team.create({
      name: 'Test Team',
      slug: 'test-team',
      createdBy: inviter.id
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Creation', () => {
    test('should create invitation with valid data', async () => {
      const invitationData = {
        email: 'newuser@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      };

      const invitation = await TeamInvitation.create(invitationData);

      expect(invitation.id).toBeDefined();
      expect(invitation.email).toBe('newuser@example.com');
      expect(invitation.teamId).toBe(testTeam.id);
      expect(invitation.invitedBy).toBe(inviter.id);
      expect(invitation.role).toBe('member');
      expect(invitation.status).toBe('pending');
      expect(invitation.token).toBeDefined();
      expect(invitation.token).toHaveLength(64);
      expect(invitation.expiresAt).toBeDefined();
      expect(invitation.sentAt).toBeDefined();
    });

    test('should normalize email to lowercase', async () => {
      const invitation = await TeamInvitation.create({
        email: 'NewUser@EXAMPLE.COM',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      });

      expect(invitation.email).toBe('newuser@example.com');
    });

    test('should generate unique token', async () => {
      const invitation1 = await TeamInvitation.create({
        email: 'user1@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      });

      const invitation2 = await TeamInvitation.create({
        email: 'user2@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      });

      expect(invitation1.token).not.toBe(invitation2.token);
      expect(invitation1.token).toHaveLength(64);
      expect(invitation2.token).toHaveLength(64);
    });

    test('should set default expiration to 7 days', async () => {
      const invitation = await TeamInvitation.create({
        email: 'newuser@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      });

      const expectedExpiry = new Date();
      expectedExpiry.setDate(expectedExpiry.getDate() + 7);

      const timeDiff = Math.abs(invitation.expiresAt - expectedExpiry);
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    test('should default to member role', async () => {
      const invitation = await TeamInvitation.create({
        email: 'newuser@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id
      });

      expect(invitation.role).toBe('member');
    });

    test('should default to pending status', async () => {
      const invitation = await TeamInvitation.create({
        email: 'newuser@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'admin'
      });

      expect(invitation.status).toBe('pending');
    });

    test('should validate role values', async () => {
      const validRoles = ['admin', 'member', 'viewer'];
      
      for (const role of validRoles) {
        const invitation = await TeamInvitation.create({
          email: `user-${role}@example.com`,
          teamId: testTeam.id,
          invitedBy: inviter.id,
          role: role
        });
        expect(invitation.role).toBe(role);
      }

      // Test invalid role
      await expect(TeamInvitation.create({
        email: 'invalid@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'invalid-role'
      })).rejects.toThrow();
    });

    test('should validate status values', async () => {
      const validStatuses = ['pending', 'accepted', 'declined', 'expired', 'cancelled'];
      
      for (const status of validStatuses) {
        const invitation = await TeamInvitation.create({
          email: `user-${status}@example.com`,
          teamId: testTeam.id,
          invitedBy: inviter.id,
          role: 'member',
          status: status
        });
        expect(invitation.status).toBe(status);
      }

      // Test invalid status
      await expect(TeamInvitation.create({
        email: 'invalid@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member',
        status: 'invalid-status'
      })).rejects.toThrow();
    });

    test('should validate email format', async () => {
      const invalidEmails = ['not-an-email', 'missing@', '@missing.com', 'spaces @domain.com'];
      
      for (const email of invalidEmails) {
        await expect(TeamInvitation.create({
          email: email,
          teamId: testTeam.id,
          invitedBy: inviter.id,
          role: 'member'
        })).rejects.toThrow();
      }
    });

    test('should require email, teamId, and invitedBy', async () => {
      await expect(TeamInvitation.create({})).rejects.toThrow();
      
      await expect(TeamInvitation.create({
        email: 'test@example.com'
      })).rejects.toThrow();
      
      await expect(TeamInvitation.create({
        email: 'test@example.com',
        teamId: testTeam.id
      })).rejects.toThrow();
    });

    test('should allow message field', async () => {
      const invitation = await TeamInvitation.create({
        email: 'newuser@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member',
        message: 'Welcome to our team!'
      });

      expect(invitation.message).toBe('Welcome to our team!');
    });

    test('should enforce unique email-team combination for pending invitations', async () => {
      await TeamInvitation.create({
        email: 'duplicate@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      });

      await expect(TeamInvitation.create({
        email: 'duplicate@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      })).rejects.toThrow();
    });

    test('should allow new invitation after previous was accepted', async () => {
      const invitation1 = await TeamInvitation.create({
        email: 'user@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      });

      await invitation1.update({ status: 'accepted' });

      // Should be able to create new invitation
      const invitation2 = await TeamInvitation.create({
        email: 'user@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'admin'
      });

      expect(invitation2).toBeDefined();
    });
  });

  describe('Instance Methods', () => {
    let invitation;

    beforeEach(async () => {
      invitation = await TeamInvitation.create({
        email: 'test@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      });
    });

    test('should check if invitation is expired', () => {
      expect(invitation.isExpired()).toBe(false);

      // Set expiration to past
      invitation.expiresAt = new Date(Date.now() - 1000);
      expect(invitation.isExpired()).toBe(true);
    });

    test('should check if invitation is pending', () => {
      expect(invitation.isPending()).toBe(true);

      invitation.status = 'accepted';
      expect(invitation.isPending()).toBe(false);

      invitation.status = 'declined';
      expect(invitation.isPending()).toBe(false);
    });

    test('should check if invitation is valid', () => {
      expect(invitation.isValid()).toBe(true);

      invitation.status = 'accepted';
      expect(invitation.isValid()).toBe(false);

      invitation.status = 'pending';
      invitation.expiresAt = new Date(Date.now() - 1000);
      expect(invitation.isValid()).toBe(false);
    });

    test('should accept invitation', async () => {
      await invitation.accept();

      expect(invitation.status).toBe('accepted');
      expect(invitation.acceptedAt).toBeDefined();
    });

    test('should decline invitation', async () => {
      await invitation.decline();

      expect(invitation.status).toBe('declined');
      expect(invitation.declinedAt).toBeDefined();
    });

    test('should cancel invitation', async () => {
      await invitation.cancel();

      expect(invitation.status).toBe('cancelled');
      expect(invitation.cancelledAt).toBeDefined();
    });

    test('should expire invitation', async () => {
      await invitation.expire();

      expect(invitation.status).toBe('expired');
    });

    test('should not accept expired invitation', async () => {
      invitation.expiresAt = new Date(Date.now() - 1000);
      
      await expect(invitation.accept()).rejects.toThrow('Invitation has expired');
    });

    test('should not accept non-pending invitation', async () => {
      invitation.status = 'declined';
      
      await expect(invitation.accept()).rejects.toThrow('Invitation is not pending');
    });

    test('should regenerate token', async () => {
      const originalToken = invitation.token;
      
      await invitation.regenerateToken();

      expect(invitation.token).not.toBe(originalToken);
      expect(invitation.token).toHaveLength(64);
    });

    test('should extend expiration', async () => {
      const originalExpiry = invitation.expiresAt;
      
      await invitation.extendExpiration(3); // 3 days

      const expectedExpiry = new Date(originalExpiry);
      expectedExpiry.setDate(expectedExpiry.getDate() + 3);

      const timeDiff = Math.abs(invitation.expiresAt - expectedExpiry);
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });

    test('should resend invitation', async () => {
      const originalSentAt = invitation.sentAt;
      const originalToken = invitation.token;

      // Wait a moment to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      await invitation.resend();

      expect(invitation.sentAt).not.toEqual(originalSentAt);
      expect(invitation.token).not.toBe(originalToken);
      expect(invitation.status).toBe('pending');
    });

    test('should get invitation age in days', () => {
      const age = invitation.getAgeInDays();
      expect(typeof age).toBe('number');
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(1); // Should be less than a day old
    });

    test('should get days until expiration', () => {
      const daysUntilExpiry = invitation.getDaysUntilExpiration();
      expect(typeof daysUntilExpiry).toBe('number');
      expect(daysUntilExpiry).toBeGreaterThan(6); // Should be close to 7 days
      expect(daysUntilExpiry).toBeLessThanOrEqual(7);
    });
  });

  describe('Class Methods', () => {
    beforeEach(async () => {
      await TeamInvitation.create({
        email: 'pending@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      });

      const expired = await TeamInvitation.create({
        email: 'expired@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      });
      expired.expiresAt = new Date(Date.now() - 1000);
      await expired.save();

      const accepted = await TeamInvitation.create({
        email: 'accepted@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member',
        status: 'accepted'
      });
    });

    test('should find invitation by token', async () => {
      const pendingInvitation = await TeamInvitation.findOne({
        where: { email: 'pending@example.com' }
      });

      const found = await TeamInvitation.findByToken(pendingInvitation.token);

      expect(found).toBeDefined();
      expect(found.id).toBe(pendingInvitation.id);
    });

    test('should return null for invalid token', async () => {
      const found = await TeamInvitation.findByToken('invalid-token');
      expect(found).toBeNull();
    });

    test('should find valid invitation by token', async () => {
      const pendingInvitation = await TeamInvitation.findOne({
        where: { email: 'pending@example.com' }
      });

      const found = await TeamInvitation.findValidByToken(pendingInvitation.token);

      expect(found).toBeDefined();
      expect(found.id).toBe(pendingInvitation.id);
    });

    test('should not find expired invitation as valid', async () => {
      const expiredInvitation = await TeamInvitation.findOne({
        where: { email: 'expired@example.com' }
      });

      const found = await TeamInvitation.findValidByToken(expiredInvitation.token);
      expect(found).toBeNull();
    });

    test('should get pending invitations for team', async () => {
      const pending = await TeamInvitation.getPendingInvitations(testTeam.id);

      expect(pending).toHaveLength(1);
      expect(pending[0].email).toBe('pending@example.com');
    });

    test('should get invitations by email', async () => {
      const invitations = await TeamInvitation.getInvitationsByEmail('pending@example.com');

      expect(invitations).toHaveLength(1);
      expect(invitations[0].email).toBe('pending@example.com');
    });

    test('should get invitations by user', async () => {
      const invitations = await TeamInvitation.getInvitationsByUser(inviter.id);

      expect(invitations).toHaveLength(3); // pending, expired, accepted
    });

    test('should cleanup expired invitations', async () => {
      const cleanedUp = await TeamInvitation.cleanupExpired();

      expect(cleanedUp).toBeGreaterThan(0);

      const remaining = await TeamInvitation.findAll({
        where: { status: 'expired' }
      });
      expect(remaining).toHaveLength(0);
    });

    test('should check if email is already invited', async () => {
      const isInvited = await TeamInvitation.isEmailAlreadyInvited('pending@example.com', testTeam.id);
      expect(isInvited).toBe(true);

      const notInvited = await TeamInvitation.isEmailAlreadyInvited('notinvited@example.com', testTeam.id);
      expect(notInvited).toBe(false);

      // Accepted invitations should not count as "already invited"
      const acceptedNotInvited = await TeamInvitation.isEmailAlreadyInvited('accepted@example.com', testTeam.id);
      expect(acceptedNotInvited).toBe(false);
    });

    test('should count pending invitations for team', async () => {
      const count = await TeamInvitation.countPendingInvitations(testTeam.id);
      expect(count).toBe(1);
    });

    test('should get invitation statistics', async () => {
      const stats = await TeamInvitation.getInvitationStats(testTeam.id);

      expect(stats.total).toBe(3);
      expect(stats.pending).toBe(1);
      expect(stats.accepted).toBe(1);
      expect(stats.expired).toBe(1);
      expect(stats.declined).toBe(0);
      expect(stats.cancelled).toBe(0);
    });
  });

  describe('Associations', () => {
    test('should have team association', async () => {
      const invitation = await TeamInvitation.create({
        email: 'test@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      });

      const team = await invitation.getTeam();
      expect(team).toBeDefined();
      expect(team.id).toBe(testTeam.id);
    });

    test('should have inviter association', async () => {
      const invitation = await TeamInvitation.create({
        email: 'test@example.com',
        teamId: testTeam.id,
        invitedBy: inviter.id,
        role: 'member'
      });

      const inviterUser = await invitation.getInviter();
      expect(inviterUser).toBeDefined();
      expect(inviterUser.id).toBe(inviter.id);
    });
  });
});
