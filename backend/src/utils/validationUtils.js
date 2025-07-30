const { body, validationResult } = require('express-validator');
const DOMPurify = require('isomorphic-dompurify');

/**
 * Input validation and sanitization utilities
 */
class ValidationUtils {
  /**
   * Password validation rules
   */
  static passwordRules() {
    return body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
      .not()
      .matches(/^(.)\1+$/)
      .withMessage('Password cannot be all the same character');
  }

  /**
   * Email validation rules
   */
  static emailRules() {
    return body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email address too long');
  }

  /**
   * Name validation rules
   */
  static nameRules(field) {
    return body(field)
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage(`${field} must be between 2 and 50 characters`)
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage(`${field} can only contain letters, spaces, hyphens, and apostrophes`)
      .customSanitizer(value => DOMPurify.sanitize(value));
  }

  /**
   * Team name validation rules
   */
  static teamNameRules() {
    return body('teamName')
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage('Team name must be between 3 and 100 characters')
      .matches(/^[a-zA-Z0-9\s'-]+$/)
      .withMessage('Team name can only contain letters, numbers, spaces, hyphens, and apostrophes')
      .customSanitizer(value => DOMPurify.sanitize(value));
  }

  /**
   * Team slug validation rules
   */
  static teamSlugRules() {
    return body('teamSlug')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 })
      .withMessage('Team slug must be between 3 and 50 characters')
      .matches(/^[a-z0-9-]+$/)
      .withMessage('Team slug can only contain lowercase letters, numbers, and hyphens')
      .not()
      .matches(/^-|-$/)
      .withMessage('Team slug cannot start or end with a hyphen')
      .not()
      .matches(/--/)
      .withMessage('Team slug cannot contain consecutive hyphens');
  }

  /**
   * Token validation rules
   */
  static tokenRules(field = 'token') {
    return body(field)
      .trim()
      .isLength({ min: 32, max: 256 })
      .withMessage('Invalid token format')
      .matches(/^[a-zA-Z0-9_-]+$/)
      .withMessage('Token contains invalid characters');
  }

  /**
   * JWT token validation rules
   */
  static jwtTokenRules(field = 'refreshToken') {
    return body(field)
      .trim()
      .matches(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/)
      .withMessage('Invalid JWT token format');
  }

  /**
   * Role validation rules
   */
  static roleRules() {
    return body('role')
      .isIn(['admin', 'member', 'viewer'])
      .withMessage('Role must be admin, member, or viewer');
  }

  /**
   * Registration validation rules
   */
  static registrationValidation() {
    return [
      this.nameRules('firstName'),
      this.nameRules('lastName'),
      this.emailRules(),
      this.passwordRules(),
      this.teamNameRules(),
      this.teamSlugRules()
    ];
  }

  /**
   * Login validation rules
   */
  static loginValidation() {
    return [
      body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ];
  }

  /**
   * Email verification validation rules
   */
  static emailVerificationValidation() {
    return [
      this.tokenRules()
    ];
  }

  /**
   * Refresh token validation rules
   */
  static refreshTokenValidation() {
    return [
      this.jwtTokenRules('refreshToken')
    ];
  }

  /**
   * Forgot password validation rules
   */
  static forgotPasswordValidation() {
    return [
      this.emailRules()
    ];
  }

  /**
   * Reset password validation rules
   */
  static resetPasswordValidation() {
    return [
      this.tokenRules(),
      body('newPassword')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
        .not()
        .matches(/^(.)\1+$/)
        .withMessage('Password cannot be all the same character')
    ];
  }

  /**
   * Team invitation validation rules
   */
  static teamInvitationValidation() {
    return [
      body('invitations')
        .isArray({ min: 1, max: 10 })
        .withMessage('Must provide 1-10 invitations'),
      body('invitations.*.email')
        .isEmail()
        .withMessage('Each invitation must have a valid email')
        .normalizeEmail(),
      body('invitations.*.role')
        .isIn(['member', 'viewer'])
        .withMessage('Role must be member or viewer (admins cannot be invited)')
    ];
  }

  /**
   * Team update validation rules
   */
  static teamUpdateValidation() {
    return [
      body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Team name must be between 3 and 100 characters')
        .customSanitizer(value => DOMPurify.sanitize(value)),
      body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters')
        .customSanitizer(value => DOMPurify.sanitize(value)),
      body('settings')
        .optional()
        .isObject()
        .withMessage('Settings must be an object')
    ];
  }

  /**
   * Member role update validation rules
   */
  static memberRoleUpdateValidation() {
    return [
      body('role')
        .isIn(['admin', 'member', 'viewer'])
        .withMessage('Role must be admin, member, or viewer'),
      body('memberId')
        .isUUID()
        .withMessage('Invalid member ID')
    ];
  }

  /**
   * Handle validation errors middleware
   */
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: formattedErrors
      });
    }

    next();
  }

  /**
   * Sanitize object recursively
   */
  static sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => ValidationUtils.sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = DOMPurify.sanitize(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = ValidationUtils.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Generate team slug from team name
   */
  static generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Validate UUID format
   */
  static isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Check password strength
   */
  static checkPasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noRepeating: !/^(.)\1+$/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    let strength = 'weak';
    
    if (score >= 5) strength = 'strong';
    else if (score >= 4) strength = 'medium';
    
    return {
      score,
      strength,
      checks,
      isValid: checks.length && checks.lowercase && checks.uppercase && checks.number && checks.noRepeating
    };
  }

  /**
   * Rate limiting helpers
   */
  static getRateLimitKey(req, identifier = 'ip') {
    switch (identifier) {
      case 'ip':
        return req.ip || req.connection.remoteAddress;
      case 'email':
        return req.body.email || 'unknown';
      case 'user':
        return req.user?.id || req.ip;
      default:
        return req.ip;
    }
  }

  /**
   * Custom validation for team slug uniqueness
   */
  static async validateTeamSlugUnique(slug, excludeTeamId = null) {
    const { Team } = require('../models');
    
    const where = { slug };
    if (excludeTeamId) {
      where.id = { [require('sequelize').Op.ne]: excludeTeamId };
    }

    const existingTeam = await Team.findOne({ where });
    return !existingTeam;
  }

  /**
   * Custom validation for email uniqueness
   */
  static async validateEmailUnique(email, excludeUserId = null) {
    const { User } = require('../models');
    
    const where = { email };
    if (excludeUserId) {
      where.id = { [require('sequelize').Op.ne]: excludeUserId };
    }

    const existingUser = await User.findOne({ where });
    return !existingUser;
  }

  /**
   * Middleware to sanitize request body
   */
  static sanitizeBody(req, res, next) {
    if (req.body) {
      req.body = ValidationUtils.sanitizeObject(req.body);
    }
    next();
  }

  /**
   * Middleware to log validation errors
   */
  static logValidationErrors(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      console.warn('Validation errors:', {
        url: req.url,
        method: req.method,
        ip: req.ip,
        errors: errors.array()
      });
    }
    
    next();
  }
}

module.exports = ValidationUtils;
