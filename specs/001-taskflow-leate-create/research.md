# Research: Simple Client-Side To-Do List (Angular 20+)

## Decision: Use Angular 20+ Standalone Components, Signals, IndexedDB, and LocalStorage

### Rationale
- Angular 20+ standalone components are the required and recommended approach for new features (per constitution and Angular best practices).
- Signals are the preferred state management primitive for local UI state, as recommended by Angular 20+ documentation.
- IndexedDB is used for transactional, persistent storage of tasks, supporting scalability and reliability for up to 500+ items.
- LocalStorage is used for lightweight, non-transactional UI state (e.g., filter selection, deleted panel open/closed state), as it is simple and synchronous.
- Accessibility and performance requirements are addressed using Angular CDK utilities and best practices (WCAG 2.1 AA, keyboard navigation, color contrast, etc.).

### Alternatives Considered
- NgRx or other external state libraries: Not needed for this scope; signals are sufficient and simpler.
- Service Workers for offline sync: Out of scope for initial release; local-only persistence is sufficient.
- Only LocalStorage for all data: Not chosen due to lack of transactional guarantees and scalability for large lists.
- Using Angular modules (NgModules): Not recommended for new code; standalone components are preferred.

### Best Practices (from Context7/Angular 20+)
- Use `ng generate` with `--standalone` for all components/services.
- Use signals for all local state; avoid external state libraries unless complexity demands.
- Use `bootstrapApplication` instead of `bootstrapModule` for app entrypoint.
- Import only required directives/components in each standalone component's `imports` array.
- Use IndexedDB for persistent, transactional data (tasks) and LocalStorage for ephemeral UI state.
- Enforce accessibility using Angular CDK and manual checks for keyboard/focus/contrast.
- Use unique `track` expressions in `@for` loops for efficient rendering (e.g., `track task.id`).
- Validate all user input (trim, length, etc.) in the UI before persisting.
- Avoid circular dependencies and keep all code in the frontend directory.

### Open Questions (all resolved in spec clarifications)
- Storage split: IndexedDB for tasks, LocalStorage for UI state.
- Soft delete/restore: In-memory buffer, purged on reload.
- Accessibility: WCAG 2.1 AA, keyboard, non-color indicators.

---

All research tasks complete. Ready for Phase 1 design.
