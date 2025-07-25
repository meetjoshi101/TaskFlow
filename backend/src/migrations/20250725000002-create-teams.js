'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('teams', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
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
      website: {
        type: Sequelize.STRING(255),
        allowNull: true,
        validate: {
          isUrl: true
        }
      },
      logo: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      settings: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    // Add indexes for performance and uniqueness
    await queryInterface.addIndex('teams', ['slug'], {
      name: 'teams_slug_unique',
      unique: true
    });

    await queryInterface.addIndex('teams', ['createdBy'], {
      name: 'teams_created_by_idx'
    });

    await queryInterface.addIndex('teams', ['isActive'], {
      name: 'teams_is_active_idx'
    });

    await queryInterface.addIndex('teams', ['name'], {
      name: 'teams_name_idx'
    });

    await queryInterface.addIndex('teams', ['createdAt'], {
      name: 'teams_created_at_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('teams');
  }
};
