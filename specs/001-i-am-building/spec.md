# Feature Specification: Work Management Core Domain Modeling

**Feature Branch**: `001-i-am-building`  
**Created**: 2025-09-22  
**Status**: Draft  
**Input**: User description: "I am building a work-management system. The system should have the following work groups:-\n\n1. Strategic Planning\n2. Execution\n3. Operations\n\nEach work group should have the following work type:-\n\nA. Goals Management\n    - Goals\n    - Sub Goals\nB. Execution\n    - Portfolios\n    - Projects\n    - Tasks\n    - Sub Tasks\n    - Steps\nC. Operations\n    - Work Item Entity (represents Goals, Sub Goals, Portfolios, Projects, Tasks)\n    - Work Log\n    - Work Checklist\n\nFollowing is the relationship between the work groups and work types:-\n\n1. Strategic Planning\n    - Goals can have multiple Sub Goals.\n    - Sub Goals can be part of multiple Goals.\n    - Goals and Sub Goals can have a many-to-many association with Portfolios, Projects, and Tasks.\n\n2. Execution\n    - Portfolios can have multiple Projects\n    - Projects can have multiple Tasks\n    - Tasks can have multiple Sub Tasks\n    - Sub Tasks can have multiple Steps\n    - Project can be part of multiple Portfolios\n    - Task can be part of multiple Projects\n\n3. Operations\n    - Work Log can be associated with a Work Item Entity.\n    - Work Checklist can be associated with a Work Item Entity and Work Log.\n    - Work Item Entity can have multiple Work Logs.\n    - Work Log can have multiple Work Checklists.\n    - Work Item Entity is a polymorphic type that can represent one of: Goal, Sub Goal, Portfolio, Project, or Task.\n\nExclude:\n    1) User Management and User Authencation.\n\nFocuse on core features only."

## User Scenarios & Testing *(mandatory)*

### Primary User Story

As a planner or operator, I want to create and link strategic goals to execution artifacts (portfolios, projects, tasks) so that high-level objectives are traceable down to granular work and operational tracking (logs, checklists) can roll back up to strategic planning.

### Acceptance Scenarios

1. **Given** a new initiative, **When** a planner creates a Goal and associates existing Projects and Tasks, **Then** the system shows the Goal with linked Projects/Tasks and those work items list the Goal in their strategic associations.
2. **Given** an existing Goal with Sub Goals, **When** an operator adds a Work Log to a Task linked to that Goal, **Then** the Work Log is traceable via the polymorphic Work Item Entity back to the Task and up the chain to its Goal and Sub Goals.
3. **Given** multiple Goals, **When** a Sub Goal is associated with two different Goals, **Then** both Goals reflect the association and the Sub Goal lists both parent Goals.
4. **Given** a Portfolio containing multiple Projects and a Project belonging to two Portfolios, **When** viewing the Project, **Then** both Portfolio associations are displayed without duplication.
5. **Given** a Task with Sub Tasks and Steps, **When** a new Step is added to a Sub Task, **Then** the hierarchical path (Task > Sub Task > Step) is visible for traceability.
6. **Given** a Work Checklist tied to a Work Log for a Project, **When** all checklist items are marked complete, **Then** the checklist status reflects completion and the Work Log indicates checklist completion status.

### Edge Cases

