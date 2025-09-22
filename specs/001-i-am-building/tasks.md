# Tasks: Work Management Core Domain Modeling (Frontend Prototype)

**Input**: Design documents from `/workspaces/TaskFlow/specs/001-i-am-building/`
**Prerequisites**: `plan.md` (required), `research.md`, `data-model.md`, `contracts/README.md`, `quickstart.md`

All paths are absolute and assume single-project structure (frontend-only Angular SPA) per `plan.md` Structure Decision (Option 1).

## Execution Flow (Generated)
```
1. Setup repo scaffolding (Angular + tooling)
2. Create empty src/ + tests/ structure & quality configs
3. Author failing contract tests (repository/service methods) & integration scenario tests
4. Author failing model/schema unit tests for each entity
5. Implement minimal models + zod schemas to satisfy parsing tests
6. Implement in-memory repositories + domain services to satisfy contract tests (no IndexedDB yet)
7. Introduce IndexedDB persistence adapter & edge stores
8. Implement invariants (cycle detection, duplicate edge rejection, archival constraints)
9. Implement operational entities (WorkLog, Checklist, ChecklistItem) + completion logic
10. Implement lineage/traversal queries
11. Add Angular component scaffolds & accessibility features
12. Add performance benchmarks & logging wrapper
13. Polish: docs, cleanup, remaining unit tests, performance validation
```

## Legend
Format: `[ID] [P?] Description`
- `[P]` = Task may execute in parallel with other `[P]` tasks (different files, no dependency conflicts)
- No `[P]` = Must follow listed dependencies or shares file scope

## Phase 3.1: Setup
- [ ] T001 Initialize Node project & Angular workspace (no sample app) in `/workspaces/TaskFlow` (command: `npm init -y`; `npm create @angular@latest -- --directory . --minimal`) – produces baseline `package.json`, `tsconfig.*`, `angular.json` (Depends: none)
- [ ] T002 Install core dependencies in `/workspaces/TaskFlow/package.json` (`@angular/core`, `@angular/platform-browser`, `rxjs`, `zod`, `idb`, `ulidx`, `jest`, `ts-jest`, `@types/jest`, `playwright`, `@playwright/test`, `axe-core`) (Depends: T001)
- [ ] T003 [P] Add dev tooling: eslint, prettier, husky, lint-staged config (`.eslintrc.cjs`, `.prettierrc`, `.lintstagedrc`) (Depends: T001)
- [ ] T004 [P] Configure Jest (create `jest.config.ts`) and `ts-jest` transformer (Depends: T001)
- [ ] T005 [P] Configure Playwright (`playwright.config.ts`) + accessibility (axe) helper (Depends: T001)
- [ ] T006 Establish project structure directories: 
  - `/workspaces/TaskFlow/src/{models,services,repositories,adapters,components,utils,logging}`
  - `/workspaces/TaskFlow/tests/{contract,integration,unit,performance,accessibility}` (Depends: T001)
- [ ] T007 Add npm scripts: `test`, `test:watch`, `test:integration`, `test:accessibility`, `bench:cycles`, `bench:lineage`, `lint`, `format` in `package.json` (Depends: T002)
- [ ] T008 Implement minimal logger wrapper `src/logging/logger.ts` with level toggle via `localStorage.debugMode` (Depends: T006)

## Phase 3.2: Tests First (Contracts & Integration) – MUST FAIL INITIALLY
Contract file source: `contracts/README.md` method lists. Each repository/service method receives at least one contract test file capturing: happy path skeleton, validation failure, invariant enforcement (initially unimplemented → failing).

StrategicService / Goals & SubGoals
- [ ] T009 [P] Contract test `StrategicService.createGoal` in `/workspaces/TaskFlow/tests/contract/strategic/createGoal.spec.ts` (Depends: T006)
- [ ] T010 [P] Contract test `StrategicService.createSubGoal` in `tests/contract/strategic/createSubGoal.spec.ts` (Depends: T006)
- [ ] T011 [P] Contract test `associateSubGoalToGoal` (cycle detection negative) in `tests/contract/strategic/associateSubGoalToGoal.spec.ts` (Depends: T006)
- [ ] T012 [P] Contract test `associateGoalToProject` in `tests/contract/strategic/associateGoalToProject.spec.ts` (Depends: T006)
- [ ] T013 [P] Contract test `batchAssociateTasksToGoal` (limit + rollback) in `tests/contract/strategic/batchAssociateTasksToGoal.spec.ts` (Depends: T006)

