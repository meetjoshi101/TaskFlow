# Contracts: Domain Service & Repository Interfaces

These contracts represent internal service/repository operations in the frontend-only prototype. They are structured so they can translate into future REST/GraphQL endpoints without semantic change.

## Conventions
- All methods return Promises.
- Inputs validated via zod schemas (not included yet; tests-first will define them).
- Errors: use typed error objects with `code` (e.g., `VALIDATION_ERROR`, `CYCLE_DETECTED`, `DUPLICATE_EDGE`, `NOT_FOUND`, `ARCHIVED_CONFLICT`).

### Error Object Shape

```ts
interface DomainError {
  code:
    | 'VALIDATION_ERROR'
    | 'CYCLE_DETECTED'
    | 'DUPLICATE_EDGE'
    | 'NOT_FOUND'
    | 'ARCHIVED_CONFLICT'
    | 'LIMIT_EXCEEDED'
    | 'INVARIANT_VIOLATION';
  message: string;
  details?: Record<string, unknown>;
}
```

## Repository Interfaces (Summary)

| Interface | Purpose |
|-----------|---------|
| GoalRepository | CRUD + association linking for Goals/SubGoals/Execution entities |
| PortfolioRepository | Manage portfolios and portfolio-project edges |
| ProjectRepository | Manage projects, project-task edges |
| TaskRepository | Manage tasks, task-subtask edges, lineage queries |
| SubTaskRepository | Manage sub tasks and step hierarchy |
| WorkLogRepository | Manage Work Logs and lineage resolution |
| ChecklistRepository | Manage Work Checklists + items & completion updates |
| AssociationHistoryRepository | Append/read association events |

## Service Layer (Orchestration)

| Service | Core Responsibilities |
|---------|-----------------------|
| StrategicService | Goal/SubGoal creation, association integrity, cycle detection |
| ExecutionService | Portfolio/Project/Task structural operations + multi-parent validation |
| OperationsService | WorkLog + Checklist lifecycle, orphan detection, completion calculation |
| LineageService | Unified traversal for any entity or work item to its strategic & execution context |

## Core Methods (Indicative)

### StrategicService

- `createGoal(input)`
- `createSubGoal(input)`
- `associateGoalToProject(goalId, projectId)`
- `associateSubGoalToGoal(subGoalId, goalId)` (cycle detection gate)
- `batchAssociateTasksToGoal(goalId, taskIds[])` (<=200)
- `listGoals(filter, pagination)`
- `listGoalsForProject(projectId)`
- `listGoalsForTask(taskId, options?: { includeViaProjects?: boolean })`
- `archiveGoal(goalId, cascade?: boolean)`
- `archiveSubGoal(subGoalId, cascade?: boolean)`
- `dissociateSubGoalFromGoal(subGoalId, goalId)`

### ExecutionService

- `createPortfolio(input)`
- `createProject(input)`
- `addProjectToPortfolio(projectId, portfolioId)`
- `createTask(input)`
- `addTaskToProject(taskId, projectId)`
- `createSubTask(taskId, input)`
- `reorderSteps(subTaskId, stepIdsInOrder)`
- `removeTaskFromProject(taskId, projectId)`
- `removeProjectFromPortfolio(projectId, portfolioId)`
- `archiveProject(projectId, cascade?: boolean)`
- `archivePortfolio(portfolioId, cascade?: boolean)`
- `updateStep(stepId, content)`
- `removeStep(stepId)`

### OperationsService

- `createWorkLog(workItemRef, input)`
- `createChecklist(workLogId, input)`
- `addChecklistItem(checklistId, input)`
- `updateChecklistItemStatus(itemId, status)`
- `recomputeChecklistCompletion(checklistId)`
- `listWorkLogs(workItemRef, pagination)`
- `listChecklistsForWorkItem(workItemRef, pagination)`

### LineageService

