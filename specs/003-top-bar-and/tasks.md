# Tasks: Navigation Structure with Top Bar and Sidebar

**Input**: Design documents from `/specs/003-top-bar-and/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: Angular 20+, TypeScript 5.x, Angular CLI, Angular CDK, Tailwind CSS v4.1
   → Structure: Web frontend (single Angular application)
2. Load design documents:
   → data-model.md: NavigationState, NavigationItem, BreadcrumbItem, ViewportState
   → contracts/navigation-service.md: NavigationService, TopBarComponent, SidebarComponent, BreadcrumbComponent
   → research.md: Angular Router, Angular CDK Layout, signals-based state management
   → quickstart.md: Mobile responsiveness, accessibility, restore functionality test scenarios
3. Generate tasks by category:
   → Setup: Angular project dependencies, CDK installation, Tailwind CSS v4.1 @theme configuration
   → Core: NavigationService, data models, components
   → Integration: Router configuration, CDK Layout, accessibility
   → Features: Page components, restore functionality, state persistence
   → Polish: Animations, empty states, performance optimization
4. Apply task rules:
   → Different components/services = mark [P] for parallel
   → Shared services/routing = sequential (no [P])
   → Setup before implementation, core before integration
5. Number tasks sequentially (T001, T002...)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions
- Frontend Angular structure: `frontend/src/app/`

## Phase 3.1: Project Setup
- [X] T001 Install Angular CDK and configure dependencies in frontend/package.json
- [X] T002 Configure Tailwind CSS v4.1 responsive breakpoints using @theme directive in frontend/src/styles.css
- [X] T003 [P] Setup ESLint and TypeScript strict mode configuration in frontend/
- [X] T004 [P] Configure Angular testing environment with Testing Library setup

## Phase 3.2: Core Data Models and Interfaces  
- [X] T005 [P] Create NavigationItem model interface in frontend/src/app/models/navigation-item.model.ts
- [X] T006 [P] Create BreadcrumbItem model interface in frontend/src/app/models/breadcrumb-item.model.ts
- [X] T007 [P] Create NavigationState model interface in frontend/src/app/models/navigation-state.model.ts
- [X] T008 [P] Create ViewportState model interface in frontend/src/app/models/viewport-state.model.ts

## Phase 3.3: Core Services
- [X] T009 Create NavigationService with signals-based state management in frontend/src/app/services/navigation.service.ts
- [X] T010 Create ViewportService with Angular CDK BreakpointObserver in frontend/src/app/services/viewport.service.ts
- [X] T011 Create BreadcrumbService for dynamic breadcrumb generation in frontend/src/app/services/breadcrumb.service.ts
- [X] T012 Add localStorage persistence methods to NavigationService for state restoration

## Phase 3.4: Angular Router Configuration
- [X] T013 Configure hierarchical routes with breadcrumb data in frontend/src/app/app.routes.ts
- [X] T014 Create route guards for navigation state consistency in frontend/src/app/guards/navigation.guard.ts
- [X] T015 Generate TasksComponent page with routing in frontend/src/app/pages/tasks/tasks.component.ts
- [X] T016 Generate DeletedItemsComponent page with routing in frontend/src/app/pages/deleted-items/deleted-items.component.ts

## Phase 3.5: Navigation Components
- [X] T017 [P] Generate TopBarComponent standalone component in frontend/src/app/components/top-bar/
- [X] T018 [P] Generate SidebarComponent standalone component in frontend/src/app/components/sidebar/
- [X] T019 [P] Generate BreadcrumbComponent standalone component in frontend/src/app/components/breadcrumb/
- [X] T020 [P] Create navigation menu items configuration in frontend/src/app/config/navigation.config.ts

## Phase 3.6: Component Implementation
- [X] T021 Implement TopBarComponent with application name and hamburger menu toggle
- [X] T022 Implement SidebarComponent with responsive navigation menu and active state management
- [X] T023 Implement BreadcrumbComponent with hierarchical navigation display
- [X] T024 Integrate NavigationService signals into all navigation components

## Phase 3.7: Responsive Design Implementation
- [X] T025 [P] Add mobile sidebar overlay functionality with Angular CDK Overlay in SidebarComponent
- [X] T026 [P] Implement responsive breakpoint handling in ViewportService
- [X] T027 [P] Add hamburger menu toggle animations with Angular Animations API
- [X] T028 [P] Create backdrop click handling for mobile sidebar closure

## Phase 3.8: Accessibility Implementation
- [X] T029 [P] Add ARIA navigation patterns and labels to all navigation components
- [X] T030 [P] Implement focus management for sidebar open/close operations using Angular CDK A11y
- [X] T031 [P] Add screen reader announcements for navigation state changes
- [X] T032 [P] Ensure keyboard navigation support (Tab, Enter, Escape) throughout navigation

## Phase 3.9: Feature-Specific Implementation
- [X] T033 Add restore functionality to DeletedItemsComponent with navigation integration
- [X] T034 [P] Implement empty state component for deleted items page in frontend/src/app/components/empty-state/
- [X] T035 [P] Add loading indicators during navigation transitions
- [X] T036 [P] Implement visual feedback for active navigation items and hover states

## Phase 3.10: Integration and Polish
- [X] T037 Integrate all navigation components into main app layout in frontend/src/app/app.component.ts
- [X] T038 [P] Add smooth transition animations for desktop/tablet sidebar states
- [X] T039 [P] Implement navigation state persistence and restoration on app bootstrap
- [X] T040 [P] Add performance optimization (OnPush change detection) to all navigation components
- [X] T041 [P] Create comprehensive navigation documentation in frontend/src/app/components/README.md

## Dependencies
**Critical Path Dependencies**:
- T001-T004 (Setup) must complete before all other tasks
- T005-T008 (Models) must complete before T009-T011 (Services)
- T009 (NavigationService) must complete before T017-T019 (Components) and T021-T024 (Component Implementation)
- T013-T016 (Routing) must complete before T021-T024 (Component Implementation)
- T017-T020 (Component Generation) must complete before T021-T024 (Component Implementation)
- T021-T024 (Core Implementation) must complete before T025-T041 (Advanced Features)

**Service Dependencies**:
- T010 (ViewportService) blocks T025-T026 (Responsive features)
- T011 (BreadcrumbService) blocks T023 (BreadcrumbComponent implementation)
- T012 (localStorage) blocks T039 (State persistence)

**Component Dependencies**:
- T017-T019 (Component generation) must precede respective implementation tasks T021-T023
- T037 (App integration) requires all components T021-T024 to be complete

## Parallel Execution Examples
```bash
# Phase 3.2: All model interfaces can be created simultaneously
Task: "Create NavigationItem model interface in frontend/src/app/models/navigation-item.model.ts"
Task: "Create BreadcrumbItem model interface in frontend/src/app/models/breadcrumb-item.model.ts" 
Task: "Create NavigationState model interface in frontend/src/app/models/navigation-state.model.ts"
Task: "Create ViewportState model interface in frontend/src/app/models/viewport-state.model.ts"

