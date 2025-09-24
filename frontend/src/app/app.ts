import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskList } from './components/task-list/task-list';
import { TaskInput } from './components/task-input/task-input';
import { TaskItem } from './components/task-item/task-item';
import { DeletedPanel } from './components/deleted-panel/deleted-panel';
import { FilterToolbar } from './components/filter-toolbar/filter-toolbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TaskList, TaskInput, TaskItem, DeletedPanel, FilterToolbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
