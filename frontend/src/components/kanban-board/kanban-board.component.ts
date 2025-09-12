import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
import { ApiService } from '../../services/api.service';
import { Task, User } from '../../services/api.models';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit, OnDestroy {
  projectId: number = 0;
  currentUser: User | null = null;

  // Kanban columns
  todo: Task[] = [];
  inProgress: Task[] = [];
  inReview: Task[] = [];
  done: Task[] = [];

  allTasks: Task[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private websocketService: WebsocketService
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCurrentUser();
    this.loadTasks();
    this.websocketService.connect();
    this.websocketService.joinProject(this.projectId);

    // Listen for real-time updates
    this.websocketService.onTaskUpdated().subscribe((update) => {
      this.handleTaskUpdate(update);
    });
  }

  ngOnDestroy(): void {
    this.websocketService.leaveProject(this.projectId);
  }

  loadCurrentUser(): void {
    const userStr = localStorage.getItem('selectedUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    } else {
      this.router.navigate(['/users']);
    }
  }

  loadTasks(): void {
    this.loading = true;
    this.apiService.getTasksForProject(this.projectId).subscribe({
      next: (tasks) => {
        this.allTasks = tasks;
        this.distributeTasks();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load tasks. Please try again.';
        this.loading = false;
        console.error('Error loading tasks:', error);
      }
    });
  }

  distributeTasks(): void {
    this.todo = this.allTasks.filter(task => task.status === 'To Do');
    this.inProgress = this.allTasks.filter(task => task.status === 'In Progress');
    this.inReview = this.allTasks.filter(task => task.status === 'In Review');
    this.done = this.allTasks.filter(task => task.status === 'Done');
  }

  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    const task = event.item.data;
    let newStatus: 'To Do' | 'In Progress' | 'In Review' | 'Done';

    if (event.container.id === 'todo-list') {
      newStatus = 'To Do';
    } else if (event.container.id === 'in-progress-list') {
      newStatus = 'In Progress';
    } else if (event.container.id === 'in-review-list') {
      newStatus = 'In Review';
    } else {
      newStatus = 'Done';
    }

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    // Update task status via API
    this.updateTaskStatus(task.id, newStatus);
  }

  updateTaskStatus(taskId: number, status: 'To Do' | 'In Progress' | 'In Review' | 'Done'): void {
    this.apiService.updateTaskStatus(taskId, status).subscribe({
      next: (updatedTask) => {
        // Emit websocket event
        this.websocketService.emitTaskUpdate(taskId, { status });
      },
      error: (error) => {
        console.error('Error updating task status:', error);
        // Reload tasks to revert changes
        this.loadTasks();
      }
    });
  }

  handleTaskUpdate(update: any): void {
    // Handle real-time updates from other users
    if (update.taskId) {
      const taskIndex = this.allTasks.findIndex(t => t.id === update.taskId);
      if (taskIndex !== -1) {
        this.allTasks[taskIndex] = { ...this.allTasks[taskIndex], ...update };
        this.distributeTasks();
      }
    }
  }

  isCurrentUserTask(task: Task): boolean {
    return this.currentUser ? task.assignedUserId === this.currentUser.id : false;
  }

  backToProjects(): void {
    this.router.navigate(['/projects']);
  }

  retry(): void {
    this.error = null;
    this.loadTasks();
  }
}