# Phase 3.5: Component generation can run in parallel
Task: "Generate TopBarComponent standalone component in frontend/src/app/components/top-bar/"
Task: "Generate SidebarComponent standalone component in frontend/src/app/components/sidebar/"
Task: "Generate BreadcrumbComponent standalone component in frontend/src/app/components/breadcrumb/"
Task: "Create navigation menu items configuration in frontend/src/app/config/navigation.config.ts"

# Phase 3.7: Responsive features are independent
Task: "Add mobile sidebar overlay functionality with Angular CDK Overlay in SidebarComponent"
Task: "Implement responsive breakpoint handling in ViewportService"
Task: "Add hamburger menu toggle animations with Angular Animations API"
Task: "Create backdrop click handling for mobile sidebar closure"

# Phase 3.8: Accessibility features are independent
Task: "Add ARIA navigation patterns and labels to all navigation components"
Task: "Implement focus management for sidebar open/close operations using Angular CDK A11y"
Task: "Add screen reader announcements for navigation state changes"
Task: "Ensure keyboard navigation support (Tab, Enter, Escape) throughout navigation"
```

## Angular CLI Commands
```bash
# Setup Commands
npm install @angular/cdk @angular/animations
ng add @angular/cdk

# Tailwind CSS v4.1 Setup (no config file needed)
# Configuration done directly in CSS using @theme directive in styles.css

# Component Generation Commands  
ng generate service services/navigation --skip-tests=false
ng generate service services/viewport --skip-tests=false
ng generate service services/breadcrumb --skip-tests=false
ng generate component components/top-bar --standalone --skip-tests=false
ng generate component components/sidebar --standalone --skip-tests=false
ng generate component components/breadcrumb --standalone --skip-tests=false
ng generate component components/empty-state --standalone --skip-tests=false
ng generate component pages/tasks --standalone --skip-tests=false
ng generate component pages/deleted-items --standalone --skip-tests=false
ng generate guard guards/navigation --skip-tests=false
```

## Validation Checklist
- [x] All contracts have corresponding implementation tasks
- [x] All entities have model creation tasks  
- [x] All components have generation and implementation tasks
- [x] Parallel tasks operate on different files
- [x] Each task specifies exact file path
- [x] Dependencies properly sequenced
- [x] Angular CLI integration included
- [x] Accessibility and responsive requirements covered
- [x] Feature-specific requirements (restore, empty state) included

## Notes
- Use Angular 20+ standalone components throughout
- Implement signals-based state management as per research decisions
- Follow Angular CDK patterns for responsive design and accessibility
- Maintain Tailwind CSS utility-first approach for styling
- Ensure all navigation components are keyboard accessible
- Test mobile responsiveness at each breakpoint
- Constitution Reference: v4.0.0 (`/memory/constitution.md`)

**Task Count**: 41 tasks organized in 10 phases with clear dependencies and parallel execution opportunities.