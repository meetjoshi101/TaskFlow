
import { Component, inject, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task';
import { Task } from '../../models/task.model';
import { TaskItem } from '../task-item/task-item';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskItem],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskList {
  private taskService = inject(TaskService);
  @Input() filter: 'all' | 'active' | 'completed' = 'all';

  get tasks() {
    return this.taskService.filter(false, this.filter);
  }

  onToggleComplete(id: string) {
    this.taskService.toggleComplete(id);
  }

  onDelete(id: string) {
    this.taskService.delete(id);
  }

  onEdit(id: string, title: string) {
    this.taskService.update(id, title);
  }
}