- Circular association attempt: System prevents both direct and indirect cycles by performing a graph traversal before saving associations; operation fails with a validation error if a cycle would occur.
- Over-association limits: Large association sets are supported; responses are paginated (default page size 50, client may request up to 200). Associations beyond 10,000 per entity are discouraged and may return a warning flag.
- Deletion constraints: Parent entities (Goal, Sub Goal, Portfolio, Project, Task) use soft archival. Archival is blocked if dependent active children remain unless a cascade archival option is explicitly confirmed. Hard deletes are reserved for administrative maintenance outside normal workflow.
- Dissociation integrity: Removing a Task from a Project leaves Task ↔ Goal/Sub Goal links intact; strategic associations are independent of execution grouping.
- Checklist orphaning: Deleting (archiving) a Work Log cascades archival of its Work Checklists; restoration restores both.
- Polymorphic resolution failure: Creation prohibits dangling references; on archival of underlying entity, Work Logs and Checklists remain readable and reference the archived state; if underlying entity is hard-deleted (admin action) logs are marked with an "orphaned" flag but retained.
- Step ordering: Steps auto-assign incremental integer positions; manual reordering is supported via a reorder operation that normalizes sequence to contiguous integers starting at 1.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow creation, viewing, updating (non-implementation detail), and archival of Goals, Sub Goals, Portfolios, Projects, Tasks, Sub Tasks, Steps, Work Logs, and Work Checklists (excluding user accounts per scope exclusion).
- **FR-002**: System MUST support many-to-many associations between Goals/Sub Goals and Portfolios, Projects, and Tasks.
- **FR-003**: System MUST support many-to-many associations between Sub Goals and Goals (Sub Goal can belong to multiple Goals) while preventing cyclic parent-child loops.
- **FR-004**: System MUST allow hierarchical containment: Portfolio → Projects; Project → Tasks; Task → Sub Tasks; Sub Task → Steps.
- **FR-005**: System MUST allow Projects to belong to multiple Portfolios and Tasks to belong to multiple Projects without duplicating underlying entities.
- **FR-006**: System MUST provide a polymorphic Work Item Entity reference capable of representing exactly one of: Goal, Sub Goal, Portfolio, Project, Task.
- **FR-007**: System MUST allow Work Logs to associate with exactly one Work Item Entity and retrieve that entity's hierarchical and strategic lineage for reporting.
- **FR-008**: System MUST allow Work Checklists to associate with a Work Log and its referenced Work Item Entity and reflect completion status.
-- **FR-009**: System MUST enforce referential integrity so that removing a parent entity with dependents (e.g., Goal with Sub Goals) requires either dissociation or an allowed archival workflow (soft archive; hard delete not part of standard user operations).
- **FR-010**: System MUST maintain consistent bidirectional visibility of associations (e.g., a Goal lists linked Projects; a Project lists linked Goals).
-- **FR-011**: System MUST support ordering of Steps within a Sub Task using a stable sequence attribute and provide a reorder operation to change sequence while preserving uniqueness.
- **FR-012**: System MUST allow Work Logs to have multiple Work Checklists and Work Checklists to reference their parent Work Log.
- **FR-013**: System MUST allow retrieval of a chain: Step → Sub Task → Task → Project(s) → Portfolio(s) and associated Goals/Sub Goals.
- **FR-014**: System MUST prevent creation of duplicate association rows between the same two entities.
- **FR-015**: System MUST support listing all Work Logs for a given Work Item Entity.
-- **FR-016**: System MUST allow marking a Work Checklist as fully complete when all its items (modeled as first-class child checklist item records with id, label, status, position) are complete.
-- **FR-017**: System MUST allow partial completion tracking (e.g., X of Y checklist items complete) and compute percentage as floor((completed / total) * 100).
- **FR-018**: System MUST allow querying which Goals a Task contributes to via direct association or through its Project(s).
-- **FR-019**: System MUST allow Sub Goal association/disassociation from multiple Goals while maintaining a timestamped association history log (add/remove events) for audit purposes.
- **FR-020**: System MUST provide constraints to prevent associating Steps directly with higher-level entities (only via Sub Task).
- **FR-021**: System MUST ensure that dissociating a Task from a Project does not remove its existing Goal links.
-- **FR-022**: System MUST allow association changes (add/remove) to be auditable including who performed the change, timestamp, and affected entities (content diffs of descriptions not required).
- **FR-023**: System MUST surface validation errors for attempts to create invalid or cyclic links.
-- **FR-024**: System MUST allow filtering or segmenting Goals by linked Portfolios, Projects, Tasks, active/archived status, and association counts; results are paginated (default 25, configurable up to 200 per page).
- **FR-025**: System MUST ensure Work Logs cannot exist without a valid Work Item Entity reference.
- **FR-026**: System MUST allow retrieval of all Work Checklists for a given Work Item Entity (via its Work Logs).
-- **FR-027**: System MUST treat Work Item Entity as a read-only polymorphic view (no write-through; modifications occur only through the specific underlying entity's standard operations).
-- **FR-028**: System MUST provide a way to mark Goals or Projects as archived without breaking historical Work Log references; archival freezes new association creation but existing associations remain readable.
- **FR-029**: System MUST allow Steps to be added, updated (content/order), and removed while preserving sequence integrity.
-- **FR-030**: System MUST allow batch association of multiple Tasks to a Goal with a maximum batch size of 200 Tasks per operation.

### Key Entities *(include if feature involves data)*

- **Goal**: Strategic objective at highest level; links to Sub Goals, Portfolios, Projects, Tasks (many-to-many).
- **Sub Goal**: Secondary strategic objective; may belong to multiple Goals; links to same execution entities; cannot create cycles.
- **Portfolio**: Collection grouping multiple Projects; may overlap (Project can belong to multiple Portfolios); links upstream to Goals/Sub Goals indirectly via associated Projects/Tasks.
- **Project**: Execution container for multiple Tasks; can belong to multiple Portfolios; can associate directly with Goals/Sub Goals.
- **Task**: Executable unit; can belong to multiple Projects; links to Goals/Sub Goals; parent of Sub Tasks.
- **Sub Task**: Decomposition of a Task; parent of Steps.
- **Step**: Smallest actionable unit inside a Sub Task; ordered sequence.
- **Work Item Entity (Polymorphic)**: Abstract reference wrapper pointing to one of Goal | Sub Goal | Portfolio | Project | Task to enable uniform logging/checklists.
- **Work Log**: Operational record attached to a single Work Item Entity; parent of Work Checklists.
- **Work Checklist**: Structured checklist tied to a Work Log and indirectly to its Work Item Entity; tracks completion of first-class checklist item records (each with id, label, status, position).

### Assumptions & Dependencies *(optional but relevant)*

- No user authentication/authorization layer included (explicitly out of scope).
- Performance, scaling, UI/UX, and persistence technology details intentionally deferred (no implementation details per template rules).
- Integrity rules assume a single data store with ACID-style transactional integrity; distributed transactions / eventual consistency are out of scope for this phase.
- Reporting/analytics layers are out of scope beyond traceability requirements.

### Resolved Assumptions (Former Clarifications)

- Cycle detection performs full graph traversal to prevent indirect loops.
- Pagination defaults: 25 (general listing), 50 (association browsing) with upper cap 200 per request.
- Soft archival model with optional cascade; hard delete restricted to maintenance.
- Checklist items are first-class entities.
- Step reordering supported via explicit reorder action; sequences normalized.
- Association history (add/remove) retained with timestamps; no full version snapshotting of entities.
- Audit logging includes entity lifecycle and association changes (who, when, what); excludes field-level diff content beyond identifiers.
- Filtering supports status, linked entity types/count ranges; large sets paginated.
- Archival freezes creation of new associations but preserves existing visibility.
- Percentage completion uses floor rounding of computed percentage.
- Maximum batch association size: 200 tasks per operation.
- Integrity built on single-store transactional guarantees; distributed consistency concerns deferred.
- Cascading archival of Work Logs triggers archival of dependent checklists; restoration restores dependents.
- Orphan prevention via strict referential checks; if underlying entity is administratively removed, logs persist flagged as orphaned.

### UX & Accessibility Notes

- Hierarchical navigation (Goal → Sub Goal → Portfolio/Project → Task → Sub Task → Step) must be logically traceable; any UI should surface a consistent breadcrumb or contextual hierarchy label set.
- Association lists must present total counts and paginated results with clear controls (page size options: 25, 50, 100, 200) labeled accessibly.
- Archived entities must be visually and semantically distinguishable (e.g., status tag) to prevent invalid association attempts.
- Checklist completion states must use both color and a secondary indicator (icon/text) to ensure accessibility for color-vision deficiencies.
- Step reordering must support non-pointer interaction (keyboard or command-driven ordering) to ensure accessibility.
- Clear entity type naming without ambiguous abbreviations (e.g., use "Sub Goal" not "SubG").

### Performance Goals

- Single entity retrieval with up to 200 direct associations SHOULD complete in ≤ 500 ms (p95) under nominal load.
- Association listing (page ≤ 200) SHOULD respond in ≤ 400 ms (p95).
- Batch association of ≤ 200 Tasks SHOULD complete in ≤ 2,000 ms (p95) with success/error summary.
- Goal/Sub Goal cycle detection for graphs ≤ 5,000 nodes SHOULD complete in ≤ 300 ms.
- Step reorder operation (≤ 200 Steps) SHOULD persist and return updated ordering in ≤ 300 ms (p95).
- Archival (single entity + cascade metadata) SHOULD complete in ≤ 800 ms (p95).

## Review & Acceptance Checklist

### Gate: Automated checks run during main() execution

### Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Constitution Alignment

- [x] Tests-first requirement noted where applicable (acceptance scenarios & edge cases enumerated)
- [x] UX consistency or accessibility impacts identified when UI is affected (baseline notes added)
- [x] Performance goals specified when performance is material to the feature (baseline targets defined)

### Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable (traceability, association integrity, archival rules)
- [x] Scope is clearly bounded (excludes auth/users/tech stack)
- [x] Dependencies and assumptions identified

## Execution Status

### Updated by main() during processing

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Review checklist passed
