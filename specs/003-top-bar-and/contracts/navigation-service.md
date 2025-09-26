# Navigation Service Contracts

**Feature**: Navigation Structure with Top Bar and Sidebar  
**Date**: September 24, 2025  
**Type**: Angular Service Interfaces

## NavigationService Interface

### Core Methods

```typescript
interface NavigationService {
  // State accessors (signals)
  readonly navigationState: Signal<NavigationState>;
  readonly currentRoute: Signal<string>;
  readonly breadcrumbs: Signal<BreadcrumbItem[]>;
  readonly isSidebarOpen: Signal<boolean>;
  readonly isMobileView: Signal<boolean>;
  
  // Navigation actions
  navigateTo(route: string): Promise<boolean>;
  toggleSidebar(): void;
  closeSidebar(): void;
  
  // State management
  updateNavigationItems(items: NavigationItem[]): void;
  refreshBreadcrumbs(): void;
}
```

### State Contracts

```typescript
interface NavigationState {
  currentRoute: string;
  breadcrumbs: BreadcrumbItem[];
  navigationItems: NavigationItem[];
  isSidebarOpen: boolean;
  isMobileView: boolean;
}

interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  isActive: boolean;
  order: number;
}

interface BreadcrumbItem {
  label: string;
  route?: string;
  isLast: boolean;
}
```

## Component Contracts

### TopBarComponent Interface

```typescript
interface TopBarComponent {
  // Inputs
  @Input() showBreadcrumbs: boolean = true;
  @Input() applicationName: string = 'TaskFlow';
  
  // Outputs  
  @Output() menuToggled = new EventEmitter<void>();
  
  // Public methods
  onMenuToggle(): void;
}
```

### SidebarComponent Interface

```typescript
interface SidebarComponent {
  // Inputs
  @Input() navigationItems: NavigationItem[] = [];
  @Input() isOpen: boolean = false;
  @Input() isMobileView: boolean = false;
  
  // Outputs
  @Output() itemSelected = new EventEmitter<string>();
  @Output() sidebarClosed = new EventEmitter<void>();
  
  // Public methods
  onItemClick(route: string): void;
  onBackdropClick(): void;
  closeSidebar(): void;
}
```

### BreadcrumbComponent Interface

```typescript
interface BreadcrumbComponent {
  // Inputs
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() maxVisible: number = 5;
  
  // Outputs
  @Output() breadcrumbClicked = new EventEmitter<string>();
  
  // Public methods
  onBreadcrumbClick(route?: string): void;
  getVisibleBreadcrumbs(): BreadcrumbItem[];
}
```

## Event Contracts

### Navigation Events

```typescript
interface NavigationEventPayload {
  fromRoute: string;
  toRoute: string;
  timestamp: Date;
  trigger: 'user' | 'programmatic' | 'browser';
}

interface SidebarEventPayload {
  isOpen: boolean;
  trigger: 'button' | 'backdrop' | 'resize' | 'programmatic';
  timestamp: Date;
}
```

## Validation Contracts

### Input Validation

```typescript
interface NavigationValidator {
  validateRoute(route: string): ValidationResult;
  validateNavigationItem(item: NavigationItem): ValidationResult;
  validateBreadcrumbChain(breadcrumbs: BreadcrumbItem[]): ValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

## Error Handling Contracts

### Navigation Errors

```typescript
enum NavigationErrorType {
  ROUTE_NOT_FOUND = 'ROUTE_NOT_FOUND',
  INVALID_NAVIGATION_ITEM = 'INVALID_NAVIGATION_ITEM',
  BREADCRUMB_CHAIN_INVALID = 'BREADCRUMB_CHAIN_INVALID',
  SIDEBAR_STATE_CONFLICT = 'SIDEBAR_STATE_CONFLICT'
}

interface NavigationError extends Error {
  type: NavigationErrorType;
  context: Record<string, any>;
  route?: string;
}
```

## Testing Contracts

### Service Test Interface

```typescript
interface NavigationServiceTestContract {
  // Setup
  setupNavigationItems(): NavigationItem[];
  setupMockRouter(): jasmine.SpyObj<Router>;
  
  // Assertions
  expectNavigationState(expected: Partial<NavigationState>): void;
  expectBreadcrumbChain(expected: BreadcrumbItem[]): void;
  expectSidebarState(isOpen: boolean, isMobile: boolean): void;
  
  // Actions
  simulateNavigation(route: string): Promise<void>;
  simulateViewportChange(width: number): void;
  simulateSidebarToggle(): void;
}
```

### Component Test Interfaces

```typescript
interface TopBarComponentTestContract {
  expectApplicationName(name: string): void;
  expectBreadcrumbs(breadcrumbs: BreadcrumbItem[]): void;
  expectMenuButton(visible: boolean): void;
  simulateMenuToggle(): void;
}

interface SidebarComponentTestContract {
  expectNavigationItems(items: NavigationItem[]): void;
  expectActiveItem(route: string): void;
  expectSidebarOpen(isOpen: boolean): void;
  simulateItemClick(route: string): void;
  simulateBackdropClick(): void;
}
```

## Integration Contracts

### Router Integration

```typescript
interface RouterIntegration {
  // Route configuration
  configureRoutes(routes: Route[]): void;
  addBreadcrumbData(route: Route, data: any): Route;
  
  // Navigation guards
  canNavigate(route: string): boolean | Promise<boolean>;
  onNavigationStart(route: string): void;
  onNavigationEnd(route: string): void;
}
```

### Accessibility Integration

```typescript
interface AccessibilityIntegration {
  // ARIA support
  setSidebarAriaExpanded(expanded: boolean): void;
  announceBreadcrumbChange(breadcrumbs: BreadcrumbItem[]): void;
  setActiveItemAria(itemId: string): void;
  
  // Focus management
  focusFirstSidebarItem(): void;
  focusMenuButton(): void;
  restoreFocus(): void;
}
```

**Status**: Contracts defined for all navigation components and services. Ready for test generation and quickstart documentation.