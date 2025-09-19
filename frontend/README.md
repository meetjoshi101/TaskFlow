# Taskflow

## Overview

taskflow is a focused work management application for organizing strategic goals, portfolios, projects, and tasks. Authentication and authorization are intentionally omitted to accelerate iteration on core domain features.

## Core Concepts and Hierarchy

1. Goal (root strategic intent)
    - Can contain: sub goals, portfolios, projects, tasks
    - Supports nested sub goals (recursive)
2. Portfolio (groups related projects)
    - Can belong to multiple goals
    - Can contain: projects
3. Project (deliverable container)
    - Can belong to multiple portfolios
    - Can contain: tasks, task sections
4. Task (actionable unit)
    - Can belong to multiple projects
    - Can have: subtasks
    - Can be grouped via task sections
5. Task Section (logical grouping of tasks within a project)
6. Sub Goal
    - Only attaches to a parent Goal.
7. Sub Task
    - Only attaches to a parent Task

## Relationship Rules

- A Goal may have children of any work type (goals, portfolios, projects, tasks).
- Sub goals attach only to Goals
- A Task may be linked to multiple Projects (many-to-many).
- A Project may appear in multiple Portfolios (many-to-many).
- Task Sections group Tasks within a Project(no nesting).
- Subtasks inherit no automatic linkage to projects unless the parent task provides it.
- Deleting a parent should not hard delete children by default (soft linkage recommended).

## Functional Scope

Included:
- Create / update / archive goals, portfolios, projects, tasks
- Link / unlink tasks to projects
- Add / reorder / complete subtasks
- Nest goals (strategic decomposition)
- Group tasks via sections
- Cross-membership management (projects <-> portfolios, tasks <-> projects)
- Filtering by status, hierarchy path, and assignment placeholder (future-ready)

Excluded (Non-goals for now):
- User accounts / roles / permissions
- Real-time collaboration
- External integrations
- Advanced reporting / analytics
- Notifications

## Key Operations (Planned)

- CreateGoal(parentGoalId?)
- CreatePortfolio(goalId)
- CreateProject(goalId | portfolioIds[])
- CreateTask(projectIds[] | goalId, sectionId?)
- AddSubGoal(goalId, parentGoalId)
- AddSubTask(taskId, parentTaskId)
- AssignTaskToProject(taskId, projectId)
- AddProjectToPortfolio(projectId, portfolioId)
- ReorderSections(projectId)
- MoveTaskBetweenSections(sectionFromId, sectionToId, taskId, position)

## Data Integrity Considerations

- Prevent circular goal nesting.
- Enforce max depth for sub goals (configurable).
- Many-to-many pivot tables for:
  - task_projects
  - project_portfolios
- Soft delete with cascade visibility (child remains but shows orphan state if parent gone).
- Idempotent linking operations.

## Progression Example

Goal (Increase Customer Retention)
 ├─ Sub Goal (Improve Onboarding)
 ├─ Portfolio (Onboarding Experience)
 │   ├─ Project (Signup Flow Revamp)
 │   │   ├─ Section (Backend)
 │   │   │   ├─ Task (Refactor auth service)
 │   │   ├─ Section (Frontend)
 │   │   │   ├─ Task (Redesign signup form)
 │   │   │       └─ Subtask (Add password strength meter)
 └─ Project (Churn Analysis)
      └─ Task (Segment churn cohorts)

## Minimal UX Targets

- Hierarchical tree navigation
- Context panel for selected entity
- Drag-and-drop for task ordering within sections
- Multi-association management dialogs (projects <-> tasks, portfolios <-> projects)
- Inline quick add for tasks, subtasks, and sections

## Future Extensions (Deferred)

- Timeline / Gantt
- Dependency graph
- Objective / Key Result alignment metadata
- Bulk editing
- Public sharing links

This functional definition frames the initial implementation scope while keeping the data model extensible.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
