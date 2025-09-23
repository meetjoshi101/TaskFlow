import { openDB, IDBPDatabase } from 'idb';
import { Task, validateTitle, assignInitialOrder, computeRestoreOrder, sortTasks } from 'core-data';
import { BehaviorSubject } from 'rxjs';

interface TaskRow extends Task {}

const DB_NAME = 'taskflow';
const DB_VERSION = 1;
const STORE_ACTIVE = 'active';
const STORE_DELETED = 'deleted';

export class TasksRepository {
  private dbPromise: Promise<IDBPDatabase> | null = null;
  private active$ = new BehaviorSubject<Task[]>([]);
  private deleted$ = new BehaviorSubject<Task[]>([]);
  private memoryFallback = false;
  private memActive: Task[] = [];
  private memDeleted: Task[] = [];

  constructor() {
    this.init();
  }

  get activeTasks$() { return this.active$.asObservable(); }
  get deletedTasks$() { return this.deleted$.asObservable(); }

  private async init() {
    try {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_ACTIVE)) db.createObjectStore(STORE_ACTIVE, { keyPath: 'id' });
          if (!db.objectStoreNames.contains(STORE_DELETED)) db.createObjectStore(STORE_DELETED, { keyPath: 'id' });
        }
      });
      await this.refresh();
    } catch (e) {
      this.memoryFallback = true;
    }
  }

  private async refresh() {
    if (this.memoryFallback) {
      this.active$.next(sortTasks(this.memActive));
      this.deleted$.next(sortTasks(this.memDeleted));
      return;
    }
    const db = await this.dbPromise!;
    const tx = db.transaction([STORE_ACTIVE, STORE_DELETED]);
    const active = await tx.objectStore(STORE_ACTIVE).getAll() as TaskRow[];
    const deleted = await tx.objectStore(STORE_DELETED).getAll() as TaskRow[];
    this.active$.next(sortTasks(active));
    this.deleted$.next(sortTasks(deleted));
  }

  async createTask(titleRaw: string): Promise<Task> {
    const v = validateTitle(titleRaw);
    if (!v.valid) throw new Error(v.error);
    const task: Task = {
      id: crypto.randomUUID(),
      title: v.normalized!,
      completed: false,
      deleted: false,
      order: assignInitialOrder(this.memoryFallback ? this.memActive : this.active$.value),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      originalOrder: undefined
    };
    if (this.memoryFallback) {
      this.memActive.push(task);
    } else {
      const db = await this.dbPromise!;
      const tx = db.transaction(STORE_ACTIVE, 'readwrite');
      await tx.objectStore(STORE_ACTIVE).put(task);
    }
    await this.refresh();
    return task;
  }

  async listActive(): Promise<Task[]> { return this.active$.value; }
  async listDeleted(): Promise<Task[]> { return this.deleted$.value; }

  async updateTask(id: string, patch: Partial<Pick<Task, 'title'|'completed'>>) {
    const collection = this.memoryFallback ? this.memActive : this.active$.value;
    const t = collection.find(t => t.id === id);
    if (!t) throw new Error('not_found');
    if (patch.title !== undefined) {
      const v = validateTitle(patch.title);
      if (!v.valid) throw new Error(v.error);
      t.title = v.normalized!;
    }
    if (patch.completed !== undefined) t.completed = patch.completed;
    t.updatedAt = Date.now();
    if (this.memoryFallback) {
      // already mutated
    } else {
      const db = await this.dbPromise!;
      const tx = db.transaction(STORE_ACTIVE, 'readwrite');
      await tx.objectStore(STORE_ACTIVE).put(t);
    }
    await this.refresh();
  }

  async softDelete(id: string) {
    const src = this.memoryFallback ? this.memActive : this.active$.value;
    const idx = src.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('not_found');
    const task = { ...src[idx], deleted: true, originalOrder: src[idx].originalOrder ?? src[idx].order };
    if (this.memoryFallback) {
      src.splice(idx, 1);
      this.memDeleted.push(task);
    } else {
      const db = await this.dbPromise!;
      const tx = db.transaction([STORE_ACTIVE, STORE_DELETED], 'readwrite');
      await tx.objectStore(STORE_ACTIVE).delete(id);
      await tx.objectStore(STORE_DELETED).put(task);
    }
    await this.refresh();
  }

  async restore(id: string) {
    const deleted = this.memoryFallback ? this.memDeleted : this.deleted$.value;
    const idx = deleted.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('not_found');
    const active = this.memoryFallback ? this.memActive : this.active$.value;
    const task = { ...deleted[idx], deleted: false } as Task;
    task.order = computeRestoreOrder(active, task);
    if (this.memoryFallback) {
      deleted.splice(idx, 1);
      active.push(task);
    } else {
      const db = await this.dbPromise!;
      const tx = db.transaction([STORE_ACTIVE, STORE_DELETED], 'readwrite');
      await tx.objectStore(STORE_DELETED).delete(task.id);
      await tx.objectStore(STORE_ACTIVE).put(task);
    }
    await this.refresh();
  }

  async purgeDeleted() {
    if (this.memoryFallback) {
      this.memDeleted = [];
    } else {
      const db = await this.dbPromise!;
      const tx = db.transaction(STORE_DELETED, 'readwrite');
      await tx.objectStore(STORE_DELETED).clear();
    }
    await this.refresh();
  }
}
