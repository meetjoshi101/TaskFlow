
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-item.html',
  styleUrl: './task-item.css'
})
export class TaskItem {
  @Input() task!: Task;
  @Output() toggleComplete = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();
  @Output() edit = new EventEmitter<{id: string, title: string}>();
  
  editing = false;

  onToggleComplete() {
    this.toggleComplete.emit(this.task.id);
  }

  onDelete() {
    this.delete.emit(this.task.id);
  }

  onEdit(newTitle: string) {
    this.edit.emit({id: this.task.id, title: newTitle});
  }
}
