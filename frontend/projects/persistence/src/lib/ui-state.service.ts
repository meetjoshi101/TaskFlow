import { BehaviorSubject } from 'rxjs';

export type TaskFilter = 'all' | 'active' | 'completed';
interface UiStateSnapshot { filter: TaskFilter; deletedPanelOpen: boolean; }

const STORAGE_KEY = 'taskflow_ui_state_v1';

function loadPersisted(): UiStateSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function persist(s: UiStateSnapshot) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

export class UiStateService {
  private state: UiStateSnapshot = loadPersisted() || { filter: 'all', deletedPanelOpen: false };
  private filter$ = new BehaviorSubject<TaskFilter>(this.state.filter);
  private deletedPanel$ = new BehaviorSubject<boolean>(this.state.deletedPanelOpen);

  get filterChanges() { return this.filter$.asObservable(); }
  get deletedPanelChanges() { return this.deletedPanel$.asObservable(); }

  setFilter(f: TaskFilter) {
    if (this.state.filter === f) return;
    this.state.filter = f;
    this.filter$.next(f);
    persist(this.state);
  }

  toggleDeletedPanel(force?: boolean) {
    if (typeof force === 'boolean') this.state.deletedPanelOpen = force; else this.state.deletedPanelOpen = !this.state.deletedPanelOpen;
    this.deletedPanel$.next(this.state.deletedPanelOpen);
    persist(this.state);
  }
}
