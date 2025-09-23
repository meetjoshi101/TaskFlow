<!--
Sync Impact Report
Version: 3.0.0 -> 3.1.0
Modified Principles:
 - I: Added Angular framework preference and simple implementation emphasis
 - II: Enhanced Angular CLI scaffolding guidance with Context7 integration
 - V: Added Angular-specific simplicity guidelines
Removed Sections: None
Added Sections:
 - Angular framework specification in technology stack
 - Simple implementation methodology
Templates Updated:
 - .specify/templates/plan-template.md ✅ (updated Constitution Check for Angular-first v3.1.0)
 - .specify/templates/spec-template.md ✅ (updated version reference to v3.1.0)
 - .specify/templates/tasks-template.md ✅ (updated version reference to v3.1.0)
 - .specify/templates/agent-file-template.md (no constitution references) ✅
Rationale for MINOR: Added new enforceable constraints (Angular framework, simple implementation) without breaking existing principles.
Deferred TODOs: None
-->

# TaskFlow Constitution

## Core Principles

### I. Angular-First Modular Architecture & Simple Implementation

Every functional capability MUST begin as a simple, standalone Angular component or service before considering more complex architectural patterns. Angular (v18+) with standalone components is the REQUIRED framework. Start with the simplest implementation that satisfies the requirement, then refactor only when complexity is proven necessary. Shared code MUST never be duplicated across components—promote to a reusable module when used twice. All Angular artifacts MUST be created using Angular CLI (`ng generate`) to ensure consistency. Libraries MUST declare explicit public APIs and semantic version constraints. Circular dependencies are PROHIBITED. Each module MUST include README, usage examples, and minimal contract tests before first consumption.

Simple Implementation Rules:
1. Always start with standalone components over feature modules
2. Use signals for state management before considering external state libraries  
3. Implement the minimal feature set that satisfies user requirements
4. Prefer built-in Angular features over third-party solutions
5. Add complexity only when simple solutions are proven insufficient through testing

Rationale: Enforces clear boundaries, enables rapid development through simplicity, and reduces regression surface when scaling the codebase.

### II. Angular CLI, MCP & Documentation Integration

Automation, scaffolding, and analysis capabilities MUST be exposed via Angular CLI commands or project-specific CLI wrappers emitting deterministic text or JSON (stdin/stdout; errors to stderr). Machine-readable command outputs MUST include a top-level `version` field and non-zero exit codes on failure with structured error objects. The MCP (Model Context Protocol) integration layer MUST remain stateless: no hidden side effects, idempotent reads, explicit writes.

Angular CLI Requirements:

1. ALL Angular artifacts (components, services, pipes, directives, guards) MUST be generated using `ng generate` commands
2. Initial workspace MUST be created with `ng new <project-name> --standalone --routing --style=css`
3. Use `--standalone` flag for all generated components to align with modern Angular patterns
4. Custom schematics SHOULD be created for repetitive patterns specific to the project

Documentation Requirements:

1. The Context7 MCP server MUST be used to fetch up-to-date documentation for Angular and related libraries instead of relying on potentially outdated local documentation
2. Before implementing any feature using Angular or related libraries (TypeScript, RxJS, etc.), the AI agent MUST query Context7 for current API documentation and best practices
3. Library version compatibility checks MUST be performed via Context7 to ensure recommended usage patterns align with the project's dependency versions
4. When scaffolding or generating code, the agent MUST validate generated patterns against Context7-retrieved documentation to ensure they follow current best practices
5. Custom implementations that deviate from Context7-documented patterns REQUIRE explicit justification in the plan Complexity section

Scaffolding Rules:

1. Start with Angular CLI defaults and customize only when necessary
2. Manual artifact creation is discouraged; use CLI generators to maintain consistency
3. Refactors (moves/renames) SHOULD use Angular CLI update/migration schematics when available
4. The AI agent MUST validate scaffolding output against Context7-retrieved documentation for consistency

Backward incompatible CLI or MCP contract changes REQUIRE a MAJOR version bump with deprecation notice (minimum 2 MINOR release overlap when feasible).

