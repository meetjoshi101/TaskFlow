# Tasks: Simple Client-Side To-Do List

**Input**: Design documents from `/specs/001-taskflow-leate-create/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (summary)

Derived from templates: Setup → Tests (failing first) → Core models/services → UI components → Feature facade → Integration (persistence wiring) → Polish (a11y, performance, docs).

## Format: `[ID] [P] Description`

`[P]` means can run in parallel (different file, no dependency overlap).

## Phase 3.1: Setup

- [X] T001 Initialize Angular workspace (if not present) with CLI: `ng new frontend --create-application=false --standalone --routing --strict --style=css --package-manager=pnpm` (root)
- [X] T002 Add libraries via CLI (library-first):
  - `ng generate library core-data --standalone`
  - `ng generate library persistence --standalone`
  - `ng generate library ui-components --standalone`
  - `ng generate library feature-tasks --standalone`
- [X] T003 [P] Add `idb` dependency (optional wrapper) and update root README with storage rationale (`frontend/`): `pnpm add idb`
- [X] T004 Configure lint/test scripts in `frontend/package.json` (ensure test + lint commands exist, strict TS stays enabled)
- [X] T005 [P] Create initial directory placeholders for tests: `frontend/tests/{unit,contract,integration}` (align with plan structure)

## Phase 3.2: Tests First (TDD) – MUST FAIL INITIALLY

User stories (5 acceptance + extended flows) + edge behaviors.

- [ ] T006 [P] Contract test: persistence service create/list/update/delete soft delete flow in `frontend/tests/contract/persistence.spec.ts`
- [ ] T007 [P] Contract test: UI state service persistence (filter & panel) in `frontend/tests/contract/ui-state.spec.ts`
- [ ] T008 [P] Unit test: Task title validation (length, trim) in `frontend/tests/unit/task-validation.spec.ts`
- [ ] T009 [P] Unit test: Ordering & restore insertion logic in `frontend/tests/unit/order-restore.spec.ts`
- [ ] T010 [P] Integration test: Add → list → toggle complete in `frontend/tests/integration/add_toggle.spec.ts`
- [ ] T011 [P] Integration test: Edit (inline) save & cancel scenarios in `frontend/tests/integration/edit_inline.spec.ts`
- [ ] T012 [P] Integration test: Soft delete → restore → reload purge behavior in `frontend/tests/integration/soft_delete_restore.spec.ts`
- [ ] T013 [P] Integration test: Bulk clear completed (confirmation required) in `frontend/tests/integration/bulk_clear.spec.ts`
- [ ] T014 [P] Integration test: Filter persistence across reload + deleted panel state in `frontend/tests/integration/filter_persistence.spec.ts`
- [ ] T015 [P] Integration test: Performance seed 500 tasks (timing assertion heuristic) in `frontend/tests/integration/perf_500.spec.ts`
- [ ] T016 [P] Accessibility smoke test (keyboard traversal, ARIA roles, status text) in `frontend/tests/integration/a11y_smoke.spec.ts`

## Phase 3.3: Core Models & Services (Implement after failing tests committed)

- [ ] T017 [P] Implement `Task` interface + validation utilities in `frontend/projects/core-data/src/lib/task.model.ts`
- [ ] T018 [P] Implement ordering & restore helper functions in `frontend/projects/core-data/src/lib/order.utils.ts`
- [ ] T019 Implement `TasksRepository` (IndexedDB CRUD + soft delete buffer) in `frontend/projects/persistence/src/lib/tasks.repository.ts`
- [ ] T020 Implement UI state service (filter + deleted panel) in `frontend/projects/persistence/src/lib/ui-state.service.ts`
- [ ] T021 Wire persistence error handling + fallback in-memory store (IndexedDB open failure) `tasks.repository.ts`
- [ ] T022 Add model/index exports (public API surfacing) in `frontend/projects/core-data/src/public-api.ts`
- [ ] T023 [P] Export services from `frontend/projects/persistence/src/public-api.ts`

## Phase 3.4: UI Components

- [ ] T024 [P] `TaskInputComponent` (add new task + validation feedback) `frontend/projects/ui-components/src/lib/task-input.component.ts`
- [ ] T025 [P] `TaskListComponent` (list, toggle, edit entry points) `frontend/projects/ui-components/src/lib/task-list.component.ts`
- [ ] T026 [P] `TaskItemComponent` (individual row: display, edit mode handling) `frontend/projects/ui-components/src/lib/task-item.component.ts`
- [ ] T027 [P] `FilterBarComponent` (All/Active/Completed + counts) `frontend/projects/ui-components/src/lib/filter-bar.component.ts`
- [ ] T028 [P] `DeletedPanelComponent` (restore + list soft-deleted) `frontend/projects/ui-components/src/lib/deleted-panel.component.ts`
- [ ] T029 Add accessibility attributes & aria-live region integration across components

## Phase 3.5: Feature Facade & Orchestration

- [ ] T030 Implement feature facade service (combines repo + ui state + derived selectors) in `frontend/projects/feature-tasks/src/lib/tasks.facade.ts`
- [ ] T031 Provide facade DI + exported public API in `frontend/projects/feature-tasks/src/public-api.ts`
- [ ] T032 Host demo application scaffold (`ng generate application demo`) referencing facade & components

## Phase 3.6: Integration Wiring & Additional Tests

- [ ] T033 Persistence service integration refinements (batch load + lazy render path) in `tasks.repository.ts`
- [ ] T034 Add performance measurement helper (simple timing log) in `frontend/projects/feature-tasks/src/lib/perf.util.ts`
- [ ] T035 Add smoke test verifying Deleted panel restore ordering `frontend/tests/integration/deleted_panel_restore_order.spec.ts`

## Phase 3.7: Polish & Quality Gates

- [ ] T036 [P] Add README per library with usage + public API description
- [ ] T037 [P] Add additional unit tests for edge cases (quota exceeded, invalid restore) in `frontend/tests/unit/persistence_edge.spec.ts`
- [ ] T038 [P] Add axe-based accessibility script (optional) `frontend/scripts/a11y-check.ts`
- [ ] T039 Bundle size check + report (ensure ≤250KB gzip main) document results in `specs/001-taskflow-leate-create/quickstart.md` appendix
- [ ] T040 Mutation testing placeholder (document future plan) add note in `research.md`
- [ ] T041 Refactor pass (remove duplication, ensure single responsibility) across services/components
- [ ] T042 Final docs update: update `contracts/README.md` with any API surface changes & add performance evidence section

## Dependencies Overview

| Task | Depends On |
|------|------------|
| T002 | T001 |
| T003 | T001 |
| T004 | T001 |
| T006-T016 | T001-T005 (setup) |
| T017 | T006-T016 (tests written) |
| T018 | T017 |
| T019 | T017,T018 |
| T020 | T017 |
| T021 | T019 |
| T022 | T017 |
| T023 | T019,T020 |
| T024-T028 | T019,T020,T017 (models+services) |
| T029 | T024-T028 |
| T030 | T017-T023 |
| T031 | T030 |
| T032 | T024-T031 |
| T033 | T019,T030 |
| T034 | T030 |
| T035 | T030,T028 |
| T036-T038 | Core & UI complete (T017-T032) |
| T039 | T032,T033,T034 |
| T040 | Research baseline (no code dependency) |
| T041 | All core implementation (T017-T035) |
| T042 | T039,T041 |

## Parallel Execution Examples

```MD
# Example 1: Write initial contract/integration/unit tests in parallel (T006-T016)
Task: T006 persistence contract test
Task: T007 UI state contract test
Task: T008 task validation unit test
Task: T009 ordering + restore unit test
Task: T010 add/toggle integration test
Task: T011 edit inline integration test
Task: T012 soft delete/restore integration test
Task: T013 bulk clear integration test
Task: T014 filter persistence integration test
Task: T015 performance seed integration test
Task: T016 a11y smoke integration test

# Example 2: Parallel model/service exports (after tests fail)
Task: T017 Task model
Task: T018 ordering utils
Task: T022 public API (core-data) (after T017)
Task: T023 persistence exports (after T019, T020 ready)

# Example 3: Parallel UI components (T024-T028)
Task: T024 task input
Task: T025 task list
Task: T026 task item
Task: T027 filter bar
Task: T028 deleted panel
```

## Validation Checklist

- [ ] All entities have model tasks (Task ✅)
- [ ] Tests precede implementation (Phases 3.2 before 3.3+)
- [ ] Parallel tasks only different files
- [ ] Accessibility & performance tasks included
- [ ] Soft delete & restore covered in tests
- [ ] UI state persistence covered in tests

## Notes

- Commit after each task; keep test failures intentional until implementation phase starts.
- Ensure no production code added before corresponding failing test (Principle III).
- Use Angular CLI for every generated artifact (no manual component/service file stubs).
- Keep libraries' public API minimal.