ExecutionService / Portfolios, Projects, Tasks, SubTasks, Steps
- [ ] T014 [P] Contract test `createPortfolio` in `tests/contract/execution/createPortfolio.spec.ts` (Depends: T006)
- [ ] T015 [P] Contract test `createProject` in `tests/contract/execution/createProject.spec.ts` (Depends: T006)
- [ ] T016 [P] Contract test `addProjectToPortfolio` in `tests/contract/execution/addProjectToPortfolio.spec.ts` (Depends: T006)
- [ ] T017 [P] Contract test `createTask` in `tests/contract/execution/createTask.spec.ts` (Depends: T006)
- [ ] T018 [P] Contract test `addTaskToProject` in `tests/contract/execution/addTaskToProject.spec.ts` (Depends: T006)
- [ ] T019 [P] Contract test `createSubTask` in `tests/contract/execution/createSubTask.spec.ts` (Depends: T006)
- [ ] T020 [P] Contract test `reorderSteps` (ordering + normalization) in `tests/contract/execution/reorderSteps.spec.ts` (Depends: T006)
- [ ] T021 [P] Contract test `updateStep/removeStep` invariants in `tests/contract/execution/stepMutations.spec.ts` (Depends: T006)

OperationsService / Work Logs & Checklists
- [ ] T022 [P] Contract test `createWorkLog` (NOT_FOUND invalid reference) in `tests/contract/operations/createWorkLog.spec.ts` (Depends: T006)
- [ ] T023 [P] Contract test `createChecklist` + `addChecklistItem` (completion recalculation) in `tests/contract/operations/checklistLifecycle.spec.ts` (Depends: T006)
- [ ] T024 [P] Contract test `recomputeChecklistCompletion` rounding in `tests/contract/operations/recomputeChecklistCompletion.spec.ts` (Depends: T006)

LineageService
- [ ] T025 [P] Contract test `getExecutionPath` (Step→Portfolios chain) in `tests/contract/lineage/getExecutionPath.spec.ts` (Depends: T006)
- [ ] T026 [P] Contract test `getWorkLogContext` in `tests/contract/lineage/getWorkLogContext.spec.ts` (Depends: T006)
- [ ] T027 [P] Contract test `getTaskCoverage` (direct + via projects) in `tests/contract/lineage/getTaskCoverage.spec.ts` (Depends: T006)

Archive & Invariants / Error Codes
- [ ] T028 [P] Contract test archival conflict (`archiveGoal` + post-association attempt) in `tests/contract/strategic/archiveGoalConflict.spec.ts` (Depends: T006)
- [ ] T029 [P] Contract test `DUPLICATE_EDGE` (repeat association) in `tests/contract/common/duplicateEdge.spec.ts` (Depends: T006)
- [ ] T030 [P] Contract test cycle detection error code in `tests/contract/strategic/cycleDetection.spec.ts` (Depends: T006)
- [ ] T031 [P] Contract test `LIMIT_EXCEEDED` for batch over threshold in `tests/contract/strategic/batchLimitExceeded.spec.ts` (Depends: T006)

Integration / User Story Scenarios (from `quickstart.md` sequence)
- [ ] T032 [P] Integration test initial Goal→Project→Task association flow in `tests/integration/goal_project_task_flow.spec.ts` (Depends: T006)
- [ ] T033 [P] Integration test cycle prevention scenario in `tests/integration/goal_subgoal_cycle.spec.ts` (Depends: T006)
- [ ] T034 [P] Integration test checklist lifecycle + completion updates in `tests/integration/checklist_lifecycle.spec.ts` (Depends: T006)
- [ ] T035 [P] Integration test lineage traversal (Step to Goals) in `tests/integration/lineage_traversal.spec.ts` (Depends: T006)
- [ ] T036 [P] Accessibility integration test (keyboard reorder + ARIA badges) in `tests/accessibility/step_reorder_accessibility.spec.ts` (Depends: T005, T006)

