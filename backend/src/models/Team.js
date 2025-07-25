const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Team = sequelize.define('Team', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100],
        notEmpty: true
      }
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 100],
        is: /^[a-z0-9]+(-[a-z0-9]+)*$/,
        notStartsWithDash(value) {
          if (value && value.startsWith('-')) {
            throw new Error('Slug cannot start with a dash');
          }
        },
        notEndsWithDash(value) {
          if (value && value.endsWith('-')) {
            throw new Error('Slug cannot end with a dash');
          }
        },
        noSpaces(value) {
          if (value && value.includes(' ')) {
            throw new Error('Slug cannot contain spaces');
          }
        },
        noUnderscores(value) {
          if (value && value.includes('_')) {
            throw new Error('Slug cannot contain underscores');
          }
        },
        noUppercase(value) {
          if (value && value !== value.toLowerCase()) {
            throw new Error('Slug must be lowercase');
          }
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    logo: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'teams',
    hooks: {
      beforeValidate: (team) => {
        if (team.name && !team.slug) {
          team.slug = team.generateSlug(team.name);
        }
      }
    }
  });

  // Instance Methods
  Team.prototype.generateSlug = function(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s.-]/g, '') // Allow dots temporarily
      .replace(/\./g, '-') // Convert dots to dashes first
      .replace(/\s+/g, '-') // Convert spaces to dashes
      .replace(/-+/g, '-') // Collapse multiple dashes
      .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
      .trim();
  };

  Team.prototype.updateSlug = async function(newName) {
    const baseSlug = this.generateSlug(newName || this.name);
    let slug = baseSlug;
    let counter = 1;

    // Check if slug exists (excluding current team)
    while (await Team.findOne({ 
      where: { 
        slug: slug,
        id: { [sequelize.Sequelize.Op.ne]: this.id }
      } 
    })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
    return this.save();
  };

  Team.prototype.addMember = async function(userId, role = 'member', invitedBy = null) {
    const TeamMember = sequelize.models.TeamMember;
    return TeamMember.create({
      userId: userId,
      teamId: this.id,
      role: role,
      invitedBy: invitedBy,
      invitedAt: invitedBy ? new Date() : null
    });
  };

  Team.prototype.removeMember = async function(userId) {
    const TeamMember = sequelize.models.TeamMember;
    const result = await TeamMember.destroy({
      where: {
        userId: userId,
        teamId: this.id
      }
    });
    return result > 0;
  };

  Team.prototype.updateMemberRole = async function(userId, newRole) {
    const TeamMember = sequelize.models.TeamMember;
    const [updatedCount] = await TeamMember.update(
      { role: newRole },
      {
        where: {
          userId: userId,
          teamId: this.id
        }
      }
    );
    if (updatedCount > 0) {
      return TeamMember.findOne({
        where: { userId: userId, teamId: this.id }
      });
    }
    return null;
  };

  Team.prototype.getMembersByRole = async function(role) {
    const TeamMember = sequelize.models.TeamMember;
    
    return TeamMember.findAll({
      where: {
        teamId: this.id,
        role: role,
        status: 'active'
      },
      include: [{
        model: sequelize.models.User,
        as: 'user'
      }]
    });
  };

  Team.prototype.getMembers = async function() {
    const TeamMember = sequelize.models.TeamMember;
    
    return TeamMember.findAll({
      where: {
        teamId: this.id,
        status: 'active'
      },
      include: [{
        model: sequelize.models.User,
        as: 'user'
      }]
    });
  };

  Team.prototype.getMemberCount = async function() {
    const TeamMember = sequelize.models.TeamMember;
    return TeamMember.count({
      where: {
        teamId: this.id,
        status: 'active'
      }
    });
  };

  Team.prototype.getAdmins = async function() {
    const TeamMember = sequelize.models.TeamMember;
    return TeamMember.findAll({
      where: {
        teamId: this.id,
        role: 'admin',
        status: 'active'
      },
      include: [{
        model: sequelize.models.User,
        as: 'user'
      }]
    });
  };

  Team.prototype.isUserMember = async function(userId) {
    const TeamMember = sequelize.models.TeamMember;
    const membership = await TeamMember.findOne({
      where: {
        userId: userId,
        teamId: this.id,
        status: 'active'
      }
    });
    return !!membership;
  };

  Team.prototype.getUserRole = async function(userId) {
    const TeamMember = sequelize.models.TeamMember;
    const membership = await TeamMember.findOne({
      where: {
        userId: userId,
        teamId: this.id,
        status: 'active'
      }
    });
    return membership ? membership.role : null;
  };

  Team.prototype.isUserAdmin = async function(userId) {
    const role = await this.getUserRole(userId);
    return role === 'admin';
  };

  Team.prototype.updateSettings = function(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    return this.save();
  };

  Team.prototype.getSetting = function(key, defaultValue = null) {
    return this.settings && this.settings[key] !== undefined 
      ? this.settings[key] 
      : defaultValue;
  };

  Team.prototype.setSetting = function(key, value) {
    if (!this.settings) {
      this.settings = {};
    }
    this.settings[key] = value;
    return this.save();
  };

  Team.prototype.activate = function() {
    this.isActive = true;
    return this.save();
  };

  Team.prototype.deactivate = function() {
    this.isActive = false;
    return this.save();
  };

  // Class Methods
  Team.findBySlug = function(slug) {
    return this.findOne({
      where: { 
        slug: slug.toLowerCase(),
        isActive: true
      }
    });
  };

  Team.generateUniqueSlug = async function(name) {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s.-]/g, '') // Allow dots temporarily
      .replace(/\./g, '-') // Convert dots to dashes first
      .replace(/\s+/g, '-') // Convert spaces to dashes
      .replace(/-+/g, '-') // Collapse multiple dashes
      .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (await this.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  };

  Team.getActiveTeams = function() {
    return this.findAll({
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
  };

  Team.getUserTeams = function(userId) {
    const TeamMember = sequelize.models.TeamMember;
    return this.findAll({
      include: [{
        model: TeamMember,
        as: 'memberships',
        where: {
          userId: userId,
          status: 'active'
        }
      }],
      where: { isActive: true },
      order: [['name', 'ASC']]
    });
  };

  Team.searchByName = function(query) {
    return this.findAll({
      where: {
        name: {
          [sequelize.Sequelize.Op.like]: `%${query}%`
        },
        isActive: true
      },
      order: [['name', 'ASC']]
    });
  };

  Team.getTeamStats = async function(teamId) {
    const TeamMember = sequelize.models.TeamMember;
    const TeamInvitation = sequelize.models.TeamInvitation;

    const memberCount = await TeamMember.count({
      where: {
        teamId: teamId,
        status: 'active'
      }
    });

    const adminCount = await TeamMember.count({
      where: {
        teamId: teamId,
        role: 'admin',
        status: 'active'
      }
    });

    const pendingInvitations = await TeamInvitation.count({
      where: {
        teamId: teamId,
        status: 'pending'
      }
    });

    return {
      members: memberCount,
      admins: adminCount,
      pendingInvitations: pendingInvitations
    };
  };

  Team.getRecentTeams = function(limit = 10) {
    return this.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
      limit: limit
    });
  };

  Team.validateSlug = function(slug) {
    return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 100;
  };

  Team.createWithOwner = async function(teamData, userId) {
    const TeamMember = sequelize.models.TeamMember;
    
    // Generate slug if not provided
    if (!teamData.slug) {
      teamData.slug = await this.generateUniqueSlug(teamData.name);
    }
    
    // Set createdBy
    teamData.createdBy = userId;
    
    // Create team
    const team = await this.create(teamData);
    
    // Add creator as admin
    await TeamMember.create({
      userId: userId,
      teamId: team.id,
      role: 'admin',
      status: 'active',
      joinedAt: new Date()
    });
    
    return team;
  };

  // Define associations
  Team.associate = function(models) {
    // Team belongs to user (creator)
    Team.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    // Team has many members through team_members
    Team.belongsToMany(models.User, {
      through: models.TeamMember,
      foreignKey: 'teamId',
      otherKey: 'userId',
      as: 'members'
    });

    // Team has many memberships
    Team.hasMany(models.TeamMember, {
      foreignKey: 'teamId',
      as: 'memberships'
    });

    // Team has many invitations
    Team.hasMany(models.TeamInvitation, {
      foreignKey: 'teamId',
      as: 'invitations'
    });
  };

  return Team;
};
