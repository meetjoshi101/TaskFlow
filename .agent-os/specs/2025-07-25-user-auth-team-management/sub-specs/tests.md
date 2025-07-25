# Tests Specification

This is the tests coverage details for the spec detailed in @.agent-os/specs/2025-07-25-user-auth-team-management/spec.md

> Created: July 25, 2025
> Version: 1.0.0

## Test Coverage

### Unit Tests

**AuthController**
- `register()` - Test user registration with valid/invalid data, duplicate email handling, team creation
- `verifyEmail()` - Test token validation, expired tokens, invalid tokens, successful verification
- `login()` - Test credential validation, rate limiting, unverified email handling, successful login
- `refresh()` - Test token refresh, invalid tokens, expired tokens, token rotation
- `logout()` - Test token revocation, single/all device logout
- `forgotPassword()` - Test email sending, rate limiting, non-existent email handling
- `resetPassword()` - Test token validation, password strength, successful reset

**TeamController**
- `getCurrent()` - Test team retrieval with proper user context and permissions
- `updateCurrent()` - Test team updates with admin permissions, validation, unauthorized access
- `getMembers()` - Test member listing with pagination, filtering, role-based access
- `inviteMembers()` - Test invitation creation, duplicate email handling, role validation
- `updateMember()` - Test role changes, status updates, permission validation
- `removeMember()` - Test member removal, self-removal prevention, admin permissions

**User Model**
- `hashPassword()` - Test password hashing strength and verification
- `generateVerificationToken()` - Test token generation uniqueness and expiration
- `verifyPassword()` - Test password comparison accuracy
- `findByEmail()` - Test email lookup with case insensitivity

**Team Model**
- `createWithOwner()` - Test team creation with automatic admin membership
- `generateSlug()` - Test slug generation from team name, uniqueness handling
- `validateSlug()` - Test slug format validation and character restrictions

**TeamMember Model**
- `addMember()` - Test member addition with role assignment and validation
- `updateRole()` - Test role changes with permission checks
- `getByTeamAndRole()` - Test member queries with role filtering

### Integration Tests

**Registration Flow**
- End-to-end user registration including team creation and email verification
- Test registration with existing email, invalid team data
- Verify database state after successful registration

**Authentication Flow** 
- Complete login process with token generation and session creation
- Test failed login attempts, rate limiting, and account lockouts
- Verify refresh token rotation and session persistence

**Team Management Workflow**
- Admin inviting members, members accepting invitations
- Role changes and permission enforcement across endpoints
- Team member removal and its effects on access

**Email Integration**
- Verification email sending and token validation
- Password reset email delivery and token processing
- Invitation email generation and acceptance flow

**Multi-tenant Isolation**
- Verify users can only access their team's data
- Test cross-team data leakage prevention
- Validate team-scoped queries and permissions

### Feature Tests (End-to-End)

**New User Registration Journey**
1. User visits registration page
2. Fills out form with team information
3. Submits registration and receives confirmation
4. Checks email and clicks verification link
5. Completes email verification and is logged in
6. Sees team dashboard with invitation capabilities

**Team Invitation and Onboarding**
1. Admin navigates to team management page
2. Sends invitations to multiple email addresses
3. Invitees receive emails with join links
4. New users complete registration through invitation
5. Existing users join additional teams
6. All users appear in team member list with correct roles

**Password Reset Process**
1. User attempts login with forgotten password
2. Clicks "Forgot Password" link
3. Enters email address and submits request
4. Receives password reset email
5. Clicks reset link and enters new password
6. Successfully logs in with new credentials

**Team Administration Tasks**
1. Admin views team member list
2. Updates member roles and permissions
3. Removes inactive team members
4. Updates team information and settings
5. Verifies changes are reflected across the system

### Mocking Requirements

**Email Service**
- Mock nodemailer transport for email sending tests
- Capture email content for verification without actual delivery
- Test email template rendering with dynamic content

**Database Transactions**
- Mock database operations for unit tests using sinon stubs
- Use test database with automatic cleanup between tests
- Mock Sequelize models for isolated controller testing

**JWT Token Service**
- Mock token generation for predictable test tokens
- Stub token verification for authentication middleware tests
- Mock token expiration for refresh flow testing

**External Services**
- Mock any third-party APIs used for validation or notifications
- Stub rate limiting Redis operations for consistent test timing
- Mock file system operations for temporary token storage

## Test Environment Setup

### Database Configuration
- Use separate test database (taskflow_test) for integration tests
- Implement database seeding for consistent test data
- Automatic database reset and migration before test suites

### Authentication Test Helpers
- Factory functions for creating test users with various roles
- Helper methods for generating valid/invalid JWT tokens
- Test fixtures for team and membership data

### API Testing Framework
- Use supertest for HTTP endpoint testing
- Custom matchers for JWT token validation
- Shared test utilities for authentication headers

### Performance Test Considerations
- Load testing for authentication endpoints under concurrent requests
- Memory leak testing for token generation and cleanup
- Database query performance testing with large user/team datasets
