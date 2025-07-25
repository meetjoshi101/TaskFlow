const TeamIsolation = require('../utils/teamIsolation');

/**
 * Express middleware for multi-tenant team isolation
 */
class TeamMiddleware {
  constructor(models) {
    this.models = models;
  }

  /**
   * Middleware to require team context in request
   * Validates that user has access to the requested team
   */
  requireTeamContext() {
    return async (req, res, next) => {
      try {
        // Get team ID from various sources
        const teamId = req.params.teamId || 
                      req.body.teamId || 
                      req.query.teamId || 
                      req.headers['x-team-id'] ||
                      req.user?.currentTeamId;

        const userId = req.user?.id;

        if (!teamId) {
          return res.status(400).json({
            success: false,
            error: 'Team context is required. Provide teamId in URL params, body, query, or X-Team-ID header.'
          });
        }

        if (!userId) {
          return res.status(401).json({
            success: false,
            error: 'User authentication required'
          });
        }

        // Verify user has access to this team
        const membership = await this.models.TeamMember.findOne({
          where: {
            userId,
            teamId,
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
          return res.status(403).json({
            success: false,
            error: 'Access denied - you are not an active member of this team'
          });
        }

        // Add team context to request
        req.teamContext = {
          teamId,
          userId,
          userRole: membership.role,
          membership,
          team: membership.team
        };

        // Add helper functions
        req.teamHelpers = {
          isAdmin: () => membership.role === 'admin',
          isMember: () => ['admin', 'member'].includes(membership.role),
          isViewer: () => membership.role === 'viewer',
          canManage: () => membership.role === 'admin',
          canInvite: () => ['admin', 'member'].includes(membership.role),
          createQuery: (additionalWhere = {}) => TeamIsolation.createTeamScope(teamId, additionalWhere)
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
   * Middleware to require specific roles within a team
   */
  requireTeamRole(requiredRoles = []) {
    const normalizedRoles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    return (req, res, next) => {
      const userRole = req.teamContext?.userRole;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          error: 'Team context required. Use requireTeamContext middleware first.'
        });
      }

      if (normalizedRoles.length > 0 && !normalizedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          error: `Access denied - requires one of these roles: ${normalizedRoles.join(', ')}. Your role: ${userRole}`
        });
      }

      next();
    };
  }

  /**
   * Middleware to require admin role in team
   */
  requireTeamAdmin() {
    return this.requireTeamRole(['admin']);
  }

  /**
   * Middleware to require member or admin role (excludes viewers)
   */
  requireTeamMember() {
    return this.requireTeamRole(['admin', 'member']);
  }

  /**
   * Middleware to set default team for user if not specified
   */
  setDefaultTeam() {
    return async (req, res, next) => {
      try {
        // If team context already exists, continue
        if (req.teamContext?.teamId || req.params.teamId || req.body.teamId || req.query.teamId) {
          return next();
        }

        const userId = req.user?.id;
        if (!userId) {
          return next(); // Let other middleware handle authentication
        }

        // Find user's first active team membership
        const membership = await this.models.TeamMember.findOne({
          where: {
            userId,
            status: 'active'
          },
          include: [
            {
              model: this.models.Team,
              as: 'team'
            }
          ],
          order: [['joinedAt', 'ASC']] // Use their oldest team as default
        });

        if (membership) {
          // Set default team context
          req.teamContext = {
            teamId: membership.teamId,
            userId,
            userRole: membership.role,
            membership,
            team: membership.team,
            isDefault: true // Flag to indicate this was auto-selected
          };

          // Add helper functions
          req.teamHelpers = {
            isAdmin: () => membership.role === 'admin',
            isMember: () => ['admin', 'member'].includes(membership.role),
            isViewer: () => membership.role === 'viewer',
            canManage: () => membership.role === 'admin',
            canInvite: () => ['admin', 'member'].includes(membership.role),
            createQuery: (additionalWhere = {}) => TeamIsolation.createTeamScope(membership.teamId, additionalWhere)
          };
        }

        next();
      } catch (error) {
        console.error('Default team setting error:', error);
        next(); // Continue without setting default team
      }
    };
  }

  /**
   * Middleware to validate team resource ownership
   * Ensures that resources being accessed belong to the current team
   */
  validateTeamResource(resourceType, resourceIdParam = 'id') {
    return async (req, res, next) => {
      try {
        const teamId = req.teamContext?.teamId;
        const resourceId = req.params[resourceIdParam];

        if (!teamId) {
          return res.status(400).json({
            success: false,
            error: 'Team context required'
          });
        }

        if (!resourceId) {
          return res.status(400).json({
            success: false,
            error: `Resource ID parameter '${resourceIdParam}' is required`
          });
        }

        // Validate resource ownership
        try {
          const resource = await TeamIsolation.validateTeamOwnership(
            this.models,
            resourceType,
            resourceId,
            teamId
          );

          // Add resource to request context
          req.teamResource = {
            type: resourceType,
            id: resourceId,
            data: resource
          };

          next();
        } catch (validationError) {
          return res.status(404).json({
            success: false,
            error: validationError.message
          });
        }
      } catch (error) {
        console.error('Team resource validation error:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error during resource validation'
        });
      }
    };
  }

  /**
   * Middleware to log team access for audit purposes
   */
  auditTeamAccess() {
    return (req, res, next) => {
      const teamId = req.teamContext?.teamId;
      const userId = req.teamContext?.userId;
      const userRole = req.teamContext?.userRole;
      const method = req.method;
      const path = req.path;
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      if (teamId && userId) {
        // Log team access (in production, you might want to use a proper logging service)
        console.log(`[TEAM_ACCESS] ${new Date().toISOString()} - User: ${userId}, Team: ${teamId}, Role: ${userRole}, Action: ${method} ${path}, IP: ${ip}, UA: ${userAgent?.substring(0, 100)}`);
      }

      next();
    };
  }

  /**
   * Middleware factory for common team operations
   */
  createTeamMiddleware() {
    return {
      requireContext: this.requireTeamContext(),
      requireAdmin: [this.requireTeamContext(), this.requireTeamAdmin()],
      requireMember: [this.requireTeamContext(), this.requireTeamMember()],
      requireRole: (roles) => [this.requireTeamContext(), this.requireTeamRole(roles)],
      validateResource: (type, param) => this.validateTeamResource(type, param),
      setDefault: this.setDefaultTeam(),
      audit: this.auditTeamAccess()
    };
  }

  /**
   * Error handler for team-related errors
   */
  handleTeamErrors() {
    return (error, req, res, next) => {
      // Handle specific team-related errors
      if (error.message?.includes('Team context not set')) {
        return res.status(400).json({
          success: false,
          error: 'Team context is required for this operation'
        });
      }

      if (error.message?.includes('Access denied - user is not a member')) {
        return res.status(403).json({
          success: false,
          error: 'You do not have access to this team'
        });
      }

      if (error.message?.includes('Resource not found or access denied')) {
        return res.status(404).json({
          success: false,
          error: 'The requested resource was not found or you do not have access to it'
        });
      }

      // Pass other errors to default error handler
      next(error);
    };
  }
}

module.exports = TeamMiddleware;
