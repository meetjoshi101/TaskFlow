const { DataTypes, Op } = require('sequelize');
const crypto = require('crypto');

module.exports = (sequelize) => {
  const TeamInvitation = sequelize.define('TeamInvitation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase());
      }
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    invitedBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'member', 'viewer'),
      allowNull: false,
      defaultValue: 'member',
      validate: {
        isIn: [['admin', 'member', 'viewer']]
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'declined', 'expired', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'accepted', 'declined', 'expired', 'cancelled']]
      }
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      defaultValue: () => crypto.randomBytes(32).toString('hex')
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    acceptedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    declinedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cancelledAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'team_invitations',
    hooks: {
      beforeCreate: (invitation, options) => {
        // Generate token if not provided
        invitation.token = invitation.token || crypto.randomBytes(32).toString('hex');
        // Set expiration if not provided (7 days from now)
        invitation.expiresAt = invitation.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['email', 'teamId', 'status'],
        where: {
          status: 'pending'
        }
      }
    ]
  });

  // Instance Methods
  TeamInvitation.prototype.isExpired = function() {
    return this.expiresAt < new Date();
  };

  TeamInvitation.prototype.isPending = function() {
    return this.status === 'pending';
  };

  TeamInvitation.prototype.isValid = function() {
    return this.status === 'pending' && !this.isExpired();
  };

  TeamInvitation.prototype.accept = async function() {
    if (!this.isPending()) {
      throw new Error('Invitation is not pending');
    }
    if (this.isExpired()) {
      throw new Error('Invitation has expired');
    }

    this.status = 'accepted';
    this.acceptedAt = new Date();
    return this.save();
  };

  TeamInvitation.prototype.decline = async function() {
    this.status = 'declined';
    this.declinedAt = new Date();
    return this.save();
  };

  TeamInvitation.prototype.cancel = async function() {
    this.status = 'cancelled';
    this.cancelledAt = new Date();
    return this.save();
  };

  TeamInvitation.prototype.expire = async function() {
    this.status = 'expired';
    return this.save();
  };

  TeamInvitation.prototype.regenerateToken = async function() {
    this.token = crypto.randomBytes(32).toString('hex');
    return this.save();
  };

  TeamInvitation.prototype.extendExpiration = async function(days = 7) {
    this.expiresAt = new Date(this.expiresAt.getTime() + days * 24 * 60 * 60 * 1000);
    return this.save();
  };

  TeamInvitation.prototype.resend = async function() {
    this.token = crypto.randomBytes(32).toString('hex');
    this.sentAt = new Date();
    this.status = 'pending';
    return this.save();
  };

  TeamInvitation.prototype.getAgeInDays = function() {
    const now = new Date();
    const sentDate = new Date(this.sentAt);
    return Math.floor((now - sentDate) / (1000 * 60 * 60 * 24));
  };

  TeamInvitation.prototype.getDaysUntilExpiration = function() {
    const now = new Date();
    const expiryDate = new Date(this.expiresAt);
    return Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
  };

  // Class Methods
  TeamInvitation.findByToken = function(token) {
    return this.findOne({
      where: { token: token }
    });
  };

  TeamInvitation.findValidByToken = function(token) {
    return this.findOne({
      where: {
        token: token,
        status: 'pending',
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });
  };

  TeamInvitation.getPendingInvitations = function(teamId) {
    return this.findAll({
      where: {
        teamId: teamId,
        status: 'pending'
      },
      include: [{
        model: sequelize.models.User,
        as: 'inviter'
      }],
      order: [['sentAt', 'DESC']]
    });
  };

  TeamInvitation.getInvitationsByEmail = function(email) {
    return this.findAll({
      where: {
        email: email.toLowerCase()
      },
      include: [{
        model: sequelize.models.Team,
        as: 'team'
      }, {
        model: sequelize.models.User,
        as: 'inviter'
      }],
      order: [['sentAt', 'DESC']]
    });
  };

  TeamInvitation.getInvitationsByUser = function(userId) {
    return this.findAll({
      where: {
        invitedBy: userId
      },
      include: [{
        model: sequelize.models.Team,
        as: 'team'
      }],
      order: [['sentAt', 'DESC']]
    });
  };

  TeamInvitation.cleanupExpired = async function() {
    const [updatedCount] = await this.update(
      { status: 'expired' },
      {
        where: {
          status: 'pending',
          expiresAt: {
            [Op.lt]: new Date()
          }
        }
      }
    );
    return updatedCount;
  };

  TeamInvitation.isEmailAlreadyInvited = async function(email, teamId) {
    const invitation = await this.findOne({
      where: {
        email: email.toLowerCase(),
        teamId: teamId,
        status: 'pending'
      }
    });
    return !!invitation;
  };

  TeamInvitation.countPendingInvitations = function(teamId) {
    return this.count({
      where: {
        teamId: teamId,
        status: 'pending'
      }
    });
  };

  TeamInvitation.getInvitationStats = async function(teamId) {
    const total = await this.count({
      where: { teamId: teamId }
    });

    const pending = await this.count({
      where: { teamId: teamId, status: 'pending' }
    });

    const accepted = await this.count({
      where: { teamId: teamId, status: 'accepted' }
    });

    const declined = await this.count({
      where: { teamId: teamId, status: 'declined' }
    });

    const expired = await this.count({
      where: { teamId: teamId, status: 'expired' }
    });

    const cancelled = await this.count({
      where: { teamId: teamId, status: 'cancelled' }
    });

    return {
      total,
      pending,
      accepted,
      declined,
      expired,
      cancelled
    };
  };

  TeamInvitation.getExpiringSoon = function(days = 1) {
    const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return this.findAll({
      where: {
        status: 'pending',
        expiresAt: {
          [Op.between]: [new Date(), futureDate]
        }
      },
      include: [{
        model: sequelize.models.Team,
        as: 'team'
      }, {
        model: sequelize.models.User,
        as: 'inviter'
      }]
    });
  };

  TeamInvitation.bulkInvite = async function(emails, teamId, invitedBy, role = 'member', message = null) {
    const invitations = emails.map(email => ({
      email: email.toLowerCase(),
      teamId: teamId,
      invitedBy: invitedBy,
      role: role,
      message: message,
      token: crypto.randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }));

    return this.bulkCreate(invitations, {
      ignoreDuplicates: true,
      returning: true
    });
  };

  TeamInvitation.revokeUserInvitations = function(userId) {
    return this.update(
      { 
        status: 'cancelled',
        cancelledAt: new Date()
      },
      {
        where: {
          invitedBy: userId,
          status: 'pending'
        }
      }
    );
  };

  // Define associations
  TeamInvitation.associate = function(models) {
    // TeamInvitation belongs to Team
    TeamInvitation.belongsTo(models.Team, {
      foreignKey: 'teamId',
      as: 'team'
    });

    // TeamInvitation belongs to User (inviter)
    TeamInvitation.belongsTo(models.User, {
      foreignKey: 'invitedBy',
      as: 'inviter'
    });
  };

  return TeamInvitation;
};
