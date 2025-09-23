<!--
Sync Impact Report
Version: 1.1.0 -> 2.0.0
Modified Principles:
 - II: Expanded & consolidated with former VI (now removed)
Removed Principles:
 - VI (Scaffolded Generation & Agent Automation) merged into II
Added Sections: None (structural consolidation)
Templates Updated:
 - .specify/templates/plan-template.md ✅ (version ref)
 - .specify/templates/spec-template.md ✅ (version ref)
 - .specify/templates/tasks-template.md ✅ (version ref)
 - .specify/templates/agent-file-template.md (no change needed) ✅
Rationale for MAJOR: Principle removal (renumbering) per governance rules; content preserved but numbering changed.
Deferred TODOs: None
-->

# TaskFlow Constitution

## Core Principles

### I. Angular Monorepo & Library-First Architecture
Every functional capability MUST begin as an isolated, testable Angular (v20+) library or standalone feature module before integration into any application shell. Shared code MUST never be duplicated across apps—promote to a library when reused twice. Libraries MUST declare explicit public APIs (barrel exports) and semantic version constraints. Circular dependencies are PROHIBITED. Internal implementation details MUST NOT leak via deep imports. Each library MUST include README, usage examples, and minimal contract tests before first consumption. Architectural changes that increase coupling REQUIRE written justification in the plan Complexity section.
Rationale: Enforces clear boundaries, enables parallel development, and reduces regression surface when scaling the codebase.

### II. CLI, MCP & Automated Scaffolding Interface
Automation, scaffolding, and analysis capabilities MUST be exposed via Angular CLI commands or project-specific CLI wrappers emitting deterministic text or JSON (stdin/stdout; errors to stderr). Machine-readable command outputs MUST include a top-level `version` field and non-zero exit codes on failure with structured error objects. The MCP (Model Context Protocol) integration layer MUST remain stateless: no hidden side effects, idempotent reads, explicit writes.

Scaffolding Rules:
1. All Angular artifacts (components, standalone components, directives, pipes, services, guards, interceptors, feature modules, libraries) MUST be generated via `ng generate` with enforced defaults (e.g., `--standalone`, `--skip-tests=false`).
2. Libraries MUST be created with `ng generate library <name>`; publishable boundaries or path mappings MUST NOT be manually mutated without an ADR.
3. Schematics defaults (in `angular.json` / `schematics`) MUST encode required flags; drift in generated structure vs defaults is a CI failure.
4. The AI agent MUST invoke artifact creation through the MCP Angular provider (no raw file writes for scaffolded assets).
5. Refactors (moves/renames) SHOULD use provided Angular CLI or migration schematics to preserve metadata.
6. Missing expected generated companion files (e.g., `*.spec.ts`) or manual artifact stubs in place of CLI output MUST block merge.

Backward incompatible CLI or MCP contract changes REQUIRE a MAJOR version bump with deprecation notice (minimum 2 MINOR release overlap when feasible). Manual hand-written initial scaffolding is only allowed for test fixtures or spike branches; promotion requires re-generation before merge.
Rationale: Ensures reproducible automation, consistent structure, future schematic upgrade adoption, and reliable agent interoperability.

### III. Test-First Quality Gates (NON-NEGOTIABLE)
Red–Green–Refactor MUST govern all implementation work. For every new behavior: (1) Write failing unit/contract/integration test; (2) Commit failing test; (3) Implement minimal code to pass; (4) Refactor with tests GREEN. No production code WITHOUT a covering test. Mutation testing (or equivalent) MUST be applied to critical libraries (core logic, contract layer) with a documented threshold (initial ≥60%, target ≥80%). Pull Requests WITHOUT evidence of failing tests prior to implementation MUST be rejected. Flaky tests MUST be quarantined within 24h and either fixed or reverted—no ignored tests in main.
Rationale: Ensures provable correctness, reduces regressions, and supports confident refactoring.

### IV. Contract & Integration Testing Discipline
Any externally consumed API (public library API surface, CLI command, MCP method, HTTP endpoint) MUST have a contract test suite asserting request/response schema or observable behavior. Integration tests MUST cover: cross-library orchestration, persistence boundaries, and error propagation paths (success + failure). When a contract changes, a compatibility test MUST demonstrate either backward compatibility or clearly failing old behavior with documented migration notes. Contract drift WITHOUT tests is a blocker for release.
Rationale: Protects downstream consumers and stabilizes evolution of public interfaces.

