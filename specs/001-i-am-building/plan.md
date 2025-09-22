
# Implementation Plan: Work Management Core Domain Modeling

**Branch**: `001-i-am-building` | **Date**: 2025-09-22 | **Spec**: `/workspaces/TaskFlow/specs/001-i-am-building/spec.md`
**Input**: Feature specification from `/specs/001-i-am-building/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Provide a core domain model and traceability layer for a work management system enabling strategic planning (Goals/Sub Goals) to connect bidirectionally with execution artifacts (Portfolios, Projects, Tasks hierarchy) and operational telemetry (Work Logs, Work Checklists) while enforcing integrity (cycle prevention, archival semantics, polymorphic logging) and accessibility of hierarchical lineage. Initial implementation will be a frontend-only Angular single-page application persisting data locally in browser storage (IndexedDB + localStorage for meta) to validate domain modeling and interaction patterns without backend complexity.

## Technical Context
**Language/Version**: TypeScript (Angular 18+), Node 20 toolchain
**Primary Dependencies**: Angular framework, RxJS, ngx-builders (default), idb (IndexedDB wrapper), zod (schema validation), Jest (unit), Playwright (integration/UI), eslint/prettier (quality)
**Storage**: IndexedDB (domain entities & association graphs), localStorage (user preferences, archival filter state)
**Testing**: Jest (unit/contract), Playwright (integration user stories), lightweight in-memory repository adapter for deterministic tests
**Target Platform**: Modern desktop browsers (Chromium, Firefox, Safari latest two versions)
**Project Type**: single (frontend-only SPA) → use Option 1 structure (no backend folder)
**Performance Goals**: Entity load w/ ≤200 associations < 50ms client parse; batch association (≤200 tasks) graph update < 150ms; step reorder < 40ms; checklist completion recompute O(n) with n≤200 < 20ms
**Constraints**: Offline-capable (no network), persistence durability (IndexedDB commits), cycle detection worst-case 5k nodes < 300ms, accessibility (keyboard reorder, high contrast), no backend APIs in v1
**Scale/Scope**: Prototype scope: up to ~5k entities total (Goals+Sub Goals+Portfolios+Projects+Tasks+Sub Tasks+Steps) within single-browser storage; 10-15 Angular components initial, <20 services/models

Cross-Refs: Storage & graph strategy → see `research.md#1-storage-layer-strategy` and `research.md#4-cycle-detection-goalssub-goals`. Entity normalization → `data-model.md#entity-overview`.

## Constitution Check

Initial Review (Pre-Phase 0):

- Code Quality: Plan includes explicit layering (models, services, UI components) and will enforce lint + typed models (TypeScript + zod). PASS
- Testing Standards: Tests-first approach defined (contract & integration scenarios from spec) before implementing services/components. PASS
- UX Consistency: Accessibility requirements (hierarchy breadcrumbs, archived state indicators, keyboard reordering) captured. PASS
- Performance Goals: Client-side performance targets derived from spec p95 constraints adapted to local execution (no network). PASS
- Observability & Versioning: Browser-only prototype—structured console logging wrapper + feature flag for debug; semantic versioning not yet required (no public API). Mitigation: document once backend introduced. ACCEPTABLE

No violations requiring Complexity Tracking at this stage.

Post-Design Check (after Phase 1 artifacts drafted):

- Data model normalization: PASS (edge stores + separate entity stores)
- Contract abstraction (service methods defined): PASS
- Accessibility & performance considerations captured: PASS

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)

```text
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single project) — frontend-only Angular SPA; backend omitted in this phase. `src/` will contain domain, persistence adapters, components.

## Phase 0: Outline & Research

1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

Phase 0 Execution Notes (planned):

- Validate IndexedDB suitability for polymorphic work item queries and graph traversal performance (5k node worst case).
- Evaluate cycle detection algorithm (DFS vs union-find) for multi-parent Goal/Sub Goal graph (choose DFS with memoization for readability + detection of indirect loops).
- Decide representation of many-to-many associations (edge store vs adjacency arrays). Likely edge collection with composite key to simplify duplicate prevention.
- Assess offline synchronization placeholder strategy (deferred) and how to design repository interfaces to allow future backend swap.
- Determine versioning field approach for optimistic concurrency (local incremental revision number per entity) to aid future sync.

Research tasks will yield decisions recorded in `research.md`.

## Phase 1: Design & Contracts

### Prerequisites

research.md complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements (ADAPTED for frontend-only):
   - Model as internal service contracts (TypeScript interfaces + zod schemas) instead of HTTP endpoints
   - Define abstract repository interface methods (e.g., `createGoal`, `associateGoalToProject`, `addWorkLog`)
   - Represent contract set in `/contracts/` as markdown + TypeScript declaration files to facilitate future backend API translation

3. **Generate contract tests** from contracts:
   - One test file per repository/service method
   - Assert schema validation (zod) and expected domain invariants (cycle prevention, duplicate association rejection)
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot`
   - Maintain brevity; include Angular, IndexedDB adapter, zod testing approach additions only once.

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach

### Scope

This section describes what the /tasks command will do - DO NOT execute during /plan.

**Task Generation Strategy** (for /tasks command later):

- Load `.specify/templates/tasks-template.md` as base
- Derive tasks from: entities (models), association invariants, polymorphic work item wrapper, checklist lifecycle, archival logic, ordering logic
- Each service contract method → contract test task [P]
- Each entity definition → model + zod schema + unit test task [P]
- Each user story → integration test (Playwright or high-level service orchestration) task
- Add tasks for accessibility (keyboard reorder, archived state labeling) and performance (cycle detection benchmark harness)
- Reference: contracts coverage table → `contracts/README.md#functional-requirement-mapping` for ensuring task completeness.

**Ordering Strategy**:

- TDD order: tests (schemas, services) precede implementation
- Dependency order: core value objects → entity schemas → repositories → domain services → UI components → integration scenarios
- Parallel [P]: Independent entity schema/test tasks

**Estimated Output**: 30-35 numbered tasks (slight increase due to accessibility & performance tasks)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation

### Note

These phases are beyond the scope of the /plan command.

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking

Fill ONLY if Constitution Check has violations that must be justified.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking

This checklist is updated during execution flow.

**Phase Status**:

- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:

- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v0.2.0 - See `/memory/constitution.md`*
