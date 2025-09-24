# UI Styling Contracts

**Feature**: Modern UI Styling for TaskFlow  
**Date**: September 24, 2025  
**Purpose**: Define interface contracts for UI styling enhancements

## Component Styling Contracts

### TaskListComponent Styling Contract

**Input Styling Requirements**:
```typescript
interface TaskListStylingProps {
  tasks: Task[];
  currentFilter: 'all' | 'active' | 'completed';
  isEmpty: boolean;
}
```

**Output Styling Elements**:
- List container with `role="list"` and Spring Happiness theme colors
- Empty state display when no tasks match filter
- Responsive layout for tablet (768px+) and desktop (1024px+)
- Loading state indicators during operations

**CSS Class Contract**:
```css
.task-list-container {
  /* Container styling with Spring Happiness palette */
}
.task-list-empty-state {
  /* Attractive empty state styling */
}
.task-list-loading {
  /* Loading state animations */
}
```

### TaskItemComponent Styling Contract

**Input Styling Requirements**:
```typescript
interface TaskItemStylingProps {
  task: Task;
  isEditing: boolean;
  isHovered: boolean;
  isFocused: boolean;
}
```

**Output Styling Elements**:
- Task item with completion state visual distinction
- Hover and focus states for interactive feedback  
- Edit mode styling transformation
- Text wrapping with max 2-line constraint
- Action button styling with accessibility

**CSS Class Contract**:
```css
.task-item {
  /* Base task item styling */
}
.task-item--completed {
  /* Completed task visual styling */
}
.task-item--editing {
  /* Edit mode styling */
}
.task-item--deleted {
  /* Deleted task styling */
}
```

### TaskInputComponent Styling Contract

**Input Styling Requirements**:
```typescript
interface TaskInputStylingProps {
  value: string;
  isValid: boolean;
  isSubmitting: boolean;
  placeholder: string;
}
```

**Output Styling Elements**:
- Modern form input styling
- Validation state indicators
- Focus states with Spring Happiness accent colors
- Submit button styling with loading states

**CSS Class Contract**:
```css
.task-input-form {
  /* Form container styling */
}
.task-input-field {
  /* Input field styling */
}
.task-input-submit {
  /* Submit button styling */
}
```

### FilterToolbarComponent Styling Contract

**Input Styling Requirements**:
```typescript
interface FilterToolbarStylingProps {
  activeFilter: 'all' | 'active' | 'completed';
  taskCounts: {
    all: number;
    active: number;
    completed: number;
  };
}
```

**Output Styling Elements**:
- Tab-style filter buttons with active state indication
- Task count badges with consistent styling
- Responsive layout adaptation
- Clear visual hierarchy

**CSS Class Contract**:
```css
.filter-toolbar {
  /* Toolbar container styling */
}
.filter-button {
  /* Individual filter button styling */
}
.filter-button--active {
  /* Active filter button styling */
}
.filter-count-badge {
  /* Count badge styling */
}
```

### DeletedPanelComponent Styling Contract

**Input Styling Requirements**:
```typescript
interface DeletedPanelStylingProps {
  deletedTasks: Task[];
  isVisible: boolean;
  isCollapsed: boolean;
}
```

**Output Styling Elements**:
- Panel with smooth slide animations
- Deleted task list with restore/delete actions
- Collapse/expand controls
- Empty state when no deleted tasks

**CSS Class Contract**:
```css
.deleted-panel {
  /* Panel container with animations */
}
.deleted-panel--collapsed {
  /* Collapsed state styling */
}
.deleted-task-item {
  /* Individual deleted task styling */
}
```

## Global Styling Contracts

### Theme System Contract

**CSS Custom Properties**:
```css
:root {
  /* Spring Happiness Color Palette */
  --color-spring-rose: #AF7575;
  --color-spring-yellow: #EFD8A1;
  --color-spring-green: #BCD693;
  --color-spring-teal-light: #AFD7DB;
  --color-spring-teal-dark: #3D9CA8;
  
  /* Spacing System */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-base: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Typography */
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Animation */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --duration-slow: 500ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Responsive Design Contract

**Breakpoints**:
- Mobile: `< 768px` (fallback/minimal support)
- Tablet: `>= 768px` (primary target)  
- Desktop: `>= 1024px` (primary target)

**Layout Contracts**:
```css
/* Mobile-first with tablet/desktop enhancement */
@media (min-width: 768px) {
  /* Tablet-specific enhancements */
}

@media (min-width: 1024px) {
  /* Desktop-specific enhancements */
}
```

### Accessibility Contract

**WCAG 2.2 Level AA Requirements**:
- Color contrast ratios ≥ 4.5:1 for normal text
- Color contrast ratios ≥ 3:1 for large text
- Focus indicators visible and high contrast
- Keyboard navigation support for all interactive elements
- Screen reader compatible markup and ARIA attributes

**Focus Management Contract**:
```css
.focus-visible {
  /* High-contrast focus indicators */
  outline: 2px solid var(--color-spring-teal-dark);
  outline-offset: 2px;
}
```

### Animation Contract

**Motion Preferences**:
```css
@media (prefers-reduced-motion: reduce) {
  /* Reduce or eliminate animations */
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Standard Animation Durations**:
- Micro-interactions: `150ms`
- Component transitions: `300ms` 
- Page transitions: `500ms`

## Integration Contract

### Angular Component Integration

**ViewEncapsulation**: Component-scoped styling with global Tailwind utilities

**CSS Architecture**:
- Global: `src/styles.css` (Tailwind import + theme configuration)
- Component: Individual `.css` files for component-specific styling
- Utilities: Tailwind classes applied directly in templates

**Build Integration**:
- PostCSS pipeline processes Tailwind utilities
- Angular CLI handles component scoping
- CSS custom properties bridge global and component styles