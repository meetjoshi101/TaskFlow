
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task';

@Component({
  selector: 'app-task-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './task-input.html',
  styleUrl: './task-input.css'
})
export class TaskInput {
  private taskService = inject(TaskService);
  title = '';

  addTask() {
    if (this.title.trim().length > 0) {
      this.taskService.add(this.title.trim());
      this.title = '';
    }
  }
}