## Phase 3.3: Core Models & Schemas (Models before Services)
Entity model + zod schema tasks (one file per entity) – independent → parallel.
- [ ] T037 [P] Define ULID helper + base types in `src/models/base.ts` (Depends: T009-T036 failing in place)
- [ ] T038 [P] Goal model & schema in `src/models/goal.ts` (Depends: T037)
- [ ] T039 [P] SubGoal model & schema in `src/models/subGoal.ts` (Depends: T037)
- [ ] T040 [P] Portfolio model & schema in `src/models/portfolio.ts` (Depends: T037)
- [ ] T041 [P] Project model & schema in `src/models/project.ts` (Depends: T037)
- [ ] T042 [P] Task model & schema in `src/models/task.ts` (Depends: T037)
- [ ] T043 [P] SubTask model & schema in `src/models/subTask.ts` (Depends: T037)
- [ ] T044 [P] Step model & schema in `src/models/step.ts` (Depends: T037)
- [ ] T045 [P] WorkLog model & schema in `src/models/workLog.ts` (Depends: T037)
- [ ] T046 [P] WorkChecklist model & schema in `src/models/workChecklist.ts` (Depends: T037)
- [ ] T047 [P] ChecklistItem model & schema in `src/models/checklistItem.ts` (Depends: T037)
- [ ] T048 [P] AssociationEvent model & schema in `src/models/associationEvent.ts` (Depends: T037)

## Phase 3.4: Repository Interfaces & In-Memory Adapters
- [ ] T049 Define repository interface declarations in `src/repositories/interfaces.ts` (Depends: T038-T048)
- [ ] T050 Implement in-memory edge store + utility functions in `src/repositories/memory/edgeStore.ts` (Depends: T049)
- [ ] T051 Implement in-memory StrategicRepository/Service scaffolds in `src/services/strategicService.ts` (failing tests guide) (Depends: T049)
- [ ] T052 Implement in-memory ExecutionService in `src/services/executionService.ts` (Depends: T049)
- [ ] T053 Implement in-memory OperationsService in `src/services/operationsService.ts` (Depends: T049)
- [ ] T054 Implement in-memory LineageService in `src/services/lineageService.ts` (Depends: T049)

## Phase 3.5: IndexedDB Adapter & Persistence Layer
- [ ] T055 Create IndexedDB schema initializer `src/adapters/indexeddb/schema.ts` (Depends: T050)
- [ ] T056 Implement `IndexedDbRepositoryAdapter` base in `src/adapters/indexeddb/baseAdapter.ts` (Depends: T055)
- [ ] T057 Implement strategic IndexedDB adapter in `src/adapters/indexeddb/strategicAdapter.ts` (Depends: T056)
- [ ] T058 Implement execution IndexedDB adapter in `src/adapters/indexeddb/executionAdapter.ts` (Depends: T056)
- [ ] T059 Implement operations IndexedDB adapter in `src/adapters/indexeddb/operationsAdapter.ts` (Depends: T056)
- [ ] T060 Implement lineage IndexedDB adapter in `src/adapters/indexeddb/lineageAdapter.ts` (Depends: T056)
- [ ] T061 Wire services to switch between in-memory and IndexedDB via factory `src/repositories/repositoryFactory.ts` (Depends: T057-T060)

## Phase 3.6: Invariants & Domain Logic Enhancements
- [ ] T062 Implement DFS cycle detection module `src/services/internal/cycleDetection.ts` (Depends: T051, T052)
- [ ] T063 Enforce duplicate edge + limit checks in strategic service (update `strategicService.ts`) (Depends: T051, T050)
- [ ] T064 Implement archival constraints + cascade logic in strategic/execution services (Depends: T051, T052)
- [ ] T065 Implement step reorder + normalization logic in execution service (Depends: T052)
- [ ] T066 Implement checklist completion recalculation + caching in operations service (Depends: T053)
- [ ] T067 Implement lineage traversal algorithms in lineage service (Depends: T054)
- [ ] T068 Implement association event append + retrieval in strategic/execution services (Depends: T051, T052)

## Phase 3.7: Angular UI Scaffolding & Accessibility
- [ ] T069 Generate initial Angular module + routing skeleton in `src/app/` (Depends: T001, T002)
- [ ] T070 Component: Goal list & create form `src/components/goals/goal-list.component.ts` (Depends: T069, T061)
- [ ] T071 Component: Project detail with tasks `src/components/projects/project-detail.component.ts` (Depends: T069, T061)
- [ ] T072 Component: Task detail + SubTasks + Steps `src/components/tasks/task-detail.component.ts` (Depends: T069, T061)
- [ ] T073 Component: Checklist panel + live completion `src/components/checklists/checklist-panel.component.ts` (Depends: T069, T066)
- [ ] T074 Accessibility: keyboard step reorder directives `src/components/steps/step-reorder.directive.ts` (Depends: T065)
- [ ] T075 Accessibility: archived badge component `src/components/common/archived-badge.component.ts` (Depends: T064)
- [ ] T076 Logging toggle UI + debug overlay `src/components/common/debug-toggle.component.ts` (Depends: T008)

