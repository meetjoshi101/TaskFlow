import { Task } from './task.model';

export function assignInitialOrder(existing: Task[]): number {
  if (!existing.length) return 1;
  return Math.max(...existing.map(t => t.order)) + 1;
}

export function computeRestoreOrder(active: Task[], deleted: Task): number {
  // If originalOrder present and not taken, reuse it, else append to end.
  if (deleted.originalOrder) {
    const taken = active.some(a => a.order === deleted.originalOrder);
    if (!taken) return deleted.originalOrder;
  }
  return assignInitialOrder(active);
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.order - b.order);
}
