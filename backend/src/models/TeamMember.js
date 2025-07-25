const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TeamMember = sequelize.define('TeamMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    teamId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'member', 'viewer'),
      allowNull: false,
      defaultValue: 'member'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active'
    },
    invitedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    invitedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'team_members',
    indexes: [
      {
        unique: true,
        fields: ['userId', 'teamId']
      }
    ]
  });

  // Instance Methods
  TeamMember.prototype.updateRole = async function(newRole) {
    const validRoles = ['admin', 'member', 'viewer'];
    if (!validRoles.includes(newRole)) {
      throw new Error(`Invalid role: ${newRole}`);
    }
    this.role = newRole;
    return this.save();
  };

  TeamMember.prototype.updateStatus = async function(newStatus) {
    const validStatuses = ['active', 'inactive', 'suspended'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status: ${newStatus}`);
    }
    this.status = newStatus;
    return this.save();
  };

  TeamMember.prototype.isAdmin = function() {
    return this.role === 'admin';
  };

  TeamMember.prototype.isActive = function() {
    return this.status === 'active';
  };

  TeamMember.prototype.canManageTeam = function() {
    return this.role === 'admin' && this.status === 'active';
  };

  TeamMember.prototype.canInviteMembers = function() {
    return (this.role === 'admin' || this.role === 'member') && this.status === 'active';
  };

  TeamMember.prototype.getMembershipDuration = function() {
    const now = new Date();
    const joinDate = new Date(this.joinedAt);
    return Math.floor((now - joinDate) / (1000 * 60 * 60 * 24)); // Days
  };

  // Class Methods
  TeamMember.findByUserAndTeam = function(userId, teamId) {
    return this.findOne({
      where: {
        userId: userId,
        teamId: teamId
      }
    });
  };

  TeamMember.getTeamMembersByRole = function(teamId, role) {
    return this.findAll({
      where: {
        teamId: teamId,
        role: role
      },
      include: [{
        model: sequelize.models.User,
        as: 'user'
      }]
    });
  };

  TeamMember.getTeamMembersByStatus = function(teamId, status) {
    return this.findAll({
      where: {
        teamId: teamId,
        status: status
      },
      include: [{
        model: sequelize.models.User,
        as: 'user'
      }]
    });
  };

  TeamMember.getUserTeams = function(userId) {
    return this.findAll({
      where: {
        userId: userId
      },
      include: [{
        model: sequelize.models.Team,
        as: 'team'
      }]
    });
  };

  TeamMember.countTeamMembers = function(teamId) {
    return this.count({
      where: {
        teamId: teamId,
        status: 'active'
      }
    });
  };

  TeamMember.isUserTeamMember = async function(userId, teamId) {
    const membership = await this.findOne({
      where: {
        userId: userId,
        teamId: teamId,
        status: 'active'
      }
    });
    return !!membership;
  };

  TeamMember.getUserRoleInTeam = async function(userId, teamId) {
    const membership = await this.findOne({
      where: {
        userId: userId,
        teamId: teamId,
        status: 'active'
      }
    });
    return membership ? membership.role : null;
  };

  TeamMember.getTeamAdmins = function(teamId) {
    return this.findAll({
      where: {
        teamId: teamId,
        role: 'admin',
        status: 'active'
      },
      include: [{
        model: sequelize.models.User,
        as: 'user'
      }]
    });
  };

  TeamMember.getActiveTeamMembers = function(teamId) {
    return this.findAll({
      where: {
        teamId: teamId,
        status: 'active'
      },
      include: [{
        model: sequelize.models.User,
        as: 'user'
      }],
      order: [['joinedAt', 'ASC']]
    });
  };

  TeamMember.getUserActiveTeams = function(userId) {
    return this.findAll({
      where: {
        userId: userId,
        status: 'active'
      },
      include: [{
        model: sequelize.models.Team,
        as: 'team',
        where: { isActive: true }
      }],
      order: [[{ model: sequelize.models.Team, as: 'team' }, 'name', 'ASC']]
    });
  };

  TeamMember.bulkUpdateRole = async function(teamId, userIds, newRole) {
    const [updatedCount] = await this.update(
      { role: newRole },
      {
        where: {
          teamId: teamId,
          userId: {
            [sequelize.Sequelize.Op.in]: userIds
          }
        }
      }
    );
    return updatedCount;
  };

  TeamMember.removeUserFromTeam = function(userId, teamId) {
    return this.destroy({
      where: {
        userId: userId,
        teamId: teamId
      }
    });
  };

  TeamMember.getTeamMembershipStats = async function(teamId) {
    const total = await this.count({
      where: { teamId: teamId }
    });

    const active = await this.count({
      where: { teamId: teamId, status: 'active' }
    });

    const admins = await this.count({
      where: { teamId: teamId, role: 'admin', status: 'active' }
    });

    const members = await this.count({
      where: { teamId: teamId, role: 'member', status: 'active' }
    });

    const viewers = await this.count({
      where: { teamId: teamId, role: 'viewer', status: 'active' }
    });

    return {
      total,
      active,
      admins,
      members,
      viewers
    };
  };

  // Define associations
  TeamMember.associate = function(models) {
    // TeamMember belongs to User
    TeamMember.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // TeamMember belongs to Team
    TeamMember.belongsTo(models.Team, {
      foreignKey: 'teamId',
      as: 'team'
    });

    // TeamMember belongs to User (inviter)
    TeamMember.belongsTo(models.User, {
      foreignKey: 'invitedBy',
      as: 'inviter'
    });
  };

  return TeamMember;
};
