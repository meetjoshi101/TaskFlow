# Tasks: Create Taskify

**Input**: Design documents from `/wor- [ ] T018 [P] Integration test user selection scenario in backend/tests/integration/test_user_selection.js
- [ ] T019 [P] Integration test project view scenario in backend/tests/integration/test_project_view.js
- [ ] T020 [P] Integration test task management scenario in backend/tests/integration/test_task_management.jsaces/TaskFlow/specs/001-create-taskify-team/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below assume web app structure

## Phase 3.1: Setup
- [ ] T001 Create backend project structure per implementation plan
- [ ] T002 Create frontend project structure per implementation plan
- [ ] T003 Initialize backend with Node.js Express dependencies
- [ ] T004 Initialize frontend with Angular 20 dependencies
- [ ] T005 [P] Configure backend linting and formatting tools
- [ ] T006 [P] Configure frontend linting and formatting tools

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**
- [ ] T007 [P] Contract test GET /api/users in backend/tests/contract/test_users_get.js
- [ ] T008 [P] Contract test GET /api/projects in backend/tests/contract/test_projects_get.js
- [ ] T009 [P] Contract test POST /api/projects in backend/tests/contract/test_projects_post.js
- [ ] T010 [P] Contract test GET /api/projects/:id/tasks in backend/tests/contract/test_tasks_get.js
- [ ] T011 [P] Contract test POST /api/projects/:id/tasks in backend/tests/contract/test_tasks_post.js
- [ ] T012 [P] Contract test PUT /api/tasks/:id/status in backend/tests/contract/test_tasks_status_put.js
- [ ] T013 [P] Contract test GET /api/tasks/:id/comments in backend/tests/contract/test_comments_get.js
- [ ] T014 [P] Contract test POST /api/tasks/:id/comments in backend/tests/contract/test_comments_post.js
- [ ] T015 [P] Contract test PUT /api/comments/:id in backend/tests/contract/test_comments_put.js
- [ ] T016 [P] Contract test DELETE /api/comments/:id in backend/tests/contract/test_comments_delete.js
- [ ] T017 [P] Contract test GET /api/notifications in backend/tests/contract/test_notifications_get.js
- [ ] T018 [P] Integration test user selection scenario in backend/tests/integration/test_user_selection.js
- [ ] T018 [P] Integration test project view scenario in backend/tests/integration/test_project_view.js
- [ ] T019 [P] Integration test task management scenario in backend/tests/integration/test_task_management.js

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T021 [P] User model in backend/src/models/user.js (see data-model.md#User)
- [ ] T022 [P] Project model in backend/src/models/project.js (see data-model.md#Project)
- [ ] T023 [P] Task model in backend/src/models/task.js (see data-model.md#Task)
- [ ] T024 [P] Comment model in backend/src/models/comment.js (see data-model.md#Comment)
- [ ] T025 [P] Database connection and migrations in backend/src/db/index.js (see data-model.md#Database Schema)
- [ ] T026 [P] User service in backend/src/services/userService.js
- [ ] T027 [P] Project service in backend/src/services/projectService.js
- [ ] T028 [P] Task service in backend/src/services/taskService.js
- [ ] T029 [P] Comment service in backend/src/services/commentService.js
- [ ] T030 GET /api/users endpoint in backend/src/api/users.js (see contracts/api.yaml#/paths/~1users/get)
- [ ] T031 GET /api/projects endpoint in backend/src/api/projects.js (see contracts/api.yaml#/paths/~1projects/get)
- [ ] T032 POST /api/projects endpoint in backend/src/api/projects.js (see contracts/api.yaml#/paths/~1projects/post)
- [ ] T033 GET /api/projects/:id/tasks endpoint in backend/src/api/tasks.js (see contracts/api.yaml#/paths/~1projects~1{projectId}~1tasks/get)
- [ ] T034 POST /api/projects/:id/tasks endpoint in backend/src/api/tasks.js (see contracts/api.yaml#/paths/~1projects~1{projectId}~1tasks/post)
- [ ] T035 PUT /api/tasks/:id/status endpoint in backend/src/api/tasks.js (see contracts/api.yaml#/paths/~1tasks~1{taskId}~1status/put)
- [ ] T036 GET /api/tasks/:id/comments endpoint in backend/src/api/comments.js (see contracts/api.yaml#/paths/~1tasks~1{taskId}~1comments/get)
- [ ] T037 POST /api/tasks/:id/comments endpoint in backend/src/api/comments.js (see contracts/api.yaml#/paths/~1tasks~1{taskId}~1comments/post)
- [ ] T038 PUT /api/comments/:id endpoint in backend/src/api/comments.js (see contracts/api.yaml#/paths/~1comments~1{commentId}/put)
- [ ] T039 DELETE /api/comments/:id endpoint in backend/src/api/comments.js (see contracts/api.yaml#/paths/~1comments~1{commentId}/delete)
- [ ] T040 GET /api/notifications endpoint in backend/src/api/notifications.js (see contracts/api.yaml#/paths/~1notifications/get)
- [ ] T041 Main server file in backend/src/server.js
- [ ] T042 [P] User component in frontend/src/app/components/user-selector/ (see spec.md#User Scenarios & Testing)
- [ ] T043 [P] Project list component in frontend/src/app/components/project-list/
- [ ] T044 [P] Kanban board component in frontend/src/app/components/kanban-board/ (use Angular CDK for drag-and-drop, see research.md#Drag-and-Drop)
- [ ] T045 [P] Task card component in frontend/src/app/components/task-card/
- [ ] T046 [P] Comment component in frontend/src/app/components/comment/ (implement edit/delete permissions, see spec.md#Functional Requirements FR-008)
- [ ] T047 [P] API service in frontend/src/app/services/api.service.ts (see contracts/api.yaml)
- [ ] T048 [P] WebSocket service for real-time updates in frontend/src/app/services/websocket.service.ts (see research.md#Real-Time Updates)
- [ ] T049 Main app component in frontend/src/app/app.component.ts
- [ ] T050 App routing in frontend/src/app/app-routing.module.ts

## Phase 3.4: Integration
- [ ] T051 Connect backend to SQLite database and create schema (see data-model.md#Database Schema)
- [ ] T052 CORS middleware for frontend-backend communication
- [ ] T053 Socket.io integration for real-time updates (see research.md#Real-Time Updates)
- [ ] T054 Error handling middleware
- [ ] T055 Logging middleware
- [ ] T056 Authentication middleware (user selection)
- [ ] T057 Seed database with sample data (see data-model.md#Sample Data)

## Phase 3.5: Polish
- [ ] T058 [P] Backend unit tests for services in backend/tests/unit/
- [ ] T059 [P] Frontend unit tests for components in frontend/src/
- [ ] T060 End-to-end tests with Cypress
- [ ] T061 Performance optimization for drag-and-drop
- [ ] T062 [P] Update API documentation
- [ ] T063 [P] Update README.md
- [ ] T064 Remove duplication and refactor
- [ ] T065 Manual testing checklist validation

## Dependencies
- Tests (T007-T020) before implementation (T021-T050)
- Models (T021-T025) before services (T026-T029)
- Services before API endpoints (T030-T040)
- Backend setup (T001-T006) before tests
- Frontend components depend on API service (T047)
- Real-time features (T053) after basic API

## Parallel Example
```
# Launch T007-T020 together:
Task: "Contract test GET /api/users in backend/tests/contract/test_users_get.js"
Task: "Contract test GET /api/projects in backend/tests/contract/test_projects_get.js"
Task: "Contract test POST /api/projects in backend/tests/contract/test_projects_post.js"
...
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Commit after each task with timestamped message
- Use absolute paths: /workspaces/TaskFlow/backend/..., /workspaces/TaskFlow/frontend/...