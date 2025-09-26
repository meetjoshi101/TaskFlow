import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class TasksComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly taskService = inject(TaskService);
  
  token: string | null = null;
  newTaskTitle = signal('');
  filter = signal<'all' | 'active' | 'completed'>('all');
  
  // Computed properties
  get tasks(): Task[] {
    return this.taskService.filter(false, this.filter());
  }
  
  get activeTasks(): Task[] {
    return this.taskService.filter(false, 'active');
  }
  
  get completedTasks(): Task[] {
    return this.taskService.filter(false, 'completed');
  }
  
  ngOnInit(): void {
    // Handle token query parameter
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        console.log('Token received:', this.token);
        this.handleToken(this.token);
      }
    });
  }
  
  addTask(): void {
    const title = this.newTaskTitle().trim();
    if (title) {
      this.taskService.add(title);
      this.newTaskTitle.set('');
    }
  }
  
  toggleTaskComplete(taskId: string): void {
    this.taskService.toggleComplete(taskId);
  }
  
  deleteTask(taskId: string): void {
    this.taskService.delete(taskId);
  }
  
  updateTaskTitle(taskId: string, newTitle: string): void {
    const title = newTitle.trim();
    if (title) {
      this.taskService.update(taskId, title);
    }
  }
  
  setFilter(newFilter: 'all' | 'active' | 'completed'): void {
    this.filter.set(newFilter);
  }
  
  clearCompleted(): void {
    this.taskService.clearCompleted();
  }
  
  private handleToken(token: string): void {
    console.log('Processing token:', token);
    // Token handling logic can be implemented here if needed
  }
}
