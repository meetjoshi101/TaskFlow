# <!--
Sync Impact Report
Version change: TODO(OLD_VERSION) -> 0.2.0
Modified principles:

- Defined: Code Quality (new explicit wording)
- Defined: Testing Standards (TDD-first clarity)
- Defined: User Experience Consistency (new mandatory guidance)
- Defined: Performance & Scalability Requirements (new mandatory guidance)
- Clarified: Observability & Versioning (expanded guidance)

Added sections:

- Additional Constraints & Security Requirements
- Development Workflow & Quality Gates (expanded)

Templates updated:

- .specify/templates/plan-template.md ✅ updated
- .specify/templates/spec-template.md ✅ updated
- .specify/templates/tasks-template.md ✅ updated

Follow-up TODOs:

- TODO(RATIFICATION_DATE): confirm original ratification date and replace placeholder
- Update any agent-specific guidance files under `.specify/templates/commands/` if present (scan recommended)
-->

# TaskFlow Constitution

## Core Principles

### I. Code Quality (NON-NEGOTIABLE)

All source code MUST be clear, maintainable, and reviewable. Conventions (linting, formatting) MUST be enforced by pre-commit hooks and CI. Every public module or API MUST include concise documentation and examples. Complexity increases MUST be justified in PR descriptions and accompanied by unit tests and design notes.

Rationale: High code quality reduces maintenance cost, enables safer refactors, and improves developer onboarding.

### II. Testing Standards (TDD-FIRST, REQUIRED)

All features MUST follow a tests-first approach: failing tests (unit/contract/integration) are created before implementation. Tests MUST be deterministic, isolated where possible, and fast for unit-level checks. CI MUST run the full test suite on every merge; flaky tests MUST be quarantined and fixed within one sprint. Code coverage targets SHOULD be agreed per-repository and reported in CI dashboards.

Rationale: Tests-first ensures behavior is specified, regressions are caught early, and design remains testable.

### III. User Experience Consistency (MUST)

User-facing flows and interfaces MUST be consistent across the product. Design tokens, component libraries, wording, and error messaging MUST follow the documented UX guidelines. Accessibility basics (keyboard navigation, semantic markup, and sufficient color contrast) MUST be considered for every UI change. Any deviation from the style guide requires an explicit rationale and design review.

Rationale: Consistent UX reduces user confusion, lowers support cost, and improves accessibility and trust.

### IV. Performance & Scalability Requirements (MUST-DEFINE)

Every feature MUST include clear performance goals when performance is material to correctness or user experience (e.g., p95 latency targets, memory limits, throughput). Reasonable defaults apply: backend endpoints SHOULD aim for <200ms p95 under typical load; critical batch jobs SHOULD complete within agreed SLAs. Performance work MUST include benchmarks, reproducible load tests, and monitoring instrumentation.

Rationale: Explicit performance expectations prevent regressions and guide design decisions under realistic constraints.

### V. Observability & Versioning

Systems MUST emit structured logs and key metrics; trace context SHOULD be propagated for request flows where applicable. Releases MUST follow semantic versioning for public APIs; breaking changes MUST be communicated in release notes with migration guidance. Backward-incompatible governance-level changes to this constitution are MAJOR bumps; additions or new principles are MINOR bumps; editorial clarifications are PATCH bumps.

Rationale: Observability enables debugging and SLO tracking; clear versioning reduces friction for consumers.

## Additional Constraints & Security Requirements

Security MUST be a first-class concern: secrets MUST never be checked into source control, sensitive data MUST be encrypted in transit and at rest when required by law or policy, and third-party dependencies MUST be vetted for known vulnerabilities on dependency updates. Technology stack choices SHOULD favor widely-supported, secure ecosystems and be documented in the plan for new features.

## Development Workflow & Quality Gates

Code reviews are REQUIRED for all changes to main branches. PRs MUST include: summary of change, linked design or spec, test plan, and any migration steps. CI gates MUST include linting, unit tests, and security scans. Manual approval from a maintainer is REQUIRED for production deployments and major architectural changes. Complexity trade-offs MUST be documented in the Complexity Tracking section of feature plans.

## Governance

This constitution supersedes informal practices. Amendments to principles or governance require a documented proposal, review by at least two maintainers, and a migration plan for any breaking process changes. Changes that add mandatory developer effort (e.g., new checks in CI) MUST include an implementation timeline and testing plan.

**Version**: 0.2.0 | **Ratified**: TODO(RATIFICATION_DATE): confirm original adoption date | **Last Amended**: 2025-09-22
