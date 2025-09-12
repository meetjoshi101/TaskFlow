import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/users', pathMatch: 'full' },
  {
    path: 'users',
    loadComponent: () => import('../components/user-selector/user-selector.component').then(m => m.UserSelectorComponent)
  },
  {
    path: 'projects',
    loadComponent: () => import('../components/project-list/project-list.component').then(m => m.ProjectListComponent)
  },
  {
    path: 'projects/:id',
    loadComponent: () => import('../components/kanban-board/kanban-board.component').then(m => m.KanbanBoardComponent)
  }
];