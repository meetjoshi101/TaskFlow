const bcrypt = require('bcrypt');
const { User, Team, TeamMember, RefreshToken } = require('../models');
const JWTUtils = require('../utils/jwtUtils');
const emailService = require('../utils/emailService');
const ValidationUtils = require('../utils/validationUtils');
const { Op } = require('sequelize');

/**
 * Authentication Controller
 * Handles user registration, login, token management, and password operations
 */
class AuthController {
  /**
   * Register new user with team creation
   * POST /api/auth/register
   */
  static async register(req, res) {
    const transaction = await require('../models').sequelize.transaction();
    
    try {
      const { firstName, lastName, email, password, teamName, teamSlug } = req.body;

      // Check if email already exists
      const existingUser = await User.findOne({ 
        where: { email: email.toLowerCase() } 
      });

      if (existingUser) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists'
        });
      }

      // Generate or validate team slug
      let finalTeamSlug = teamSlug;
      if (!finalTeamSlug) {
        finalTeamSlug = ValidationUtils.generateSlug(teamName);
      }

      // Check if team slug already exists
      const existingTeam = await Team.findOne({ 
        where: { slug: finalTeamSlug } 
      });

      if (existingTeam) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          message: 'A team with this name already exists'
        });
      }

      // Generate email verification token
      const emailVerificationToken = JWTUtils.generateSecureToken();

      // Create user (password will be hashed by User model hook)
      const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        username: email.toLowerCase().split('@')[0], // Generate username from email
        password: password, // Pass plain password, let model hash it
        isEmailVerified: false,
        emailVerificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      }, { transaction });

      // Create team
      const team = await Team.create({
        name: teamName,
        slug: finalTeamSlug,
        createdBy: user.id,
        description: `${teamName} workspace`,
        settings: {}
      }, { transaction });

      // Create team membership (user as admin)
      await TeamMember.create({
        userId: user.id,
        teamId: team.id,
        role: 'admin',
        status: 'active',
        joinedAt: new Date()
      }, { transaction });

      await transaction.commit();

      // Send verification email (don't wait for it)
      emailService.sendEmailVerification(
        user.email,
        user.firstName,
        emailVerificationToken
      ).catch(error => {
        console.error('Failed to send verification email:', error);
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully. Please check your email for verification.',
        data: {
          userId: user.id,
          teamId: team.id,
          email: user.email
        }
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Registration error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.'
      });
    }
  }

  /**
   * Verify email address
   * POST /api/auth/verify-email
   */
  static async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      // Find user with this verification token
      const user = await User.findOne({
        where: {
          emailVerificationToken: token,
          emailVerificationExpires: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      // Update user as verified
      await user.update({
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      });

      // Generate JWT tokens
      const userWithTeams = {
        ...user.toJSON(),
        teams: user.Teams ? user.Teams.map(team => ({
          id: team.id,
          name: team.name,
          slug: team.slug,
          role: team.TeamMember.role
        })) : []
      };

      const tokens = await JWTUtils.generateTokenPair(userWithTeams);

      // Send welcome email (don't wait for it)
      const teamName = user.Teams?.[0]?.name || 'Your Team';
      emailService.sendWelcomeEmail(
        user.email,
        user.firstName,
        teamName
      ).catch(error => {
        console.error('Failed to send welcome email:', error);
      });

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: true
          }
        }
      });

    } catch (error) {
      console.error('Email verification error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Email verification failed. Please try again.'
      });
    }
  }

  /**
   * User login
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email address before logging in'
        });
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Prepare user data
      const userWithTeams = {
        ...user.toJSON(),
        teams: [] // We'll get teams separately if needed
      };

      // Generate JWT tokens
      const tokens = await JWTUtils.generateTokenPair(userWithTeams);

      res.status(200).json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            teams: []
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.'
      });
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      // Refresh the tokens
      const newTokens = await JWTUtils.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: {
          accessToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken
        }
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired refresh token'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Token refresh failed. Please try again.'
      });
    }
  }

  /**
   * User logout
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user.id;

      // Revoke refresh token if provided
      if (refreshToken) {
        await JWTUtils.revokeRefreshToken(refreshToken, userId);
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      
      // Still return success even if token revocation fails
      res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    }
  }

  /**
   * Initiate password reset
   * POST /api/auth/forgot-password
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Always return success to prevent email enumeration
      const successResponse = {
        success: true,
        message: 'If an account exists, password reset instructions have been sent.'
      };

      // Find user
      const user = await User.findOne({ 
        where: { email: email.toLowerCase() } 
      });

      if (!user) {
        // Still return success but don't send email
        return res.status(200).json(successResponse);
      }

      // Generate password reset token
      const resetToken = JWTUtils.generateSecureToken();
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with reset token
      await user.update({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      });

      // Send password reset email (don't wait for it)
      emailService.sendPasswordReset(
        user.email,
        user.firstName,
        resetToken
      ).catch(error => {
        console.error('Failed to send password reset email:', error);
      });

      res.status(200).json(successResponse);

    } catch (error) {
      console.error('Forgot password error:', error);
      
      // Still return success to prevent information leakage
      res.status(200).json({
        success: true,
        message: 'If an account exists, password reset instructions have been sent.'
      });
    }
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      // Find user with valid reset token
      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: {
            [Op.gt]: new Date()
          }
        }
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Update user password and clear reset token (password will be hashed by User model hook)
      await user.update({
        password: newPassword, // Pass plain password, let model hash it
        passwordResetToken: null,
        passwordResetExpires: null
      });

      // Revoke all existing refresh tokens for security
      await JWTUtils.revokeAllUserTokens(user.id);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Password reset failed. Please try again.'
      });
    }
  }

  /**
   * Resend email verification
   * POST /api/auth/resend-verification
   */
  static async resendVerification(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ 
        where: { email: email.toLowerCase() } 
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (user.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: 'Email is already verified'
        });
      }

      // Generate new verification token
      const emailVerificationToken = JWTUtils.generateSecureToken();
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await user.update({
        emailVerificationToken,
        emailVerificationExpires
      });

      // Send verification email
      await emailService.sendEmailVerification(
        user.email,
        user.firstName,
        emailVerificationToken
      );

      res.status(200).json({
        success: true,
        message: 'Verification email sent successfully'
      });

    } catch (error) {
      console.error('Resend verification error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }
  }

  /**
   * Get current user info
   * GET /api/auth/me
   */
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'email', 'firstName', 'lastName', 'isEmailVerified', 'lastLoginAt', 'createdAt']
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            emailVerified: user.isEmailVerified,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            teams: [] // We'll implement team fetching separately
          }
        }
      });

    } catch (error) {
      console.error('Get current user error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to get user information'
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  static async updateProfile(req, res) {
    try {
      const { firstName, lastName } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });

    } catch (error) {
      console.error('Update profile error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  /**
   * Change password (authenticated user)
   * POST /api/auth/change-password
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password (will be hashed by User model hook)
      await user.update({ password: newPassword });

      // Revoke all existing refresh tokens for security
      await JWTUtils.revokeAllUserTokens(user.id);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please log in again.'
      });

    } catch (error) {
      console.error('Change password error:', error);
      
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }
}

module.exports = AuthController;
