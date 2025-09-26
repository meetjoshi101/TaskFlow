import { Injectable, signal, computed, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationState, initialNavigationState } from '../models/navigation-state.model';
import { NavigationItem } from '../models/navigation-item.model';
import { BreadcrumbItem } from '../models/breadcrumb-item.model';

/**
 * NavigationService provides centralized state management for navigation
 * using Angular signals-based reactive state management
 */
@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly router = inject(Router);
  
  // Private signals for state management
  private readonly _navigationState = signal<NavigationState>(initialNavigationState);
  private readonly _isMobileView = signal<boolean>(false);
  
  // Public computed signals (read-only)
  readonly navigationState = this._navigationState.asReadonly();
  readonly currentRoute = computed(() => this._navigationState().currentRoute);
  readonly breadcrumbs = computed(() => this._navigationState().breadcrumbs);
  readonly navigationItems = computed(() => this._navigationState().navigationItems);
  readonly isSidebarOpen = computed(() => this._navigationState().isSidebarOpen);
  readonly isMobileView = this._isMobileView.asReadonly();
  
  constructor() {
    this.initializeRouterSubscription();
    this.loadPersistedState();
  }
  
  /**
   * Navigate to a specific route
   */
  async navigateTo(route: string): Promise<boolean> {
    try {
      const result = await this.router.navigate([route]);
      if (result) {
        this.updateCurrentRoute(route);
        this.refreshBreadcrumbs();
        this.updateActiveNavigationItem(route);
        this.persistState();
      }
      return result;
    } catch (error) {
      console.error('Navigation failed:', error);
      return false;
    }
  }
  
  /**
   * Toggle sidebar visibility
   */
  toggleSidebar(): void {
    const currentState = this._navigationState();
    this._navigationState.set({
      ...currentState,
      isSidebarOpen: !currentState.isSidebarOpen
    });
    this.persistState();
  }
  
  /**
   * Close sidebar
   */
  closeSidebar(): void {
    const currentState = this._navigationState();
    this._navigationState.set({
      ...currentState,
      isSidebarOpen: false
    });
    this.persistState();
  }
  
  /**
   * Update navigation items
   */
  updateNavigationItems(items: NavigationItem[]): void {
    const currentState = this._navigationState();
    const sortedItems = [...items].sort((a, b) => a.order - b.order);
    
    this._navigationState.set({
      ...currentState,
      navigationItems: sortedItems
    });
    
    // Update active state based on current route
    this.updateActiveNavigationItem(currentState.currentRoute);
    this.persistState();
  }
  
  /**
   * Refresh breadcrumbs based on current route
   */
  refreshBreadcrumbs(): void {
    const currentRoute = this._navigationState().currentRoute;
    const breadcrumbs = this.generateBreadcrumbs(currentRoute);
    
    const currentState = this._navigationState();
    this._navigationState.set({
      ...currentState,
      breadcrumbs
    });
  }
  
  /**
   * Update mobile view state
   */
  updateMobileViewState(isMobile: boolean): void {
    this._isMobileView.set(isMobile);
    
    const currentState = this._navigationState();
    this._navigationState.set({
      ...currentState,
      isMobileView: isMobile,
      // Auto-close sidebar on mobile when switching to desktop
      isSidebarOpen: isMobile ? currentState.isSidebarOpen : false
    });
    
    this.persistState();
  }
  
  /**
   * Initialize router subscription to track route changes
   */
  private initializeRouterSubscription(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateCurrentRoute(event.urlAfterRedirects);
        this.refreshBreadcrumbs();
        this.updateActiveNavigationItem(event.urlAfterRedirects);
        this.persistState();
      });
  }
  
  /**
   * Update current route in state
   */
  private updateCurrentRoute(route: string): void {
    const currentState = this._navigationState();
    this._navigationState.set({
      ...currentState,
      currentRoute: route
    });
  }
  
  /**
   * Update active navigation item based on route
   */
  private updateActiveNavigationItem(route: string): void {
    const currentState = this._navigationState();
    
    // Extract pathname from URL (ignore query parameters and fragments)
    const routePath = route.split('?')[0].split('#')[0];
    
    const updatedItems = currentState.navigationItems.map(item => ({
      ...item,
      isActive: item.route === routePath
    }));
    
    this._navigationState.set({
      ...currentState,
      navigationItems: updatedItems
    });
  }
  
  /**
   * Generate breadcrumbs from route
   */
  private generateBreadcrumbs(route: string): BreadcrumbItem[] {
    // Extract pathname from URL (ignore query parameters and fragments)
    const routePath = route.split('?')[0].split('#')[0];
    
    if (!routePath || routePath === '/') {
      return [{ label: 'Home', route: '/', isLast: true }];
    }
    
    const segments = routePath.split('/').filter(segment => segment.length > 0);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', route: '/', isLast: false }
    ];
    
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === segments.length - 1;
      
      // Capitalize and format segment for display
      const label = this.formatSegmentLabel(segment);
      
      breadcrumbs.push({
        label,
        route: isLast ? undefined : currentPath,
        isLast
      });
    });
    
    return breadcrumbs;
  }
  
  /**
   * Format route segment for breadcrumb display
   */
  private formatSegmentLabel(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Persist navigation state to localStorage
   */
  private persistState(): void {
    try {
      const state = this._navigationState();
      const persistedData = {
        isSidebarOpen: state.isSidebarOpen,
        navigationItems: state.navigationItems,
        currentRoute: state.currentRoute
      };
      localStorage.setItem('taskflow_navigation_state', JSON.stringify(persistedData));
    } catch (error) {
      console.warn('Failed to persist navigation state:', error);
    }
  }
  
  /**
   * Load persisted state from localStorage
   */
  private loadPersistedState(): void {
    try {
      const persistedData = localStorage.getItem('taskflow_navigation_state');
      if (persistedData) {
        const parsed = JSON.parse(persistedData);
        const currentState = this._navigationState();
        
        this._navigationState.set({
          ...currentState,
          isSidebarOpen: parsed.isSidebarOpen ?? false,
          navigationItems: parsed.navigationItems ?? [],
          currentRoute: parsed.currentRoute ?? '/'
        });
        
        this.refreshBreadcrumbs();
      }
    } catch (error) {
      console.warn('Failed to load persisted navigation state:', error);
    }
  }
}