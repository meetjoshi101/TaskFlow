import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default route - redirect to tasks, preserving query params
  {
    path: '',
    redirectTo: '/tasks',
    pathMatch: 'full'
  },
  
  // Tasks page route
  {
    path: 'tasks',
    loadComponent: () => import('./pages/tasks/tasks').then(c => c.TasksComponent),
    data: { 
      breadcrumb: 'Tasks',
      title: 'Task Management'
    }
  },
  
  // Deleted items page route  
  {
    path: 'deleted-items',
    loadComponent: () => import('./pages/deleted-items/deleted-items').then(c => c.DeletedItemsComponent),
    data: { 
      breadcrumb: 'Deleted Items',
      title: 'Deleted Items Management'
    }
  },
  
  // Task details route (if needed for future expansion)
  {
    path: 'tasks/:id',
    loadComponent: () => import('./pages/tasks/tasks').then(c => c.TasksComponent),
    data: { 
      breadcrumb: 'Task Details',
      title: 'Task Details'
    }
  },
  
  // Wildcard route - redirect to tasks for any unknown paths
  {
    path: '**',
    redirectTo: '/tasks'
  }
];
