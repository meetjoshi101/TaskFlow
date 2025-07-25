# TaskFlow - Project Management SaaS Platform

A comprehensive project management platform designed for development teams (5-50 members) with multi-tenant architecture and real-time collaboration features.

## 🏗️ Project Structure

```
TaskFlow/
├── backend/                 # Node.js/Express API server
│   ├── src/                # Source code
│   │   ├── models/         # Sequelize database models
│   │   ├── controllers/    # API route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Database and app configuration
│   │   ├── migrations/     # Database migration files
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Utility functions
│   ├── __tests__/          # Backend test files
│   ├── package.json        # Backend dependencies
│   └── ...
├── frontend/               # Angular client application
│   ├── src/                # Angular source code
│   ├── package.json        # Frontend dependencies
│   └── ...
├── .agent-os/              # Agent OS documentation and specs
├── package.json            # Root workspace configuration
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+
- PostgreSQL 14+ (for production)
- SQLite3 (for development/testing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/meetjoshi101/TaskFlow.git
   cd TaskFlow
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Set up environment variables:**
   ```bash
   # Backend environment
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Development

1. **Start both backend and frontend in development mode:**
   ```bash
   npm run dev
   ```

   Or start them individually:
   ```bash
   # Backend only (API server on http://localhost:3000)
   npm run dev:backend
   
   # Frontend only (Angular dev server on http://localhost:4200)
   npm run dev:frontend
   ```

2. **Run tests:**
   ```bash
   # All tests
   npm test
   
   # Backend tests only
   npm run test:backend
   
   # Frontend tests only
   npm run test:frontend
   ```

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Database operations
npm run db:migrate      # Run migrations
npm run db:seed         # Run seeders
npm run db:reset        # Reset database
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 🛠️ Technology Stack

### Backend
- **Runtime:** Node.js 21+
- **Framework:** Express.js
- **Database:** PostgreSQL (production), SQLite3 (development/testing)
- **ORM:** Sequelize
- **Authentication:** JWT tokens with bcrypt password hashing
- **Real-time:** Socket.io for live collaboration
- **Email:** Nodemailer with SMTP/SendGrid support
- **Testing:** Jest with comprehensive test coverage
- **Security:** Helmet, CORS, rate limiting, input validation

### Frontend
- **Framework:** Angular 17+
- **State Management:** NgRx
- **UI Components:** Angular Material
- **Styling:** SCSS with responsive design
- **Real-time:** Socket.io client integration
- **Testing:** Jasmine and Karma
- **Build:** Angular CLI with Webpack

## 📋 Features

### Core Features
- **Multi-tenant Architecture:** Team-based data isolation
- **User Authentication:** Secure JWT-based auth with refresh tokens
- **Team Management:** Role-based access control (admin, member, viewer)
- **Project Planning:** Hierarchical project structure with tasks
- **Sprint Planning:** Agile workflow support with sprint management
- **Daily Planning:** Task assignment and progress tracking
- **Real-time Collaboration:** Live updates and notifications

### Security Features
- Secure password hashing with bcrypt
- JWT token authentication with automatic refresh
- Multi-tenant data isolation
- Rate limiting and CORS protection
- Input validation and sanitization
- Email verification and password reset

## 🧪 Testing

The project follows Test-Driven Development (TDD) principles:

- **Backend:** Comprehensive Jest test suites for models, controllers, and services
- **Frontend:** Angular testing with Jasmine and Karma
- **Integration:** End-to-end testing with Cypress
- **Security:** Penetration testing for authentication flows

## 📈 Current Development Status

**Phase 1: User Authentication & Team Management** (In Progress)
- [x] Project setup and architecture planning
- [x] Database models and comprehensive test suites
- [ ] Database migrations and model implementation
- [ ] Authentication API endpoints
- [ ] Team management API
- [ ] Email service integration
- [ ] Frontend authentication components
- [ ] Team management UI
- [ ] Security and integration testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Documentation

- [Agent OS Specifications](.agent-os/) - Detailed project specifications and architecture
- [API Documentation](backend/docs/) - Backend API reference
- [Frontend Guide](frontend/docs/) - Angular application guide
- [Database Schema](backend/docs/database.md) - Database design and relationships

## 📧 Contact

For questions and support, please open an issue on GitHub or contact the development team.
