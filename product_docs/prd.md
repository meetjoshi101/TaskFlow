# Taskflow

## Overview

Taskflow is a focused client-side work management application for organizing strategic Goals, Portfolios, Projects, and Tasks. Authentication and authorization are intentionally omitted to accelerate iteration on core domain features and to keep the MVP focused on domain modeling, UX, and client-side persistence.

## Core Concepts and Hierarchy

- Goal (root strategic intent)
  - Can contain: sub-goals, portfolios, projects, tasks
  - Supports nested sub-goals (recursive)
- Portfolio (groups related projects)
  - Can belong to multiple goals
  - Can contain projects
- Project (deliverable container)
  - Can belong to multiple portfolios
  - Can contain tasks and task sections
- Task (actionable unit)
  - Can belong to multiple projects
  - Can have subtasks
  - Can be grouped via task sections
- Task Section (logical grouping of tasks within a project)

## Relationship Rules

- A Goal may have children of any work type (goals, portfolios, projects, tasks).
- Sub-goals attach only to Goals.
- A Task may be linked to multiple Projects (many-to-many).
- A Project may appear in multiple Portfolios (many-to-many).
- Task Sections group Tasks within a Project (no nesting).
- Subtasks inherit no automatic linkage to projects unless the parent task provides it.
- Deleting or archiving a parent does not hard-delete children by default (soft semantics).

## Data Model (concise)

Common fields for all entities:
- id: string (stable UUID)
- title: string
- description?: string
- status: enum {active, completed, archived}
- createdAt: ISO timestamp
- updatedAt: ISO timestamp
- archivedAt?: ISO timestamp
- metadata?: Record<string, unknown>

Entity-specific:
- Goal: parentGoalId?: string, childIds: string[], maxDepth?: number (system/config)
  - default max depth for sub-goals: 3 (configurable per workspace)
- Portfolio: goalIds: string[], projectIds: string[]
- Project: portfolioIds: string[], taskIds: string[], sectionIds: string[]
- Task: projectIds: string[], parentTaskId?: string, subtaskIds: string[], sectionId?: string, position?: number
- TaskSection: projectId: string, taskIds: string[], position?: number

Many-to-many pivots (client-side arrays/sets):
- task_projects: Task.projectIds
- project_portfolios: Project.portfolioIds

Idempotency: linking operations must be no-ops when the link already exists.

## Functional Scope (MVP)

Included:
- Create / Read / Update / Archive (soft-delete) Goals, Portfolios, Projects, Tasks
- Link / Unlink tasks ↔ projects and projects ↔ portfolios (idempotent)
- Add / reorder / complete subtasks
- Nest goals (with circular reference prevention and depth rules)
- Group tasks via sections and reorder tasks within sections
- Filtering by status and hierarchy path
- Client-side durable persistence and snapshot export/import

Excluded:
- User accounts, roles, and permissions
- Real-time collaboration
- External integrations and notifications
- Advanced reporting and analytics

## Acceptance Criteria (MVP)

- CRUD flows: user can create, edit, view, and archive Goals/Portfolios/Projects/Tasks.
- Nesting: user can add sub-goals up to the configured max depth (default: 3); circular references prevented.
- Many-to-many: user can link/unlink tasks↔projects and projects↔portfolios; UI shows membership clearly.
- Sections: user can add/reorder sections and move tasks between sections; order persisted in client state and durable snapshots.
- Soft-delete: archived parents do not hard-delete children; children remain active and show orphaned state if all parents archived. No automatic descendant archival occurs.
- Drag-and-drop: reorder within a section persists position in client state.
- Idempotency: repeated linking or unlinking operations leave the state unchanged after first application.
- Accessibility: keyboard navigation for lists/trees, ARIA for drag-and-drop controls, announcements for critical actions.

Success metrics (initial)
- Basic flows succeed without errors in 90% of manual test runs.
- No circular goal references observed in tests.
- UI shows correct membership for cross-associated entities in 95% of scenarios.

## Data Integrity & Constraints

- Prevent circular goal nesting (detect via DFS on link attempt).
- Enforce configurable max depth for sub-goals (default: 3; workspace-level override available via workspace config).
- Client-side state persistence: runtime state held in-memory as the canonical signal graph; durable snapshots persisted across sessions (IndexedDB primary, localStorage fallback).
- Soft delete: archive flag toggled; children retained and rendered with orphan indicators if no active parent. Archiving is non-destructive — no automatic descendant archival is performed by default.
- Validate many-to-many consistency: operations update both sides atomically in client state.
- Reject invalid moves (e.g., placing a task into a non-existent section).

## Frontend Plan (high-level, non-technical)

Purpose
- Define screens, user flows, UI surface, state boundaries, persistence expectations, accessibility targets, test/QA criteria, and delivery milestones — without implementation-level detail.

