const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

/**
 * Email service for sending authentication-related emails
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize email transporter
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Configure transporter based on environment
      if (process.env.NODE_ENV === 'production') {
        // Production: Use SendGrid or SMTP
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      } else {
        // Development: Use Ethereal Email for testing
        const testAccount = await nodemailer.createTestAccount();
        
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      }

      // Verify transporter
      await this.transporter.verify();
      this.initialized = true;

      console.log('Email service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      throw error;
    }
  }

  /**
   * Send email verification message
   * @param {string} to - Recipient email
   * @param {string} firstName - User's first name
   * @param {string} verificationToken - Email verification token
   * @returns {Object} Send result
   */
  async sendEmailVerification(to, firstName, verificationToken) {
    await this.ensureInitialized();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    
    const subject = 'Verify Your TaskFlow Account';
    const html = await this.generateEmailVerificationHtml(firstName, verificationUrl);
    const text = this.generateEmailVerificationText(firstName, verificationUrl);

    return await this.sendEmail(to, subject, html, text);
  }

  /**
   * Send password reset email
   * @param {string} to - Recipient email
   * @param {string} firstName - User's first name
   * @param {string} resetToken - Password reset token
   * @returns {Object} Send result
   */
  async sendPasswordReset(to, firstName, resetToken) {
    await this.ensureInitialized();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const subject = 'Reset Your TaskFlow Password';
    const html = await this.generatePasswordResetHtml(firstName, resetUrl);
    const text = this.generatePasswordResetText(firstName, resetUrl);

    return await this.sendEmail(to, subject, html, text);
  }

  /**
   * Send team invitation email
   * @param {string} to - Recipient email
   * @param {string} inviterName - Name of person sending invitation
   * @param {string} teamName - Team name
   * @param {string} invitationToken - Invitation token
   * @param {string} role - Role being offered
   * @returns {Object} Send result
   */
  async sendTeamInvitation(to, inviterName, teamName, invitationToken, role) {
    await this.ensureInitialized();

    const invitationUrl = `${process.env.FRONTEND_URL}/join-team?token=${invitationToken}`;
    
    const subject = `You're invited to join ${teamName} on TaskFlow`;
    const html = await this.generateTeamInvitationHtml(inviterName, teamName, invitationUrl, role);
    const text = this.generateTeamInvitationText(inviterName, teamName, invitationUrl, role);

    return await this.sendEmail(to, subject, html, text);
  }

  /**
   * Send welcome email after successful verification
   * @param {string} to - Recipient email
   * @param {string} firstName - User's first name
   * @param {string} teamName - Team name
   * @returns {Object} Send result
   */
  async sendWelcomeEmail(to, firstName, teamName) {
    await this.ensureInitialized();

    const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard`;
    
    const subject = 'Welcome to TaskFlow!';
    const html = await this.generateWelcomeHtml(firstName, teamName, dashboardUrl);
    const text = this.generateWelcomeText(firstName, teamName, dashboardUrl);

    return await this.sendEmail(to, subject, html, text);
  }

  /**
   * Core email sending function
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} html - HTML content
   * @param {string} text - Plain text content
   * @returns {Object} Send result
   */
  async sendEmail(to, subject, html, text) {
    try {
      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'TaskFlow',
          address: process.env.FROM_EMAIL || 'noreply@taskflow.com'
        },
        to,
        subject,
        html,
        text
      };

      const info = await this.transporter.sendMail(mailOptions);

      // Log preview URL for development
      if (process.env.NODE_ENV !== 'production') {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate email verification HTML template
   */
  async generateEmailVerificationHtml(firstName, verificationUrl) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - TaskFlow</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #1d4ed8; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        .security-note { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TaskFlow</div>
            <h1>Verify Your Email Address</h1>
        </div>
        
        <p>Hi ${firstName},</p>
        
        <p>Thanks for signing up for TaskFlow! To get started, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        
        <div class="security-note">
            <strong>Security Note:</strong> This verification link will expire in 24 hours. If you didn't create a TaskFlow account, you can safely ignore this email.
        </div>
        
        <div class="footer">
            <p>Need help? Contact us at support@taskflow.com</p>
            <p>&copy; 2025 TaskFlow. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate password reset HTML template
   */
  async generatePasswordResetHtml(firstName, resetUrl) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - TaskFlow</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #b91c1c; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        .security-note { background-color: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0; font-size: 14px; border-left: 4px solid #dc2626; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TaskFlow</div>
            <h1>Reset Your Password</h1>
        </div>
        
        <p>Hi ${firstName},</p>
        
        <p>We received a request to reset your TaskFlow password. Click the button below to choose a new password:</p>
        
        <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        
        <div class="security-note">
            <strong>Important:</strong> This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        </div>
        
        <div class="footer">
            <p>Need help? Contact us at support@taskflow.com</p>
            <p>&copy; 2025 TaskFlow. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate team invitation HTML template
   */
  async generateTeamInvitationHtml(inviterName, teamName, invitationUrl, role) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Invitation - TaskFlow</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #047857; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        .team-info { background-color: #f0f9ff; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .role-badge { background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px; text-transform: uppercase; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TaskFlow</div>
            <h1>You're Invited to Join a Team!</h1>
        </div>
        
        <p><strong>${inviterName}</strong> has invited you to join their team on TaskFlow.</p>
        
        <div class="team-info">
            <h3>Team: ${teamName}</h3>
            <p>Role: <span class="role-badge">${role}</span></p>
        </div>
        
        <p>Accept this invitation to start collaborating with your team on TaskFlow's powerful project management platform.</p>
        
        <div style="text-align: center;">
            <a href="${invitationUrl}" class="button">Accept Invitation</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${invitationUrl}</p>
        
        <p><em>This invitation will expire in 7 days. If you don't want to join this team, you can safely ignore this email.</em></p>
        
        <div class="footer">
            <p>Need help? Contact us at support@taskflow.com</p>
            <p>&copy; 2025 TaskFlow. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate welcome email HTML template
   */
  async generateWelcomeHtml(firstName, teamName, dashboardUrl) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to TaskFlow!</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #1d4ed8; }
        .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        .features { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .feature { margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TaskFlow</div>
            <h1>Welcome to TaskFlow, ${firstName}! 🎉</h1>
        </div>
        
        <p>Congratulations! Your TaskFlow account has been successfully verified and your team <strong>${teamName}</strong> is ready to go.</p>
        
        <div class="features">
            <h3>What you can do now:</h3>
            <div class="feature">✅ Invite team members to collaborate</div>
            <div class="feature">✅ Create and manage projects</div>
            <div class="feature">✅ Track tasks and progress</div>
            <div class="feature">✅ Set up team workflows</div>
        </div>
        
        <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
        </div>
        
        <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
        
        <div class="footer">
            <p>Happy collaborating!</p>
            <p>The TaskFlow Team</p>
            <p>&copy; 2025 TaskFlow. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Plain text versions for email clients that don't support HTML

  generateEmailVerificationText(firstName, verificationUrl) {
    return `
Hi ${firstName},

Thanks for signing up for TaskFlow! To get started, please verify your email address by visiting:

${verificationUrl}

This verification link will expire in 24 hours. If you didn't create a TaskFlow account, you can safely ignore this email.

Need help? Contact us at support@taskflow.com

© 2025 TaskFlow. All rights reserved.
`;
  }

  generatePasswordResetText(firstName, resetUrl) {
    return `
Hi ${firstName},

We received a request to reset your TaskFlow password. Visit the following link to choose a new password:

${resetUrl}

This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Need help? Contact us at support@taskflow.com

© 2025 TaskFlow. All rights reserved.
`;
  }

  generateTeamInvitationText(inviterName, teamName, invitationUrl, role) {
    return `
${inviterName} has invited you to join their team on TaskFlow.

Team: ${teamName}
Role: ${role.toUpperCase()}

Accept this invitation to start collaborating:

${invitationUrl}

This invitation will expire in 7 days. If you don't want to join this team, you can safely ignore this email.

Need help? Contact us at support@taskflow.com

© 2025 TaskFlow. All rights reserved.
`;
  }

  generateWelcomeText(firstName, teamName, dashboardUrl) {
    return `
Welcome to TaskFlow, ${firstName}!

Congratulations! Your TaskFlow account has been successfully verified and your team "${teamName}" is ready to go.

What you can do now:
- Invite team members to collaborate
- Create and manage projects  
- Track tasks and progress
- Set up team workflows

Go to your dashboard: ${dashboardUrl}

If you have any questions or need help getting started, don't hesitate to reach out to our support team.

Happy collaborating!
The TaskFlow Team

© 2025 TaskFlow. All rights reserved.
`;
  }

  /**
   * Ensure email service is initialized
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
