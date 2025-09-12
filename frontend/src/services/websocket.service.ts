import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: Socket | null = null;
  private socketUrl = 'http://localhost:3000';

  // Subjects for different events
  private taskUpdated$ = new Subject<any>();
  private commentAdded$ = new Subject<any>();
  private projectUpdated$ = new Subject<any>();

  constructor() {}

  connect(): void {
    if (!this.socket) {
      this.socket = io(this.socketUrl);

      // Listen for events
      this.socket.on('task-updated', (data) => {
        this.taskUpdated$.next(data);
      });

      this.socket.on('comment-added', (data) => {
        this.commentAdded$.next(data);
      });

      this.socket.on('project-updated', (data) => {
        this.projectUpdated$.next(data);
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
      });
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Emit events
  emitTaskUpdate(taskId: number, updates: any): void {
    if (this.socket) {
      this.socket.emit('update-task', { taskId, ...updates });
    }
  }

  emitCommentAdded(taskId: number, comment: any): void {
    if (this.socket) {
      this.socket.emit('add-comment', { taskId, comment });
    }
  }

  // Observable getters
  onTaskUpdated(): Observable<any> {
    return this.taskUpdated$.asObservable();
  }

  onCommentAdded(): Observable<any> {
    return this.commentAdded$.asObservable();
  }

  onProjectUpdated(): Observable<any> {
    return this.projectUpdated$.asObservable();
  }

  // Join/leave rooms for specific projects
  joinProject(projectId: number): void {
    if (this.socket) {
      this.socket.emit('join-project', projectId);
    }
  }

  leaveProject(projectId: number): void {
    if (this.socket) {
      this.socket.emit('leave-project', projectId);
    }
  }
}