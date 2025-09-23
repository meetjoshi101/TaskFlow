# Data Model: Simple Client-Side To-Do List

## Entity: Task
- **id**: string (UUID, required, unique)
- **title**: string (1–140 chars, trimmed, required)
- **completed**: boolean (default: false)
- **createdAt**: number (timestamp, required)
- **deleted**: boolean (default: false, for soft delete in session)

### Validation Rules
- Title must be 1–140 characters after trimming whitespace
- Title may contain internal whitespace
- id must be unique (UUID)
- createdAt is set at creation, not user-editable

## UI State (LocalStorage)
- **filter**: 'all' | 'active' | 'completed' (persisted)
- **deletedPanelOpen**: boolean (persisted)

## Relationships
- None (flat list, no subtasks or hierarchy)

## State Transitions
- Task: active <-> completed
- Task: active/completed -> deleted (soft, session-only)
- Task: deleted -> restored (session-only, until reload)

---

All data model requirements derived from spec and research. No backend or user management entities required.
