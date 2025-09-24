import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface EmptyStateConfig {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  actionRoute?: string;
  actionCallback?: () => void;
}

@Component({
  selector: 'app-empty-state',
  imports: [CommonModule, RouterModule],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css'
})
export class EmptyStateComponent {
  @Input() config: EmptyStateConfig = {
    title: 'No items found',
    description: 'There are no items to display at this time.'
  };
  
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  /**
   * Handle action button click
   */
  onActionClick(): void {
    if (this.config.actionCallback) {
      this.config.actionCallback();
    }
  }
  
  /**
   * Get container CSS classes
   */
  getContainerClasses(): string {
    const classes = ['empty-state'];
    classes.push(`empty-state--${this.size}`);
    return classes.join(' ');
  }
  
  /**
   * Check if action button should be shown
   */
  hasAction(): boolean {
    return !!(this.config.actionText && (this.config.actionRoute || this.config.actionCallback));
  }
}
