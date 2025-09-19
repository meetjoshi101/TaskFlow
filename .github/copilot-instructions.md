You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TaskFlow Project Context

TaskFlow is a hierarchical work management application with complex many-to-many relationships between Goals, Portfolios, Projects, and Tasks. Authentication is intentionally omitted to focus on core domain features.

### Domain Model Hierarchy
- **Goal**: Root strategic intent, can contain sub-goals, portfolios, projects, tasks
- **Portfolio**: Groups related projects, belongs to multiple goals  
- **Project**: Deliverable container, belongs to multiple portfolios, contains tasks/sections
- **Task**: Actionable unit, belongs to multiple projects, can have subtasks
- **Task Section**: Logical grouping of tasks within a project

### Key Architectural Decisions
- Pure Angular v20+ standalone application (no NgModules)
- Signal-based state management throughout
- No backend - focus on rich client-side domain modeling
- Strict TypeScript configuration with comprehensive compiler options
- Component prefix: `app-`

### Development Setup
- Working directory: `/workspaces/TaskFlow/frontend/`
- Start dev server: `npm start` (serves on http://localhost:4200)
- Run tests: `npm test` 
- Build: `npm build`
- Prettier configured with 100 char width, single quotes, Angular HTML parser

## TypeScript Best Practices

- Use strict type checking (already configured in tsconfig.json)
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain
- Leverage strict compiler options: `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noPropertyAccessFromIndexSignature`

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead
- Design for many-to-many relationships (tasks ↔ projects, projects ↔ portfolios)

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection
- Model domain operations: CreateGoal, AssignTaskToProject, MoveTaskBetweenSections, etc.

## TaskFlow-Specific Patterns

### UX Requirements
- Hierarchical tree navigation for Goals/Portfolios/Projects/Tasks
- Context panel for selected entity details
- Drag-and-drop for task ordering within sections
- Multi-association management (many-to-many relationships)
- Inline quick-add functionality

### Data Integrity Rules
- Prevent circular goal nesting
- Enforce configurable max depth for sub-goals
- Soft delete with cascade visibility (orphan state indication)
- Idempotent linking operations for many-to-many relationships

### Future Considerations
- No authentication/authorization (by design)
- Extensible for timeline/Gantt views
- Prepared for assignment metadata (currently placeholder)
