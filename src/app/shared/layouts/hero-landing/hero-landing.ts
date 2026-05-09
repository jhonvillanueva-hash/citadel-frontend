import { Component, inject, HostListener, signal, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-hero-landing',
  standalone: true,
  templateUrl: './hero-landing.html',
  imports: [RouterLink]
})
export class HeroLanding implements OnDestroy {
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  readonly currentUser = this.authService.currentUser;
  readonly isMenuOpen = signal(false);

  logout(): void {
    this.authService.logout();
  }

  toggleMenu(): void {
    this.isMenuOpen() ? this.closeMenu() : this.openMenu();
  }

  openMenu(): void {
    this.isMenuOpen.set(true);
    this.setBodyScroll(false);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
    this.setBodyScroll(true);
  }

  private setBodyScroll(enabled: boolean): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = enabled ? '' : 'hidden';
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.isMenuOpen()) this.closeMenu();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (isPlatformBrowser(this.platformId) && window.innerWidth >= 1024 && this.isMenuOpen()) {
      this.closeMenu();
    }
  }

  ngOnDestroy(): void {
    this.setBodyScroll(true);
  }
}
