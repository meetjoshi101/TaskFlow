const jwt = require('jsonwebtoken');
const { RefreshToken } = require('../models');
const crypto = require('crypto');

/**
 * JWT utility functions for token management
 */
class JWTUtils {
  /**
   * Generate access token (15 minute expiry)
   * @param {Object} payload - Token payload
   * @returns {string} JWT access token
   */
  static generateAccessToken(payload) {
    return jwt.sign(
      { ...payload, jti: Date.now() + Math.random() },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
        issuer: 'TaskFlow',
        audience: 'TaskFlow-Client'
      }
    );
  }

  /**
   * Generate refresh token (7 day expiry)
   * @param {Object} payload - Token payload
   * @returns {string} JWT refresh token
   */
  static generateRefreshToken(payload) {
    return jwt.sign(
      { ...payload, type: 'refresh', jti: Date.now() + Math.random() },
      process.env.JWT_SECRET,
      { 
        expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
        issuer: 'TaskFlow',
        audience: 'TaskFlow-Client'
      }
    );
  }

  /**
   * Generate both access and refresh tokens
   * @param {Object} user - User object
   * @returns {Object} Object containing accessToken and refreshToken
   */
  static async generateTokenPair(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      teamIds: user.teams ? user.teams.map(t => t.id) : []
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    // Store refresh token in database
    await RefreshToken.create({
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isActive: true
    });

    return {
      accessToken,
      refreshToken
    };
  }

  /**
   * Verify and decode JWT token
   * @param {string} token - JWT token to verify
   * @param {string} type - Token type ('access' or 'refresh')
   * @returns {Object} Decoded token payload
   * @throws {Error} If token is invalid or expired
   */
  static verifyToken(token, type = 'access') {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: 'TaskFlow',
        audience: 'TaskFlow-Client'
      });

      // Check if it's the expected token type
      if (type === 'refresh' && decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      if (type === 'access' && decoded.type === 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else {
        throw error;
      }
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Valid refresh token
   * @returns {Object} New token pair
   * @throws {Error} If refresh token is invalid
   */
  static async refreshAccessToken(refreshToken) {
    // Verify refresh token format
    const decoded = this.verifyToken(refreshToken, 'refresh');

    // Check if refresh token exists and is valid in database
    const tokenRecord = await RefreshToken.findOne({
      where: {
        token: refreshToken,
        userId: decoded.userId,
        isActive: true
      }
      // Remove include to avoid association conflicts
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    // Invalidate old refresh token
    await tokenRecord.update({ isActive: false });

    // Get user separately to avoid association conflicts
    const { User } = require('../models');
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Generate new token pair
    return await this.generateTokenPair(user);
  }

  /**
   * Revoke refresh token (for logout)
   * @param {string} refreshToken - Refresh token to revoke
   * @param {string} userId - User ID for additional security
   * @returns {boolean} Success status
   */
  static async revokeRefreshToken(refreshToken, userId) {
    if (!refreshToken) return true; // No token to revoke

    try {
      const result = await RefreshToken.update(
        { isActive: false },
        {
          where: {
            token: refreshToken,
            userId: userId,
            isActive: true
          }
        }
      );

      return result[0] > 0; // Returns true if any rows were updated
    } catch (error) {
      console.error('Error revoking refresh token:', error);
      return false;
    }
  }

  /**
   * Revoke all refresh tokens for a user (for security events like password change)
   * @param {string} userId - User ID
   * @returns {number} Number of tokens revoked
   */
  static async revokeAllUserTokens(userId) {
    try {
      const result = await RefreshToken.update(
        { isActive: false },
        {
          where: {
            userId: userId,
            isActive: true
          }
        }
      );

      return result[0]; // Number of rows updated
    } catch (error) {
      console.error('Error revoking all user tokens:', error);
      return 0;
    }
  }

  /**
   * Generate secure random token for email verification, password reset, etc.
   * @param {number} length - Token length in bytes (default: 32)
   * @returns {string} Hex encoded random token
   */
  static generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Extract token from Authorization header
   * @param {string} authHeader - Authorization header value
   * @returns {string|null} Token or null if not found
   */
  static extractTokenFromHeader(authHeader) {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }

  /**
   * Clean up expired refresh tokens (for maintenance)
   * @returns {number} Number of tokens cleaned up
   */
  static async cleanupExpiredTokens() {
    try {
      const result = await RefreshToken.destroy({
        where: {
          expiresAt: {
            [require('sequelize').Op.lt]: new Date()
          }
        }
      });

      console.log(`Cleaned up ${result} expired refresh tokens`);
      return result;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }

  /**
   * Get token statistics for monitoring
   * @returns {Object} Token statistics
   */
  static async getTokenStats() {
    try {
      const [totalTokens, validTokens, expiredTokens] = await Promise.all([
        RefreshToken.count(),
        RefreshToken.count({ where: { isActive: true } }),
        RefreshToken.count({
          where: {
            expiresAt: {
              [require('sequelize').Op.lt]: new Date()
            }
          }
        })
      ]);

      return {
        total: totalTokens,
        valid: validTokens,
        invalid: totalTokens - validTokens,
        expired: expiredTokens
      };
    } catch (error) {
      console.error('Error getting token stats:', error);
      return {
        total: 0,
        valid: 0,
        invalid: 0,
        expired: 0
      };
    }
  }
}

module.exports = JWTUtils;
