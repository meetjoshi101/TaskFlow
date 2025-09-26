/**
 * ViewportState interface for responsive design state management
 */
export interface ViewportState {
  /** Current viewport width in pixels */
  width: number;
  
  /** Current viewport height in pixels */
  height: number;
  
  /** Whether the viewport is mobile size (< 768px) */
  isMobile: boolean;
  
  /** Whether the viewport is tablet size (768px - 1023px) */
  isTablet: boolean;
  
  /** Whether the viewport is desktop size (>= 1024px) */
  isDesktop: boolean;
  
  /** Current breakpoint name */
  breakpoint: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Viewport breakpoints configuration
 */
export const VIEWPORT_BREAKPOINTS = {
  MOBILE_MAX: 767,
  TABLET_MIN: 768,
  TABLET_MAX: 1023,
  DESKTOP_MIN: 1024,
} as const;

/**
 * Initial viewport state
 */
export const initialViewportState: ViewportState = {
  width: 0,
  height: 0,
  isMobile: false,
  isTablet: false,
  isDesktop: true,
  breakpoint: 'desktop',
};

/**
 * Type guard for ViewportState validation
 */
export function isValidViewportState(state: any): state is ViewportState {
  return (
    typeof state === 'object' &&
    state !== null &&
    typeof state.width === 'number' &&
    typeof state.height === 'number' &&
    typeof state.isMobile === 'boolean' &&
    typeof state.isTablet === 'boolean' &&
    typeof state.isDesktop === 'boolean' &&
    ['mobile', 'tablet', 'desktop'].includes(state.breakpoint)
  );
}

/**
 * Calculate viewport state from dimensions
 */
export function calculateViewportState(width: number, height: number): ViewportState {
  const isMobile = width <= VIEWPORT_BREAKPOINTS.MOBILE_MAX;
  const isTablet = width >= VIEWPORT_BREAKPOINTS.TABLET_MIN && width <= VIEWPORT_BREAKPOINTS.TABLET_MAX;
  const isDesktop = width >= VIEWPORT_BREAKPOINTS.DESKTOP_MIN;
  
  let breakpoint: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (isMobile) breakpoint = 'mobile';
  else if (isTablet) breakpoint = 'tablet';
  
  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
  };
}