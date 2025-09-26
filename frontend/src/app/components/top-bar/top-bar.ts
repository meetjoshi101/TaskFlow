import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';
import { ViewportService } from '../../services/viewport.service';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb';
import { navigationConfig } from '../../config/navigation.config';

@Component({
  selector: 'app-top-bar',
  imports: [CommonModule, RouterModule, BreadcrumbComponent],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css'
})
export class TopBarComponent {
  private readonly navigationService = inject(NavigationService);
  private readonly viewportService = inject(ViewportService);
  
  readonly applicationName = navigationConfig.applicationName;
  readonly isMobileView = this.viewportService.isMobile;
  readonly isSidebarOpen = this.navigationService.isSidebarOpen;
  readonly breadcrumbs = this.navigationService.breadcrumbs;
  
  /**
   * Check if breadcrumbs should be shown
   */
  readonly shouldShowBreadcrumbs = computed(() => {
    return this.breadcrumbs().length > 1;
  });
  
  /**
   * Toggle sidebar visibility
   */
  onToggleSidebar(): void {
    this.navigationService.toggleSidebar();
  }
  
  /**
   * Handle keyboard navigation for hamburger menu
   */
  onMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onToggleSidebar();
    }
  }
  
  /**
   * Get ARIA label for hamburger menu button
   */
  getMenuButtonAriaLabel(): string {
    return this.isSidebarOpen() ? 'Close navigation menu' : 'Open navigation menu';
  }
}
