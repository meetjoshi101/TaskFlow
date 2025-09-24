import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { NavigationService } from '../services/navigation.service';
import { ViewportService } from '../services/viewport.service';

/**
 * Navigation guard for maintaining navigation state consistency
 * Ensures proper navigation state updates and mobile sidebar handling
 */
export const navigationGuard: CanActivateFn = (route, state) => {
  const navigationService = inject(NavigationService);
  const viewportService = inject(ViewportService);
  const router = inject(Router);
  
  try {
    // Close mobile sidebar when navigating to a new route
    if (viewportService.isMobile()) {
      navigationService.closeSidebar();
    }
    
    // Update navigation service with current route information
    const currentRoute = state.url;
    
    // Validate route exists in navigation items
    const navigationItems = navigationService.navigationItems();
    const isValidRoute = navigationItems.some(item => item.route === currentRoute) || 
                        currentRoute === '/' || 
                        currentRoute === '/tasks' || 
                        currentRoute === '/deleted-items';
    
    if (!isValidRoute && currentRoute !== '/') {
      // Redirect to default route if invalid
      console.warn(`Invalid route attempted: ${currentRoute}, redirecting to /tasks`);
      router.navigate(['/tasks']);
      return false;
    }
    
    // Log navigation for debugging (only in development)
    if (typeof environment !== 'undefined' && !environment.production) {
      console.log(`Navigation guard: allowing navigation to ${currentRoute}`);
    }
    
    return true;
    
  } catch (error) {
    console.error('Navigation guard error:', error);
    
    // Fallback to allow navigation but log the error
    return true;
  }
};

// Note: Import environment if available, otherwise remove the environment check
declare const environment: { production: boolean } | undefined;
