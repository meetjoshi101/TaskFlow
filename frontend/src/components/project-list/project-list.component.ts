import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Project, User } from '../../services/api.models';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  currentUser: User | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadProjects();
  }

  loadCurrentUser(): void {
    const userStr = localStorage.getItem('selectedUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    } else {
      // Redirect to user selection if no user selected
      this.router.navigate(['/users']);
    }
  }

  loadProjects(): void {
    this.loading = true;
    this.apiService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load projects. Please try again.';
        this.loading = false;
        console.error('Error loading projects:', error);
      }
    });
  }

  selectProject(project: Project): void {
    this.router.navigate(['/projects', project.id]);
  }

  logout(): void {
    localStorage.removeItem('selectedUser');
    this.router.navigate(['/users']);
  }

  retry(): void {
    this.error = null;
    this.loadProjects();
  }
}