/**
 * NavigationItem interface for sidebar navigation menu entries
 */
export interface NavigationItem {
  /** Unique identifier for the navigation item */
  id: string;
  
  /** Display text for the navigation item (max 50 characters) */
  label: string;
  
  /** Angular router path (e.g., '/tasks', '/deleted') */
  route: string;
  
  /** Optional icon name/class for visual representation */
  icon?: string;
  
  /** Whether this item represents the current page */
  isActive: boolean;
  
  /** Display order in the navigation menu */
  order: number;
}

/**
 * Type guard for NavigationItem validation
 */
export function isValidNavigationItem(item: any): item is NavigationItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.label === 'string' &&
    item.label.length > 0 &&
    item.label.length <= 50 &&
    typeof item.route === 'string' &&
    item.route.startsWith('/') &&
    typeof item.isActive === 'boolean' &&
    typeof item.order === 'number' &&
    item.order > 0 &&
    (item.icon === undefined || typeof item.icon === 'string')
  );
}