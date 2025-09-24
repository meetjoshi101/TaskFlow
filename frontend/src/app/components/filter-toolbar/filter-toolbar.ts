
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-filter-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-toolbar.html',
  styleUrl: './filter-toolbar.css'
})
export class FilterToolbar {
  private taskService = inject(TaskService);
  filter: 'all' | 'active' | 'completed' = 'all';

  setFilter(f: 'all' | 'active' | 'completed') {
    this.filter = f;
  }

  clearCompleted() {
    this.taskService.clearCompleted();
  }
}
