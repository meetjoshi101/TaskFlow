import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  User,
  Project,
  Task,
  Comment,
  Notification,
  ApiResponse
} from './api.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`)
      .pipe(catchError(this.handleError));
  }

  // Projects
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects`)
      .pipe(catchError(this.handleError));
  }

  createProject(project: { name: string }): Observable<Project> {
    return this.http.post<Project>(`${this.baseUrl}/projects`, project)
      .pipe(catchError(this.handleError));
  }

  // Tasks
  getTasksForProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/projects/${projectId}/tasks`)
      .pipe(catchError(this.handleError));
  }

  createTask(projectId: number, task: {
    title: string;
    description?: string;
    status?: 'To Do' | 'In Progress' | 'In Review' | 'Done';
    assignedUserId?: number;
  }): Observable<Task> {
    return this.http.post<Task>(`${this.baseUrl}/projects/${projectId}/tasks`, task)
      .pipe(catchError(this.handleError));
  }

  updateTaskStatus(taskId: number, status: 'To Do' | 'In Progress' | 'In Review' | 'Done'): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/tasks/${taskId}/status`, { status })
      .pipe(catchError(this.handleError));
  }

  // Comments
  getCommentsForTask(taskId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.baseUrl}/tasks/${taskId}/comments`)
      .pipe(catchError(this.handleError));
  }

  createComment(taskId: number, comment: { text: string; authorId: number }): Observable<Comment> {
    return this.http.post<Comment>(`${this.baseUrl}/tasks/${taskId}/comments`, comment)
      .pipe(catchError(this.handleError));
  }

  updateComment(commentId: number, comment: { text: string }): Observable<Comment> {
    return this.http.put<Comment>(`${this.baseUrl}/comments/${commentId}`, comment)
      .pipe(catchError(this.handleError));
  }

  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/comments/${commentId}`)
      .pipe(catchError(this.handleError));
  }

  // Notifications
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/notifications`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}