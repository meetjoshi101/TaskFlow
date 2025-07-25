'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('team_invitations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true
        }
      },
      teamId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      invitedBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('admin', 'member', 'viewer'),
        allowNull: false,
        defaultValue: 'member'
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'declined', 'expired', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      acceptedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      declinedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancelledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique constraint for pending invitations (prevent duplicate pending invitations)
    await queryInterface.addIndex('team_invitations', ['email', 'teamId', 'status'], {
      name: 'team_invitations_email_team_status_unique',
      unique: true,
      where: {
        status: 'pending'
      }
    });

    // Add unique constraint for token
    await queryInterface.addIndex('team_invitations', ['token'], {
      name: 'team_invitations_token_unique',
      unique: true
    });

    // Add indexes for performance
    await queryInterface.addIndex('team_invitations', ['email'], {
      name: 'team_invitations_email_idx'
    });

    await queryInterface.addIndex('team_invitations', ['teamId'], {
      name: 'team_invitations_team_id_idx'
    });

    await queryInterface.addIndex('team_invitations', ['invitedBy'], {
      name: 'team_invitations_invited_by_idx'
    });

    await queryInterface.addIndex('team_invitations', ['status'], {
      name: 'team_invitations_status_idx'
    });

    await queryInterface.addIndex('team_invitations', ['expiresAt'], {
      name: 'team_invitations_expires_at_idx'
    });

    await queryInterface.addIndex('team_invitations', ['sentAt'], {
      name: 'team_invitations_sent_at_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('team_invitations');
  }
};
