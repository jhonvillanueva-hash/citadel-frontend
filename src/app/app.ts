import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet, ActivatedRoute } from '@angular/router';
import { ScrollAnimationService } from './core/services/scroll-animation.service';
import { ToastContainerComponent } from './shared/components/toast/toast-container';
import { ConfirmDialogComponent } from "./shared/components/confirm-dialog/confirm-dialog";
import { CartModal } from './features/public/store/components/cart-modal/cart-modal';
import { filter } from 'rxjs';
import { HeaderStore } from './features/public/store/components/header-store/header-store';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent, CartModal, HeaderStore, CommonModule],
  templateUrl: './app.html',
})

export class App implements OnInit, OnDestroy {

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  showHeader = signal(false);

  constructor(private scrollAnimationService: ScrollAnimationService) {}

  ngOnInit() {
    this.scrollAnimationService.init();
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        let current = this.route.root;

        while (current.firstChild) {
          current = current.firstChild;
        }

        this.showHeader.set(current.snapshot.data['showHeader'] ?? false);
      });
  }

  ngOnDestroy() {
    this.scrollAnimationService.destroy();
  }
}
