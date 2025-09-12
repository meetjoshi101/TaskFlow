import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, User } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-user-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-selector.component.html',
  styleUrls: ['./user-selector.component.scss']
})
export class UserSelectorComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private websocketService: WebsocketService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.apiService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load users. Please try again.';
        this.loading = false;
        console.error('Error loading users:', error);
      }
    });
  }

  selectUser(user: User): void {
    this.selectedUser = user;
    // Store selected user in localStorage or service
    localStorage.setItem('selectedUser', JSON.stringify(user));
    // Connect to websocket
    this.websocketService.connect();
    // Navigate to projects
    this.router.navigate(['/projects']);
  }

  retry(): void {
    this.error = null;
    this.loadUsers();
  }
}