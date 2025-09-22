# Data Model: Work Management Core Domain

## Entity Overview

Entities reflect strategic planning, execution hierarchy, and operational logging.

| Entity | Purpose | Key Fields | Relationships |
|--------|---------|------------|---------------|
| Goal | Top-level strategic objective | id, title, description, archivedAt | M:N SubGoals, M:N Portfolios/Projects/Tasks |
| SubGoal | Secondary objective under one or more Goals | id, title, description, archivedAt | M:N Goals, M:N Portfolios/Projects/Tasks |
| Portfolio | Grouping of Projects | id, name, description, archivedAt | 1:N Projects (multi-parent via edge), M:N Goals/SubGoals indirect |
| Project | Execution container | id, name, description, archivedAt | M:N Portfolios, 1:N Tasks, M:N Goals/SubGoals |
| Task | Executable unit | id, title, description, status, archivedAt | M:N Projects, 1:N SubTasks, M:N Goals/SubGoals |
| SubTask | Decomposition of a Task | id, title, archivedAt | BelongsTo Task, 1:N Steps |
| Step | Ordered actionable step | id, content, position | BelongsTo SubTask |
| WorkLog | Operational record | id, workItem, notes, createdAt | BelongsTo polymorphic Work Item; 1:N WorkChecklists |
| WorkChecklist | Checklist meta | id, workLogId, completionPct, archivedAt | BelongsTo WorkLog, 1:N ChecklistItems |
| ChecklistItem | Individual checklist row | id, checklistId, label, status, position | BelongsTo WorkChecklist |
| AssociationEvent | Audit trail for add/remove | id, type, fromType, fromId, toType, toId, ts | References entity pairs |

## Field Definitions

### Goal / SubGoal

- id: ULID
- title: string (1..140)
- description: string (0..2000)
- archivedAt: ISO timestamp | null
- createdAt / updatedAt: ISO timestamp

### Portfolio / Project

- id: ULID
- name: string (1..140)
- description: string (0..2000)
- archivedAt: ISO timestamp | null
- createdAt / updatedAt

### Task

- id: ULID
- title: string (1..140)
- description: string (0..2000)
- status: enum ("pending" | "in_progress" | "blocked" | "done" | "archived")
- archivedAt: ISO timestamp | null
- createdAt / updatedAt

### SubTask

- id: ULID
- title: string (1..140)
- archivedAt: ISO timestamp | null
- createdAt / updatedAt

### Step

- id: ULID
- content: string (1..500)
- position: integer >=1 (unique within SubTask)
- createdAt / updatedAt

### WorkLog

- id: ULID
- workItem: { kind: enum, id: ULID }
- notes: string (0..4000)
- createdAt: ISO timestamp
- orphaned: boolean (false unless underlying entity hard-deleted later - outside normal flow)

### WorkChecklist

- id: ULID
- workLogId: ULID
- completionPct: integer 0..100 (derived+cached)
- archivedAt: ISO timestamp | null
- createdAt / updatedAt

### ChecklistItem

- id: ULID
- checklistId: ULID
- label: string (1..200)
- status: enum ("open" | "done")
- position: integer >=1 (unique in checklist)

### AssociationEvent

- id: ULID
- type: enum ("add" | "remove")
- fromType / fromId / toType / toId: entity descriptors
- ts: ISO timestamp

## Association Stores (Edge Models)

| Edge Store | From | To | Cardinality | Constraints |
|------------|------|----|-------------|-------------|
| goal_subgoal | Goal | SubGoal | M:N | No cycles allowed (DFS pre-check) |
| goal_project | Goal | Project | M:N | Unique pair |
| goal_task | Goal | Task | M:N | Unique pair |
| subgoal_project | SubGoal | Project | M:N | Unique pair |
| subgoal_task | SubGoal | Task | M:N | Unique pair |
| goal_portfolio | Goal | Portfolio | M:N | Unique pair |
| subgoal_portfolio | SubGoal | Portfolio | M:N | Unique pair |
| portfolio_project | Portfolio | Project | 1:N via M:N edge (Project multi-parent) | Unique pair |
| project_task | Project | Task | 1:N via M:N edge (Task multi-parent) | Unique pair |
| task_subtask | Task | SubTask | 1:N | SubTask unique parent |
| subtask_step | SubTask | Step | 1:N ordered | Step position unique per SubTask |

