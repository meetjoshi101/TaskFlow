# Data Model: Create Taskify

## Entities

### User
- **id**: integer (primary key, auto-increment)
- **name**: string (required, unique)
- **role**: string (required, enum: 'product_manager', 'engineer')

**Validation Rules**:
- Name must be non-empty, max 50 chars
- Role must be one of the predefined values

### Project
- **id**: integer (primary key, auto-increment)
- **name**: string (required, unique)

**Relationships**:
- Has many Tasks

**Validation Rules**:
- Name must be non-empty, max 100 chars

### Task
- **id**: integer (primary key, auto-increment)
- **title**: string (required)
- **description**: string (optional)
- **status**: string (required, enum: 'To Do', 'In Progress', 'In Review', 'Done')
- **assignedUserId**: integer (foreign key to User, nullable)
- **projectId**: integer (foreign key to Project, required)

**Relationships**:
- Belongs to User (assignedUser)
- Belongs to Project
- Has many Comments

**Validation Rules**:
- Title must be non-empty, max 200 chars
- Description max 1000 chars
- Status must be one of the predefined values
- assignedUserId must reference existing User or be null

**State Transitions**:
- Any status can transition to any other status (drag-and-drop)

### Comment
- **id**: integer (primary key, auto-increment)
- **text**: string (required)
- **authorId**: integer (foreign key to User, required)
- **taskId**: integer (foreign key to Task, required)
- **createdAt**: datetime (auto-generated)
- **updatedAt**: datetime (auto-generated on update)

**Relationships**:
- Belongs to User (author)
- Belongs to Task

**Validation Rules**:
- Text must be non-empty, max 500 chars
- authorId must reference existing User
- taskId must reference existing Task

**Permissions**:
- Only author can edit/delete their own comments
- All users can view all comments

## Database Schema (SQLite)

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('product_manager', 'engineer'))
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('To Do', 'In Progress', 'In Review', 'Done')),
  assignedUserId INTEGER,
  projectId INTEGER NOT NULL,
  FOREIGN KEY (assignedUserId) REFERENCES users(id),
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  authorId INTEGER NOT NULL,
  taskId INTEGER NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (authorId) REFERENCES users(id),
  FOREIGN KEY (taskId) REFERENCES tasks(id) ON DELETE CASCADE
);
```

## Sample Data

### Users
- Alice Johnson (product_manager)
- Bob Smith (engineer)
- Carol Davis (engineer)
- David Wilson (engineer)
- Eve Brown (engineer)

### Projects
- TaskFlow MVP
- Mobile App Redesign
- API Optimization

### Tasks (per project: 5-15 randomly distributed)
- Status distribution: Mix of all 4 statuses, at least 1 per status