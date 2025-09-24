import { NavigationItem } from '../models/navigation-item.model';

/**
 * Navigation configuration for the application
 * Defines the main navigation items displayed in the sidebar
 */
export interface NavigationConfig {
  items: NavigationItem[];
  defaultRoute: string;
  applicationName: string;
}

/**
 * Default navigation configuration
 */
export const navigationConfig: NavigationConfig = {
  applicationName: 'TaskFlow',
  defaultRoute: '/tasks',
  items: [
    {
      id: 'tasks',
      label: 'Tasks',
      route: '/tasks',
      icon: 'task-icon',
      isActive: false,
      order: 1
    },
    {
      id: 'deleted-items',
      label: 'Deleted Items',
      route: '/deleted-items',
      icon: 'trash-icon',
      isActive: false,
      order: 2
    }
  ]
};

/**
 * Navigation item categories for future organization
 */
export const navigationCategories = {
  MAIN: 'main',
  ADMIN: 'admin',
  SETTINGS: 'settings'
} as const;

/**
 * Navigation icons mapping
 */
export const navigationIcons = {
  tasks: 'task-icon',
  'deleted-items': 'trash-icon',
  settings: 'settings-icon',
  profile: 'profile-icon',
  help: 'help-icon'
} as const;

/**
 * Helper function to get navigation item by route
 */
export function getNavigationItemByRoute(route: string): NavigationItem | undefined {
  return navigationConfig.items.find(item => item.route === route);
}

/**
 * Helper function to get navigation item by id
 */
export function getNavigationItemById(id: string): NavigationItem | undefined {
  return navigationConfig.items.find(item => item.id === id);
}

/**
 * Helper function to validate navigation configuration
 */
export function validateNavigationConfig(config: NavigationConfig): boolean {
  // Check if all required fields are present
  if (!config.applicationName || !config.defaultRoute || !Array.isArray(config.items)) {
    return false;
  }
  
  // Check if all items have unique IDs
  const ids = config.items.map(item => item.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    return false;
  }
  
  // Check if all items have unique routes
  const routes = config.items.map(item => item.route);
  const uniqueRoutes = new Set(routes);
  if (routes.length !== uniqueRoutes.size) {
    return false;
  }
  
  // Check if default route exists in items
  const hasDefaultRoute = config.items.some(item => item.route === config.defaultRoute);
  if (!hasDefaultRoute) {
    return false;
  }
  
  return true;
}

/**
 * Create a new navigation item
 */
export function createNavigationItem(
  id: string,
  label: string,
  route: string,
  order: number,
  icon?: string
): NavigationItem {
  return {
    id,
    label,
    route,
    icon: icon || navigationIcons[id as keyof typeof navigationIcons],
    isActive: false,
    order
  };
}