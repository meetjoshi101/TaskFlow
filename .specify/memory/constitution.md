<!--
Sync Impact Report
- Version change: 2.1.1 -> 2.2.0
- Modified principles: Added/expanded principles for Code Quality, Testing Standards,
	User Experience Consistency, Performance Requirements, and Release & Observability
- Added sections: `Additional Constraints`, `Development Workflow` (clarified)
- Removed sections: None
- Templates requiring updates:
	- ✅ /workspaces/TaskFlow/.specify/templates/plan-template.md
	- ✅ /workspaces/TaskFlow/.specify/templates/spec-template.md
	- ✅ /workspaces/TaskFlow/.specify/templates/tasks-template.md
	- ⚠ /workspaces/TaskFlow/.specify/templates/agent-file-template.md (manual review recommended)
- Follow-up TODOs:
	- TODO(RATIFICATION_DATE): original ratification date unknown — please provide ISO date
	- TODO: Run CI checks to add automated constitution gates into project pipeline
	- TODO: Review `agent-file-template.md` to ensure generated guidance mirrors new principles
-->

# TaskFlow Constitution
<!-- Canonical governance and mandatory engineering principles for the TaskFlow project -->

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)
All code MUST follow the project-wide TypeScript and Angular standards: strict typing,
no use of `any` except behind an explicit, documented adapter, and preservation of public
APIs. Components MUST be small and single-responsibility. Prefer standalone Angular
components and signals-based state; set `ChangeDetectionStrategy.OnPush` on components.
Every library or feature MUST include API surface documentation and an automated lint
configuration. Rationale: Consistent, strongly-typed code reduces bugs, accelerates
onboarding, and enables safe refactors at scale.

### II. Testing Standards (NON-NEGOTIABLE)
Tests are a first-class deliverable. The project enforces a tests-first workflow:
write failing tests (unit, integration/contract, and where applicable performance tests)
before implementation. Pull requests MUST include tests covering the new behavior and
maintain or improve overall coverage. Acceptance gates: unit tests in CI, contract tests
for API boundaries, integration tests for cross-cutting flows, and explicit performance
benchmarks for performance-sensitive changes. Rationale: Prevent regressions and make
designs verifiable and maintainable.

### III. User Experience Consistency
User-facing interfaces MUST follow shared design tokens, accessibility (a11y) standards,
and component contracts. Use `NgOptimizedImage` for static images, prefer inline
templates for small components, and ensure keyboard and screen-reader support where
applicable. Visual and interaction patterns MUST be documented and re-used rather than
reimplemented. Rationale: Consistent UX reduces cognitive load for users and accelerates
feature composition.

### IV. Performance Requirements
Performance targets MUST be explicit for features expected to operate at scale. Define
performance budgets (e.g., bundle size, initial render p95, API p95) in the feature
spec and include profiling evidence for non-trivial changes. Apply lazy-loading,
code-splitting, and efficient change detection patterns; measure before and after
optimizations. Rationale: Early budget enforcement prevents regressions and keeps the
application responsive under load.

### V. Release, Versioning & Observability
Follow semantic versioning for public APIs. Linking and assignment operations MUST be
idempotent; enforce soft deletes with visibility rules. Instrument code with structured
logs and metrics; use tracing for critical flows. Breaking changes require a documented
migration path and a MAJOR version bump. Rationale: Clear release rules and observability
are essential for diagnosing issues and coordinating cross-team changes.

## Additional Constraints
Technology and compliance constraints derived from core principles:

- Project MUST remain a standalone Angular v20+ application: no NgModules; use
	standalone components and signals.
- TypeScript `strict` mode enabled; prefer `unknown` if type is uncertain; avoid `any`.
- No authentication/authorization baked into the core (design decision) — features may
	add auth adapters but must document them in their spec.
- All static images MUST use `NgOptimizedImage` where feasible.
- Performance budgets and accessibility checks are mandatory for user-facing features.

## Development Workflow & Quality Gates

- PRs MUST reference a feature spec and the relevant tests. Tests MUST be present and
	passing in CI before merge. Commits that change public contracts MUST include
	contract tests that initially fail.
- Code review MUST validate: adherence to Code Quality, Tests, UX, and Performance
	principles. Reviews must include at least one maintainer approval for substantial
	changes (configurable per-repo settings).
- Complexity deviations (technical debt, exceptions to principles) MUST be documented
	in the PR description and approved by maintainers, with a remediation plan and
	timeline.
- Performance-sensitive PRs MUST include before/after measurements or explicit
	justification if measurements are deferred.

## Governance

Amendments to this constitution are the canonical way to change project-level rules.
Procedure:

1. Propose changes by editing `.specify/memory/constitution.md` in a PR that documents
	the rationale and impact (tests, templates, and migration steps if applicable).
2. The PR MUST include a version bump following semantic rules described below and a
	`Last Amended` ISO date.
3. Approval: At least one repository maintainer must approve. For MAJOR governance
	changes (removal or redefinition of principles) a two-maintainer approval is
	recommended.

Versioning policy:

- MAJOR: incompatible governance or principle removals/redefinitions.
- MINOR: new principle or material expansion of existing principles.
- PATCH: clarifications, wording, or typo fixes.

Compliance reviews:

- Every PR that changes code or config which could affect these principles MUST include
  a Constitution Check section in its description listing the applicable principles and
  how the changes comply.
- Automated checks (lint, test, and performance where configured) SHOULD be added to
  CI to enforce gates over time.

**Version**: 2.2.0 | **Ratified**: TODO(RATIFICATION_DATE): provide original adoption date | **Last Amended**: 2025-09-22