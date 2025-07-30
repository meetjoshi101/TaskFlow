const express = require('express');
const router = express.Router();

// Import controllers
const AuthController = require('../controllers/authController');

// Import middleware
const {
  authMiddleware,
  authRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
  emailVerificationRateLimiter
} = require('../middleware/authMiddleware');

// Import validation
const ValidationUtils = require('../utils/validationUtils');

/**
 * Authentication Routes
 */

// User Registration
router.post('/register',
  registrationRateLimiter,
  ValidationUtils.registrationValidation(),
  ValidationUtils.handleValidationErrors,
  ValidationUtils.sanitizeBody,
  AuthController.register
);

// Email Verification
router.post('/verify-email',
  emailVerificationRateLimiter,
  ValidationUtils.emailVerificationValidation(),
  ValidationUtils.handleValidationErrors,
  AuthController.verifyEmail
);

// User Login
router.post('/login',
  authRateLimiter,
  ValidationUtils.loginValidation(),
  ValidationUtils.handleValidationErrors,
  AuthController.login
);

// Token Refresh
router.post('/refresh',
  ValidationUtils.refreshTokenValidation(),
  ValidationUtils.handleValidationErrors,
  AuthController.refresh
);

// User Logout (requires authentication)
router.post('/logout',
  authMiddleware,
  AuthController.logout
);

// Forgot Password
router.post('/forgot-password',
  passwordResetRateLimiter,
  ValidationUtils.forgotPasswordValidation(),
  ValidationUtils.handleValidationErrors,
  AuthController.forgotPassword
);

// Reset Password
router.post('/reset-password',
  ValidationUtils.resetPasswordValidation(),
  ValidationUtils.handleValidationErrors,
  AuthController.resetPassword
);

// Resend Email Verification
router.post('/resend-verification',
  emailVerificationRateLimiter,
  ValidationUtils.forgotPasswordValidation(), // Same validation as forgot password (just email)
  ValidationUtils.handleValidationErrors,
  AuthController.resendVerification
);

// Get Current User (requires authentication)
router.get('/me',
  authMiddleware,
  AuthController.getCurrentUser
);

// Update User Profile (requires authentication)
router.put('/profile',
  authMiddleware,
  [
    ValidationUtils.nameRules('firstName').optional(),
    ValidationUtils.nameRules('lastName').optional()
  ],
  ValidationUtils.handleValidationErrors,
  ValidationUtils.sanitizeBody,
  AuthController.updateProfile
);

// Change Password (requires authentication)
router.post('/change-password',
  authMiddleware,
  [
    require('express-validator').body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    ValidationUtils.passwordRules().custom((value, { req }) => {
      // Ensure new password is different from current
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
  ],
  ValidationUtils.handleValidationErrors,
  AuthController.changePassword
);

module.exports = router;
