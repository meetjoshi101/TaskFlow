# Quickstart: Simple Client-Side To-Do List

## 1. Prerequisites
- Node.js LTS
- pnpm installed globally (`corepack enable` or `npm i -g pnpm`)
- Angular CLI v20 installed (`npm i -g @angular/cli@latest`)

## 2. Create Angular Workspace (Library-First)
```
ng new frontend --create-application=false --standalone --routing --strict --style=css --package-manager=pnpm
cd frontend
```

## 3. Generate Libraries
```
# Core data model & interfaces
ng generate library core-data --standalone

# Persistence (IndexedDB/localStorage services)
ng generate library persistence --standalone

# UI components (task item, list, deleted panel)
ng generate library ui-components --standalone

# Feature orchestration (task feature facade)
ng generate library feature-tasks --standalone
```

## 4. Public API Exports
Update each library's `public-api.ts` to expose only intended services/components.

## 5. Implement Persistence Service (persistence lib)
- Add thin wrapper using `idb` (install: `pnpm add idb` in workspace root) — optional; if added, note dependency.
- Provide `TasksRepository` with CRUD + soft delete buffer.

## 6. Implement Core Models (core-data lib)
- `Task` interface (fields from data-model.md)
- Validation utilities for title length.

## 7. UI Components (ui-components lib)
- `TaskInputComponent` (add new task)
- `TaskListComponent` (renders tasks, emits toggle/edit/delete)
- `DeletedPanelComponent` (lists soft-deleted tasks + restore)
- `FilterBarComponent` (All/Active/Completed + counts)

## 8. Feature Facade (feature-tasks lib)
- Aggregates persistence + UI state
- Exposes signals/observables: tasks, filteredTasks, counts, deletedTasks, uiState

## 9. Tests (red first)
```
# Example test creation
ng generate component task-input --project=ui-components --standalone=false --export
# (Adjust for actual component names if needed.)
```
Write failing tests for:
- Add rejects invalid titles
- Toggle completion updates state & timestamp
- Soft delete moves item to deleted buffer
- Restore reinserts in correct order
- Bulk clear confirmation required
- Filter & panel state persist across simulated reload

## 10. Accessibility Verification
Manual + tooling (axe) for keyboard traversal and ARIA labels.

## 11. Run & Validate
```
# (Create a host application if desired later)
ng generate application demo --standalone --routing=false
ng serve demo
```

## 12. Performance Smoke Test
Seed 500 tasks (script) → confirm initial render <1s and interactions remain responsive.

## 13. Next Steps
Proceed to `/tasks` generation then implement in TDD order.
