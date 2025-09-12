# Quickstart: Create Taskify

## Prerequisites
- Node.js 18+
- npm or yarn
- Angular CLI 17+

## Backend Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Initialize database**:
   ```bash
   npm run init-db
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   Server will run on http://localhost:3000

## Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```
   App will be available at http://localhost:4200

## Usage

1. Open http://localhost:4200 in your browser
2. Select a user from the predefined list
3. View available projects
4. Click on a project to see the Kanban board
5. Drag and drop tasks between columns
6. Add comments to tasks
7. Edit/delete your own comments

## API Endpoints

- `GET /api/users` - List all users
- `GET /api/projects` - List all projects
- `GET /api/projects/:id/tasks` - Get tasks for a project
- `POST /api/projects/:id/tasks` - Create a new task
- `PUT /api/tasks/:id/status` - Update task status
- `GET /api/tasks/:id/comments` - Get comments for a task
- `POST /api/tasks/:id/comments` - Add a comment
- `PUT /api/comments/:id` - Update a comment
- `DELETE /api/comments/:id` - Delete a comment
- `GET /api/notifications` - Get notifications

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```