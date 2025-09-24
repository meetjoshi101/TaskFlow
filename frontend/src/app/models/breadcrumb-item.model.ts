/**
 * BreadcrumbItem interface for top bar breadcrumb navigation segments
 */
export interface BreadcrumbItem {
  /** Display text for the breadcrumb segment (max 30 characters) */
  label: string;
  
  /** Optional route for clickable breadcrumb segments */
  route?: string;
  
  /** Whether this is the final breadcrumb (current page) */
  isLast: boolean;
}

/**
 * Type guard for BreadcrumbItem validation
 */
export function isValidBreadcrumbItem(item: any): item is BreadcrumbItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.label === 'string' &&
    item.label.length > 0 &&
    item.label.length <= 30 &&
    typeof item.isLast === 'boolean' &&
    (item.route === undefined || (typeof item.route === 'string' && item.route.startsWith('/')))
  );
}

/**
 * Validates that only one breadcrumb has isLast: true
 */
export function isValidBreadcrumbChain(breadcrumbs: BreadcrumbItem[]): boolean {
  const lastBreadcrumbs = breadcrumbs.filter(b => b.isLast);
  return lastBreadcrumbs.length === 1;
}