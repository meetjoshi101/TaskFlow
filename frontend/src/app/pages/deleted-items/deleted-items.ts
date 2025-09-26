import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';
import { ViewportService } from '../../services/viewport.service';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-deleted-items',
  imports: [CommonModule],
  templateUrl: './deleted-items.html',
  styleUrl: './deleted-items.css'
})
export class DeletedItemsComponent implements OnInit {
  private readonly navigationService = inject(NavigationService);
  private readonly viewportService = inject(ViewportService);
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  
  readonly isMobileView = this.viewportService.isMobile;
  
  selectedTasks: Set<string> = new Set();
  isLoading = false;

  // Get deleted tasks from the task service
  get deletedTasks(): Task[] {
    return this.taskService.filter(true, 'all').filter(task => task.deleted);
  }
  
  ngOnInit(): void {
    // No need to load tasks manually - using getter from TaskService
  }
  
  /**
   * Restore a single task
   */
  restoreTask(taskId: string): void {
    this.taskService.restore(taskId);
    this.selectedTasks.delete(taskId);
    console.log(`Task restored successfully`);
  }
  
  /**
   * Restore multiple selected tasks
   */
  restoreSelectedTasks(): void {
    const tasksToRestore = Array.from(this.selectedTasks);
    
    tasksToRestore.forEach(taskId => {
      this.taskService.restore(taskId);
    });
    
    this.selectedTasks.clear();
    console.log(`Restored ${tasksToRestore.length} tasks`);
  }
  
  /**
   * Permanently delete a task
   */
  permanentlyDeleteTask(taskId: string): void {
    const task = this.deletedTasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (confirm(`Are you sure you want to permanently delete "${task.title}"? This action cannot be undone.`)) {
      // Remove from the tasks array permanently
      this.taskService.tasks.update(tasks => tasks.filter(t => t.id !== taskId));
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
    this.router.navigate(['/tasks']);
  }
  
  /**
   * Format date for display
   */
  formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  }
  
  /**
   * Track tasks for *ngFor performance
   */
  trackByTask(index: number, task: Task): string {
    return task.id;
  }
}
