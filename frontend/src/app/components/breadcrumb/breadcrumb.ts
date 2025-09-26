import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { BreadcrumbItem } from '../../models/breadcrumb-item.model';

@Component({
  selector: 'app-breadcrumb',
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.css'
})
export class BreadcrumbComponent {
  private readonly navigationService = inject(NavigationService);
  private readonly breadcrumbService = inject(BreadcrumbService);
  
  readonly breadcrumbs = this.navigationService.breadcrumbs;
  readonly currentRoute = this.navigationService.currentRoute;
  
  /**
   * Check if breadcrumbs should be visible
   */
  readonly shouldShow = computed(() => {
    const route = this.currentRoute();
    return this.breadcrumbService.shouldShowBreadcrumbs(route) && this.breadcrumbs().length > 0;
  });
  
  /**
   * Get the last (current) breadcrumb
   */
  readonly currentBreadcrumb = computed(() => {
    const crumbs = this.breadcrumbs();
    return crumbs.find(b => b.isLast) || null;
  });
  
  /**
   * Get navigable breadcrumbs (excluding the current/last one)
   */
  readonly navigableBreadcrumbs = computed(() => {
    return this.breadcrumbs().filter(b => !b.isLast && b.route);
  });
  
  /**
   * Handle breadcrumb click navigation
   */
  onBreadcrumbClick(breadcrumb: BreadcrumbItem): void {
    if (breadcrumb.route && !breadcrumb.isLast) {
      this.navigationService.navigateTo(breadcrumb.route);
    }
  }
  
  /**
   * Handle keyboard navigation for breadcrumb items
   */
  onBreadcrumbKeydown(event: KeyboardEvent, breadcrumb: BreadcrumbItem): void {
    if ((event.key === 'Enter' || event.key === ' ') && breadcrumb.route && !breadcrumb.isLast) {
      event.preventDefault();
      this.onBreadcrumbClick(breadcrumb);
    }
  }
  
  /**
   * Get ARIA label for breadcrumb navigation
   */
  getBreadcrumbAriaLabel(): string {
    const current = this.currentBreadcrumb();
    return current ? `Current page: ${current.label}` : 'Breadcrumb navigation';
  }
  
  /**
   * Get breadcrumb item classes
   */
  getBreadcrumbClasses(breadcrumb: BreadcrumbItem): string {
    const classes = ['breadcrumb-item'];
    
    if (breadcrumb.isLast) {
      classes.push('breadcrumb-item--current');
    } else if (breadcrumb.route) {
      classes.push('breadcrumb-item--link');
    }
    
    return classes.join(' ');
  }
  
  /**
   * Check if breadcrumb should be clickable
   */
  isClickable(breadcrumb: BreadcrumbItem): boolean {
    return !breadcrumb.isLast && !!breadcrumb.route;
  }
  
  /**
   * Track breadcrumb items for *ngFor performance
   */
  trackByBreadcrumb(index: number, breadcrumb: BreadcrumbItem): string {
    return `${breadcrumb.label}-${breadcrumb.route || 'current'}`;
  }
  
  /**
   * Get separator aria label
   */
  getSeparatorAriaLabel(): string {
    return 'Breadcrumb separator';
  }
}
