import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavigationService } from '../../services/navigation.service';
import { ViewportService } from '../../services/viewport.service';
import { NavigationItem } from '../../models/navigation-item.model';
import { navigationConfig } from '../../config/navigation.config';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class SidebarComponent implements OnInit {
  private readonly navigationService = inject(NavigationService);
  private readonly viewportService = inject(ViewportService);
  
  readonly isMobileView = this.viewportService.isMobile;
  readonly isSidebarOpen = this.navigationService.isSidebarOpen;
  readonly navigationItems = this.navigationService.navigationItems;
  
  private readonly focusedItemId = signal<string | null>(null);
  
  /**
   * Check if sidebar should be visible
   */
  readonly isVisible = computed(() => {
    return !this.isMobileView() || this.isSidebarOpen();
  });
  
  /**
   * Get sidebar CSS classes
   */
  readonly sidebarClasses = computed(() => {
    const classes = ['sidebar'];
    
    if (this.isMobileView()) {
      classes.push('sidebar--mobile');
      if (this.isSidebarOpen()) {
        classes.push('sidebar--open');
      }
    } else {
      classes.push('sidebar--desktop');
    }
    
    return classes.join(' ');
  });
  
  ngOnInit(): void {
    // Initialize navigation items if not already set
    if (this.navigationItems().length === 0) {
      this.navigationService.updateNavigationItems(navigationConfig.items);
    }
  }
  
  /**
   * Handle navigation item click
   */
  onNavigationItemClick(item: NavigationItem): void {
    this.navigationService.navigateTo(item.route);
    
    // Close sidebar on mobile after navigation
    if (this.isMobileView()) {
      this.navigationService.closeSidebar();
    }
  }
  
  /**
   * Handle keyboard navigation
   */
  onNavigationItemKeydown(event: KeyboardEvent, item: NavigationItem): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.onNavigationItemClick(item);
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.focusPreviousItem(item);
        break;
        
      case 'ArrowDown':
        event.preventDefault();
        this.focusNextItem(item);
        break;
        
      case 'Home':
        event.preventDefault();
        this.focusFirstItem();
        break;
        
      case 'End':
        event.preventDefault();
        this.focusLastItem();
        break;
        
      case 'Escape':
        if (this.isMobileView()) {
          event.preventDefault();
          this.navigationService.closeSidebar();
        }
        break;
    }
  }
  
  /**
   * Handle backdrop click on mobile
   */
  onBackdropClick(): void {
    if (this.isMobileView()) {
      this.navigationService.closeSidebar();
    }
  }
  
  /**
   * Handle backdrop keydown (for accessibility)
   */
  onBackdropKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.navigationService.closeSidebar();
    }
  }
  
  /**
   * Focus previous navigation item
   */
  private focusPreviousItem(currentItem: NavigationItem): void {
    const items = this.navigationItems();
    const currentIndex = items.findIndex(item => item.id === currentItem.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    const previousItem = items[previousIndex];
    
    if (previousItem) {
      this.focusedItemId.set(previousItem.id);
      this.focusNavigationItem(previousItem.id);
    }
  }
  
  /**
   * Focus next navigation item
   */
  private focusNextItem(currentItem: NavigationItem): void {
    const items = this.navigationItems();
    const currentIndex = items.findIndex(item => item.id === currentItem.id);
    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    const nextItem = items[nextIndex];
    
    if (nextItem) {
      this.focusedItemId.set(nextItem.id);
      this.focusNavigationItem(nextItem.id);
    }
  }
  
  /**
   * Focus first navigation item
   */
  private focusFirstItem(): void {
    const items = this.navigationItems();
    if (items.length > 0) {
      this.focusedItemId.set(items[0].id);
      this.focusNavigationItem(items[0].id);
    }
  }
  
  /**
   * Focus last navigation item
   */
  private focusLastItem(): void {
    const items = this.navigationItems();
    if (items.length > 0) {
      const lastItem = items[items.length - 1];
      this.focusedItemId.set(lastItem.id);
      this.focusNavigationItem(lastItem.id);
    }
  }
  
  /**
   * Focus a specific navigation item by ID
   */
  private focusNavigationItem(itemId: string): void {
    setTimeout(() => {
      const element = document.querySelector(`[data-nav-item="${itemId}"]`) as HTMLElement;
      if (element) {
        element.focus();
      }
    });
  }
  
  /**
   * Get navigation item classes
   */
  getNavigationItemClasses(item: NavigationItem): string {
    const classes = ['nav-item'];
    
    if (item.isActive) {
      classes.push('nav-item--active');
    }
    
    if (this.focusedItemId() === item.id) {
      classes.push('nav-item--focused');
    }
    
    return classes.join(' ');
  }
  
  /**
   * Track navigation items for *ngFor performance
   */
  trackByNavigationItem(index: number, item: NavigationItem): string {
    return item.id;
  }
}
