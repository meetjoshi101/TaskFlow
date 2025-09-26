import { NavigationItem } from './navigation-item.model';
import { BreadcrumbItem } from './breadcrumb-item.model';

/**
 * NavigationState interface for centralized navigation state management
 */
export interface NavigationState {
  /** Currently active route path */
  currentRoute: string;
  
  /** Current breadcrumb trail */
  breadcrumbs: BreadcrumbItem[];
  
  /** All available navigation options */
  navigationItems: NavigationItem[];
  
  /** Mobile sidebar visibility state */
  isSidebarOpen: boolean;
  
  /** Whether the current viewport is mobile size */
  isMobileView: boolean;
}

/**
 * Initial navigation state
 */
export const initialNavigationState: NavigationState = {
  currentRoute: '/',
  breadcrumbs: [],
  navigationItems: [],
  isSidebarOpen: false,
  isMobileView: false,
};

/**
 * Type guard for NavigationState validation
 */
export function isValidNavigationState(state: any): state is NavigationState {
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof state.currentRoute === 'string' &&
    Array.isArray(state.breadcrumbs) &&
    Array.isArray(state.navigationItems) &&
    typeof state.isSidebarOpen === 'boolean' &&
    typeof state.isMobileView === 'boolean'
  );
}