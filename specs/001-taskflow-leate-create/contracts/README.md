# Contracts Overview

This feature has no external HTTP or GraphQL API surface (frontend-only, offline-capable). Instead of network contracts, we define internal boundary contracts:

## Internal Service Contracts

### Persistence Service

- `createTask(title: string): Task` – Validates length and returns persisted Task.
- `updateTask(id: string, patch: Partial<{title: string; completed: boolean}>): Task` – Applies validation, updates timestamps.
- `deleteTask(id: string): void` – Moves task to soft delete buffer (and removes from IndexedDB).
- `restoreTask(id: string): Task` – Re-inserts task preserving createdAt.
- `clearCompleted(confirm: boolean): number` – Deletes all completed tasks after confirmation; returns count removed.
- `listTasks(): Task[]` – Returns active tasks ordered by createdAt ascending.
- `listDeleted(): Task[]` – Returns soft-deleted tasks (session buffer).

### UI State Service

- `getFilter(): Filter`
- `setFilter(f: Filter): void`
- `isDeletedPanelOpen(): boolean`
- `setDeletedPanelOpen(open: boolean): void`

## Contract Test Plan (Placeholder)

Contract tests will assert:

- Creation rejects empty/over-length titles.
- Update preserves ordering & timestamps.
- Soft delete removal from active + presence in buffer.
- Restore reinserts with original createdAt.
- Clear completed only executes with confirmation flag.
- Filter & Deleted panel state persist across simulated reload.

Because these are internal services, contract tests will live under `tests/contract/` referencing public exported service factories.
