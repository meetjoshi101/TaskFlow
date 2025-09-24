import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class TasksComponent {
  tasks = [
    { id: '1', title: 'Sample Task 1', completed: false },
    { id: '2', title: 'Sample Task 2', completed: true },
    { id: '3', title: 'Sample Task 3', completed: false }
  ];
}
