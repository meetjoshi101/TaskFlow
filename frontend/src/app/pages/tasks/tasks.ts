import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tasks',
  imports: [CommonModule],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css'
})
export class TasksComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  
  tasks = [
    { id: '1', title: 'Sample Task 1', completed: false },
    { id: '2', title: 'Sample Task 2', completed: true },
    { id: '3', title: 'Sample Task 3', completed: false }
  ];
  
  token: string | null = null;
  
  ngOnInit(): void {
    // Handle token query parameter
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (this.token) {
        console.log('Token received:', this.token);
        // Handle token logic here (e.g., authentication, special features)
        this.handleToken(this.token);
      }
    });
  }
  
  private handleToken(token: string): void {
    // Add your token handling logic here
    // For example: authentication, special task loading, etc.
    console.log('Processing token:', token);
    
    // Example: You might want to load specific tasks based on token
    // or authenticate the user, etc.
  }
}