Rationale: Ensures access to current documentation, consistent Angular project structure, and reliable agent interoperability while leveraging Angular's built-in tooling ecosystem.

 
### III. Test-First Quality Gates (NON-NEGOTIABLE)
Red–Green–Refactor MUST govern all implementation work. For every new behavior: (1) Write failing unit/contract/integration test; (2) Commit failing test; (3) Implement minimal code to pass; (4) Refactor with tests GREEN. No production code WITHOUT a covering test. Mutation testing (or equivalent) MUST be applied to critical libraries (core logic, contract layer) with a documented threshold (initial ≥60%, target ≥80%). Pull Requests WITHOUT evidence of failing tests prior to implementation MUST be rejected. Flaky tests MUST be quarantined within 24h and either fixed or reverted—no ignored tests in main.
Rationale: Ensures provable correctness, reduces regressions, and supports confident refactoring.

 
### IV. Contract & Integration Testing Discipline
Any externally consumed API (public library API surface, CLI command, MCP method, HTTP endpoint) MUST have a contract test suite asserting request/response schema or observable behavior. Integration tests MUST cover: cross-library orchestration, persistence boundaries, and error propagation paths (success + failure). When a contract changes, a compatibility test MUST demonstrate either backward compatibility or clearly failing old behavior with documented migration notes. Contract drift WITHOUT tests is a blocker for release.
Rationale: Protects downstream consumers and stabilizes evolution of public interfaces.

 
### V. Operational Excellence (Observability, Versioning, Simplicity, Accessibility, Security)

Observability: Structured logging (JSON in production, human-readable locally) MUST exist at boundaries (CLI entrypoints, MCP handlers, persistence, external calls). Metrics for latency (p95), error rate, and test duration MUST be emitted or derivable. Traces SHOULD wrap cross-service or long-running flows.

Versioning: Semantic Versioning (MAJOR.MINOR.PATCH). MAJOR = breaking contracts; MINOR = backward compatible feature or principle additions; PATCH = fixes/clarifications. No unreleased breaking changes in main.

Simplicity: Prefer the simplest working abstraction; additional layers REQUIRE explicit justification tied to scaling or correctness. YAGNI enforced in review. Angular-specific simplicity rules:

- Use standalone components over NgModules unless module provides clear organizational benefit
- Use Angular signals for simple state before considering external state management
- Prefer built-in Angular pipes over custom utility functions
- Use reactive forms over template-driven forms for data validation
- Start with Angular's built-in HTTP client before adding request libraries

Accessibility: UI elements MUST meet WCAG 2.1 AA for color contrast, keyboard nav, and ARIA roles when applicable. Use Angular CDK accessibility utilities where available.

Security: Dependencies scanned weekly; critical CVEs (CVSS ≥9) patched within 48h, high (≥7) within one release cycle. Angular security best practices MUST be followed (sanitization, CSP, HTTPS).

Rationale: Sustains long-term maintainability, user trust, and operational reliability while leveraging Angular's built-in capabilities.

 
 
## Additional Constraints

Technology Stack: Angular (v18+), TypeScript ≥5.5, Node.js LTS (current active), Package manager: pnpm (preferred) or npm (if CI constraint). Use standalone components as the default pattern. Start with Angular's built-in features (signals, reactive forms, router) before adding external libraries. Build tooling MUST use Angular CLI defaults unless measurable improvement >10% demonstrated. Context7 MCP server MUST be used for documentation validation of all Angular and related library usage.

Documentation: Every component and service MUST include: purpose, public API, usage examples, test strategy, version notes. Architectural decision records (ADR) REQUIRED for: cross-cutting concerns, build pipeline deviations, or third-party library adoptions.

Quality Budgets: p95 unit test runtime <300ms per component; integration suite <5m total. Lint errors = build failure. Code coverage global minimum 85% lines, 90% for core logic components.

Forbidden Practices: Hidden side effects in constructors, dynamic reflection-based API wiring, global mutable singletons (except Angular DI providers), silent error swallowing, and undocumented feature flags.

## Development Workflow

Branching: `feature/{issue-id}-{slug}`, `fix/{issue-id}-{slug}`, `chore/{task}`. All feature branches MUST rebase (not merge) before opening a PR unless repository policy disallows.

Pull Request Gates: (1) All tests PASS; (2) New tests added first commit; (3) Constitution principles checklist completed in plan.md Constitution Check section; (4) Complexity deviations table filled if any principle bent; (5) Context7 documentation validation completed for external library usage; (6) No unresolved [NEEDS CLARIFICATION] markers in related spec.

Review: Minimum 1 qualified reviewer for PATCH, 2 for MINOR, 3 (including an architect steward) for MAJOR-impacting governance or architectural change.

CI Pipeline Order: Lint → Type check → Unit tests → Contract tests → Integration tests → Coverage gate → Build → Security scan.

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

**Version**: 3.1.0 | **Ratified**: 2025-09-23 | **Last Amended**: 2025-09-23