### V. Operational Excellence (Observability, Versioning, Simplicity, Accessibility, Performance, Security)
Observability: Structured logging (JSON in production, human-readable locally) MUST exist at boundaries (CLI entrypoints, MCP handlers, persistence, external calls). Metrics for latency (p95), error rate, and test duration MUST be emitted or derivable. Traces SHOULD wrap cross-service or long-running flows.
Versioning: Semantic Versioning (MAJOR.MINOR.PATCH). MAJOR = breaking contracts; MINOR = backward compatible feature or principle additions; PATCH = fixes/clarifications. No unreleased breaking changes in main.
Simplicity: Prefer the simplest working abstraction; additional layers REQUIRE explicit justification tied to scaling or correctness. YAGNI enforced in review.
Accessibility: UI elements (if/when Angular app shell emerges) MUST meet WCAG 2.1 AA for color contrast, keyboard nav, and ARIA roles.
Performance: Establish and enforce budgets: initial Angular bundle ≤250KB gzip main bundle; critical path interactive <2s on baseline hardware; CLI command startup <500ms (cold) where feasible.
Security: Dependencies scanned weekly; critical CVEs (CVSS ≥9) patched within 48h, high (≥7) within one release cycle.
Rationale: Sustains long-term maintainability, user trust, and operational reliability.



## Additional Constraints
Technology Stack: Angular 20+, TypeScript ≥5.5, Node.js LTS (current active), Package manager: pnpm (preferred) or npm (if CI constraint). Styling system: CSS variables + scoped component styles; avoid global overrides. State management: lightweight signals or RxJS where reactive orchestration needed—NO premature global state libraries. Build tooling MUST rely on Angular CLI defaults unless measurable build-time or bundle-size improvement >10% demonstrated.
Documentation: Every library MUST include: purpose, public API, example usage, test strategy, version notes. Architectural decision records (ADR) REQUIRED for: cross-cutting concerns, build pipeline deviations, or third-party platform adoptions.
Quality Budgets: p95 unit test runtime <300ms per library; integration suite <5m total. Lint errors = build failure. Code coverage global minimum 85% lines, 90% for core logic libs.
Forbidden Practices: Hidden side effects in constructors, dynamic reflection-based API wiring, global mutable singletons (except DI root providers), silent error swallowing, and undocumented feature flags.

## Development Workflow
Branching: `feature/{issue-id}-{slug}`, `fix/{issue-id}-{slug}`, `chore/{task}`. All feature branches MUST rebase (not merge) before opening a PR unless repository policy disallows.
Pull Request Gates: (1) All tests PASS; (2) New tests added first commit; (3) Constitution principles checklist completed in plan.md Constitution Check section; (4) Complexity deviations table filled if any principle bent; (5) Bundle size & performance budgets validated (provide evidence in PR description when applicable); (6) No unresolved [NEEDS CLARIFICATION] markers in related spec.
Review: Minimum 1 qualified reviewer for PATCH, 2 for MINOR, 3 (including an architect steward) for MAJOR-impacting governance or architectural change.
CI Pipeline Order: Lint → Type check → Unit tests → Contract tests → Integration tests → Coverage gate → Build (if library publish) → Bundle analysis → Security scan.
Release Process: Automated version bump via commit semantics (`feat:` = MINOR, `fix:` = PATCH, `breaking:` tag or explicit indicator = MAJOR). Release notes auto-generated; manual curation for MAJOR. MCP & CLI artifacts version-locked together.
Backporting: Only security and critical regression fixes; MUST include reproducible failing test cherry-picked first.

## Governance
Authority: This constitution supersedes ad-hoc practices. Conflicts resolved in favor of the most recent ratified version.
Amendments: Proposed via PR labeled `governance`. Include: (1) Motivation; (2) Impacted principles; (3) Version bump type justification; (4) Migration/rollout plan. MINOR requires ≥2 approvals; MAJOR requires ≥3 including architect steward and 1 rotating maintainer.
Versioning Policy: Update **Version** metadata and include Sync Impact Report header changes describing deltas. Use Semantic Versioning rules defined in Principle V. A change that redefines or removes a principle is MAJOR. Adding a new enforceable constraint = MINOR. Textual clarifications (no normative effect) = PATCH.
Compliance & Review: Every plan.md MUST translate principles into a Constitution Check gate list. CI MAY enforce automated detection (e.g., coverage thresholds, bundle size). Manual reviewers MUST reject PRs violating non-negotiable gates (Principle III & breaking changes without version bump).
Enforcement: Repeated violations trigger a hardening sprint where only remediation tasks are allowed until compliance restored.
Sunset / Decommission: A principle may be deprecated (labeled "DEPRECATED" for ≥1 MINOR release) before removal in a MAJOR.
Record Keeping: Maintain a CHANGELOG section for governance amendments referencing PR numbers.

**Version**: 2.0.0 | **Ratified**: 2025-09-23 | **Last Amended**: 2025-09-23
