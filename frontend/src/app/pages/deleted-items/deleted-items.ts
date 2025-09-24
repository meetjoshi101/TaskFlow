import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../services/navigation.service';
import { ViewportService } from '../../services/viewport.service';

interface DeletedTask {
  id: string;
  title: string;
  description?: string;
  deletedAt: Date;
  originalCategory?: string;
}

@Component({
  selector: 'app-deleted-items',
  imports: [CommonModule],
  templateUrl: './deleted-items.html',
  styleUrl: './deleted-items.css'
})
export class DeletedItemsComponent implements OnInit {
  private readonly navigationService = inject(NavigationService);
  private readonly viewportService = inject(ViewportService);
  
  readonly isMobileView = this.viewportService.isMobile;
  
  deletedTasks: DeletedTask[] = [];
  selectedTasks: Set<string> = new Set();
  isLoading = false;
  
  ngOnInit(): void {
    this.loadDeletedTasks();
  }
  
  /**
   * Load deleted tasks from storage or service
   */
  private loadDeletedTasks(): void {
    this.isLoading = true;
    
    // Simulate loading deleted tasks
    // In a real app, this would come from a service/API
    setTimeout(() => {
      this.deletedTasks = [
        {
          id: '1',
          title: 'Sample Deleted Task 1',
          description: 'This is a sample deleted task for testing',
          deletedAt: new Date('2025-09-20'),
          originalCategory: 'Work'
        },
        {
          id: '2',
          title: 'Sample Deleted Task 2',
          description: 'Another sample deleted task',
          deletedAt: new Date('2025-09-19'),
          originalCategory: 'Personal'
        }
      ];
      this.isLoading = false;
    }, 500);
  }
  
  /**
   * Restore a single task
   */
  restoreTask(taskId: string): void {
    const task = this.deletedTasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Remove from deleted tasks
    this.deletedTasks = this.deletedTasks.filter(t => t.id !== taskId);
    this.selectedTasks.delete(taskId);
    
    // In a real app, this would call a service to restore the task
    console.log(`Restored task: ${task.title}`);
    
    // Show success message (could be implemented with a toast service)
    // For now, just log success
    console.log(`Task "${task.title}" has been restored successfully`);
  }
  
  /**
   * Restore multiple selected tasks
   */
  restoreSelectedTasks(): void {
    const tasksToRestore = Array.from(this.selectedTasks);
    
    tasksToRestore.forEach(taskId => {
      this.restoreTask(taskId);
    });
    
    console.log(`Restored ${tasksToRestore.length} tasks`);
  }
  
  /**
   * Permanently delete a task
   */
  permanentlyDeleteTask(taskId: string): void {
    const task = this.deletedTasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (confirm(`Are you sure you want to permanently delete "${task.title}"? This action cannot be undone.`)) {
      this.deletedTasks = this.deletedTasks.filter(t => t.id !== taskId);
      this.selectedTasks.delete(taskId);
      
      console.log(`Permanently deleted task: ${task.title}`);
    }
  }
  
  /**
   * Toggle task selection
   */
  toggleTaskSelection(taskId: string): void {
    if (this.selectedTasks.has(taskId)) {
      this.selectedTasks.delete(taskId);
    } else {
      this.selectedTasks.add(taskId);
    }
  }
  
  /**
   * Select all tasks
   */
  selectAllTasks(): void {
    this.deletedTasks.forEach(task => {
      this.selectedTasks.add(task.id);
    });
  }
  
  /**
   * Deselect all tasks
   */
  deselectAllTasks(): void {
    this.selectedTasks.clear();
  }
  
  /**
   * Check if task is selected
   */
  isTaskSelected(taskId: string): boolean {
    return this.selectedTasks.has(taskId);
  }
  
  /**
   * Get selected tasks count
   */
  getSelectedCount(): number {
    return this.selectedTasks.size;
  }
  
  /**
   * Check if any tasks are selected
   */
  hasSelectedTasks(): boolean {
    return this.selectedTasks.size > 0;
  }
  
  /**
   * Check if all tasks are selected
   */
  areAllTasksSelected(): boolean {
    return this.deletedTasks.length > 0 && this.selectedTasks.size === this.deletedTasks.length;
  }
  
  /**
   * Navigate back to tasks
   */
  navigateToTasks(): void {
    this.navigationService.navigateTo('/tasks');
  }
  
  /**
   * Format date for display
   */
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
  
  /**
   * Track tasks for *ngFor performance
   */
  trackByTask(index: number, task: DeletedTask): string {
    return task.id;
  }
}
