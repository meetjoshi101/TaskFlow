# TaskFlow Backend API

Node.js/Express backend server for the TaskFlow project management platform.

## 🏗️ Architecture

- **Framework:** Express.js with RESTful API design
- **Database:** PostgreSQL with Sequelize ORM
- **Authentication:** JWT tokens with refresh token rotation
- **Multi-tenancy:** Team-based data isolation
- **Real-time:** Socket.io for live collaboration
- **Testing:** Jest with comprehensive test coverage

## 📁 Directory Structure

```
backend/
├── src/
│   ├── models/           # Sequelize database models
│   │   ├── User.js       # User authentication model
│   │   ├── Team.js       # Team/organization model
│   │   ├── TeamMember.js # Team membership model
│   │   ├── TeamInvitation.js # Team invitation model
│   │   ├── RefreshToken.js   # JWT refresh tokens
│   │   └── index.js      # Model associations and exports
│   ├── controllers/      # API route controllers
│   ├── middleware/       # Express middleware
│   ├── services/         # Business logic services
│   ├── config/          # Database and app configuration
│   ├── migrations/      # Database migration files
│   └── utils/           # Utility functions
├── __tests__/           # Test files
│   └── models/          # Model test suites
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts with authentication
- **teams** - Team/organization entities
- **team_members** - Team membership with roles
- **team_invitations** - Team invitation system
- **refresh_tokens** - JWT refresh token management

### Key Features
- Multi-tenant data isolation per team
- Role-based access control (admin, member, viewer)
- Secure password hashing with bcrypt
- JWT authentication with refresh token rotation
- Email verification and password reset flows

## 🚀 Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (production) or SQLite3 (development)
- npm 9+

### Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev         # Start development server with hot reload
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode
npm run db:migrate  # Run database migrations
npm run db:seed     # Run database seeders
npm run db:reset    # Reset database (drop + migrate + seed)
npm start           # Start production server
npm run build       # Build for production
```

## 🧪 Testing

The backend follows Test-Driven Development (TDD):

```bash
# Run all tests
npm test

# Run specific test file
npm test User.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch
```

### Test Structure
- **Model Tests:** Comprehensive testing of Sequelize models
- **Controller Tests:** API endpoint testing
- **Service Tests:** Business logic testing
- **Integration Tests:** End-to-end API testing
- **Security Tests:** Authentication and authorization testing

## 🔐 Security Features

- **Password Security:** bcrypt hashing with configurable rounds
- **JWT Authentication:** Access + refresh token pattern
- **Rate Limiting:** Configurable rate limits per endpoint
- **CORS Protection:** Configurable cross-origin resource sharing
- **Input Validation:** Comprehensive request validation
- **SQL Injection Prevention:** Sequelize ORM parameterized queries
- **Multi-tenant Isolation:** Team-based data segregation

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset confirmation
- `POST /api/auth/verify-email` - Email verification

### Team Management Endpoints
- `GET /api/teams` - List user teams
- `POST /api/teams` - Create new team
- `GET /api/teams/:id` - Get team details
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team
- `GET /api/teams/:id/members` - List team members
- `POST /api/teams/:id/invite` - Invite team member
- `PUT /api/teams/:id/members/:userId` - Update member role
- `DELETE /api/teams/:id/members/:userId` - Remove member

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/taskflow
NODE_ENV=development

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Email
EMAIL_FROM=noreply@taskflow.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password

# Server
PORT=3000
CORS_ORIGIN=http://localhost:4200
```

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker Support
```dockerfile
# Dockerfile included for containerized deployment
docker build -t taskflow-backend .
docker run -p 3000:3000 taskflow-backend
```

## 📈 Performance Considerations

- **Database Indexing:** Optimized indexes for query performance
- **Connection Pooling:** Sequelize connection pool configuration
- **Caching:** Redis integration for session and data caching
- **Rate Limiting:** Protection against API abuse
- **Query Optimization:** Efficient database queries with proper associations

## 🔍 Monitoring & Logging

- **Request Logging:** Morgan HTTP request logger
- **Error Handling:** Centralized error handling middleware
- **Health Checks:** API health and database connectivity endpoints
- **Performance Metrics:** Response time and database query monitoring

## 🤝 Contributing

1. Follow TDD principles - write tests first
2. Ensure all tests pass before submitting PR
3. Follow ESLint configuration for code style
4. Update API documentation for new endpoints
5. Add proper error handling and validation
