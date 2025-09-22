# Phase 0 Research: Work Management Core Domain Modeling

## Objectives

Resolve technical unknowns for a frontend-only Angular SPA implementing the core domain model with local persistence while preserving future backend extensibility.

## Decisions & Rationale

### 1. Storage Layer Strategy

- Decision: Use IndexedDB (via `idb` package) for structured entity and association storage; use `localStorage` only for ephemeral UI prefs (filters, last viewed entity id).
- Rationale: IndexedDB supports indexed queries, transactions, and larger data volumes than localStorage. Graph traversals and batch writes needed for association management benefit from IndexedDB atomic transactions.
- Alternatives considered: Plain localStorage (insufficient for volume/query patterns), in-memory only (no persistence), WebSQL (deprecated).

### 2. Entity Representation & Normalization

- Decision: Each core entity (Goal, Sub Goal, Portfolio, Project, Task, Sub Task, Step, WorkLog, WorkChecklist, ChecklistItem) stored in its own object store keyed by `id` (ULID for sortable lexicographic IDs). Many-to-many associations stored in dedicated edge stores with composite key string `${leftId}::${rightId}`.
- Rationale: Edge stores simplify duplicate prevention and cycle detection; ULIDs allow chronological sorting without server.
- Alternatives: Embed association arrays on entities (risk of write amplification & duplicate filtering complexity).

### 3. Polymorphic Work Item Entity

- Decision: Implement as lightweight discriminated reference `{ kind: 'goal'|'subGoal'|'portfolio'|'project'|'task', id: string }` embedded directly in WorkLog and WorkChecklist.
- Rationale: Avoids separate polymorphic table; simple runtime resolution via switch + store lookup.
- Alternatives: Separate `workItemEntity` store (adds indirection cost for no added value locally).

### 4. Cycle Detection (Goals/Sub Goals)

- Decision: Depth-first search with memoization and early exit on detection before commit; maintain adjacency map in memory built from edge store.
- Rationale: Graph size small (<5k); DFS clear and maintainable.
- Alternatives: Union-Find (better for undirected sets, additional complexity), incremental cycle caching (premature optimization).

### 5. Step Ordering

- Decision: Maintain integer `position` starting at 1 per Sub Task; reorder operation reassigns positions in new order sequentially.
- Rationale: Simple deterministic ordering; stable under insertion/removal.
- Alternatives: Gap-based ordering (allows fewer rewrites but unnecessary at small scale), fractional ordering (added complexity).

### 6. Checklist Completion Calculation

- Decision: Derive completion metrics on read (compute counts) and persist a cached `completionPct` field that is updated transactionally when checklist items change for quick listing.
- Rationale: Balance between real-time correctness and list view performance.
- Alternatives: Always compute dynamically (acceptable but slightly slower for large lists), event-sourced log (overkill for scope).

### 7. Archival Model

- Decision: Soft archive via `archivedAt: string | null`; cascade archival flags in a transaction when archival with cascade selected. Prevent new associations if archived.
- Rationale: Matches spec; preserves referential visibility.
- Alternatives: Boolean flag only (lack of temporal context), separate archive store (needless duplication).

### 8. Association History & Audit

- Decision: Maintain `association_events` store with records `{ id, type: 'add'|'remove', fromType, fromId, toType, toId, ts }` for Goal/Sub Goal associations + tasks/projects where required.
- Rationale: Provides minimal audit timeline; supports filtering and future export.
- Alternatives: Embedding event arrays on entities (write amplification / concurrency risk).

### 9. Validation & Schema Layer

- Decision: Use `zod` schemas for all entity create/update inputs; service layer performs invariant checks (cycle detection, duplicate prevention, ordering integrity) post-parse, pre-persist.
- Rationale: Clear separation of shape vs relational invariants.
- Alternatives: Custom validators only (reinvents schema validation), runtime TypeScript only (no runtime safety).

### 10. ID Generation

- Decision: Use ULIDs (library) for temporal ordering and uniqueness offline.
- Rationale: Natural sort order + future merge-friendly.
- Alternatives: UUID v4 (no ordering), incremental counters (collision risk across sessions).

### 11. Performance Safeguards

- Decision: Paginate large association queries in memory after retrieving edges by indexed key; implement defensive ceiling (warn if >10k edges). Precompute reverse indexes for frequently accessed relationships at load.
- Rationale: Keeps UI responsive; avoids scanning entire stores for each view.
- Alternatives: On-demand full scans (performance degradation at scale).

### 12. Future Backend Compatibility

- Decision: Define repository interfaces returning Promises to mirror eventual async API calls; isolate IndexedDB specifics in `IndexedDbRepositoryAdapter`.
- Rationale: Seamless swap to HTTP/GraphQL later.
- Alternatives: Direct synchronous objects (harder to retrofit network latency semantics).

### 13. Testing Approach

- Decision: Contract tests instantiate in-memory mock adapter (Map-based) to run fast; separate adapter tests cover IndexedDB specifics via jest-environment-jsdom + fake IndexedDB.
- Rationale: Deterministic fast unit tests; targeted persistence tests.
- Alternatives: Only test via real IndexedDB (slower, flakier).

### 14. Accessibility & UX Hooks

- Decision: Provide keyboard shortcuts for step reordering (e.g., Alt+Arrow), ARIA-live updates for checklist completion changes, visible archived badge component.
- Rationale: Meets constitution UX consistency & accessibility notes.
- Alternatives: Mouse-only interactions (non-compliant), hidden status updates.

### 15. Logging & Observability (Prototype Scope)

- Decision: Implement a minimal logger wrapper with levels (debug/info/warn/error) toggled by localStorage flag `debugMode`.
- Rationale: Lightweight, no backend; future expansion possible.
- Alternatives: Heavy telemetry libraries (unnecessary now).

## Open Items Resolved

No remaining NEEDS CLARIFICATION items for Phase 1.

## Risks & Mitigations

- Risk: IndexedDB schema migrations complexity → Mitigation: versioned upgrade handler, keep schema minimal early.
- Risk: Cycle detection performance at upper bound → Mitigation: memoization + test with synthetic 5k node graph.
- Risk: Data loss from clearing browser storage → Mitigation: export/import JSON utility planned (deferred, note for future tasks backlog).

## Summary

The research supports proceeding with Phase 1 design using a normalized entity-per-store model, edge-based many-to-many associations, DFS cycle detection, and schema-driven validation ensuring future backend portability.
