# Phase 0 Research: Simple Client-Side To-Do List

## Decisions & Rationale

### Storage Layer

- **Decision**: Hybrid: Tasks persisted in IndexedDB object store; UI state (filter, Deleted panel) in localStorage.
- **Rationale**: IndexedDB scales for record-level operations (edit, toggle) with minimal rewrite overhead; localStorage trivial for tiny UI flags.
- **Alternatives Considered**:
  - Single localStorage JSON blob: Simpler but whole-list rewrite costs & risk of partial corruption on concurrent tab writes.
  - localStorage per-task keys: Key explosion & iteration overhead for 500 tasks.
  - Full IndexedDB for UI flags: Overkill serialization.

### Soft Delete & Restore

- **Decision**: Session-only soft delete buffer (in-memory) with Deleted panel; purged on reload.
- **Rationale**: Avoids complex persistence & migration of deleted records; keeps UI simple while enabling quick recovery from accidental deletes.
- **Alternatives**:
  - Persisted deleted flag: Adds complexity & UX overhead for permanently deleted state management.
  - Immediate hard delete only: Higher accidental loss risk.

### Inline Editing Behavior

- **Decision**: Enter saves, blur saves, Escape cancels.
- **Rationale**: Aligns with common UX patterns; reduces friction vs explicit buttons; accessible via keyboard.
- **Alternatives**: Buttons (more clicks), autosave per keystroke (noise & performance), blur cancel (data loss risk).

### Bulk Clear Completed

- **Decision**: Confirmation dialog required.
- **Rationale**: Prevents irreversible bulk loss; reinforces safe destructive actions.
- **Alternatives**: Undo snackbar (additional complexity), immediate action (risk).

### UI State Persistence

- **Decision**: Persist filter + Deleted panel open state in localStorage.
- **Rationale**: Restores user mental model; minimal storage footprint.
- **Alternatives**: Session-only (loss of continuity), full layout snapshot (overkill).

### Performance Strategy

- Preload tasks sequentially from IndexedDB at startup (single transaction) and render incrementally if >300 tasks to keep first meaningful paint <1s.
- Defer a11y audits (axe) to post-initial render test stage.
- Avoid heavy state libs; rely on Angular signals or simple services.

### Accessibility Baseline

- Visible focus ring on all actionable elements.
- Completed status announced with text (e.g., "(completed)").
- Buttons have descriptive `aria-label` for delete, toggle, restore.
- Panel state changes announced via `aria-live="polite"` region.

### Testing Strategy (High-Level)

- Unit tests: Task model validation, persistence service (mock IndexedDB), filtering logic, soft delete buffer.
- Integration tests: Add → edit → toggle → delete → restore → bulk clear path; filter persistence across reload (simulated); soft delete purge after reload.
- Accessibility smoke tests: Keyboard traversal (tab order), role presence, basic contrast checks (manual / tooling).

### Risk & Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| IndexedDB API variability | Data load failure | Low | Use well-tested wrapper (idb) |
| Soft delete buffer memory growth | Increased RAM | Low | 500 task cap & session purge |
| Race conditions multi-tab | Stale views | Medium | Accept requirement (manual refresh) |
| Over-fetch on startup | Slower initial render | Low | Batch read once, lazy secondary rendering if >300 |

### Open (Deferred) Topics

- Mutation testing tooling (future when scale grows).
- Theming / dark mode (explicitly out of initial scope).
- i18n / localization (single language for now).

## Summary Table

| Topic | Decision | Status |
|-------|----------|--------|
| Storage | IndexedDB + localStorage | Final |
| Soft Delete | Session-only in-memory buffer | Final |
| Editing | Enter/blur save, Esc cancel | Final |
| Bulk Clear | Confirm dialog | Final |
| UI State Persistence | Filter + panel open state | Final |
| Performance Budget | 500 tasks <1s initial render | Final |
| Accessibility | WCAG 2.1 AA baseline | Final |

All clarifications integrated; no unresolved blocking unknowns remain.
