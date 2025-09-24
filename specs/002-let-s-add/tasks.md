# Tasks: Modern UI Styling for TaskFlow

**Input**: Design documents from `/specs/002-let-s-add/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)

```MD
1. Load plan.md from feature directory
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness
```

## Phase 3.1: Setup

- [X] T001 Install Tailwind CSS v4.1 and @tailwindcss/postcss in `/frontend/package.json`
- [X] T002 Configure PostCSS integration in `/frontend/postcss.config.js`
- [X] T003 [P] Update `/frontend/src/styles.css` to import Tailwind and define Spring Happiness theme
- [X] T004 [P] Configure linting and formatting tools in `/frontend/eslint.config.js`

## Phase 3.2: Contract Tests

- [X] T005 [P] Contract test for TaskListComponent styling in `/specs/002-let-s-add/contracts/ui-styling-contracts.md`
- [X] T006 [P] Contract test for TaskItemComponent styling in `/specs/002-let-s-add/contracts/ui-styling-contracts.md`
- [X] T007 [P] Contract test for TaskInputComponent styling in `/specs/002-let-s-add/contracts/ui-styling-contracts.md`
- [X] T008 [P] Contract test for FilterToolbarComponent styling in `/specs/002-let-s-add/contracts/ui-styling-contracts.md`
- [X] T009 [P] Contract test for DeletedPanelComponent styling in `/specs/002-let-s-add/contracts/ui-styling-contracts.md`

## Phase 3.3: Core Implementation

- [X] T010 [P] Implement Spring Happiness color palette and theme system in `/frontend/src/styles.css`
- [X] T011 [P] Style TaskListComponent in `/frontend/src/app/components/task-list/task-list.html` and `/frontend/src/app/components/task-list/task-list.css`
- [X] T012 [P] Style TaskItemComponent in `/frontend/src/app/components/task-item/task-item.html` and `/frontend/src/app/components/task-item/task-item.css`
- [X] T013 [P] Style TaskInputComponent in `/frontend/src/app/components/task-input/task-input.html` and `/frontend/src/app/components/task-input/task-input.css`
- [X] T014 [P] Style FilterToolbarComponent in `/frontend/src/app/components/filter-toolbar/filter-toolbar.html` and `/frontend/src/app/components/filter-toolbar/filter-toolbar.css`
- [X] T015 [P] Style DeletedPanelComponent in `/frontend/src/app/components/deleted-panel/deleted-panel.html` and `/frontend/src/app/components/deleted-panel/deleted-panel.css`

## Phase 3.3a: Documentation (Constitution Compliance)

- [X] T015a [P] Add documentation and usage examples for TaskListComponent in `/frontend/src/app/components/task-list/README.md`
- [X] T015b [P] Add documentation and usage examples for TaskItemComponent in `/frontend/src/app/components/task-item/README.md`
- [X] T015c [P] Add documentation and usage examples for TaskInputComponent in `/frontend/src/app/components/task-input/README.md`
- [X] T015d [P] Add documentation and usage examples for FilterToolbarComponent in `/frontend/src/app/components/filter-toolbar/README.md`
- [X] T015e [P] Add documentation and usage examples for DeletedPanelComponent in `/frontend/src/app/components/deleted-panel/README.md`


## Phase 3.4: Integration & Validation

- [X] T016 Validate responsive design at tablet (768px+) and desktop (1024px+) breakpoints in `/frontend/src/styles.css` and all component CSS files
- [X] T017 Validate accessibility (WCAG 2.2 AA) in all components and global styles
- [X] T018 Validate keyboard navigation and focus indicators in all components
- [X] T019 Validate color contrast and screen reader compatibility in all components
- [X] T020 Validate build process and CSS bundle size in `/frontend`
- [X] T021 Validate cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- [X] T022 Validate performance (animations, transitions, runtime)

## Phase 3.4a: Additional Validation Tasks

- [X] T023 Validate animation duration and easing for all transitions in `/frontend/src/styles.css` and component CSS files
- [X] T024 Validate error and loading state styling in all components
- [X] T025 Security review: Scan dependencies, check for CVEs, and validate Angular security best practices

## Phase 3.5: Polish

- [X] T026 [P] Update documentation in `/frontend/README.md` and `/specs/002-let-s-add/quickstart.md`
- [X] T027 [P] Manual verification and smoke testing

## Requirement/Task Mapping Table

| Requirement Key                        | Has Task? | Task IDs         | Notes                                      |
|----------------------------------------|-----------|------------------|--------------------------------------------|
| display-modern-styling                 | Yes       | T011-T015        | Covered by component styling tasks         |
| consistent-visual-design               | Yes       | T011-T015        | Overlaps with above                        |
| spring-happiness-color-palette         | Yes       | T003, T010        | Theme system tasks                         |
| responsive-design-breakpoints          | Yes       | T016              | Responsive validation                      |
| visual-distinction-task-states         | Yes       | T011, T012, T015  | Component styling                          |
| hover-interactive-feedback             | Yes       | T011-T015         | Component styling                          |
| wcag-2-2-aa-accessibility              | Yes       | T017, T019        | Accessibility validation                   |
| attractive-empty-states                | Yes       | T011, T015        | Component styling                          |
| consistent-spacing-layout              | Yes       | T003, T010        | Theme system tasks                         |
| smooth-transitions-animations          | Yes       | T022, T023        | Animation validation                       |
| error-loading-state-visuals            | Yes       | T024              | Edge case mapped                           |
| documentation                          | Yes       | T015a-T015e, T023 | Per-component and global documentation     |
| performance-validation                 | Yes       | T022, T020        | Performance metrics and build validation    |
| security-validation                    | Yes       | T025              | Security review task                       |

## Dependencies

- T001 → T002 → T003, T004
- T003, T004 → T005-T009 (contract tests)
- T005-T009 → T010-T015 (core implementation)
- T010-T015 → T016-T022 (integration & validation)
- T016-T022 → T023, T024 (polish)

## Parallel Execution Example

```MD
# Launch T005-T009 together:
Task: "Contract test for TaskListComponent styling in /specs/002-let-s-add/contracts/ui-styling-contracts.md"
Task: "Contract test for TaskItemComponent styling in /specs/002-let-s-add/contracts/ui-styling-contracts.md"
Task: "Contract test for TaskInputComponent styling in /specs/002-let-s-add/contracts/ui-styling-contracts.md"
Task: "Contract test for FilterToolbarComponent styling in /specs/002-let-s-add/contracts/ui-styling-contracts.md"
Task: "Contract test for DeletedPanelComponent styling in /specs/002-let-s-add/contracts/ui-styling-contracts.md"
```

## Notes

- [P] tasks = different files, no dependencies
- Tests before implementation (TDD)
- Each task specifies exact file path
- No task modifies same file as another [P] task
