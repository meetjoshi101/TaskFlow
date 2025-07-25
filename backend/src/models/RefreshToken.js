const { DataTypes } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const RefreshToken = sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    deviceType: {
      type: DataTypes.ENUM('web', 'mobile', 'desktop', 'tablet'),
      allowNull: true
    },
    deviceId: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    revokedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'refresh_tokens',
    hooks: {
      beforeCreate: (token) => {
        if (!token.token) {
          token.token = crypto.randomBytes(40).toString('hex');
        }
        if (!token.expiresAt) {
          token.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        }
      }
    }
  });

  // Instance Methods
  RefreshToken.prototype.isExpired = function() {
    return this.expiresAt < new Date();
  };

  RefreshToken.prototype.isValid = function() {
    return this.isActive && !this.isExpired();
  };

  RefreshToken.prototype.revoke = async function() {
    this.isActive = false;
    this.revokedAt = new Date();
    return this.save();
  };

  RefreshToken.prototype.updateLastUsed = async function() {
    this.lastUsedAt = new Date();
    this.usageCount += 1;
    return this.save();
  };

  RefreshToken.prototype.extendExpiration = async function(days = 7) {
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return this.save();
  };

  RefreshToken.prototype.regenerate = async function() {
    this.token = crypto.randomBytes(40).toString('hex');
    this.isActive = true;
    this.revokedAt = null;
    return this.save();
  };

  RefreshToken.prototype.getAgeInHours = function() {
    const now = new Date();
    const createdDate = new Date(this.createdAt);
    return Math.floor((now - createdDate) / (1000 * 60 * 60));
  };

  RefreshToken.prototype.getHoursUntilExpiration = function() {
    const now = new Date();
    const expiryDate = new Date(this.expiresAt);
    return Math.ceil((expiryDate - now) / (1000 * 60 * 60));
  };

  RefreshToken.prototype.getDaysUntilExpiration = function() {
    const now = new Date();
    const expiryDate = new Date(this.expiresAt);
    return Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  };

  RefreshToken.prototype.needsRenewal = function(thresholdDays = 2) {
    const daysUntilExpiry = this.getDaysUntilExpiration();
    return daysUntilExpiry <= thresholdDays;
  };

  RefreshToken.prototype.getDeviceInfo = function() {
    return {
      type: this.deviceType,
      id: this.deviceId,
      userAgent: this.userAgent,
      ipAddress: this.ipAddress
    };
  };

  // Class Methods
  RefreshToken.findByToken = function(token) {
    return this.findOne({
      where: { token: token }
    });
  };

  RefreshToken.findValidByToken = function(token) {
    return this.findOne({
      where: {
        token: token,
        isActive: true,
        expiresAt: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    });
  };

  RefreshToken.getUserTokens = function(userId) {
    return this.findAll({
      where: { userId: userId },
      order: [['createdAt', 'DESC']]
    });
  };

  RefreshToken.getActiveUserTokens = function(userId) {
    return this.findAll({
      where: {
        userId: userId,
        isActive: true,
        expiresAt: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      },
      order: [['lastUsedAt', 'DESC']]
    });
  };

  RefreshToken.revokeUserTokens = async function(userId) {
    const [updatedCount] = await this.update(
      { 
        isActive: false,
        revokedAt: new Date()
      },
      {
        where: {
          userId: userId,
          isActive: true
        }
      }
    );
    return updatedCount;
  };

  RefreshToken.revokeUserTokensByDevice = async function(userId, deviceType) {
    const [updatedCount] = await this.update(
      { 
        isActive: false,
        revokedAt: new Date()
      },
      {
        where: {
          userId: userId,
          deviceType: deviceType,
          isActive: true
        }
      }
    );
    return updatedCount;
  };

  RefreshToken.cleanupExpired = async function() {
    const [updatedCount] = await this.update(
      { 
        isActive: false,
        revokedAt: new Date()
      },
      {
        where: {
          isActive: true,
          expiresAt: {
            [sequelize.Sequelize.Op.lt]: new Date()
          }
        }
      }
    );
    return updatedCount;
  };

  RefreshToken.getTokensNeedingRenewal = function(thresholdDays = 2) {
    const thresholdDate = new Date(Date.now() + thresholdDays * 24 * 60 * 60 * 1000);
    return this.findAll({
      where: {
        isActive: true,
        expiresAt: {
          [sequelize.Sequelize.Op.between]: [new Date(), thresholdDate]
        }
      },
      include: [{
        model: sequelize.models.User,
        as: 'user'
      }]
    });
  };

  RefreshToken.countUserActiveTokens = function(userId) {
    return this.count({
      where: {
        userId: userId,
        isActive: true,
        expiresAt: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    });
  };

  RefreshToken.getUserTokenStats = async function(userId) {
    const total = await this.count({
      where: { userId: userId }
    });

    const active = await this.count({
      where: {
        userId: userId,
        isActive: true,
        expiresAt: {
          [sequelize.Sequelize.Op.gt]: new Date()
        }
      }
    });

    const expired = await this.count({
      where: {
        userId: userId,
        expiresAt: {
          [sequelize.Sequelize.Op.lt]: new Date()
        }
      }
    });

    const revoked = await this.count({
      where: {
        userId: userId,
        isActive: false,
        revokedAt: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    });

    return {
      total,
      active,
      expired,
      revoked
    };
  };

  RefreshToken.createWithDeviceInfo = function(userId, deviceInfo) {
    return this.create({
      userId: userId,
      deviceType: deviceInfo.type || null,
      deviceId: deviceInfo.id || null,
      userAgent: deviceInfo.userAgent || null,
      ipAddress: deviceInfo.ipAddress || null
    });
  };

  RefreshToken.rotateToken = async function(oldToken) {
    const existingToken = await this.findValidByToken(oldToken);
    if (!existingToken) {
      throw new Error('Invalid refresh token');
    }

    // Revoke old token
    await existingToken.revoke();

    // Create new token with same device info
    const newToken = await this.create({
      userId: existingToken.userId,
      deviceType: existingToken.deviceType,
      deviceId: existingToken.deviceId,
      userAgent: existingToken.userAgent,
      ipAddress: existingToken.ipAddress
    });

    return newToken;
  };

  RefreshToken.cleanupOldTokens = async function(keepDays = 30) {
    const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
    const deletedCount = await this.destroy({
      where: {
        isActive: false,
        revokedAt: {
          [sequelize.Sequelize.Op.lt]: cutoffDate
        }
      }
    });
    return deletedCount;
  };

  RefreshToken.getUserTokensByDevice = function(userId, deviceType) {
    return this.findAll({
      where: {
        userId: userId,
        deviceType: deviceType
      },
      order: [['createdAt', 'DESC']]
    });
  };

  RefreshToken.getRecentlyUsedTokens = function(userId, hours = 24) {
    const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.findAll({
      where: {
        userId: userId,
        lastUsedAt: {
          [sequelize.Sequelize.Op.gt]: cutoffDate
        }
      },
      order: [['lastUsedAt', 'DESC']]
    });
  };

  // Define associations
  RefreshToken.associate = function(models) {
    // RefreshToken belongs to User
    RefreshToken.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return RefreshToken;
};
