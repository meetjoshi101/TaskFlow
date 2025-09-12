import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, User } from '../../services/api.models';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Input() currentUser: User | null = null;
  @Input() showComments = false;
  @Output() taskClick = new EventEmitter<Task>();
  @Output() statusChange = new EventEmitter<{taskId: number, status: string}>();

  get isCurrentUserTask(): boolean {
    return this.currentUser ? this.task.assignedUserId === this.currentUser.id : false;
  }

  onCardClick(): void {
    this.taskClick.emit(this.task);
  }

  onStatusChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value;
    this.statusChange.emit({ taskId: this.task.id, status: newStatus });
  }
}