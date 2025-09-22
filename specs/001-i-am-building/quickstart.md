# Quickstart: Work Management Core Domain (Frontend Prototype)

This quickstart guides running tests-first development for the Angular + IndexedDB prototype.

## Prerequisites
- Node.js 20+
- npm 10+

## Install
```
npm install
```
(Dependencies to be added when implementation phase begins.)

## Development Flow (TDD)
1. Write failing zod schema & repository contract tests for one entity (e.g., Goal).
2. Implement minimal model & in-memory adapter to make tests pass.
3. Add association tests (Goal↔Project, Goal↔Task) including duplicate & cycle prevention.
4. Implement DFS cycle detection; confirm failing test flips.
5. Add Sub Goal multi-parent tests & audit event append tests.
6. Implement edge stores + audit recording.
7. Add WorkLog + Checklist tests (completion calculation & orphan prevention).
8. Implement checklist completion logic & cached percentage updates.
9. Add lineage traversal tests (step path, work log context).
10. Implement traversal queries.
11. Add accessibility tests (keyboard reorder, archived badges present) via Playwright.
12. Build Angular components incrementally (read-only views first, then mutation flows) making tests pass.

## Running Tests
(Unit & integration harness placeholders until code scaffolded.)
```
npm test
```

## Data Reset (Prototype)
Provide a temporary utility (later) to clear IndexedDB stores: `window.taskFlowDev.resetAll()` in dev tools.

## Export/Import (Deferred)
A JSON export/import utility will be introduced post-initial domain validation.

## Performance Check
Performance validation adds confidence that local algorithms meet targets.

### Seed & Benchmark (Planned)
```
npm run seed:graph   # Seeds ~5k entities + edges
npm run bench:cycles # Runs cycle detection benchmarks (reports p95)
npm run bench:lineage # Runs lineage path retrieval benchmarks
```
Targets:
- Cycle detection (5k node graph add edge check) p95 < 300ms
- Lineage query (deep Step → Portfolios + Goals/Sub Goals) p95 < 50ms

### Measuring
Bench commands output JSON summary (planned):
```
{
	"cycleDetection": { "p50": 42, "p95": 185 },
	"lineage": { "p50": 8, "p95": 31 }
}
```
Fail the benchmark script (exit code 1) if p95 exceeds target thresholds.

## Accessibility Tests
Playwright + axe-core integration planned:
```
npm run test:accessibility
```
Scenarios:
- Keyboard-only step reorder (Alt+Arrow) cycles through list without focus loss.
- Archived entity badge has ARIA label (e.g., `aria-label="Archived entity"`).
- Checklist completion updates announced via ARIA live region.
- Color contrast verification for status indicators (acceptable ratio >= 4.5:1).

## Error Code Validation
Add unit tests asserting expected `DomainError.code` for:
- Duplicate edge (DUPLICATE_EDGE)
- Cycle attempt (CYCLE_DETECTED)
- Archive mutation (ARCHIVED_CONFLICT)
- Excess batch size (LIMIT_EXCEEDED)
- Invalid reference (NOT_FOUND)

## Next Steps
After Phase 1 design approval, run `/tasks` command to generate tasks list, then begin TDD cycle following ordering constraints.
