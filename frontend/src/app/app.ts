import { Component, inject, OnInit, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TopBarComponent } from './components/top-bar/top-bar';
import { SidebarComponent } from './components/sidebar/sidebar';
import { NavigationService } from './services/navigation.service';
import { ViewportService } from './services/viewport.service';
import { navigationConfig } from './config/navigation.config';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, TopBarComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent implements OnInit {
  private readonly navigationService = inject(NavigationService);
  private readonly viewportService = inject(ViewportService);
  
  readonly isMobileView = this.viewportService.isMobile;
  readonly isSidebarOpen = this.navigationService.isSidebarOpen;
  
  constructor() {
    // Safe viewport state sync - only update when mobile state actually changes
    let previousMobileState: boolean | null = null;
    effect(() => {
      const viewport = this.viewportService.viewportState();
      if (previousMobileState !== viewport.isMobile) {
        previousMobileState = viewport.isMobile;
        this.navigationService.updateMobileViewState(viewport.isMobile);
      }
    });
  }
  
  ngOnInit(): void {
    // Initialize navigation with the application configuration
    this.navigationService.updateNavigationItems(navigationConfig.items);
  }
  
  /**
   * Get main container CSS classes
   */
  getMainContainerClasses(): string {
    const classes = ['main-container'];
    
    if (this.isMobileView()) {
      classes.push('main-container--mobile');
    } else {
      classes.push('main-container--desktop');
    }
    
    return classes.join(' ');
  }
  
  /**
   * Get main content CSS classes
   */
  getMainContentClasses(): string {
    const classes = ['main-content'];
    
    if (!this.isMobileView()) {
      classes.push('main-content--with-sidebar');
    }
    
    return classes.join(' ');
  }
}