- `getStrategicLineage(entityRef)` (resolves Goals/SubGoals links)
- `getExecutionPath(stepId)` (Step → ... → Portfolios)
- `getWorkLogContext(workLogId)` (WorkLog → referenced entity → full lineage)
- `getTaskCoverage(taskId)` (direct + via projects goal/sub-goal union)

## Contract Evolution Notes

Future backend mapping:

- Each method maps to REST endpoint (e.g., POST /goals, POST /goals/{id}/associate/tasks) or GraphQL mutation.
- Error codes become HTTP status + problem+json payload.
- Pagination uses `cursor` or `offset` (TBD in backend phase).

## Testing Obligations (Pre-Implementation)

Each method requires a failing contract test specifying:
- Happy path
- Validation failure
- Referential integrity enforcement
- Edge cases (cycle detection, duplicate prevention, archival constraints)

## Functional Requirement Mapping

| FR | Covered By | Notes / Method References |
|----|------------|---------------------------|
| FR-001 | Strategic/Execution/Operations archive & create methods | Need explicit archive/unarchive methods (added) |
| FR-002 | `associateGoalToProject`, edge uniqueness | Duplicate edge rejection tests required |
| FR-003 | `associateSubGoalToGoal` + cycle detection | DFS tests + negative cycle attempt |
| FR-004 | ExecutionService hierarchy create/add methods | Ensure 1:N semantics via tests |
| FR-005 | Multi-parent add methods + remove variants | Test no duplication / safe dissociation |
| FR-006 | WorkLog.workItem schema + validation | Add kind validation test |
| FR-007 | `getWorkLogContext` | Trace upward lineage test |
| FR-008 | Checklist methods + recompute | Completion recalculation triggers tests |
| FR-009 | archive* methods blocking association | Negative association after archive tests |
| FR-010 | listGoalsForProject / listGoalsForTask | Bidirectional visibility tests |
| FR-011 | `reorderSteps` + step invariants | Sequence normalization test |
| FR-012 | Checklist + listChecklistsForWorkItem | Cardinality tests |
| FR-013 | `getExecutionPath`, `getWorkLogContext` | Path chain assertion |
| FR-014 | Edge stores + duplicate code path | DUPLICATE_EDGE error tests |
| FR-015 | `listWorkLogs` | Pagination + filtering test |
| FR-016 | recompute after final item done | 100% completion test |
| FR-017 | recompute mid-progress | Floor rounding test |
| FR-018 | `getTaskCoverage` | Union direct + via projects test |
| FR-019 | Association events auto-append | Event repository read ordering test |
| FR-020 | Guard invalid step association | Negative invalid link test |
| FR-021 | `removeTaskFromProject` leaves goals | Invariant preservation test |
| FR-022 | Association events + retrieval | listAssociationEvents (to add) |
| FR-023 | Error object schema | Standardized DomainError tests |
| FR-024 | `listGoals` filter shape | Filter by status & counts tests |
| FR-025 | `createWorkLog` validation | NOT_FOUND invalid reference test |
| FR-026 | `listChecklistsForWorkItem` | Aggregated retrieval test |
| FR-027 | No modification methods for workItem | Ensure absence / negative attempt test |
| FR-028 | archive* prevents new edges | Post-archive association negative test |
| FR-029 | `updateStep`, `removeStep`, reorder | Position integrity after mutations |
| FR-030 | `batchAssociateTasksToGoal` | Limit + rollback test |

## Pagination & Filtering (Example: listGoals)

Filter object proposed:

```ts
interface ListGoalsFilter {
  status?: 'active' | 'archived';
  hasPortfolios?: boolean;
  hasProjects?: boolean;
  hasTasks?: boolean;
  minAssociations?: number; // total execution links
  maxAssociations?: number;
}
interface Pagination { cursor?: string; limit?: number; }
```

## Read-Only Polymorphic View

Work Item reference is never mutated directly—modifications occur only through entity-specific repositories; test should assert absence of e.g. `updateWorkItem`.

