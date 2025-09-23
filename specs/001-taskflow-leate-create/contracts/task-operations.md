# Contract: Task Operations (No Backend, Frontend-Only)

## Add Task
- **Input**: { title: string }
- **Output**: { id: string, title: string, completed: boolean, createdAt: number }
- **Validation**: Title 1–140 chars, trimmed

## Update Task (Edit Title)
- **Input**: { id: string, title: string }
- **Output**: { id: string, title: string, completed: boolean, createdAt: number }
- **Validation**: Title 1–140 chars, trimmed

## Toggle Complete
- **Input**: { id: string, completed: boolean }
- **Output**: { id: string, completed: boolean }

## Delete Task (Soft Delete)
- **Input**: { id: string }
- **Output**: { id: string, deleted: true }

## Restore Task
- **Input**: { id: string }
- **Output**: { id: string, deleted: false }

## Clear Completed (Bulk)
- **Input**: none
- **Output**: { cleared: number }
- **Confirmation required**

## Filter Tasks
- **Input**: { filter: 'all' | 'active' | 'completed' }
- **Output**: Array<{ id, title, completed, createdAt }>

---

All contracts are implemented as frontend-only functions/services, not HTTP endpoints.
