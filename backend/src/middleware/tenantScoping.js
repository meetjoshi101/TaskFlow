const { DataTypes } = require('sequelize');

/**
 * Multi-tenant query scoping middleware for Sequelize models
 * Ensures all queries are automatically scoped to the user's team context
 */
class TenantScoping {
  constructor(models) {
    this.models = models;
    this.tenantContext = null;
  }

  /**
   * Set the current tenant context (team ID)
   * This should be called when a user is authenticated
   */
  setTenantContext(teamId, userId = null) {
    this.tenantContext = {
      teamId,
      userId
    };
  }

  /**
   * Clear the tenant context
   */
  clearTenantContext() {
    this.tenantContext = null;
  }

  /**
   * Get the current tenant context
   */
  getTenantContext() {
    return this.tenantContext;
  }

  /**
   * Add team scoping to a model's default scope
   */
  addTeamScoping(model, teamIdField = 'teamId') {
    const originalDefaultScope = model.options.defaultScope || {};
    
    model.addScope('defaultScope', {
      ...originalDefaultScope,
      where: {
        ...originalDefaultScope.where,
        [teamIdField]: () => {
          if (!this.tenantContext || !this.tenantContext.teamId) {
            throw new Error('Team context not set - unauthorized access attempt');
          }
          return this.tenantContext.teamId;
        }
      }
    }, { override: true });
  }

  /**
   * Create a team-scoped query for models that need team isolation
   */
  createTeamScopedQuery(baseWhere = {}, teamIdField = 'teamId') {
    if (!this.tenantContext || !this.tenantContext.teamId) {
      throw new Error('Team context not set - unauthorized access attempt');
    }

    return {
      ...baseWhere,
      [teamIdField]: this.tenantContext.teamId
    };
  }

  /**
   * Validate that a user can access a specific team resource
   */
  async validateTeamAccess(teamId, userId = null) {
    const userIdToCheck = userId || this.tenantContext?.userId;
    
    if (!userIdToCheck) {
      throw new Error('User context not available for team access validation');
    }

    if (!teamId) {
      throw new Error('Team ID required for access validation');
    }

    // Check if user is a member of the requested team
    const membership = await this.models.TeamMember.findOne({
      where: {
        userId: userIdToCheck,
        teamId: teamId,
        status: 'active'
      },
      include: [
        {
          model: this.models.Team,
          as: 'team'
        }
      ]
    });

    if (!membership) {
      throw new Error('Access denied - user is not a member of this team');
    }

    return membership;
  }

  /**
   * Get user's teams for multi-team scenarios
   */
  async getUserTeams(userId = null) {
    const userIdToCheck = userId || this.tenantContext?.userId;
    
    if (!userIdToCheck) {
      throw new Error('User context not available');
    }

    const memberships = await this.models.TeamMember.findAll({
      where: {
        userId: userIdToCheck,
        status: 'active'
      },
      include: [
        {
          model: this.models.Team,
          as: 'team'
        }
      ]
    });

    return memberships.map(m => m.team);
  }

  /**
   * Switch user's active team context
   */
  async switchTeamContext(teamId, userId = null) {
    const userIdToCheck = userId || this.tenantContext?.userId;
    
    // Validate access to the new team
    await this.validateTeamAccess(teamId, userIdToCheck);
    
    // Update context
    this.setTenantContext(teamId, userIdToCheck);
    
    return {
      teamId,
      userId: userIdToCheck
    };
  }

  /**
   * Create middleware for Express.js to handle tenant scoping
   */
  createExpressMiddleware() {
    return (req, res, next) => {
      // Clear any existing context
      this.clearTenantContext();

      // Set context from authenticated user
      if (req.user && req.user.currentTeamId) {
        this.setTenantContext(req.user.currentTeamId, req.user.id);
      }

      // Add helper methods to request object
      req.tenantScoping = {
        setContext: (teamId, userId) => this.setTenantContext(teamId, userId),
        getContext: () => this.getTenantContext(),
        validateAccess: (teamId, userId) => this.validateTeamAccess(teamId, userId),
        switchTeam: (teamId, userId) => this.switchTeamContext(teamId, userId),
        createQuery: (baseWhere, teamIdField) => this.createTeamScopedQuery(baseWhere, teamIdField)
      };

      next();
    };
  }

  /**
   * Initialize tenant scoping for all relevant models
   */
  initializeScoping() {
    // Models that need team scoping
    const teamScopedModels = [
      { model: this.models.TeamMember, field: 'teamId' },
      { model: this.models.TeamInvitation, field: 'teamId' }
    ];

    teamScopedModels.forEach(({ model, field }) => {
      if (model) {
        this.addTeamScoping(model, field);
      }
    });

    // Add instance methods to Team model for tenant operations
    if (this.models.Team) {
      this.models.Team.prototype.validateUserAccess = async function(userId) {
        const membership = await this.models.TeamMember.findOne({
          where: {
            userId: userId,
            teamId: this.id,
            status: 'active'
          }
        });
        return !!membership;
      };

      this.models.Team.prototype.getUserRole = async function(userId) {
        const membership = await this.models.TeamMember.findOne({
          where: {
            userId: userId,
            teamId: this.id,
            status: 'active'
          }
        });
        return membership ? membership.role : null;
      };

      this.models.Team.prototype.isUserAdmin = async function(userId) {
        const role = await this.getUserRole(userId);
        return role === 'admin';
      };
    }

    // Add user methods for team context
    if (this.models.User) {
      this.models.User.prototype.getActiveTeams = async function() {
        const memberships = await this.models.TeamMember.findAll({
          where: {
            userId: this.id,
            status: 'active'
          },
          include: [
            {
              model: this.models.Team,
              as: 'team'
            }
          ]
        });
        return memberships.map(m => m.team);
      };

      this.models.User.prototype.hasTeamAccess = async function(teamId) {
        const membership = await this.models.TeamMember.findOne({
          where: {
            userId: this.id,
            teamId: teamId,
            status: 'active'
          }
        });
        return !!membership;
      };

      this.models.User.prototype.getTeamRole = async function(teamId) {
        const membership = await this.models.TeamMember.findOne({
          where: {
            userId: this.id,
            teamId: teamId,
            status: 'active'
          }
        });
        return membership ? membership.role : null;
      };
    }
  }
}

module.exports = TenantScoping;
