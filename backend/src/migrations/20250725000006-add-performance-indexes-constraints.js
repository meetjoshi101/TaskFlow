'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Users table indexes
    await queryInterface.addIndex('Users', ['email'], {
      name: 'idx_users_email_lookup',
      unique: false
    });
    
    await queryInterface.addIndex('Users', ['username'], {
      name: 'idx_users_username_lookup',
      unique: false
    });
    
    await queryInterface.addIndex('Users', ['slug'], {
      name: 'idx_users_slug_lookup',
      unique: false
    });

    // Teams table indexes
    await queryInterface.addIndex('Teams', ['slug'], {
      name: 'idx_teams_slug_lookup',
      unique: false
    });
    
    await queryInterface.addIndex('Teams', ['ownerId'], {
      name: 'idx_teams_owner_lookup',
      unique: false
    });

    // TeamMembers table indexes
    await queryInterface.addIndex('TeamMembers', ['userId', 'teamId'], {
      name: 'idx_team_members_user_team_composite',
      unique: false
    });
    
    await queryInterface.addIndex('TeamMembers', ['role'], {
      name: 'idx_team_members_role_lookup',
      unique: false
    });
    
    await queryInterface.addIndex('TeamMembers', ['joinedAt'], {
      name: 'idx_team_members_joined_time',
      unique: false
    });

    // TeamInvitations table indexes
    await queryInterface.addIndex('TeamInvitations', ['email'], {
      name: 'idx_team_invitations_email_lookup',
      unique: false
    });
    
    await queryInterface.addIndex('TeamInvitations', ['teamId'], {
      name: 'idx_team_invitations_team_lookup',
      unique: false
    });
    
    await queryInterface.addIndex('TeamInvitations', ['token'], {
      name: 'idx_team_invitations_token_lookup',
      unique: false
    });
    
    await queryInterface.addIndex('TeamInvitations', ['expiresAt'], {
      name: 'idx_team_invitations_expiry_time',
      unique: false
    });

    // RefreshTokens table indexes
    await queryInterface.addIndex('RefreshTokens', ['token'], {
      name: 'idx_refresh_tokens_token_lookup',
      unique: false
    });
    
    await queryInterface.addIndex('RefreshTokens', ['userId'], {
      name: 'idx_refresh_tokens_user_lookup',
      unique: false
    });
    
    await queryInterface.addIndex('RefreshTokens', ['expiresAt'], {
      name: 'idx_refresh_tokens_expiry_time',
      unique: false
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove all the indexes in reverse order
    await queryInterface.removeIndex('RefreshTokens', 'idx_refresh_tokens_expiry_time');
    await queryInterface.removeIndex('RefreshTokens', 'idx_refresh_tokens_user_lookup');
    await queryInterface.removeIndex('RefreshTokens', 'idx_refresh_tokens_token_lookup');
    
    await queryInterface.removeIndex('TeamInvitations', 'idx_team_invitations_expiry_time');
    await queryInterface.removeIndex('TeamInvitations', 'idx_team_invitations_token_lookup');
    await queryInterface.removeIndex('TeamInvitations', 'idx_team_invitations_team_lookup');
    await queryInterface.removeIndex('TeamInvitations', 'idx_team_invitations_email_lookup');
    
    await queryInterface.removeIndex('TeamMembers', 'idx_team_members_joined_time');
    await queryInterface.removeIndex('TeamMembers', 'idx_team_members_role_lookup');
    await queryInterface.removeIndex('TeamMembers', 'idx_team_members_user_team_composite');
    
    await queryInterface.removeIndex('Teams', 'idx_teams_owner_lookup');
    await queryInterface.removeIndex('Teams', 'idx_teams_slug_lookup');
    
    await queryInterface.removeIndex('Users', 'idx_users_slug_lookup');
    await queryInterface.removeIndex('Users', 'idx_users_username_lookup');
    await queryInterface.removeIndex('Users', 'idx_users_email_lookup');
  }
};
