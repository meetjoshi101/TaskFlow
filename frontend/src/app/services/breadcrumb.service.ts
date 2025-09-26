import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BreadcrumbItem } from '../models/breadcrumb-item.model';

/**
 * BreadcrumbService provides dynamic breadcrumb generation based on route configuration
 */
@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  
  /**
   * Get breadcrumbs as Observable that updates on route changes
   */
  getBreadcrumbs(): Observable<BreadcrumbItem[]> {
    return this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.createBreadcrumbs(this.activatedRoute.root))
    );
  }
  
  /**
   * Get current breadcrumbs synchronously
   */
  getCurrentBreadcrumbs(): BreadcrumbItem[] {
    return this.createBreadcrumbs(this.activatedRoute.root);
  }
  
  /**
   * Create breadcrumbs from route hierarchy
   */
  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
    // Add home breadcrumb if this is the first call
    if (breadcrumbs.length === 0) {
      breadcrumbs.push({
        label: 'Home',
        route: '/',
        isLast: false
      });
    }
    
    // Get route configuration
    const routeConfig = route.routeConfig;
    const snapshot = route.snapshot;
    
    // Build URL segment
    if (snapshot.url.length > 0) {
      url += '/' + snapshot.url.map(segment => segment.path).join('/');
      
      // Get breadcrumb data from route data or generate from URL
      let label = '';
      
      if (snapshot.data['breadcrumb']) {
        label = snapshot.data['breadcrumb'];
      } else if (routeConfig?.path) {
        // Generate label from route path
        label = this.generateLabelFromPath(routeConfig.path);
      } else if (snapshot.url.length > 0) {
        // Generate label from URL segments
        label = this.generateLabelFromPath(snapshot.url[snapshot.url.length - 1].path);
      }
      
      if (label) {
        breadcrumbs.push({
          label,
          route: url,
          isLast: false
        });
      }
    }
    
    // Recursively process child routes
    if (route.firstChild) {
      return this.createBreadcrumbs(route.firstChild, url, breadcrumbs);
    }
    
    // Mark the last breadcrumb as isLast
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isLast = true;
      
      // Remove route from last breadcrumb (current page shouldn't be clickable)
      breadcrumbs[breadcrumbs.length - 1].route = undefined;
    }
    
    return breadcrumbs;
  }
  
  /**
   * Generate human-readable label from route path
   */
  private generateLabelFromPath(path: string): string {
    if (!path) return '';
    
    // Handle parameterized routes
    if (path.startsWith(':')) {
      return 'Details';
    }
    
    // Convert kebab-case to Title Case
    return path
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Create breadcrumbs from a route path manually
   */
  createBreadcrumbsFromPath(routePath: string): BreadcrumbItem[] {
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
      
      const label = this.generateLabelFromPath(segment);
      
      breadcrumbs.push({
        label,
        route: isLast ? undefined : currentPath,
        isLast
      });
    });
    
    return breadcrumbs;
  }
  
  /**
   * Get breadcrumb trail for a specific route
   */
  getBreadcrumbsForRoute(routePath: string): BreadcrumbItem[] {
    // Map of known routes to their breadcrumb configurations
    const routeBreadcrumbMap: Record<string, BreadcrumbItem[]> = {
      '/': [
        { label: 'Home', route: '/', isLast: true }
      ],
      '/tasks': [
        { label: 'Home', route: '/', isLast: false },
        { label: 'Tasks', route: undefined, isLast: true }
      ],
      '/deleted-items': [
        { label: 'Home', route: '/', isLast: false },
        { label: 'Deleted Items', route: undefined, isLast: true }
      ]
    };
    
    // Return configured breadcrumbs or generate them dynamically
    return routeBreadcrumbMap[routePath] || this.createBreadcrumbsFromPath(routePath);
  }
  
  /**
   * Check if a route should show breadcrumbs
   */
  shouldShowBreadcrumbs(routePath: string): boolean {
    // Don't show breadcrumbs on home page
    if (!routePath || routePath === '/') {
      return false;
    }
    
    // Show breadcrumbs for all other routes
    return true;
  }
  
  /**
   * Update breadcrumb label for a specific route level
   */
  updateBreadcrumbLabel(breadcrumbs: BreadcrumbItem[], level: number, newLabel: string): BreadcrumbItem[] {
    if (level < 0 || level >= breadcrumbs.length) {
      return breadcrumbs;
    }
    
    return breadcrumbs.map((breadcrumb, index) => 
      index === level ? { ...breadcrumb, label: newLabel } : breadcrumb
    );
  }
  
  /**
   * Validate breadcrumb chain integrity
   */
  validateBreadcrumbChain(breadcrumbs: BreadcrumbItem[]): boolean {
    if (breadcrumbs.length === 0) return false;
    
    // Check that only the last item has isLast: true
    const lastItems = breadcrumbs.filter(b => b.isLast);
    if (lastItems.length !== 1) return false;
    
    // Check that the last item is actually last
    const lastIndex = breadcrumbs.length - 1;
    if (!breadcrumbs[lastIndex].isLast) return false;
    
    // Check that non-last items have routes
    for (let i = 0; i < lastIndex; i++) {
      if (!breadcrumbs[i].route) return false;
    }
    
    return true;
  }
}