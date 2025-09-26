import { Injectable, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ViewportState, initialViewportState, calculateViewportState, VIEWPORT_BREAKPOINTS } from '../models/viewport-state.model';

/**
 * ViewportService manages responsive design state using Angular CDK BreakpointObserver
 */
@Injectable({
  providedIn: 'root'
})
export class ViewportService {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly destroyRef = inject(DestroyRef);
  
  // Private signals for state management
  private readonly _viewportState = signal<ViewportState>(initialViewportState);
  
  // Public computed signals (read-only)
  readonly viewportState = this._viewportState.asReadonly();
  readonly isMobile = () => this._viewportState().isMobile;
  readonly isTablet = () => this._viewportState().isTablet;
  readonly isDesktop = () => this._viewportState().isDesktop;
  readonly breakpoint = () => this._viewportState().breakpoint;
  readonly width = () => this._viewportState().width;
  readonly height = () => this._viewportState().height;
  
  constructor() {
    this.initializeBreakpointObserver();
    this.initializeResizeObserver();
    this.updateViewportDimensions();
  }
  
  /**
   * Check if viewport matches a specific breakpoint
   */
  isBreakpoint(breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean {
    return this._viewportState().breakpoint === breakpoint;
  }
  
  /**
   * Check if viewport is at least a specific size
   */
  isMinimumBreakpoint(breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean {
    const current = this._viewportState().breakpoint;
    const breakpointOrder = ['mobile', 'tablet', 'desktop'];
    const currentIndex = breakpointOrder.indexOf(current);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex >= targetIndex;
  }
  
  /**
   * Check if viewport is at most a specific size
   */
  isMaximumBreakpoint(breakpoint: 'mobile' | 'tablet' | 'desktop'): boolean {
    const current = this._viewportState().breakpoint;
    const breakpointOrder = ['mobile', 'tablet', 'desktop'];
    const currentIndex = breakpointOrder.indexOf(current);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex <= targetIndex;
  }
  
  /**
   * Get current viewport dimensions
   */
  getDimensions(): { width: number; height: number } {
    const state = this._viewportState();
    return { width: state.width, height: state.height };
  }
  
  /**
   * Initialize CDK BreakpointObserver for responsive breakpoints
   */
  private initializeBreakpointObserver(): void {
    // Custom breakpoints based on our design system
    const customBreakpoints = {
      mobile: `(max-width: ${VIEWPORT_BREAKPOINTS.MOBILE_MAX}px)`,
      tablet: `(min-width: ${VIEWPORT_BREAKPOINTS.TABLET_MIN}px) and (max-width: ${VIEWPORT_BREAKPOINTS.TABLET_MAX}px)`,
      desktop: `(min-width: ${VIEWPORT_BREAKPOINTS.DESKTOP_MIN}px)`,
    };
    
    // Observe mobile breakpoint
    this.breakpointObserver
      .observe([customBreakpoints.mobile])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.matches) {
          this.updateBreakpointState('mobile');
        }
      });
    
    // Observe tablet breakpoint
    this.breakpointObserver
      .observe([customBreakpoints.tablet])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.matches) {
          this.updateBreakpointState('tablet');
        }
      });
    
    // Observe desktop breakpoint
    this.breakpointObserver
      .observe([customBreakpoints.desktop])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(result => {
        if (result.matches) {
          this.updateBreakpointState('desktop');
        }
      });
    
    // Also observe standard CDK breakpoints for additional flexibility
    this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge
      ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // Update dimensions when any breakpoint changes
        this.updateViewportDimensions();
      });
  }
  
  /**
   * Initialize window resize observer for dimension tracking
   */
  private initializeResizeObserver(): void {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      this.updateViewportDimensions();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up on destroy
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', handleResize);
    });
  }
  
  /**
   * Update breakpoint state
   */
  private updateBreakpointState(breakpoint: 'mobile' | 'tablet' | 'desktop'): void {
    const currentState = this._viewportState();
    const newState = calculateViewportState(currentState.width, currentState.height);
    
    this._viewportState.set({
      ...newState,
      breakpoint,
      isMobile: breakpoint === 'mobile',
      isTablet: breakpoint === 'tablet',
      isDesktop: breakpoint === 'desktop',
    });
  }
  
  /**
   * Update viewport dimensions
   */
  private updateViewportDimensions(): void {
    if (typeof window === 'undefined') return;
    
    const width = window.innerWidth;
    const height = window.innerHeight;
    const newState = calculateViewportState(width, height);
    
    this._viewportState.set(newState);
  }
  
  /**
   * Check if device has touch capability
   */
  isTouchDevice(): boolean {
    return typeof window !== 'undefined' && 
           ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }
  
  /**
   * Check if device prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  /**
   * Get device pixel ratio
   */
  getDevicePixelRatio(): number {
    return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  }
}