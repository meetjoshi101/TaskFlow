/**
 * Team Isolation Utilities
 * Helper functions to ensure proper multi-tenant data isolation
 */

class TeamIsolation {
  /**
   * Create a team-scoped where clause for queries
   */
  static createTeamScope(teamId, additionalWhere = {}) {
    if (!teamId) {
      throw new Error('Team ID is required for team-scoped queries');
    }

    return {
      teamId,
      ...additionalWhere
    };
  }

  /**
   * Create a team-scoped include for associations
   */
  static createTeamScopedInclude(model, teamId, alias = null, additionalWhere = {}) {
    if (!teamId) {
      throw new Error('Team ID is required for team-scoped includes');
    }

    const include = {
      model,
      where: {
        teamId,
        ...additionalWhere
      }
    };

    if (alias) {
      include.as = alias;
    }

    return include;
  }

  /**
   * Validate team ownership of resources
   */
  static async validateTeamOwnership(models, resourceType, resourceId, teamId) {
    let resource;
    
    switch (resourceType) {
      case 'team':
        resource = await models.Team.findOne({
          where: { id: resourceId, id: teamId }
        });
        break;
        
      case 'teamMember':
        resource = await models.TeamMember.findOne({
          where: { id: resourceId, teamId }
        });
        break;
        
      case 'teamInvitation':
        resource = await models.TeamInvitation.findOne({
          where: { id: resourceId, teamId }
        });
        break;
        
      default:
        throw new Error(`Unknown resource type: ${resourceType}`);
    }

    if (!resource) {
      throw new Error(`Resource not found or access denied: ${resourceType}#${resourceId}`);
    }

    return resource;
  }

  /**
   * Get team-scoped query options for Sequelize findAll operations
   */
  static getTeamScopedOptions(teamId, options = {}) {
    const teamScopedWhere = this.createTeamScope(teamId, options.where || {});
    
    return {
      ...options,
      where: teamScopedWhere
    };
  }

  /**
   * Create a team context validator middleware
   */
  static createTeamContextValidator(models) {
    return async (req, res, next) => {
      try {
        const teamId = req.params.teamId || req.user?.currentTeamId;
        const userId = req.user?.id;

        if (!teamId) {
          return res.status(400).json({
            success: false,
            error: 'Team context is required'
          });
        }

        if (!userId) {
          return res.status(401).json({
            success: false,
            error: 'User authentication required'
          });
        }

        // Verify user has access to this team
        const membership = await models.TeamMember.findOne({
          where: {
            userId,
            teamId,
            status: 'active'
          }
        });

        if (!membership) {
          return res.status(403).json({
            success: false,
            error: 'Access denied - not a member of this team'
          });
        }

        // Add team context to request
        req.teamContext = {
          teamId,
          userId,
          userRole: membership.role,
          membership
        };

        next();
      } catch (error) {
        console.error('Team context validation error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error during team validation'
        });
      }
    };
  }

  /**
   * Create role-based access control middleware
   */
  static createRoleValidator(requiredRoles = []) {
    return (req, res, next) => {
      const userRole = req.teamContext?.userRole;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          error: 'Team role context required'
        });
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: `Access denied - requires one of: ${requiredRoles.join(', ')}`
        });
      }

      next();
    };
  }

  /**
   * Team query builder for complex multi-table queries
   */
  static createTeamQueryBuilder(models, teamId) {
    return {
      // Get all team members with user details
      getTeamMembers: (options = {}) => {
        return models.TeamMember.findAll({
          where: this.createTeamScope(teamId, options.where),
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: ['id', 'email', 'firstName', 'lastName', 'lastLogin']
            }
          ],
          ...options
        });
      },

      // Get team invitations
      getTeamInvitations: (options = {}) => {
        return models.TeamInvitation.findAll({
          where: this.createTeamScope(teamId, options.where),
          include: [
            {
              model: models.User,
              as: 'inviter',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ],
          ...options
        });
      },

      // Get team with member count
      getTeamWithStats: () => {
        return models.Team.findOne({
          where: { id: teamId },
          include: [
            {
              model: models.TeamMember,
              as: 'members',
              where: { status: 'active' },
              required: false
            }
          ]
        });
      }
    };
  }

  /**
   * Bulk operations with team scoping
   */
  static createTeamBulkOperations(models, teamId) {
    return {
      // Bulk update team members
      updateTeamMembers: async (memberIds, updates) => {
        return models.TeamMember.update(updates, {
          where: {
            id: memberIds,
            teamId
          }
        });
      },

      // Bulk delete team invitations
      deleteTeamInvitations: async (invitationIds) => {
        return models.TeamInvitation.destroy({
          where: {
            id: invitationIds,
            teamId
          }
        });
      },

      // Get team resource counts
      getTeamResourceCounts: async () => {
        const [memberCount, invitationCount] = await Promise.all([
          models.TeamMember.count({
            where: { teamId, status: 'active' }
          }),
          models.TeamInvitation.count({
            where: { teamId, status: 'pending' }
          })
        ]);

        return {
          members: memberCount,
          pendingInvitations: invitationCount
        };
      }
    };
  }

  /**
   * Team data migration utilities (for when users switch teams)
   */
  static createTeamMigrationHelpers(models) {
    return {
      // Transfer user data between teams (if needed)
      transferUserData: async (userId, fromTeamId, toTeamId) => {
        // This would be used for scenarios where user data needs to be moved
        // between teams (though typically not needed for most use cases)
        throw new Error('Team data transfer not implemented - contact administrator');
      },

      // Archive team data when team is deleted
      archiveTeamData: async (teamId) => {
        // Archive or soft-delete team-related data
        const archiveData = {
          archivedAt: new Date(),
          status: 'archived'
        };

        await Promise.all([
          models.TeamMember.update(archiveData, { where: { teamId } }),
          models.TeamInvitation.update(archiveData, { where: { teamId } })
        ]);

        return true;
      }
    };
  }
}

module.exports = TeamIsolation;