## Invariants & Validation Rules

- Goal/SubGoal graph must remain acyclic.
- Duplicate association edges rejected (composite key uniqueness).
- Archived entities cannot form new associations.
- Removing association does not auto-delete dependent entities (non-cascading except archival workflows).
- Step positions normalized (1..N) after reorder operation.
- Checklist completionPct = floor(done/total * 100); updated transactionally.
- WorkLog must reference existing non-orphaned entity; becomes orphaned only after hard delete (out-of-scope for normal UI).
- Dissociating Task from Project leaves Task↔Goal/SubGoal associations intact.
- Archiving an entity freezes creation of new edges where it participates (attempt → ARCHIVED_CONFLICT error).
- Batch association exceeding limit (>200 tasks) aborts entire operation (atomic rollback) with LIMIT_EXCEEDED.
- All edge insertions guarded for duplication (duplicate → DUPLICATE_EDGE error).
- Cycle attempt in Goal/SubGoal graph → CYCLE_DETECTED error.
- Invalid reference on WorkLog creation → NOT_FOUND error.

## Derived Queries

- Trace lineage: Step -> SubTask -> Task -> Projects -> Portfolios + Goals/SubGoals (direct + via Projects/Tasks edges).
- WorkLog lineage: resolve workItem then compute upward associations.
- Goal coverage: list Tasks directly + those via Projects (union distinct).

## State Transitions (Task Example)

| Current | Event | Next | Notes |
|---------|-------|------|-------|
| pending | start | in_progress | Set startedAt timestamp (future field) |
| in_progress | block | blocked | Add blockReason (future) |
| blocked | unblock | in_progress | Clear blockReason |
| in_progress | complete | done | Set completedAt |
| any (not archived) | archive | archived | archivedAt set |

## Performance Considerations

- Edge lookups indexed by fromId and toId for bidirectional traversal.
- DFS cycle detection caches visited nodes per add path.
- Bulk association (<=200 tasks) processed in single transaction; abort on first violation -> roll back.

## Future Extension Points

- Replace repository adapter with remote API implementation.
- Add user ownership fields once authentication introduced.
- Introduce tagging taxonomy (deferred) using separate tag store + entity_tag edge.

## Archival Cascade Matrix
| Entity Archived | Cascade Targets (if cascade flag true) | Blocked Operations While Archived | Notes |
|-----------------|-----------------------------------------|------------------------------------|-------|
| Goal | (Optional) SubGoals (if not linked elsewhere) | New goal_subgoal / goal_* edges | Existing associations remain readable |
| SubGoal | None (cannot auto-delete) | New subgoal_* edges | Still appears in lineage if linked |
| Portfolio | None (projects remain) | New portfolio_project edges | Projects persist multi-parent links elsewhere |
| Project | (Optional) Tasks (archival) | New project_task edges | Tasks still may link to other projects |
| Task | (Optional) SubTasks (archival) | New task_subtask edges; new goal_task associations | WorkLogs remain readable |
| SubTask | Steps (automatic) | New subtask_step edges | Step operations disallowed |
| WorkLog | WorkChecklists (automatic) | New checklist creation | Existing checklist reads allowed |
| WorkChecklist | ChecklistItems (automatic) | New checklist item writes | CompletionPct frozen |

## Error Codes Reference
| Code | Trigger | Recovery Strategy |
|------|--------|------------------|
| VALIDATION_ERROR | Schema parse failure | Correct input shape/fields |
| CYCLE_DETECTED | Adding edge creates cycle | Remove offending association path |
| DUPLICATE_EDGE | Existing identical edge | Treat as idempotent or surface warning |
| NOT_FOUND | Referenced entity missing | Ensure entity exists before call |
| ARCHIVED_CONFLICT | Mutation against archived entity | Unarchive or choose different target |
| LIMIT_EXCEEDED | Batch > allowed size (e.g., >200 tasks) | Split into smaller batches |
| INVARIANT_VIOLATION | Internal state inconsistency (e.g., step positions gap) | Recompute normalization then retry |
