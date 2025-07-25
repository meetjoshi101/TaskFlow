const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Initialize Sequelize
let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

// Import models
const User = require('./User')(sequelize);
const Team = require('./Team')(sequelize);
const TeamMember = require('./TeamMember')(sequelize);
const TeamInvitation = require('./TeamInvitation')(sequelize);
const RefreshToken = require('./RefreshToken')(sequelize);

// Store models in db object
const db = {
  User,
  Team,
  TeamMember,
  TeamInvitation,
  RefreshToken,
  sequelize,
  Sequelize
};

// Initialize associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
