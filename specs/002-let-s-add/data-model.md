# Data Model: Modern UI Styling

**Feature**: Modern UI Styling for TaskFlow  
**Date**: September 24, 2025  
**Context**: Styling enhancement preserves existing data structures

## Core Entities

### Task (Existing - No Changes)
**Purpose**: Represents a todo item with state and metadata  
**Source**: `/frontend/src/app/models/task.model.ts`

**Fields**:
- `id: string` - Unique identifier (UUID v4)
- `title: string` - Task description/title
- `completed: boolean` - Completion status
- `createdAt: number` - Creation timestamp (Unix timestamp)
- `deleted: boolean` - Soft deletion flag

**State Transitions**:
- `created` → `active` (default state)
- `active` ⟷ `completed` (toggleable)
- `active/completed` → `deleted` (soft delete)
- `deleted` → `active/completed` (restore)

**Validation Rules**:
- `id`: Required, must be unique UUID
- `title`: Required, non-empty string, max 2-line display constraint
- `completed`: Boolean flag
- `createdAt`: Required timestamp for sorting
- `deleted`: Boolean flag for soft deletion

## UI-Specific Data Structures

### Visual State Properties
**Purpose**: Define styling states that don't modify core Task data

**Filter States**:
- `'all'` - Show all non-deleted tasks
- `'active'` - Show only uncompleted tasks  
- `'completed'` - Show only completed tasks
- `'deleted'` - Show soft-deleted tasks (in deleted panel)

**Interactive States** (CSS classes):
- `:hover` - Mouse hover feedback
- `:focus` - Keyboard focus indication
- `:focus-visible` - Enhanced focus for accessibility
- `.editing` - Task in edit mode
- `.dragging` - Task being reordered (future enhancement)

### Theme Configuration
**Purpose**: Design system tokens for consistent styling

**Spring Happiness Color Palette**:
- `spring-rose`: `#AF7575` - Primary accent, completed states
- `spring-yellow`: `#EFD8A1` - Warning states, highlights  
- `spring-green`: `#BCD693` - Success states, add actions
- `spring-teal-light`: `#AFD7DB` - Secondary backgrounds
- `spring-teal-dark`: `#3D9CA8` - Primary actions, links

**Spacing Scale** (Tailwind default enhanced):
- `xs`: `0.25rem` (4px) - Fine details
- `sm`: `0.5rem` (8px) - Component padding
- `base`: `1rem` (16px) - Standard spacing
- `lg`: `1.5rem` (24px) - Section gaps
- `xl`: `2rem` (32px) - Layout spacing

**Typography Scale**:
- `text-sm`: `0.875rem` - Secondary text, metadata
- `text-base`: `1rem` - Body text, task titles
- `text-lg`: `1.125rem` - Headings, emphasis
- `text-xl`: `1.25rem` - Page titles

## Component Data Flow

### TaskListComponent
**Input**: `Task[]` from TaskService.filter()  
**Output**: Visual representation with styling states  
**Styling Data**: Filter state, item count, empty state detection

### TaskItemComponent  
**Input**: Single `Task` object  
**Output**: Styled task display with actions  
**Styling Data**: Completion status, edit mode, hover state

### TaskInputComponent
**Input**: Optional `Task` for editing  
**Output**: Form submission events  
**Styling Data**: Validation state, focus state, loading state

### FilterToolbarComponent
**Input**: Current filter state, task counts  
**Output**: Filter change events  
**Styling Data**: Active filter indication, count badges

### DeletedPanelComponent  
**Input**: Deleted `Task[]` from TaskService  
**Output**: Restore/permanent delete events  
**Styling Data**: Slide animation state, empty state

## Accessibility Data Requirements

### ARIA Properties
- `role="list"` for task containers
- `role="listitem"` for individual tasks  
- `aria-label` for action buttons
- `aria-checked` for completion checkboxes
- `aria-expanded` for collapsible sections

### Focus Management
- `tabindex` for keyboard navigation
- Focus trap in modals/edit modes
- Skip links for section navigation

### Screen Reader Support  
- Live regions for dynamic content updates
- Status announcements for actions
- Progress indicators for loading states

## Performance Considerations

### Data Optimization
- Task filtering computed signals for reactivity
- Memoized sort operations by creation date
- Lazy loading for large task lists (future)

### CSS Performance
- Component-scoped styles to prevent cascade issues
- CSS custom properties for theme switching
- Minimal DOM updates through OnPush strategy

## Storage Model (Unchanged)
- Local Storage persistence
- JSON serialization of Task array
- No backend API requirements
- Client-side filtering and state management

**Note**: This data model preserves all existing functionality while adding comprehensive styling data structures and accessibility requirements.