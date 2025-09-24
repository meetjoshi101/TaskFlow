
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-deleted-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deleted-panel.html',
  styleUrl: './deleted-panel.css'
})
export class DeletedPanel {
  private taskService = inject(TaskService);
  deletedTasks = computed(() => this.taskService.filter(true));

  restoreTask(id: string) {
    this.taskService.restore(id);
  }
}
