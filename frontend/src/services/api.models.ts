// API Models
export interface User {
  id: number;
  name: string;
  role: 'product_manager' | 'engineer';
}

export interface Project {
  id: number;
  name: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  assignedUserId?: number;
  projectId: number;
}

export interface Comment {
  id: number;
  text: string;
  authorId: number;
  taskId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: number;
  message: string;
  type: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}