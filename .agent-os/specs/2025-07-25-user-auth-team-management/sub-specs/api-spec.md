# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-07-25-user-auth-team-management/spec.md

> Created: July 25, 2025
> Version: 1.0.0

## Authentication Endpoints

### POST /api/auth/register

**Purpose:** Create a new user account with team setup
**Request Body:**
```json
{
  "firstName": "string (required, 2-50 chars)",
  "lastName": "string (required, 2-50 chars)", 
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "teamName": "string (required, 3-100 chars)",
  "teamSlug": "string (optional, auto-generated if not provided)"
}
```
**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email for verification.",
  "data": {
    "userId": "uuid",
    "teamId": "uuid",
    "email": "string"
  }
}
```
**Errors:** 400 (validation), 409 (email/slug exists), 500 (server error)

### POST /api/auth/verify-email

**Purpose:** Verify email address using token from registration email
**Request Body:**
```json
{
  "token": "string (required)"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "accessToken": "jwt_string",
    "refreshToken": "jwt_string",
    "user": {
      "id": "uuid",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "emailVerified": true
    }
  }
}
```
**Errors:** 400 (invalid/expired token), 404 (token not found)

### POST /api/auth/login

**Purpose:** Authenticate user and create session
**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```
**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_string (15min expiry)",
    "refreshToken": "jwt_string (7day expiry)", 
    "user": {
      "id": "uuid",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "teams": [
        {
          "id": "uuid",
          "name": "string",
          "slug": "string",
          "role": "admin|member|viewer"
        }
      ]
    }
  }
}
```
**Errors:** 401 (invalid credentials), 403 (unverified email), 429 (rate limited)

### POST /api/auth/refresh

**Purpose:** Refresh expired access token using refresh token
**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```
**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_string",
    "refreshToken": "jwt_string (new token)"
  }
}
```
**Errors:** 401 (invalid/expired refresh token)

### POST /api/auth/logout

**Purpose:** Invalidate current session and revoke refresh token
**Headers:** `Authorization: Bearer <access_token>`
**Request Body:**
```json
{
  "refreshToken": "string (optional, revokes specific token)"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /api/auth/forgot-password

**Purpose:** Initiate password reset process
**Request Body:**
```json
{
  "email": "string (required)"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "If an account exists, password reset instructions have been sent."
}
```
**Note:** Always returns success to prevent email enumeration

### POST /api/auth/reset-password

**Purpose:** Reset password using token from email
**Request Body:**
```json
{
  "token": "string (required)",
  "newPassword": "string (required, min 8 chars)"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```
**Errors:** 400 (invalid/expired token), 422 (weak password)

## Team Management Endpoints

### GET /api/teams/current

**Purpose:** Get current user's team information
**Headers:** `Authorization: Bearer <access_token>`
**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "slug": "string", 
    "description": "string",
    "settings": {},
    "memberCount": "number",
    "userRole": "admin|member|viewer",
    "createdAt": "iso_date"
  }
}
```

### PUT /api/teams/current

**Purpose:** Update current team information (admin only)
**Headers:** `Authorization: Bearer <access_token>`
**Request Body:**
```json
{
  "name": "string (optional, 3-100 chars)",
  "description": "string (optional, max 500 chars)",
  "settings": "object (optional)"
}
```
**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "settings": {}
  }
}
```
**Errors:** 403 (insufficient permissions), 422 (validation error)

### GET /api/teams/current/members

**Purpose:** List team members with roles and status
**Headers:** `Authorization: Bearer <access_token>`
**Query Parameters:** `?page=1&limit=50&status=active&role=all`
**Response (200):**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string",
          "email": "string",
          "lastLogin": "iso_date"
        },
        "role": "admin|member|viewer",
        "status": "active|inactive|suspended",
        "joinedAt": "iso_date"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 25,
      "totalPages": 1
    }
  }
}
```

### POST /api/teams/current/invite

**Purpose:** Invite new members to team (admin/member only)
**Headers:** `Authorization: Bearer <access_token>`
**Request Body:**
```json
{
  "invitations": [
    {
      "email": "string (required, valid email)",
      "role": "member|viewer (required)"
    }
  ]
}
```
**Response (200):**
```json
{
  "success": true,
  "data": {
    "sent": [
      {
        "email": "string",
        "role": "string",
        "token": "string"
      }
    ],
    "failed": [
      {
        "email": "string",
        "error": "Already member|Invalid email|etc"
      }
    ]
  }
}
```

### POST /api/teams/join/{token}

**Purpose:** Accept team invitation using token from email
**Request Body:**
```json
{
  "firstName": "string (required if new user)",
  "lastName": "string (required if new user)",
  "password": "string (required if new user)"
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Successfully joined team",
  "data": {
    "accessToken": "jwt_string (if new user)",
    "refreshToken": "jwt_string (if new user)",
    "team": {
      "id": "uuid",
      "name": "string",
      "role": "string"
    }
  }
}
```
**Errors:** 400 (invalid/expired token), 409 (already member)

### PUT /api/teams/current/members/{memberId}

**Purpose:** Update team member role or status (admin only)
**Headers:** `Authorization: Bearer <access_token>`
**Request Body:**
```json
{
  "role": "admin|member|viewer (optional)",
  "status": "active|inactive|suspended (optional)"
}
```
**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "string",
    "status": "string"
  }
}
```
**Errors:** 403 (insufficient permissions), 404 (member not found), 422 (cannot modify own admin role)

### DELETE /api/teams/current/members/{memberId}

**Purpose:** Remove team member (admin only, cannot remove self)
**Headers:** `Authorization: Bearer <access_token>`
**Response (200):**
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```
**Errors:** 403 (insufficient permissions), 404 (member not found), 422 (cannot remove self)

## Controller Structure

### AuthController
- `register()` - Handle user registration with team creation
- `verifyEmail()` - Process email verification tokens
- `login()` - Authenticate users and create sessions
- `refresh()` - Handle token refresh requests
- `logout()` - Revoke tokens and end sessions
- `forgotPassword()` - Initiate password reset flow
- `resetPassword()` - Process password reset with token

### TeamController  
- `getCurrent()` - Get current team details
- `updateCurrent()` - Update team information
- `getMembers()` - List team members with filtering
- `inviteMembers()` - Send team invitations
- `updateMember()` - Modify member role/status
- `removeMember()` - Remove team member

### TeamInvitationController
- `acceptInvitation()` - Process invitation acceptance
- `getInvitationDetails()` - Get invitation info for display

## Middleware Requirements

### Authentication Middleware
- `requireAuth()` - Verify JWT and set req.user
- `requireTeam()` - Ensure user has team context
- `requireRole(['admin', 'member'])` - Role-based access control

### Validation Middleware
- `validateRegistration()` - Registration input validation
- `validateLogin()` - Login input validation  
- `validateTeamInvite()` - Team invitation validation
- `validatePasswordReset()` - Password reset validation

### Security Middleware
- `rateLimitAuth()` - Rate limiting for auth endpoints
- `rateLimitEmail()` - Rate limiting for email sending
- `sanitizeInput()` - XSS protection and input sanitization
