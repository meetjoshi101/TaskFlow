const { Team, User, TeamMember, sequelize } = require('../../src/models');

describe('Team Model', () => {
  let testUser;

  beforeEach(async () => {
    await sequelize.sync({ force: true });
    
    testUser = await User.create({
      email: 'creator@example.com',
      password: 'testpassword123',
      firstName: 'Team',
      lastName: 'Creator'
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Model Creation', () => {
    test('should create a team with valid data', async () => {
      const teamData = {
        name: 'Test Team',
        slug: 'test-team',
        description: 'A test team for development',
        createdBy: testUser.id
      };

      const team = await Team.create(teamData);

      expect(team.id).toBeDefined();
      expect(team.name).toBe('Test Team');
      expect(team.slug).toBe('test-team');
      expect(team.description).toBe('A test team for development');
      expect(team.createdBy).toBe(testUser.id);
      expect(team.settings).toEqual({});
      expect(team.createdAt).toBeDefined();
      expect(team.updatedAt).toBeDefined();
    });

    test('should auto-generate slug from name if not provided', async () => {
      const teamData = {
        name: 'My Awesome Team',
        createdBy: testUser.id
      };

      const team = await Team.create(teamData);

      expect(team.slug).toBe('my-awesome-team');
    });

    test('should require unique slug', async () => {
      const teamData = {
        name: 'Test Team',
        slug: 'test-team',
        createdBy: testUser.id
      };

      await Team.create(teamData);
      
      await expect(Team.create({
        ...teamData,
        name: 'Another Team'
      })).rejects.toThrow();
    });

    test('should validate slug format', async () => {
      const invalidSlugs = [
        'Test Team',  // spaces
        'test_team_',  // trailing underscore
        'te',  // too short
        'test@team',  // special characters
        'TEST-TEAM',  // uppercase
        '-test-team',  // leading dash
        'test-team-'  // trailing dash
      ];

      for (const slug of invalidSlugs) {
        await expect(Team.create({
          name: 'Test Team',
          slug: slug,
          createdBy: testUser.id
        })).rejects.toThrow();
      }
    });

    test('should allow valid slug formats', async () => {
      const validSlugs = [
        'test-team',
        'test123',
        'team2024',
        'my-dev-team-1'
      ];

      for (let i = 0; i < validSlugs.length; i++) {
        const team = await Team.create({
          name: `Test Team ${i}`,
          slug: validSlugs[i],
          createdBy: testUser.id
        });
        expect(team.slug).toBe(validSlugs[i]);
      }
    });

    test('should require mandatory fields', async () => {
      await expect(Team.create({})).rejects.toThrow();
      
      await expect(Team.create({
        name: 'Test Team'
      })).rejects.toThrow();
    });

    test('should enforce name length limits', async () => {
      const longName = 'a'.repeat(256);
      
      await expect(Team.create({
        name: longName,
        createdBy: testUser.id
      })).rejects.toThrow();
    });
  });

  describe('Instance Methods', () => {
    let team;

    beforeEach(async () => {
      team = await Team.create({
        name: 'Test Team',
        slug: 'test-team',
        description: 'A test team',
        createdBy: testUser.id
      });
    });

    test('should add member with role', async () => {
      const newUser = await User.create({
        email: 'member@example.com',
        password: 'testpassword123',
        firstName: 'Team',
        lastName: 'Member'
      });

      const membership = await team.addMember(newUser.id, 'member');

      expect(membership.userId).toBe(newUser.id);
      expect(membership.teamId).toBe(team.id);
      expect(membership.role).toBe('member');
      expect(membership.status).toBe('active');
    });

    test('should add member with admin role', async () => {
      const newUser = await User.create({
        email: 'admin@example.com',
        password: 'testpassword123',
        firstName: 'Team',
        lastName: 'Admin'
      });

      const membership = await team.addMember(newUser.id, 'admin');

      expect(membership.role).toBe('admin');
    });

    test('should not allow duplicate memberships', async () => {
      const newUser = await User.create({
        email: 'member@example.com',
        password: 'testpassword123',
        firstName: 'Team',
        lastName: 'Member'
      });

      await team.addMember(newUser.id, 'member');
      
      await expect(team.addMember(newUser.id, 'member')).rejects.toThrow();
    });

    test('should remove member', async () => {
      const newUser = await User.create({
        email: 'member@example.com',
        password: 'testpassword123',
        firstName: 'Team',
        lastName: 'Member'
      });

      await team.addMember(newUser.id, 'member');
      const result = await team.removeMember(newUser.id);

      expect(result).toBe(true);

      const membership = await TeamMember.findOne({
        where: { userId: newUser.id, teamId: team.id }
      });
      expect(membership).toBeNull();
    });

    test('should update member role', async () => {
      const newUser = await User.create({
        email: 'member@example.com',
        password: 'testpassword123',
        firstName: 'Team',
        lastName: 'Member'
      });

      await team.addMember(newUser.id, 'member');
      const updatedMembership = await team.updateMemberRole(newUser.id, 'admin');

      expect(updatedMembership.role).toBe('admin');
    });

    test('should get members with roles', async () => {
      const member1 = await User.create({
        email: 'member1@example.com',
        password: 'testpassword123',
        firstName: 'Member',
        lastName: 'One'
      });

      const member2 = await User.create({
        email: 'member2@example.com',
        password: 'testpassword123',
        firstName: 'Member',
        lastName: 'Two'
      });

      await team.addMember(member1.id, 'admin');
      await team.addMember(member2.id, 'member');

      const members = await team.getMembers();

      expect(members).toHaveLength(2);
      expect(members.find(m => m.userId === member1.id).role).toBe('admin');
      expect(members.find(m => m.userId === member2.id).role).toBe('member');
    });

    test('should get members by role', async () => {
      const admin = await User.create({
        email: 'admin@example.com',
        password: 'testpassword123',
        firstName: 'Admin',
        lastName: 'User'
      });

      const member = await User.create({
        email: 'member@example.com',
        password: 'testpassword123',
        firstName: 'Member',
        lastName: 'User'
      });

      await team.addMember(admin.id, 'admin');
      await team.addMember(member.id, 'member');

      const admins = await team.getMembersByRole('admin');
      const members = await team.getMembersByRole('member');

      expect(admins).toHaveLength(1);
      expect(members).toHaveLength(1);
      expect(admins[0].userId).toBe(admin.id);
      expect(members[0].userId).toBe(member.id);
    });

    test('should count members', async () => {
      const member1 = await User.create({
        email: 'member1@example.com',
        password: 'testpassword123',
        firstName: 'Member',
        lastName: 'One'
      });

      const member2 = await User.create({
        email: 'member2@example.com',
        password: 'testpassword123',
        firstName: 'Member',
        lastName: 'Two'
      });

      await team.addMember(member1.id, 'member');
      await team.addMember(member2.id, 'member');

      const count = await team.getMemberCount();
      expect(count).toBe(2);
    });

    test('should update settings', async () => {
      const newSettings = {
        notifications: true,
        theme: 'dark',
        timezone: 'UTC'
      };

      await team.updateSettings(newSettings);

      expect(team.settings).toEqual(newSettings);
    });
  });

  describe('Class Methods', () => {
    test('should find team by slug', async () => {
      const team = await Team.create({
        name: 'Test Team',
        slug: 'test-team',
        createdBy: testUser.id
      });

      const foundTeam = await Team.findBySlug('test-team');
      expect(foundTeam).toBeDefined();
      expect(foundTeam.id).toBe(team.id);
    });

    test('should return null for non-existent slug', async () => {
      const team = await Team.findBySlug('non-existent-team');
      expect(team).toBeNull();
    });

    test('should generate unique slug', async () => {
      // Create team with existing slug
      await Team.create({
        name: 'Test Team',
        slug: 'test-team',
        createdBy: testUser.id
      });

      const slug1 = await Team.generateUniqueSlug('Test Team');
      const slug2 = await Team.generateUniqueSlug('Test Team');

      expect(slug1).toBe('test-team-1');
      expect(slug2).toBe('test-team-2');
    });

    test('should create team with owner', async () => {
      const teamData = {
        name: 'New Team',
        description: 'A new team'
      };

      const team = await Team.createWithOwner(teamData, testUser.id);

      expect(team.name).toBe('New Team');
      expect(team.slug).toBe('new-team');
      expect(team.createdBy).toBe(testUser.id);

      // Check that creator is added as admin
      const membership = await TeamMember.findOne({
        where: { userId: testUser.id, teamId: team.id }
      });

      expect(membership).toBeDefined();
      expect(membership.role).toBe('admin');
      expect(membership.status).toBe('active');
    });
  });

  describe('Associations', () => {
    test('should have users association through TeamMember', async () => {
      const team = await Team.create({
        name: 'Test Team',
        slug: 'test-team',
        createdBy: testUser.id
      });

      const users = await team.getUsers();
      expect(Array.isArray(users)).toBe(true);
    });

    test('should have creator association', async () => {
      const team = await Team.create({
        name: 'Test Team',
        slug: 'test-team',
        createdBy: testUser.id
      });

      const creator = await team.getCreator();
      expect(creator).toBeDefined();
      expect(creator.id).toBe(testUser.id);
    });
  });

  describe('Slug Generation', () => {
    test('should handle special characters in name', async () => {
      const team = await Team.create({
        name: 'My Awesome Team! @#$%',
        createdBy: testUser.id
      });

      expect(team.slug).toBe('my-awesome-team');
    });

    test('should handle very long names', async () => {
      const longName = 'This is a very long team name that should be truncated properly';
      const team = await Team.create({
        name: longName,
        createdBy: testUser.id
      });

      expect(team.slug.length).toBeLessThanOrEqual(100);
      expect(team.slug).toMatch(/^[a-z0-9-]+$/);
    });

    test('should handle names with numbers', async () => {
      const team = await Team.create({
        name: 'Team 2024 Version 1.0',
        createdBy: testUser.id
      });

      expect(team.slug).toBe('team-2024-version-1-0');
    });
  });
});
