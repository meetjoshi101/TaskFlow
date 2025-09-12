# Research: Create Taskify

## Decisions

### Backend Framework
**Decision**: Use Express.js for the backend REST API  
**Rationale**: Lightweight, widely adopted for Node.js APIs, good middleware ecosystem for authentication, CORS, etc.  
**Alternatives Considered**: 
- Fastify: Faster but steeper learning curve
- Koa: More modern async/await but smaller community

### Database
**Decision**: Use SQLite with sqlite3 npm package  
**Rationale**: File-based, no server setup required, suitable for small-scale app with 5 users and 3 projects  
**Alternatives Considered**: 
- PostgreSQL: Overkill for this scale
- MongoDB: Not relational, but tasks have relations

### Frontend Framework
**Decision**: Use Angular 20 with Angular Material for UI components  
**Rationale**: Full-featured framework with strong typing, good for complex UIs like Kanban boards  
**Alternatives Considered**: 
- React: More flexible but requires more setup
- Vue: Simpler but less enterprise adoption

### Drag-and-Drop
**Decision**: Use Angular CDK Drag and Drop  
**Rationale**: Official Angular solution, integrates well with Angular's change detection  
**Alternatives Considered**: 
- Third-party libraries like ng2-dragula: More features but potential maintenance issues

### Real-Time Updates
**Decision**: Use Socket.io for real-time synchronization  
**Rationale**: Handles WebSockets with fallbacks, easy to integrate with Express  
**Alternatives Considered**: 
- Server-Sent Events: Simpler but unidirectional
- WebSockets directly: Lower level, more boilerplate

### Testing
**Decision**: Jest for backend, Jasmine/Karma for frontend  
**Rationale**: Jest is standard for Node.js, Karma for Angular e2e  
**Alternatives Considered**: 
- Mocha/Chai: More flexible but requires more configuration

### Project Structure
**Decision**: Separate backend/ and frontend/ directories  
**Rationale**: Clear separation of concerns, easier deployment  
**Alternatives Considered**: 
- Monorepo with Nx: More complex for small project