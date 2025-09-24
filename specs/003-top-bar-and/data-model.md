# Data Model: Navigation Structure

**Feature**: Navigation Structure with Top Bar and Sidebar  
**Date**: September 24, 2025  
**Source**: Derived from feature specification and research findings

## Core Entities

### NavigationItem
Represents individual navigation menu entries in the sidebar.

**Fields**:
- `id: string` - Unique identifier for the navigation item
- `label: string` - Display text for the navigation item  
- `route: string` - Angular router path (e.g., '/tasks', '/deleted')
- `icon?: string` - Optional icon name/class for visual representation
- `isActive: boolean` - Whether this item represents the current page
- `order: number` - Display order in the navigation menu

**Validation Rules**:
- `id` must be unique across all navigation items
- `label` must be non-empty string, max 50 characters
- `route` must be valid Angular route path starting with '/'
- `order` must be positive integer

**State Transitions**:
- `isActive`: false → true (when route is navigated to)
- `isActive`: true → false (when different route is navigated to)

### BreadcrumbItem
Represents individual segments in the top bar breadcrumb navigation.

**Fields**:
- `label: string` - Display text for the breadcrumb segment
- `route?: string` - Optional route for clickable breadcrumb segments  
- `isLast: boolean` - Whether this is the final breadcrumb (current page)

**Validation Rules**:
- `label` must be non-empty string, max 30 characters
- `route` optional but must be valid Angular route if provided
- Only one breadcrumb can have `isLast: true` in a breadcrumb chain

### NavigationState  
Centralized state management for the entire navigation system.

**Fields**:
- `currentRoute: string` - Currently active route path
- `breadcrumbs: BreadcrumbItem[]` - Current breadcrumb trail
- `navigationItems: NavigationItem[]` - All available navigation options
- `isSidebarOpen: boolean` - Mobile sidebar visibility state
- `isMobileView: boolean` - Current viewport size state

**Validation Rules**:
- `currentRoute` must match one of the routes in `navigationItems`
- `breadcrumbs` array must not be empty when `currentRoute` is set
- Only one `navigationItems` entry can have `isActive: true`

**State Transitions**:
- Route navigation: Updates `currentRoute`, rebuilds `breadcrumbs`, updates `isActive` flags
- Viewport changes: Updates `isMobileView`, may auto-close `isSidebarOpen`
- Sidebar toggle: Toggles `isSidebarOpen` (mobile only)

### ViewportState
Manages responsive layout information.

**Fields**:
- `breakpoint: 'mobile' | 'tablet' | 'desktop'` - Current viewport category
- `width: number` - Current viewport width in pixels
- `sidebarMode: 'overlay' | 'push' | 'persistent'` - Sidebar display mode

**Validation Rules**:
- `breakpoint` derived from `width`: mobile <768px, tablet 768-1024px, desktop >1024px
- `sidebarMode` must align with breakpoint (mobile=overlay, tablet/desktop=push/persistent)

## Entity Relationships

```
NavigationState (1) -----> (*) NavigationItem
NavigationState (1) -----> (*) BreadcrumbItem  
NavigationState (1) -----> (1) ViewportState

NavigationItem (route) ----references----> BreadcrumbItem (route)
```

## Data Flow Patterns

### Navigation Event Flow
1. User clicks navigation item or browser navigation occurs
2. Router resolves new route
3. NavigationService updates NavigationState
4. Components react to state changes via signals
5. UI updates (breadcrumbs, active states, content area)

### Responsive Layout Flow
1. Viewport size changes (resize, orientation)
2. BreakpointObserver detects change
3. NavigationService updates ViewportState
4. Components adjust layout based on new breakpoint
5. Sidebar behavior switches between modes

### Data Persistence
- NavigationState persisted to localStorage on changes
- Restored on application bootstrap
- Only user preferences persisted (sidebar open/closed state)
- Current route and breadcrumbs derived from Angular Router

## Implementation Notes

### Angular Integration
- NavigationService provides reactive signals for all state
- Route data configuration includes breadcrumb information
- Router guards ensure consistent navigation state
- Angular CDK BreakpointObserver manages viewport state

### Performance Considerations
- Signals provide efficient reactivity without unnecessary change detection
- Breadcrumb computation cached based on current route
- Navigation items are static configuration (no dynamic loading needed)
- Minimal DOM updates through OnPush change detection strategy

### Accessibility Support
- Navigation items include proper ARIA labels and roles
- Breadcrumb navigation follows WAI-ARIA authoring practices
- Focus management during sidebar open/close operations
- Screen reader announcements for route changes

**Status**: Ready for contract generation and component design.