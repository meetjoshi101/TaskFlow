# Navigation Components Documentation

This directory contains all navigation-related components for the TaskFlow application, implementing a responsive navigation system with top bar and sidebar.

## Architecture Overview

The navigation system is built using Angular 20+ standalone components with signals-based state management, providing a modern, reactive, and accessible user interface.

### Core Components

#### TopBarComponent (`/top-bar/`)
- **Purpose**: Main application header with branding and breadcrumb navigation
- **Features**:
  - Application name/logo display
  - Hamburger menu toggle for mobile
  - Breadcrumb navigation integration
  - Responsive design with mobile-first approach
  - ARIA labels and keyboard navigation support

#### SidebarComponent (`/sidebar/`)
- **Purpose**: Primary navigation menu for page switching
- **Features**:
  - Responsive sidebar with desktop/mobile modes
  - Active state management with visual indicators
  - Keyboard navigation support (Arrow keys, Home, End, Escape)
  - Mobile backdrop with click-to-close functionality
  - Smooth animations and transitions

#### BreadcrumbComponent (`/breadcrumb/`)
- **Purpose**: Hierarchical navigation display showing current page location
- **Features**:
  - Automatic breadcrumb generation from routes
  - Clickable navigation for parent routes
  - Current page indication (non-clickable)
  - Mobile-responsive with truncation
  - Screen reader friendly

#### EmptyStateComponent (`/empty-state/`)
- **Purpose**: Reusable component for displaying empty states
- **Features**:
  - Configurable icon, title, and description
  - Optional action button (route or callback)
  - Multiple size variants (small, medium, large)
  - Accessibility optimized

## State Management

### NavigationService
Central service managing navigation state using Angular signals:

```typescript
interface NavigationState {
  currentRoute: string;
  breadcrumbs: BreadcrumbItem[];
  navigationItems: NavigationItem[];
  isSidebarOpen: boolean;
  isMobileView: boolean;
}
```

**Key Methods**:
- `navigateTo(route: string)`: Navigate to a specific route
- `toggleSidebar()`: Toggle sidebar visibility
- `updateNavigationItems()`: Update navigation menu items
- `refreshBreadcrumbs()`: Regenerate breadcrumb trail

### ViewportService
Manages responsive design state with CDK BreakpointObserver:

**Breakpoints**:
- Mobile: ≤767px
- Tablet: 768px-1023px  
- Desktop: ≥1024px

### BreadcrumbService
Handles dynamic breadcrumb generation from Angular route configuration.

## Configuration

### Navigation Config (`/config/navigation.config.ts`)
Centralized configuration for navigation items:

```typescript
export const navigationConfig: NavigationConfig = {
  applicationName: 'TaskFlow',
  defaultRoute: '/tasks',
  items: [
    {
      id: 'tasks',
      label: 'Tasks',
      route: '/tasks',
      icon: 'task-icon',
      order: 1
    },
    // ... more items
  ]
};
```

## Data Models

### NavigationItem
```typescript
interface NavigationItem {
  id: string;           // Unique identifier
  label: string;        // Display text (max 50 chars)
  route: string;        // Angular route path
  icon?: string;        // Optional icon class
  isActive: boolean;    // Current page indicator
  order: number;        // Display order
}
```

### BreadcrumbItem
```typescript
interface BreadcrumbItem {
  label: string;        // Display text (max 30 chars)
  route?: string;       // Optional navigation route
  isLast: boolean;      // Current page indicator
}
```

## Responsive Design

### Mobile (≤767px)
- Hamburger menu in top bar
- Sidebar as full-screen overlay
- Backdrop click to close
- Breadcrumbs truncated/hidden

### Tablet (768px-1023px)  
- Similar to mobile but with more space
- Sidebar overlay with backdrop

### Desktop (≥1024px)
- Persistent sidebar
- No hamburger menu
- Full breadcrumb navigation
- Hover states and smooth transitions

## Accessibility Features

### ARIA Support
- `role="navigation"` on sidebar and breadcrumb
- `aria-current="page"` for active items
- `aria-expanded` for sidebar state
- `aria-label` attributes for screen readers

### Keyboard Navigation
- **Tab**: Navigate between interactive elements
- **Arrow Keys**: Navigate within sidebar items
- **Home/End**: Jump to first/last sidebar item
- **Enter/Space**: Activate navigation items
- **Escape**: Close mobile sidebar

### Screen Reader Support
- Semantic HTML structure
- Descriptive labels and announcements
- Focus management on sidebar open/close
- High contrast mode support

## Styling System

### CSS Custom Properties
Navigation-specific CSS variables in `styles.css`:

```css
:root {
  --nav-sidebar-width-mobile: 280px;
  --nav-sidebar-width-desktop: 250px;
  --nav-topbar-height: 64px;
  --nav-z-index-sidebar: 1000;
  --nav-z-index-overlay: 999;
  --nav-transition-duration: 300ms;
}
```

### Tailwind CSS Integration
- Utility-first approach for styling
- Responsive breakpoints configuration
- Custom color palette from design system

## Performance Optimizations

### Angular Signals
- Reactive state management without subscriptions
- Automatic change detection optimization
- Efficient DOM updates

### Lazy Loading
- Route-based component loading
- Reduced initial bundle size
- Optimized Core Web Vitals

### Bundle Optimization
- Standalone components reduce bundle size
- Tree-shaking for unused features
- Efficient CSS with utility classes

## Testing Strategy

### Unit Tests
Each component includes comprehensive unit tests covering:
- Component rendering and initialization
- User interactions (clicks, keyboard)
- State management and signals
- Accessibility features

### Integration Tests
- Navigation flow between pages
- Responsive behavior at different breakpoints
- State persistence and restoration

## Browser Support

### Supported Browsers
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced experience with modern browser features
- Graceful degradation for older browsers

## Performance Metrics

### Target Metrics
- First Contentful Paint: <1.2s
- Largest Contentful Paint: <2.5s
- Navigation transition time: <200ms
- Sidebar animation: 300ms

### Bundle Size
- Navigation components: ~15KB gzipped
- Lazy-loaded routes: ~3KB each
- Total overhead: <5% of bundle size

## Migration Notes

### From Previous Version
The navigation system replaces the previous simple routing with:
- Enhanced mobile experience
- Persistent navigation state  
- Improved accessibility
- Better performance characteristics

### Breaking Changes
- New route structure with breadcrumb data
- Navigation guard implementation
- Changed CSS class names and structure

## Troubleshooting

### Common Issues

**Sidebar not opening on mobile**
- Check ViewportService breakpoint detection
- Verify NavigationService signal updates
- Ensure click handlers are properly bound

**Breadcrumbs not updating**
- Confirm route data includes breadcrumb information  
- Check BreadcrumbService route parsing
- Verify router navigation completion

**Performance issues**
- Enable OnPush change detection
- Check for unnecessary re-renders
- Optimize signal subscriptions

## Future Enhancements

### Planned Features
- User preferences for sidebar behavior
- Advanced breadcrumb customization
- Navigation analytics tracking
- Multi-level navigation menu support

### Technical Debt
- Migrate from CSS custom properties to CSS-in-JS
- Add more sophisticated state persistence
- Implement navigation preloading
- Enhanced error boundaries

---

**Last Updated**: September 24, 2025  
**Version**: 1.0.0  
**Angular Version**: 20+  
**Dependencies**: @angular/cdk, @angular/animations