const { TeamMember, User, Team, sequelize } = require('../../src/models');

describe('TeamMember Model', () => {
  let testUser1, testUser2, testTeam;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    
    testUser1 = await User.create({
      email: 'user1@example.com',
      password: 'testpassword123',
      firstName: 'User',
      lastName: 'One'
    });

    testUser2 = await User.create({
      email: 'user2@example.com',
      password: 'testpassword123',
      firstName: 'User',
      lastName: 'Two'
    });

    testTeam = await Team.create({
      name: 'Test Team',
      slug: 'test-team',
      createdBy: testUser1.id
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Creation', () => {
    test('should create team membership with valid data', async () => {
      const membershipData = {
        userId: testUser1.id,
        teamId: testTeam.id,
        role: 'member'
      };

      const membership = await TeamMember.create(membershipData);

      expect(membership.id).toBeDefined();
      expect(membership.userId).toBe(testUser1.id);
      expect(membership.teamId).toBe(testTeam.id);
      expect(membership.role).toBe('member');
      expect(membership.status).toBe('active');
      expect(membership.joinedAt).toBeDefined();
    });

    test('should default to member role', async () => {
      const membershipData = {
        userId: testUser1.id,
        teamId: testTeam.id
      };

      const membership = await TeamMember.create(membershipData);

      expect(membership.role).toBe('member');
    });

    test('should default to active status', async () => {
      const membershipData = {
        userId: testUser1.id,
        teamId: testTeam.id,
        role: 'admin'
      };

      const membership = await TeamMember.create(membershipData);

      expect(membership.status).toBe('active');
    });

    test('should validate role values', async () => {
      const validRoles = ['admin', 'member', 'viewer'];
      
      for (const role of validRoles) {
        const membership = await TeamMember.create({
          userId: testUser1.id,
          teamId: testTeam.id,
          role: role
        });
        expect(membership.role).toBe(role);
        await membership.destroy();
      }

      // Test invalid role
      await expect(TeamMember.create({
        userId: testUser1.id,
        teamId: testTeam.id,
        role: 'invalid-role'
      })).rejects.toThrow();
    });

    test('should validate status values', async () => {
      const validStatuses = ['active', 'inactive', 'suspended'];
      
      for (const status of validStatuses) {
        const membership = await TeamMember.create({
          userId: testUser1.id,
          teamId: testTeam.id,
          role: 'member',
          status: status
        });
        expect(membership.status).toBe(status);
        await membership.destroy();
      }

      // Test invalid status
      await expect(TeamMember.create({
        userId: testUser1.id,
        teamId: testTeam.id,
        role: 'member',
        status: 'invalid-status'
      })).rejects.toThrow();
    });

    test('should enforce unique user-team combination', async () => {
      const membershipData = {
        userId: testUser1.id,
        teamId: testTeam.id,
        role: 'member'
      };

      await TeamMember.create(membershipData);
      
      await expect(TeamMember.create(membershipData)).rejects.toThrow();
    });

    test('should require userId and teamId', async () => {
      await expect(TeamMember.create({})).rejects.toThrow();
      
      await expect(TeamMember.create({
        userId: testUser1.id
      })).rejects.toThrow();
      
      await expect(TeamMember.create({
        teamId: testTeam.id
      })).rejects.toThrow();
    });

    test('should allow invitation tracking fields', async () => {
      const membership = await TeamMember.create({
        userId: testUser1.id,
        teamId: testTeam.id,
        role: 'member',
        invitedBy: testUser2.id,
        invitedAt: new Date()
      });

      expect(membership.invitedBy).toBe(testUser2.id);
      expect(membership.invitedAt).toBeDefined();
    });
  });

  describe('Instance Methods', () => {
    let membership;

    beforeEach(async () => {
      membership = await TeamMember.create({
        userId: testUser1.id,
        teamId: testTeam.id,
        role: 'viewer'
      });
    });

    test('should update role', async () => {
      await membership.updateRole('admin');

      expect(membership.role).toBe('admin');
    });

    test('should validate role when updating', async () => {
      await expect(membership.updateRole('invalid-role')).rejects.toThrow();
    });

    test('should update status', async () => {
      await membership.updateStatus('suspended');

      expect(membership.status).toBe('suspended');
    });

    test('should validate status when updating', async () => {
      await expect(membership.updateStatus('invalid-status')).rejects.toThrow();
    });

    test('should check if user is admin', () => {
      expect(membership.isAdmin()).toBe(false);

      membership.role = 'admin';
      expect(membership.isAdmin()).toBe(true);
    });

    test('should check if user is active', () => {
      expect(membership.isActive()).toBe(true);

      membership.status = 'inactive';
      expect(membership.isActive()).toBe(false);

      membership.status = 'suspended';
      expect(membership.isActive()).toBe(false);
    });

    test('should check if user can manage team', () => {
      expect(membership.canManageTeam()).toBe(false);

      membership.role = 'admin';
      expect(membership.canManageTeam()).toBe(true);

      membership.status = 'suspended';
      expect(membership.canManageTeam()).toBe(false);
    });

    test('should check if user can invite members', () => {
      expect(membership.canInviteMembers()).toBe(false);

      membership.role = 'admin';
      expect(membership.canInviteMembers()).toBe(true);

      membership.role = 'member';
      expect(membership.canInviteMembers()).toBe(true);

      membership.role = 'viewer';
      expect(membership.canInviteMembers()).toBe(false);
    });

    test('should get membership duration', () => {
      const duration = membership.getMembershipDuration();
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Class Methods', () => {
    beforeEach(async () => {
      await TeamMember.create({
        userId: testUser1.id,
        teamId: testTeam.id,
        role: 'admin'
      });

      await TeamMember.create({
        userId: testUser2.id,
        teamId: testTeam.id,
        role: 'member'
      });
    });

    test('should find membership by user and team', async () => {
      const membership = await TeamMember.findByUserAndTeam(testUser1.id, testTeam.id);

      expect(membership).toBeDefined();
      expect(membership.userId).toBe(testUser1.id);
      expect(membership.teamId).toBe(testTeam.id);
    });

    test('should return null for non-existent membership', async () => {
      const nonExistentUser = await User.create({
        email: 'nonexistent@example.com',
        password: 'testpassword123',
        firstName: 'Non',
        lastName: 'Existent'
      });

      const membership = await TeamMember.findByUserAndTeam(nonExistentUser.id, testTeam.id);
      expect(membership).toBeNull();
    });

    test('should get team members by role', async () => {
      const admins = await TeamMember.getTeamMembersByRole(testTeam.id, 'admin');
      const members = await TeamMember.getTeamMembersByRole(testTeam.id, 'member');

      expect(admins).toHaveLength(1);
      expect(members).toHaveLength(1);
      expect(admins[0].userId).toBe(testUser1.id);
      expect(members[0].userId).toBe(testUser2.id);
    });

    test('should get team members by status', async () => {
      // Suspend one member
      const membership = await TeamMember.findByUserAndTeam(testUser2.id, testTeam.id);
      await membership.updateStatus('suspended');

      const activeMembers = await TeamMember.getTeamMembersByStatus(testTeam.id, 'active');
      const suspendedMembers = await TeamMember.getTeamMembersByStatus(testTeam.id, 'suspended');

      expect(activeMembers).toHaveLength(1);
      expect(suspendedMembers).toHaveLength(1);
      expect(activeMembers[0].userId).toBe(testUser1.id);
      expect(suspendedMembers[0].userId).toBe(testUser2.id);
    });

    test('should get user teams', async () => {
      const anotherTeam = await Team.create({
        name: 'Another Team',
        slug: 'another-team',
        createdBy: testUser1.id
      });

      await TeamMember.create({
        userId: testUser1.id,
        teamId: anotherTeam.id,
        role: 'member'
      });

      const userTeams = await TeamMember.getUserTeams(testUser1.id);

      expect(userTeams).toHaveLength(2);
      expect(userTeams.some(m => m.teamId === testTeam.id)).toBe(true);
      expect(userTeams.some(m => m.teamId === anotherTeam.id)).toBe(true);
    });

    test('should count team members', async () => {
      const count = await TeamMember.countTeamMembers(testTeam.id);
      expect(count).toBe(2);
    });

    test('should check if user is team member', async () => {
      const isMember = await TeamMember.isUserTeamMember(testUser1.id, testTeam.id);
      expect(isMember).toBe(true);

      const nonMember = await User.create({
        email: 'nonmember@example.com',
        password: 'testpassword123',
        firstName: 'Non',
        lastName: 'Member'
      });

      const isNotMember = await TeamMember.isUserTeamMember(nonMember.id, testTeam.id);
      expect(isNotMember).toBe(false);
    });

    test('should get user role in team', async () => {
      const role = await TeamMember.getUserRoleInTeam(testUser1.id, testTeam.id);
      expect(role).toBe('admin');

      const memberRole = await TeamMember.getUserRoleInTeam(testUser2.id, testTeam.id);
      expect(memberRole).toBe('member');

      const nonMember = await User.create({
        email: 'nonmember@example.com',
        password: 'testpassword123',
        firstName: 'Non',
        lastName: 'Member'
      });

      const noRole = await TeamMember.getUserRoleInTeam(nonMember.id, testTeam.id);
      expect(noRole).toBeNull();
    });
  });

  describe('Associations', () => {
    test('should have user association', async () => {
      const membership = await TeamMember.create({
        userId: testUser1.id,
        teamId: testTeam.id,
        role: 'member'
      });

      const user = await membership.getUser();
      expect(user).toBeDefined();
      expect(user.id).toBe(testUser1.id);
    });

    test('should have team association', async () => {
      const membership = await TeamMember.create({
        userId: testUser1.id,
        teamId: testTeam.id,
        role: 'member'
      });

      const team = await membership.getTeam();
      expect(team).toBeDefined();
      expect(team.id).toBe(testTeam.id);
    });

    test('should have inviter association', async () => {
      const membership = await TeamMember.create({
        userId: testUser1.id,
        teamId: testTeam.id,
        role: 'member',
        invitedBy: testUser2.id
      });

      const inviter = await membership.getInviter();
      expect(inviter).toBeDefined();
      expect(inviter.id).toBe(testUser2.id);
    });
  });
});
