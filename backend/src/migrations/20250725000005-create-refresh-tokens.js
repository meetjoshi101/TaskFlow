'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      token: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
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
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      lastUsedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      usageCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      deviceType: {
        type: Sequelize.ENUM('web', 'mobile', 'desktop', 'tablet'),
        allowNull: true
      },
      deviceId: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING(45),
        allowNull: true
      },
      revokedAt: {
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

    // Add unique constraint for token
    await queryInterface.addIndex('refresh_tokens', ['token'], {
      name: 'refresh_tokens_token_unique',
      unique: true
    });

    // Add indexes for performance
    await queryInterface.addIndex('refresh_tokens', ['userId'], {
      name: 'refresh_tokens_user_id_idx'
    });

    await queryInterface.addIndex('refresh_tokens', ['isActive'], {
      name: 'refresh_tokens_is_active_idx'
    });

    await queryInterface.addIndex('refresh_tokens', ['expiresAt'], {
      name: 'refresh_tokens_expires_at_idx'
    });

    await queryInterface.addIndex('refresh_tokens', ['userId', 'isActive'], {
      name: 'refresh_tokens_user_active_idx'
    });

    await queryInterface.addIndex('refresh_tokens', ['userId', 'deviceType'], {
      name: 'refresh_tokens_user_device_idx'
    });

    await queryInterface.addIndex('refresh_tokens', ['lastUsedAt'], {
      name: 'refresh_tokens_last_used_at_idx'
    });

    await queryInterface.addIndex('refresh_tokens', ['revokedAt'], {
      name: 'refresh_tokens_revoked_at_idx'
    });

    // Composite index for cleanup operations
    await queryInterface.addIndex('refresh_tokens', ['expiresAt', 'isActive'], {
      name: 'refresh_tokens_expires_active_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('refresh_tokens');
  }
};
