# Technical Stack

> Last Updated: July 25, 2025
> Version: 1.0.0

## Core Technologies

### Backend Framework
- **Framework:** Node.js with Express
- **Version:** 21.0+
- **Architecture:** RESTful API and microservices.

### Database
- **Primary:** Sqllite for development and PostgreSQL for production (production-ready alternative to SQLite)
- **ORM:** Sequelize
- **Caching:** Redis for session management and real-time features

## Frontend Stack

### JavaScript Framework
- **Framework:** Angular
- **Version:** Latest stable (17+)
- **State Management:** NgRx for complex state management

### Import Strategy
- **Strategy:** Node.js modules
- **Package Manager:** npm
- **Node Version:** 22 LTS

### CSS Framework
- **Framework:** TailwindCSS
- **Version:** 4.0+
- **PostCSS:** Yes
- **Components:** DaisyUI for consistent UI components

### UI Components
- **Library:** Angular Material + DaisyUI
- **Custom Components:** TaskFlow Design System
- **Icons:** Tailwind CSS Icons + Heroicons

## Real-Time Features

### WebSocket Implementation
- **Library:** Socket.io
- **Use Cases:** Live collaboration, real-time updates, notifications
- **Scaling:** Redis adapter for multi-server deployment

### State Synchronization
- **Strategy:** Optimistic updates with conflict resolution
- **Offline Support:** Service workers for offline-first experience

## Infrastructure

### Application Hosting
- **Platform:** Digital Ocean App Platform
- **Scaling:** Auto-scaling based on load
- **Environment:** Docker containers

### Database Hosting
- **Provider:** Digital Ocean Managed PostgreSQL
- **Backups:** Daily automated with point-in-time recovery
- **Monitoring:** Built-in performance monitoring

### Asset Storage
- **Provider:** Digital Ocean Spaces (S3-compatible)
- **CDN:** Digital Ocean CDN
- **File Types:** User uploads, exports, attachments

## Deployment & DevOps

### CI/CD Pipeline
- **Platform:** GitHub Actions
- **Trigger:** Push to main/staging branches
- **Tests:** Unit, integration, and E2E tests
- **Security:** Automated security scanning

### Environments
- **Production:** main branch (production.taskflow.app)
- **Staging:** staging branch (staging.taskflow.app)
- **Development:** Local development with Docker Compose

### Monitoring & Analytics
- **Application Monitoring:** New Relic or DataDog
- **Error Tracking:** Sentry
- **Analytics:** Custom analytics dashboard + Google Analytics
- **Logging:** Centralized logging with structured logs

## Security & Compliance

### Authentication
- **Primary:** JWT with refresh tokens
- **SSO:** SAML 2.0 and OAuth 2.0 support
- **MFA:** Time-based OTP support

### Data Protection
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Privacy:** GDPR and CCPA compliant
- **Backup Security:** Encrypted backups with secure key management

## Development Tools

### Code Quality
- **Linting:** ESLint + Prettier for TypeScript/JavaScript
- **Testing:** Jest + Cypress for comprehensive testing
- **Type Safety:** Full TypeScript implementation

### API Documentation
- **Documentation:** OpenAPI 3.0 specification
- **Interactive Docs:** Swagger UI for API exploration
- **SDK Generation:** Auto-generated client SDKs
