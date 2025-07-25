'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('team_members', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      role: {
        type: Sequelize.ENUM('admin', 'member', 'viewer'),
        allowNull: false,
        defaultValue: 'member'
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'active'
      },
      invitedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      invitedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      joinedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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

    // Add unique constraint for user-team combination
    await queryInterface.addIndex('team_members', ['userId', 'teamId'], {
      name: 'team_members_user_team_unique',
      unique: true
    });

    // Add indexes for performance
    await queryInterface.addIndex('team_members', ['userId'], {
      name: 'team_members_user_id_idx'
    });

    await queryInterface.addIndex('team_members', ['teamId'], {
      name: 'team_members_team_id_idx'
    });

    await queryInterface.addIndex('team_members', ['role'], {
      name: 'team_members_role_idx'
    });

    await queryInterface.addIndex('team_members', ['status'], {
      name: 'team_members_status_idx'
    });

    await queryInterface.addIndex('team_members', ['invitedBy'], {
      name: 'team_members_invited_by_idx'
    });

    await queryInterface.addIndex('team_members', ['joinedAt'], {
      name: 'team_members_joined_at_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('team_members');
  }
};