## Phase 3.8: Performance & Benchmarks
- [ ] T077 Benchmark harness cycle detection `tests/performance/cycleDetection.bench.ts` (Depends: T062)
- [ ] T078 Benchmark harness lineage queries `tests/performance/lineage.bench.ts` (Depends: T067)
- [ ] T079 Seed script to populate ~5k entities `scripts/seedGraph.ts` (Depends: T050, T051, T052)
- [ ] T080 Add npm scripts `bench:cycles`, `bench:lineage` executing harness (Depends: T077, T078)

## Phase 3.9: Polish & Additional Tests
- [ ] T081 [P] Unit tests for model schemas (Goal/SubGoal) in `tests/unit/models/strategicModels.spec.ts` (Depends: T038, T039)
- [ ] T082 [P] Unit tests for execution models (Portfolio/Project/Task/SubTask/Step) in `tests/unit/models/executionModels.spec.ts` (Depends: T040-T044)
- [ ] T083 [P] Unit tests for operations models (WorkLog/Checklist/ChecklistItem) in `tests/unit/models/operationsModels.spec.ts` (Depends: T045-T047)
- [ ] T084 [P] Unit tests for association event model in `tests/unit/models/associationEvent.spec.ts` (Depends: T048)
- [ ] T085 Documentation: update `specs/001-i-am-building/quickstart.md` with commands & scripts table (Depends: T007, T080)
- [ ] T086 Documentation: create `docs/architecture.md` summarizing repository + adapter layering (Depends: T061, T062-T068)
- [ ] T087 Add error code reference doc `docs/error-codes.md` derived from tests (Depends: T029-T031, T062-T066)
- [ ] T088 Add export/import backlog note to `docs/backlog.md` (Depends: none)
- [ ] T089 Final lint & format pass; ensure all tests green (Depends: All previous tasks except remaining polish tasks)
- [ ] T090 Performance validation run: ensure benchmarks meet targets (Depends: T077-T080)

## Dependencies Summary (Key Edges)
- Setup (T001-T008) precedes all test authoring (T009+)
- All contract & integration tests (T009-T036) must exist & fail before model implementations (T037-T048)
- Models (T037-T048) precede repository/service scaffolds (T049-T054)
- In-memory scaffolds precede IndexedDB adapters (T055-T061)
- IndexedDB adapters precede UI components that rely on persistence switching (T070-T073)
- Domain invariants (T062-T068) precede performance harness (T077, T078) & some UI features (T074, T075)
- Benchmarks (T077-T080) precede performance validation (T090)
- Final polish (T081-T090) after core & integration layers

## Parallel Execution Guidance Examples
```
# Example 1: Parallel contract tests batch (after setup T006)
Run in parallel: T009 T010 T011 T012 T013 (distinct files strategic/*)

# Example 2: Entity model schemas
Run in parallel: T038 T039 T040 T041 T042 T043 T044 T045 T046 T047 T048 (after T037)

# Example 3: Unit model test groups
Run in parallel: T081 T082 T083 T084

# Example 4: Early execution service contract tests
Run in parallel: T014 T015 T016 T017 T018 T019 T020 T021
```

## Validation Checklist (Auto-Generated Intent)
- [x] All contract methods listed have a corresponding test task
- [x] Each entity in `data-model.md` has a model/schema task
- [x] Tests (T009-T036) precede implementation tasks (T037+)
- [x] Parallel `[P]` tasks avoid file overlap
- [x] Explicit file paths provided
- [x] Invariant & error coverage tasks included (cycle, duplicate, limit, archival)
- [x] Accessibility tasks included (keyboard reorder, archived badge)
- [x] Performance benchmark tasks included
- [x] Logging/observability task included

## Constitution Alignment
- Tests-first enforced by ordering (failing tests before implementation)
- Code quality via lint/format tasks (T003, T089)
- Performance targets measured (T077-T080, T090)
- Accessibility features & tests (T036, T074, T075)
- Observability via logger (T008) and error docs (T087)

---
*Generated: 2025-09-22*
