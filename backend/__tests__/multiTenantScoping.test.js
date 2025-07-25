const { sequelize, User, Team, TeamMember, TeamInvitation } = require('../src/models');
const TenantScoping = require('../src/middleware/tenantScoping');
const TeamIsolation = require('../src/utils/teamIsolation');

describe('Multi-Tenant Query Scoping', () => {
  let tenantScoping;
  let testUser1, testUser2;
  let testTeam1, testTeam2;
  let testMember1, testMember2;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    
    // Initialize tenant scoping
    tenantScoping = new TenantScoping({
      User,
      Team,
      TeamMember,
      TeamInvitation
    });
    tenantScoping.initializeScoping();
  });

  beforeEach(async () => {
    // Create test users
    testUser1 = await User.create({
      email: 'user1@example.com',
      password: 'hashedpassword1',
      firstName: 'User',
      lastName: 'One',
      emailVerified: true
    });

    testUser2 = await User.create({
      email: 'user2@example.com',
      password: 'hashedpassword2',
      firstName: 'User',
      lastName: 'Two',
      emailVerified: true
    });

    // Create test teams
    testTeam1 = await Team.create({
      name: 'Team One',
      slug: 'team-one',
      createdBy: testUser1.id
    });

    testTeam2 = await Team.create({
      name: 'Team Two',
      slug: 'team-two',
      createdBy: testUser2.id
    });

    // Create team memberships
    testMember1 = await TeamMember.create({
      userId: testUser1.id,
      teamId: testTeam1.id,
      role: 'admin',
      status: 'active'
    });

    testMember2 = await TeamMember.create({
      userId: testUser2.id,
      teamId: testTeam2.id,
      role: 'admin',
      status: 'active'
    });
  });

  afterEach(async () => {
    await TeamMember.destroy({ where: {}, force: true });
    await TeamInvitation.destroy({ where: {}, force: true });
    await Team.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('TenantScoping Class', () => {
    describe('Context Management', () => {
      it('should set and get tenant context correctly', () => {
        tenantScoping.setTenantContext(testTeam1.id, testUser1.id);
        const context = tenantScoping.getTenantContext();
        
        expect(context).toEqual({
          teamId: testTeam1.id,
          userId: testUser1.id
        });
      });

      it('should clear tenant context', () => {
        tenantScoping.setTenantContext(testTeam1.id, testUser1.id);
        tenantScoping.clearTenantContext();
        
        const context = tenantScoping.getTenantContext();
        expect(context).toBeNull();
      });
    });

    describe('Team Access Validation', () => {
      it('should validate successful team access', async () => {
        const membership = await tenantScoping.validateTeamAccess(testTeam1.id, testUser1.id);
        
        expect(membership).toBeDefined();
        expect(membership.userId).toBe(testUser1.id);
        expect(membership.teamId).toBe(testTeam1.id);
        expect(membership.status).toBe('active');
      });

      it('should reject access to team user is not member of', async () => {
        await expect(
          tenantScoping.validateTeamAccess(testTeam2.id, testUser1.id)
        ).rejects.toThrow('Access denied - user is not a member of this team');
      });

      it('should reject access when user context is missing', async () => {
        await expect(
          tenantScoping.validateTeamAccess(testTeam1.id, null)
        ).rejects.toThrow('User context not available for team access validation');
      });
    });

    describe('Team Scoped Queries', () => {
      it('should create team-scoped query correctly', () => {
        tenantScoping.setTenantContext(testTeam1.id, testUser1.id);
        
        const query = tenantScoping.createTeamScopedQuery({ status: 'active' });
        
        expect(query).toEqual({
          status: 'active',
          teamId: testTeam1.id
        });
      });

      it('should throw error when creating query without context', () => {
        tenantScoping.clearTenantContext();
        
        expect(() => {
          tenantScoping.createTeamScopedQuery();
        }).toThrow('Team context not set - unauthorized access attempt');
      });
    });

    describe('User Teams', () => {
      beforeEach(async () => {
        // Add user1 to team2 as a member
        await TeamMember.create({
          userId: testUser1.id,
          teamId: testTeam2.id,
          role: 'member',
          status: 'active'
        });
      });

      it('should get all user teams', async () => {
        const teams = await tenantScoping.getUserTeams(testUser1.id);
        
        expect(teams).toHaveLength(2);
        expect(teams.map(t => t.id)).toContain(testTeam1.id);
        expect(teams.map(t => t.id)).toContain(testTeam2.id);
      });

      it('should switch team context successfully', async () => {
        const result = await tenantScoping.switchTeamContext(testTeam2.id, testUser1.id);
        
        expect(result.teamId).toBe(testTeam2.id);
        expect(result.userId).toBe(testUser1.id);
        
        const context = tenantScoping.getTenantContext();
        expect(context.teamId).toBe(testTeam2.id);
      });
    });

    describe('Express Middleware', () => {
      it('should create middleware that sets context from request', () => {
        const middleware = tenantScoping.createExpressMiddleware();
        
        expect(typeof middleware).toBe('function');
        expect(middleware.length).toBe(3); // req, res, next
      });

      it('should add helper methods to request object', (done) => {
        const middleware = tenantScoping.createExpressMiddleware();
        
        const mockReq = {
          user: {
            id: testUser1.id,
            currentTeamId: testTeam1.id
          }
        };
        const mockRes = {};
        const mockNext = () => {
          expect(mockReq.tenantScoping).toBeDefined();
          expect(mockReq.tenantScoping.setContext).toBeInstanceOf(Function);
          expect(mockReq.tenantScoping.getContext).toBeInstanceOf(Function);
          expect(mockReq.tenantScoping.validateAccess).toBeInstanceOf(Function);
          expect(mockReq.tenantScoping.switchTeam).toBeInstanceOf(Function);
          expect(mockReq.tenantScoping.createQuery).toBeInstanceOf(Function);
          done();
        };
        
        middleware(mockReq, mockRes, mockNext);
      });
    });
  });

  describe('TeamIsolation Utilities', () => {
    describe('Team Scope Creation', () => {
      it('should create team scope with additional where clause', () => {
        const scope = TeamIsolation.createTeamScope(testTeam1.id, { status: 'active' });
        
        expect(scope).toEqual({
          teamId: testTeam1.id,
          status: 'active'
        });
      });

      it('should throw error when team ID is missing', () => {
        expect(() => {
          TeamIsolation.createTeamScope(null);
        }).toThrow('Team ID is required for team-scoped queries');
      });
    });

    describe('Team Scoped Includes', () => {
      it('should create team-scoped include for associations', () => {
        const include = TeamIsolation.createTeamScopedInclude(
          User, 
          testTeam1.id, 
          'user', 
          { status: 'active' }
        );
        
        expect(include).toEqual({
          model: User,
          as: 'user',
          where: {
            teamId: testTeam1.id,
            status: 'active'
          }
        });
      });
    });

    describe('Team Ownership Validation', () => {
      it('should validate team member ownership', async () => {
        const resource = await TeamIsolation.validateTeamOwnership(
          { TeamMember },
          'teamMember',
          testMember1.id,
          testTeam1.id
        );
        
        expect(resource).toBeDefined();
        expect(resource.id).toBe(testMember1.id);
      });

      it('should reject invalid resource access', async () => {
        await expect(
          TeamIsolation.validateTeamOwnership(
            { TeamMember },
            'teamMember',
            testMember1.id,
            testTeam2.id
          )
        ).rejects.toThrow('Resource not found or access denied');
      });

      it('should throw error for unknown resource type', async () => {
        await expect(
          TeamIsolation.validateTeamOwnership(
            {},
            'unknownResource',
            123,
            testTeam1.id
          )
        ).rejects.toThrow('Unknown resource type: unknownResource');
      });
    });

    describe('Query Builder', () => {
      beforeEach(async () => {
        // Create team invitation for testing
        await TeamInvitation.create({
          email: 'invite@example.com',
          teamId: testTeam1.id,
          role: 'member',
          invitedBy: testUser1.id
        });
      });

      it('should build team member query correctly', async () => {
        const queryBuilder = TeamIsolation.createTeamQueryBuilder(
          { TeamMember, User },
          testTeam1.id
        );
        
        const members = await queryBuilder.getTeamMembers();
        
        expect(members).toHaveLength(1);
        expect(members[0].teamId).toBe(testTeam1.id);
      });

      it('should build team invitations query correctly', async () => {
        const queryBuilder = TeamIsolation.createTeamQueryBuilder(
          { TeamInvitation, User },
          testTeam1.id
        );
        
        const invitations = await queryBuilder.getTeamInvitations();
        
        expect(invitations).toHaveLength(1);
        expect(invitations[0].teamId).toBe(testTeam1.id);
      });
    });

    describe('Bulk Operations', () => {
      it('should update team members in bulk', async () => {
        const bulkOps = TeamIsolation.createTeamBulkOperations(
          { TeamMember },
          testTeam1.id
        );
        
        const [affectedCount] = await bulkOps.updateTeamMembers(
          [testMember1.id],
          { status: 'inactive' }
        );
        
        expect(affectedCount).toBe(1);
        
        const updatedMember = await TeamMember.findByPk(testMember1.id);
        expect(updatedMember.status).toBe('inactive');
      });

      it('should get team resource counts', async () => {
        const bulkOps = TeamIsolation.createTeamBulkOperations(
          { TeamMember, TeamInvitation },
          testTeam1.id
        );
        
        const counts = await bulkOps.getTeamResourceCounts();
        
        expect(counts.members).toBe(1);
        expect(counts.pendingInvitations).toBe(0);
      });
    });
  });

  describe('Model Integration', () => {
    describe('Team Model Extensions', () => {
      it('should validate user access to team', async () => {
        const hasAccess = await testTeam1.validateUserAccess(testUser1.id);
        expect(hasAccess).toBe(true);
        
        const noAccess = await testTeam1.validateUserAccess(testUser2.id);
        expect(noAccess).toBe(false);
      });

      it('should get user role in team', async () => {
        const role = await testTeam1.getUserRole(testUser1.id);
        expect(role).toBe('admin');
        
        const noRole = await testTeam1.getUserRole(testUser2.id);
        expect(noRole).toBeNull();
      });

      it('should check if user is admin', async () => {
        const isAdmin = await testTeam1.isUserAdmin(testUser1.id);
        expect(isAdmin).toBe(true);
        
        const notAdmin = await testTeam1.isUserAdmin(testUser2.id);
        expect(notAdmin).toBe(false);
      });
    });

    describe('User Model Extensions', () => {
      it('should get user active teams', async () => {
        const teams = await testUser1.getActiveTeams();
        
        expect(teams).toHaveLength(1);
        expect(teams[0].id).toBe(testTeam1.id);
      });

      it('should check team access', async () => {
        const hasAccess = await testUser1.hasTeamAccess(testTeam1.id);
        expect(hasAccess).toBe(true);
        
        const noAccess = await testUser1.hasTeamAccess(testTeam2.id);
        expect(noAccess).toBe(false);
      });

      it('should get team role', async () => {
        const role = await testUser1.getTeamRole(testTeam1.id);
        expect(role).toBe('admin');
        
        const noRole = await testUser1.getTeamRole(testTeam2.id);
        expect(noRole).toBeNull();
      });
    });
  });

  describe('Security Tests', () => {
    it('should prevent cross-team data access in queries', async () => {
      tenantScoping.setTenantContext(testTeam1.id, testUser1.id);
      
      const query = tenantScoping.createTeamScopedQuery();
      const members = await TeamMember.findAll({ where: query });
      
      expect(members).toHaveLength(1);
      expect(members[0].teamId).toBe(testTeam1.id);
      expect(members.every(m => m.teamId === testTeam1.id)).toBe(true);
    });

    it('should enforce team isolation in bulk operations', async () => {
      const bulkOps = TeamIsolation.createTeamBulkOperations(
        { TeamMember },
        testTeam1.id
      );
      
      // Try to update a member from a different team
      const [affectedCount] = await bulkOps.updateTeamMembers(
        [testMember2.id], // This belongs to testTeam2
        { status: 'inactive' }
      );
      
      // Should not affect any records since testMember2 belongs to testTeam2
      expect(affectedCount).toBe(0);
    });

    it('should prevent unauthorized team switching', async () => {
      await expect(
        tenantScoping.switchTeamContext(testTeam2.id, testUser1.id)
      ).rejects.toThrow('Access denied - user is not a member of this team');
    });
  });
});
