const JWTUtils = require('../utils/jwtUtils');
const { User, Team, TeamMember } = require('../models');

/**
 * Authentication middleware to verify JWT tokens and load user data
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify and decode token
    const decoded = JWTUtils.verifyToken(token, 'access');

    // Load user with team information
    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Team,
        as: 'teams',
        through: {
          model: TeamMember,
          attributes: ['role', 'status'],
          where: { status: 'active' }
        },
        attributes: ['id', 'name', 'slug']
      }],
      attributes: ['id', 'email', 'firstName', 'lastName', 'isEmailVerified']
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email not verified'
      });
    }

    // Attach user to request object
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      teams: user.Teams ? user.Teams.map(team => ({
        id: team.id,
        name: team.name,
        slug: team.slug,
        role: team.TeamMember.role,
        status: team.TeamMember.status
      })) : []
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.message === 'Token has expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      req.user = null;
      return next();
    }

    // Try to authenticate, but don't fail if it doesn't work
    try {
      const decoded = JWTUtils.verifyToken(token, 'access');
      const user = await User.findByPk(decoded.userId, {
        include: [{
          model: Team,
          as: 'teams',
          through: {
            model: TeamMember,
            attributes: ['role', 'status'],
            where: { status: 'active' }
          },
          attributes: ['id', 'name', 'slug']
        }],
        attributes: ['id', 'email', 'firstName', 'lastName', 'emailVerified']
      });

      if (user && user.emailVerified) {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          teams: user.teams ? user.teams.map(team => ({
            id: team.id,
            name: team.name,
            slug: team.slug,
            role: team.TeamMember.role,
            status: team.TeamMember.status
          })) : []
        };
      } else {
        req.user = null;
      }
    } catch (authError) {
      req.user = null;
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

/**
 * Team access middleware - requires user to be member of specific team
 */
const teamAccessMiddleware = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Get team ID from params or body
      const teamId = req.params.teamId || req.body.teamId || req.query.teamId;
      
      if (!teamId) {
        return res.status(400).json({
          success: false,
          message: 'Team ID required'
        });
      }

      // Check if user has access to this team
      const userTeam = req.user.teams.find(team => team.id === teamId);
      
      if (!userTeam) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - not a member of this team'
        });
      }

      // Check role if required
      if (requiredRole) {
        const roleHierarchy = { viewer: 1, member: 2, admin: 3 };
        const userRoleLevel = roleHierarchy[userTeam.role] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

        if (userRoleLevel < requiredRoleLevel) {
          return res.status(403).json({
            success: false,
            message: `Access denied - ${requiredRole} role required`
          });
        }
      }

      // Attach team info to request
      req.currentTeam = userTeam;
      next();
    } catch (error) {
      console.error('Team access middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error'
      });
    }
  };
};

/**
 * Admin role middleware - requires admin role in current team
 */
const adminMiddleware = teamAccessMiddleware('admin');

/**
 * Member role middleware - requires member or admin role in current team
 */
const memberMiddleware = teamAccessMiddleware('member');

/**
 * Team owner middleware - requires user to be the team owner
 */
const teamOwnerMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const teamId = req.params.teamId || req.body.teamId || req.query.teamId;
    
    if (!teamId) {
      return res.status(400).json({
        success: false,
        message: 'Team ID required'
      });
    }

    // Check if user is the owner of this team
    const team = await Team.findByPk(teamId);
    
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    if (team.ownerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - team owner required'
      });
    }

    req.currentTeam = team;
    next();
  } catch (error) {
    console.error('Team owner middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authorization error'
    });
  }
};

/**
 * Rate limiting middleware factory
 */
const createRateLimiter = (windowMs, max, message, keyGenerator = null) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = keyGenerator ? keyGenerator(req) : req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [k, data] of attempts.entries()) {
      if (data.resetTime < now) {
        attempts.delete(k);
      }
    }

    // Get or create entry for this key
    let entry = attempts.get(key);
    if (!entry) {
      entry = {
        count: 0,
        resetTime: now + windowMs
      };
      attempts.set(key, entry);
    }

    // Check if limit exceeded
    if (entry.count >= max) {
      return res.status(429).json({
        success: false,
        message: message || 'Too many requests',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      });
    }

    // Increment counter
    entry.count++;

    // Add headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': Math.max(0, max - entry.count),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
    });

    next();
  };
};

/**
 * Specific rate limiters for different endpoints
 */
const authRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  process.env.NODE_ENV === 'test' ? 1000 : 5, // Higher limit for tests
  'Too many authentication attempts, please try again later',
  (req) => `auth:${req.ip}:${req.body.email || 'unknown'}`
);

const registrationRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  process.env.NODE_ENV === 'test' ? 1000 : 3, // Higher limit for tests
  'Too many registration attempts, please try again later'
);

const passwordResetRateLimiter = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  process.env.NODE_ENV === 'test' ? 1000 : 3, // Higher limit for tests
  'Too many password reset requests, please try again later',
  (req) => `reset:${req.ip}:${req.body.email || 'unknown'}`
);

const emailVerificationRateLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  process.env.NODE_ENV === 'test' ? 1000 : 5, // Higher limit for tests
  'Too many email verification attempts, please try again later'
);

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  teamAccessMiddleware,
  adminMiddleware,
  memberMiddleware,
  teamOwnerMiddleware,
  authRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  emailVerificationRateLimiter,
  createRateLimiter
};
