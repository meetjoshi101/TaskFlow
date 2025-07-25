# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-07-25-user-auth-team-management/spec.md

> Created: July 25, 2025
> Version: 1.0.0

## Schema Changes

### New Tables

#### users table
Primary entity for storing user account information with authentication details.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  password_reset_token VARCHAR(255),
  password_reset_expires TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### teams table
Multi-tenant team workspaces that group users and projects together.

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);
```

#### team_members table
Junction table managing user-team relationships with role-based access control.

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  team_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  invited_at TIMESTAMP,
  invited_by UUID,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(user_id, team_id)
);
```

#### team_invitations table
Manages pending team invitations for users who haven't registered yet.

```sql
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  team_id UUID NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  invited_by UUID NOT NULL,
  accepted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_team_invitations_email (email),
  INDEX idx_team_invitations_token (token)
);
```

#### refresh_tokens table
Manages JWT refresh tokens for secure session management.

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used TIMESTAMP,
  revoked BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Indexes and Constraints

#### Performance Indexes
```sql
-- User authentication lookups
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verified ON users(email_verified);
CREATE INDEX idx_users_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_reset_token ON users(password_reset_token);

-- Team management queries
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_teams_created_by ON teams(created_by);

-- Team membership queries
CREATE INDEX idx_team_members_user_team ON team_members(user_id, team_id);
CREATE INDEX idx_team_members_team_role ON team_members(team_id, role);
CREATE INDEX idx_team_members_status ON team_members(status);

-- Refresh token management
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens(revoked);
```

#### Data Integrity Constraints
```sql
-- Role validation
ALTER TABLE team_members ADD CONSTRAINT chk_team_member_role 
  CHECK (role IN ('admin', 'member', 'viewer'));

ALTER TABLE team_invitations ADD CONSTRAINT chk_team_invitation_role 
  CHECK (role IN ('admin', 'member', 'viewer'));

-- Status validation
ALTER TABLE team_members ADD CONSTRAINT chk_team_member_status 
  CHECK (status IN ('active', 'inactive', 'suspended'));

-- Email format validation
ALTER TABLE users ADD CONSTRAINT chk_users_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Team slug validation (URL-safe)
ALTER TABLE teams ADD CONSTRAINT chk_teams_slug_format 
  CHECK (slug ~* '^[a-z0-9][a-z0-9-]*[a-z0-9]$' AND length(slug) >= 3);
```

## Migration Scripts

### Initial Migration (001_create_auth_tables.js)
```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      email_verification_token: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      email_verification_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      password_reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      password_reset_expires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create teams table
    await queryInterface.createTable('teams', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      settings: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Create team_members table
    await queryInterface.createTable('team_members', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      team_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'member'
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'active'
      },
      joined_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      invited_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      invited_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      }
    });

    // Add remaining tables and indexes...
    // (Continuing with team_invitations and refresh_tokens)
    
    // Add unique constraint for user-team combination
    await queryInterface.addConstraint('team_members', {
      fields: ['user_id', 'team_id'],
      type: 'unique',
      name: 'unique_user_team_membership'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('refresh_tokens');
    await queryInterface.dropTable('team_invitations');
    await queryInterface.dropTable('team_members');
    await queryInterface.dropTable('teams');
    await queryInterface.dropTable('users');
  }
};
```

## Rationale

### Multi-Tenant Design
The schema implements a clear multi-tenant architecture where each team operates as an isolated workspace. The `team_id` foreign key on all major entities ensures complete data separation between teams while allowing users to belong to multiple teams.

### Security Considerations
- UUIDs prevent enumeration attacks and provide globally unique identifiers
- Separate token storage tables enable secure token revocation and management
- Password hashing is handled at the application layer using bcrypt
- Email verification and password reset use cryptographically secure tokens

### Performance Optimization
- Strategic indexing on frequently queried columns (email, team relationships, tokens)
- JSONB settings field for flexible team configuration without schema changes
- Optimized foreign key relationships to minimize join overhead

### Data Integrity
- Comprehensive constraints ensure data quality and prevent invalid states
- Cascade deletes maintain referential integrity when teams or users are removed
- Role and status enums prevent invalid values from being stored
