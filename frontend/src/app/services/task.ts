
import { Injectable, signal } from '@angular/core';
import { Task } from '../models/task.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  tasks = signal<Task[]>(this.loadTasks());

  private loadTasks(): Task[] {
    const data = localStorage.getItem('tasks');
    return data ? JSON.parse(data) : [];
  }

  private saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks()));
  }

  add(title: string) {
    const newTask: Task = {
      id: uuidv4(),
      title,
      completed: false,
      createdAt: Date.now(),
      deleted: false
    };
    this.tasks.update(tasks => [...tasks, newTask]);
    this.saveTasks();
  }

  update(id: string, title: string) {
    this.tasks.update(tasks => tasks.map(t => t.id === id ? { ...t, title } : t));
    this.saveTasks();
  }

  toggleComplete(id: string) {
    this.tasks.update(tasks => tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    this.saveTasks();
  }

  delete(id: string) {
    this.tasks.update(tasks => tasks.map(t => t.id === id ? { ...t, deleted: true } : t));
    this.saveTasks();
  }

  restore(id: string) {
    this.tasks.update(tasks => tasks.map(t => t.id === id ? { ...t, deleted: false } : t));
    this.saveTasks();
  }

  clearCompleted() {
    this.tasks.update(tasks => tasks.filter(t => !t.completed));
    this.saveTasks();
  }

  filter(showDeleted = false, filter: 'all' | 'active' | 'completed' = 'all'): Task[] {
    let filtered = this.tasks();
    if (!showDeleted) filtered = filtered.filter(t => !t.deleted);
    if (filter === 'active') filtered = filtered.filter(t => !t.completed);
    if (filter === 'completed') filtered = filtered.filter(t => t.completed);
    return filtered;
  }
}
