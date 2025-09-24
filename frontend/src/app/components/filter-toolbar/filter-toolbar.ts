
import { Component, inject, Output, EventEmitter, Input } from '@angular/core';
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
  @Input() filter: 'all' | 'active' | 'completed' = 'all';
  @Output() filterChange = new EventEmitter<'all' | 'active' | 'completed'>();

  setFilter(f: 'all' | 'active' | 'completed') {
    this.filter = f;
    this.filterChange.emit(f);
  }

  clearCompleted() {
    this.taskService.clearCompleted();
  }
}