Primary UX principles
- Page-first navigation: entities have dedicated full-page views; the Goal tree is a navigational entry point (route), not a persistent side panel.
- Non-destructive state: archive = soft; orphan indicators visible.
- Fast inline actions: quick-add, inline edit, keyboard-first reordering.
- Predictable many-to-many management: explicit dialogs/panels for linking operations.

Primary screens / views
- Workspace / Home: summary widgets, recent items, quick-add entrypoint.
- Goals: full-page goal tree navigator and goal detail pages (/goals, /goals/:id).
- Projects: project page with sections and task lists (/projects/:id).
- Tasks: task detail page with subtasks and linked projects (/tasks/:id).
- Portfolios: portfolio list and membership editor (/portfolios).
- Global search / filter overlay.

Core conceptual components (page-oriented)
- GoalTreePage: full-page tree navigator, keyboard nav, collapse/expand, orphan/archived indicators.
- EntityPage: full-page detail and quick actions for Goals/Projects/Tasks/Portfolios.
- TaskSectionsContainer: ordered task section container for a project.
- TaskSection: header controls, add + reorder, drop target affordances.
- TaskRow: compact task view with reorder affordance and inline controls.
- ManyAssociationModal: manage multi-membership with clear commit/undo flows.
- QuickAddInline: minimal form for fast create actions.
- ArchiveUndoBanner: shows after archive actions with undo CTA.

Routing & navigation pattern
- Full-page routes:
  - /goals -> goal tree page
  - /goals/:id -> goal detail page
  - /projects/:id -> project page
  - /tasks/:id -> task detail page
  - /portfolios -> portfolios page
- Selecting an entity navigates to its dedicated page where details and quick actions are available.

Drag & Drop strategy (decision summary)
- Angular CDK DragDrop selected as the primary DnD strategy for reordering within sections and cross-section moves.
- Ensure keyboard-first reordering and ARIA announcements for moves.
- Provide a small DnD adapter abstraction in the architecture to allow future swap of implementation without changing page-level components.

State surface (conceptual slices)
- workspaceConfig: maxGoalDepth, persistence options, UI preferences
- entities: normalized maps for goals, portfolios, projects, tasks, sections
- relations: derived views for many-to-many relationships
- ui: route-driven selectedEntityId, open modals, ephemeral DnD preview state, filter/search state
- persistence: snapshot metadata and migration version

Persistence & sync semantics
- Canonical runtime: in-memory signal graph (single source of truth).
- Durable snapshots: persisted across sessions (IndexedDB primary, localStorage fallback).
- Debounced writes and versioned snapshot migrations.
- Export/import snapshot for QA and repro.
- All state mutations are idempotent at the surface API level.

User flows (brief)
- Create sub-goal: navigate to parent goal page → quick-add → validate depth/circular → commit → show in tree.
- Link task ↔ project: open ManyAssociationModal → select/unselect → commit (idempotent).
- Reorder tasks: keyboard or pointer reorder → preview + commit → persist snapshot.
- Archive parent: confirm → archive (children remain active) → show orphan indicators + optional explicit bulk-archive surfaced as a separate user-invoked action.

Accessibility checklist (MVP)
- Keyboard navigation for GoalTree and TaskSection lists and reordering.
- ARIA live announcements for DnD moves, archives, and bulk actions.
- Focus management after create/move/archive actions.
- Clear visual focus styles and semantic roles for lists and drop targets.
- Screen-reader labels for orphaned/archived states.

Testing & QA (acceptance-focused)
- Unit: state transformations and services (no circular goal creation, idempotent links, archive behavior).
- Integration: snapshot restore, reorder persistence, many-to-many flows.
- Manual: keyboard DnD, orphan/archived UX, undo flow for archive.
- Seeded demo data for reproducible manual test runs.

Deliverables & milestones (suggested)
- Milestone 1 (week 1–2): Core data model + in-memory UI flows, GoalTree page + basic CRUD.
- Milestone 2 (week 3–4): Project pages with sections + reorder flows, persistence snapshot + restore.
- Milestone 3 (week 5): Many-to-many association workflows, Portfolios page.
- Milestone 4 (week 6): Accessibility polish, tests, demo seed, QA pass.

Developer experience notes
- Workspace configuration (workspace.config.json) exposes maxGoalDepth and persistence options.
- Provide export/import snapshot for QA and a seed/demo CLI for manual testing.
- Keep TypeScript strictness and signal-first state patterns across the codebase.

Future extensions (deferred)
- Timeline / Gantt
- Dependency graph and visualizations
- Objective / Key Result metadata
- Bulk editing and advanced reporting

This document captures the functional definition and the high-level frontend plan for the TaskFlow MVP: non-destructive archiving, configurable goal depth (default 3), IndexedDB-first persistence with localStorage fallback, Angular CDK DnD strategy, and full-page entity views.

