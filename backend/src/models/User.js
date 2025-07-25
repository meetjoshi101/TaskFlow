const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase());
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [8, 255]
      }
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      get() {
        return this.getDataValue('isEmailVerified');
      }
    },
    emailVerificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    emailVerificationExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'users',
    // Add virtual fields for test compatibility
    getterMethods: {
      emailVerified() {
        return this.isEmailVerified;
      },
      passwordHash() {
        return this.password;
      },
      fullName() {
        return `${this.firstName} ${this.lastName}`;
      },
      lastLogin() {
        return this.lastLoginAt;
      }
    },
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      }
    }
  });

  // Instance Methods
  User.prototype.verifyPassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  User.prototype.verifyEmail = async function(token) {
    if (this.emailVerificationToken === token && this.isEmailVerificationTokenValid()) {
      this.clearEmailVerificationToken();
      await this.save();
      return true;
    }
    return false;
  };

  User.prototype.resetPassword = async function(token, newPassword) {
    if (this.passwordResetToken === token && this.isPasswordResetTokenValid()) {
      this.password = newPassword;
      this.clearPasswordResetToken();
      await this.save();
      return true;
    }
    return false;
  };

  User.prototype.generateEmailVerificationToken = async function() {
    this.emailVerificationToken = crypto.randomBytes(32).toString('hex');
    this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.save();
    return this.emailVerificationToken;
  };

  User.prototype.generatePasswordResetToken = async function() {
    this.passwordResetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await this.save();
    return this.passwordResetToken;
  };

  User.prototype.clearEmailVerificationToken = function() {
    this.emailVerificationToken = null;
    this.emailVerificationExpires = null;
    this.isEmailVerified = true;
  };

  User.prototype.clearPasswordResetToken = function() {
    this.passwordResetToken = null;
    this.passwordResetExpires = null;
  };

  User.prototype.updateLastLogin = function() {
    this.lastLoginAt = new Date();
    return this.save();
  };

  User.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  User.prototype.getInitials = function() {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  };

  User.prototype.isEmailVerificationTokenValid = function() {
    if (!this.emailVerificationToken || !this.emailVerificationExpires) {
      return false;
    }
    return this.emailVerificationExpires > new Date();
  };

  User.prototype.isPasswordResetTokenValid = function() {
    if (!this.passwordResetToken || !this.passwordResetExpires) {
      return false;
    }
    return this.passwordResetExpires > new Date();
  };

  User.prototype.activate = function() {
    this.isActive = true;
    return this.save();
  };

  User.prototype.deactivate = function() {
    this.isActive = false;
    return this.save();
  };

  // Class Methods
  User.findByEmail = function(email) {
    return this.findOne({ 
      where: { 
        email: email.toLowerCase() 
      } 
    });
  };

  User.findByEmailVerificationToken = function(token) {
    return this.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    });
  };

  User.findByVerificationToken = function(token) {
    return this.findByEmailVerificationToken(token);
  };

  User.findByPasswordResetToken = function(token) {
    return this.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    });
  };

  User.getActiveUsers = function() {
    return this.findAll({
      where: { isActive: true }
    });
  };

  User.getUnverifiedUsers = function() {
    return this.findAll({
      where: { 
        isEmailVerified: false,
        isActive: true
      }
    });
  };

  User.searchByName = function(query) {
    return this.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          {
            firstName: {
              [sequelize.Sequelize.Op.like]: `%${query}%`
            }
          },
          {
            lastName: {
              [sequelize.Sequelize.Op.like]: `%${query}%`
            }
          }
        ],
        isActive: true
      }
    });
  };

  User.cleanupExpiredTokens = async function() {
    const now = new Date();
    const [updatedCount] = await this.update(
      {
        emailVerificationToken: null,
        emailVerificationExpires: null,
        passwordResetToken: null,
        passwordResetExpires: null
      },
      {
        where: {
          [sequelize.Sequelize.Op.or]: [
            {
              emailVerificationExpires: {
                [sequelize.Sequelize.Op.lt]: now
              }
            },
            {
              passwordResetExpires: {
                [sequelize.Sequelize.Op.lt]: now
              }
            }
          ]
        }
      }
    );
    return updatedCount;
  };

  // Define associations
  User.associate = function(models) {
    // User creates teams
    User.hasMany(models.Team, {
      foreignKey: 'createdBy',
      as: 'createdTeams'
    });

    // User belongs to many teams through team_members
    User.belongsToMany(models.Team, {
      through: models.TeamMember,
      foreignKey: 'userId',
      otherKey: 'teamId',
      as: 'teams'
    });

    // User has many team memberships
    User.hasMany(models.TeamMember, {
      foreignKey: 'userId',
      as: 'memberships'
    });

    // User invites others to teams
    User.hasMany(models.TeamInvitation, {
      foreignKey: 'invitedBy',
      as: 'sentInvitations'
    });

    // User has many refresh tokens
    User.hasMany(models.RefreshToken, {
      foreignKey: 'userId',
      as: 'refreshTokens'
    });

    // User invites team members
    User.hasMany(models.TeamMember, {
      foreignKey: 'invitedBy',
      as: 'invitedMembers'
    });
  };

  return User;
};
