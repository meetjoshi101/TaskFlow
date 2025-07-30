const app = require('./app');
const { sequelize } = require('./models');
const emailService = require('./utils/emailService');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync database (in development only)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync();
      console.log('Database synchronized.');
    }

    // Initialize email service
    try {
      await emailService.initialize();
      console.log('Email service initialized successfully.');
    } catch (emailError) {
      console.warn('Email service initialization failed:', emailError.message);
      console.warn('Email functionality will be disabled.');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 TaskFlow backend server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🧪 API Base URL: http://localhost:${PORT}/api`);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle process termination
const gracefulShutdown = async () => {
  console.log('Received termination signal, shutting down gracefully...');
  
  try {
    await sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
startServer();
