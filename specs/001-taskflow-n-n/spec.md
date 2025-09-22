```markdown
# Feature Specification: TaskFlow -- Core Domain & MVP

**Feature Branch**: `001-taskflow-n-n`  
**Created**: 2025-09-22  
**Status**: Draft  
**Input**: User description: "Taskflow PRD: core client-side work management app for Goals, Portfolios, Projects, Tasks, Sections; IndexedDB-first persistence; many-to-many relations; soft-archive semantics; configurable goal depth; Angular frontend." 

## Execution Flow (main)
```
1. Parse user description from Input
	→ If empty: ERROR "No feature description provided"
2. Extract key concepts from description
	→ Identify: actors, actions, data, constraints
3. For each unclear aspect:
	→ Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
	→ If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
	→ Each requirement must be testable
	→ Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
	→ If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
	→ If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no low-level APIs or internal file/layout details)
- 👥 Written for business stakeholders and product managers

### Section Requirements
- **Mandatory sections**: Completed below
- **Optional sections**: Included when relevant

### Constitution Compliance (mandatory)
This feature follows the TaskFlow project principles: strict TypeScript and signal-first state (client-only), accessibility-first UX, and idempotent client operations. Performance targets: UI interactions (create, link, reorder) should complete within 100ms on a typical modern laptop for lists up to 200 items. Testing standards: unit tests for state transformations and integration tests for snapshot persistence. No deviations from constitution observed.

---

## User Scenarios & Testing (mandatory)

### Primary User Story
As a knowledge worker, I want to model strategic Goals and organize Projects and Tasks across flexible Portfolios so I can plan work at multiple levels and maintain cross-project task membership without destructive deletes.

### Acceptance Scenarios
1. Given an empty workspace, When the user creates a Goal with a title and description, Then the Goal appears in the Goal tree and can be expanded to show child entities.
2. Given a Task that belongs to Project A, When the user links it to Project B, Then the Task's project membership includes both A and B and both Project pages list the Task.
3. Given a Project with sections and tasks, When the user reorders tasks (keyboard or drag), Then the new order persists in the client snapshot and is visible after reload/import.
4. Given ParentGoal at max depth (default 3), When the user attempts to add another sub-goal beyond configured max depth, Then the UI prevents the action and shows a validation message.
5. Given a parent entity is archived, When a child remains active, Then the child shows an orphan indicator and is still accessible; archiving parent does not automatically archive children.

### Edge Cases
- Creating circular goal references must be rejected (detect via DFS on attempted link).  
- Linking a Task to a non-existent Project must fail validation and not mutate state.  
- Re-applying the same link (task↔project or project↔portfolio) is a no-op (idempotent).  
- Restoring from a corrupted or older snapshot must report migration version mismatch and refuse until manual confirmation.

## Requirements (mandatory)

### Functional Requirements
- **FR-001**: System MUST allow creating, reading, updating, and archiving (soft-delete) Goals, Portfolios, Projects, Tasks, and TaskSections.
- **FR-002**: System MUST enforce configurable max depth for sub-goals (default = 3) and prevent creation beyond the limit.
- **FR-003**: System MUST prevent circular goal nesting; link attempts creating cycles MUST be rejected with a clear error.
- **FR-004**: System MUST support many-to-many linking: Tasks ↔ Projects and Projects ↔ Portfolios. Linking/unlinking operations MUST be idempotent.
- **FR-005**: System MUST allow Tasks to have subtasks and TaskSections; subtasks inherit no automatic project links unless explicitly added.
- **FR-006**: System MUST persist client state as the canonical runtime graph in-memory and provide durable snapshots (IndexedDB primary, localStorage fallback).
- **FR-007**: System MUST allow adding, removing, and reordering TaskSections within a Project, and reordering Tasks within a Section. Orders MUST be persisted in snapshots.
- **FR-008**: System MUST surface orphan indicators when an entity has no active parent(s) due to archiving.
- **FR-009**: System MUST reject invalid moves (e.g., inserting a Task into a non-existent Section) with validation errors.
- **FR-010**: System MUST provide keyboard-accessible drag-and-drop reordering with ARIA announcements for DnD operations.

*Notes on ambiguous items:* No significant ambiguities in the PRD; operational specifics (e.g., exact snapshot schema versioning format, retention window for snapshots, or visual copy for orphan indicator) are left for implementation decisions. Marking UI copy as implementation detail.

### Key Entities
- **Goal**: Root strategic intent. Attributes: `id`, `title`, `description?`, `parentGoalId?`, `childIds[]`, `status`, timestamps, `maxDepth?` (config). Behavior: can contain any child work type; nesting limited by `maxDepth` and cycles prevented.
- **Portfolio**: Grouping for Projects. Attributes: `id`, `title`, `goalIds[]`, `projectIds[]`, status, timestamps.
- **Project**: Deliverable container. Attributes: `id`, `title`, `portfolioIds[]`, `taskIds[]`, `sectionIds[]`, status, timestamps.
- **TaskSection**: Logical grouping within a Project. Attributes: `id`, `projectId`, `taskIds[]`, `position?`.
- **Task**: Actionable unit. Attributes: `id`, `title`, `description?`, `projectIds[]`, `parentTaskId?`, `subtaskIds[]`, `sectionId?`, `position?`, status, timestamps.

## Review & Acceptance Checklist

### Content Quality
- [x] No low-level implementation details (frameworks are noted in PRD but spec focuses on what/why)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain  
  - Rationale: PRD provided comprehensive functional definitions; remaining details (snapshot schema version format, exact UI copy) are implementation-level and will be handled in planning.
- [x] Requirements are testable and unambiguous for acceptance tests listed above
- [x] Success criteria are measurable (see Acceptance Criteria in PRD)
- [x] Scope is clearly bounded (MVP excludes auth, realtime, integrations)
- [x] Dependencies and assumptions identified (IndexedDB-first persistence, Angular client)

---

## Execution Status
- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked (none critical)
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed (awaiting stakeholder review)

---

## Next Steps / Planning Handoff (recommended)
1. Planning session to convert FRs into tickets (sprint-sized): prioritize M1 (data model + GoalTree + CRUD flows).  
2. Create a snapshot schema migration plan and a small import/export test harness.  
3. Design accessibility acceptance tests for keyboard DnD and ARIA announcements.  
4. Prepare seeded demo data to exercise many-to-many scenarios and orphan states.

---

Prepared by: automation from PRD file `product_docs/prd.md` on branch `001-taskflow-n-n`.

```

