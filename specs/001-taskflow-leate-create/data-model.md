# Data Model: Simple Client-Side To-Do List

## Entities

### Task

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | string (ULID or nanoid) | Unique within local dataset | Generated on creation; not user-editable |
| title | string | 1–140 chars after trim | Internal whitespace preserved |
| completed | boolean | | True when user toggles completion |
| createdAt | number (epoch ms) | Immutable | Used for stable ordering (ascending) |
| updatedAt | number (epoch ms) | >= createdAt | Set on edit or completion toggle |
| deleted | boolean (transient, in-memory only) | Not persisted | Managed by soft delete buffer only |

### UIState (localStorage)

| Field | Type | Constraints | Notes |
| filter | 'all'|'active'|'completed' | Default 'all' | Restored on load |
| showDeletedPanel | boolean | Default false | Persisted panel open state |

### SoftDeletedBuffer (in-memory)

Array of Task snapshots removed from active persistence during session. Emptied on page reload.

## Persistence Strategy

- Active tasks stored in IndexedDB object store `tasks` keyed by `id`.
- Soft-deleted tasks NOT written to IndexedDB; removal = delete record.
- UI state stored in localStorage key: `taskflow:ui` (JSON {filter, showDeletedPanel}).

## Derived Data / Counts

- activeCount = tasks.filter(!completed && !deleted).length
- completedCount = tasks.filter(completed && !deleted).length
- deletedCount = softDeletedBuffer.length

## State Transitions

```text
ACTIVE (completed=false) ──toggle──> COMPLETED (completed=true)
COMPLETED ──toggle──> ACTIVE
ACTIVE|COMPLETED ──delete──> SOFT_DELETED (removed from store; in memory buffer)
SOFT_DELETED ──restore──> previous ACTIVE|COMPLETED state (reinsert to store)
SOFT_DELETED ──reload──> PURGED (buffer lost)
```

## Validation Rules

- Title trimmed length 1–140; reject otherwise (no mutation; show message).
- Duplicate titles allowed (no uniqueness constraint).

## Ordering

- Primary ordering: `createdAt` ascending; restore reinserts based on original `createdAt`.

## Error Cases

| Scenario | Handling |
|----------|----------|
| IndexedDB open failure | Fallback to in-memory ephemeral store (warn) |
| Write failure | Surface non-blocking error message; retry action possible |
| localStorage quota exceeded | Graceful degradation: stop persisting UI state, log warning |

## Rationale Summary

- Separation of concerns: operational UI state vs task data.
- Soft delete transient prevents stale accumulation & complexity of persistence.
- Using numeric timestamps simplifies ordering & comparisons.
