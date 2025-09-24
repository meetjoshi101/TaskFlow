import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TaskList } from '../components/task-list/task-list';
import { TaskInput } from '../components/task-input/task-input';
import { DeletedPanel } from '../components/deleted-panel/deleted-panel';
import { FilterToolbar } from '../components/filter-toolbar/filter-toolbar';

@Component({
  selector: 'app-app',
  standalone: true,
  imports: [RouterOutlet, TaskList, TaskInput, DeletedPanel, FilterToolbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
