# Tasks: Simple Client-Side To-Do List (Angular 20+)

**Input**: Design documents from `/specs/001-taskflow-leate-create/`
**Prerequisites**: plan.md (required), research.md, data-model.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
	→ If not found: ERROR "No implementation plan found"
	→ Extract: tech stack, libraries, structure
2. Load optional design documents:
	→ data-model.md: Extract entities → model tasks
	→ research.md: Extract decisions → setup tasks
3. Generate tasks by category:
	→ Setup: project init, dependencies, linting
	→ Core: models, services, components
	→ Integration: composition, wiring
	→ Tests: integration scenarios
	→ Polish: accessibility, performance, docs
4. Apply task rules:
	→ Different files = mark [P] for parallel
	→ Same file = sequential (no [P])
	→ Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
	→ All entities have models?
	→ All user scenarios have integration tests?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

---

### T001. [X][Setup] Initialize Angular 20+ Standalone Project
- Use Angular CLI to create new Angular workspace (standalone, routing, style=css) in `frontend/`
- Command: `ng new frontend --standalone --routing --style=css`
- Reference Angular MCP server for latest CLI options and best practices
- Dependency: None

### T002. [X][Setup] Install Required Dependencies
- Use Angular CLI to add Angular CDK, and install UUID library (for task IDs)
- Command: `cd frontend && ng add @angular/cdk && pnpm add uuid`
- Reference Angular MCP server for dependency recommendations
- Dependency: T001

### T003. [X][Setup] Configure Linting and Formatting
- Use Angular CLI to add Angular ESLint and Prettier
- Command: `ng add @angular-eslint/schematics`
- Reference Angular MCP server for linting and formatting best practices
- Dependency: T002

### T004. [X][P][Core] Implement Task Entity Model
- Use Angular CLI to generate model: `ng generate class models/task --type=model --skip-tests`
- File: `frontend/src/app/models/task.model.ts`
- Fields: id, title, completed, createdAt, deleted
- Reference Angular MCP server for model structure and best practices
- Dependency: T003

### T005. [X][Core] Implement Task Service (IndexedDB + LocalStorage)
- Use Angular CLI to generate service: `ng generate service services/task --skip-tests`
- File: `frontend/src/app/services/task.service.ts`
- Methods: add, update, toggleComplete, delete, restore, clearCompleted, filter
- Use signals for state, IndexedDB for tasks, localStorage for UI state
- Reference Angular MCP server for service patterns and IndexedDB/localStorage integration
- Dependency: T004

### T006. [X][Core] Implement Task List Component (Standalone)
- Use Angular CLI to generate standalone component: `ng generate component components/task-list --standalone --skip-tests`
- File: `frontend/src/app/components/task-list/task-list.component.ts`
- Display tasks, filter, and handle all user actions
- Reference Angular MCP server for component structure and best practices
- Dependency: T005

### T007. [X][Core] Implement Task Input Component (Standalone)
- Use Angular CLI to generate standalone component: `ng generate component components/task-input --standalone --skip-tests`
- File: `frontend/src/app/components/task-input/task-input.component.ts`
- Add new tasks, validate input
- Reference Angular MCP server for component structure and best practices
- Dependency: T005

### T008. [X][Core] Implement Task Item Component (Standalone)
- Use Angular CLI to generate standalone component: `ng generate component components/task-item --standalone --skip-tests`
- File: `frontend/src/app/components/task-item/task-item.component.ts`
- Edit, complete, delete, restore tasks
- Reference Angular MCP server for component structure and best practices
- Dependency: T005

### T009. [X][Core] Implement Deleted Tasks Panel Component
- Use Angular CLI to generate standalone component: `ng generate component components/deleted-panel --standalone --skip-tests`
- File: `frontend/src/app/components/deleted-panel/deleted-panel.component.ts`
- Show soft-deleted tasks, allow restore
- Reference Angular MCP server for component structure and best practices
- Dependency: T005

### T010. [X][Core] Implement Filter/Toolbar Component
- Use Angular CLI to generate standalone component: `ng generate component components/filter-toolbar --standalone --skip-tests`
- File: `frontend/src/app/components/filter-toolbar/filter-toolbar.component.ts`
- Filter tasks, clear completed, show filter state
- Reference Angular MCP server for component structure and best practices
- Dependency: T005

### T011. [X][Integration] Integrate Components in App Shell
- Use Angular CLI to generate app shell if needed: `ng generate component app --standalone --skip-tests`
- File: `frontend/src/app/app.component.ts`
- Compose all components, wire up signals and services
- Reference Angular MCP server for integration and composition best practices
- Dependency: T006, T007, T008, T009, T010

### T012. [X][P][Test] Integration Test: User Scenarios
- File: `frontend/src/app/app.component.spec.ts`
- Test: Add, complete, delete, restore, filter, clear completed, accessibility
- Reference Angular MCP server for test scenario structure and best practices
- Dependency: T011

### T013. [X][P][Polish] Accessibility Audit & Fixes
- File: All components
- Ensure keyboard navigation, focus, color contrast, ARIA roles
- Reference Angular MCP server and Angular CDK accessibility utilities
- Dependency: T011

### T014. [X][P][Polish] Performance Test: 500 Tasks
- File: `frontend/src/app/app.component.spec.ts`
- Test: Render 500 tasks in <1s
- Reference Angular MCP server for performance testing best practices
- Dependency: T011

### T015. [X][P][Polish] Documentation & Quickstart
- File: `frontend/README.md`, update quickstart.md if needed
- Reference Angular MCP server for documentation standards
- Dependency: T011

---

- [P] = Can be executed in parallel with other [P] tasks
- All tasks are dependency-ordered and ready for LLM execution
