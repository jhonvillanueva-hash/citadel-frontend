import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ScrollAnimationService } from './core/services/scroll-animation.service';
import { ToastContainerComponent } from './shared/components/toast/toast-container';
import { ConfirmDialogComponent } from "./shared/components/confirm-dialog/confirm-dialog";
import { CartModal } from './features/public/store/components/cart-modal/cart-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastContainerComponent, ConfirmDialogComponent, CartModal],
  templateUrl: './app.html',
})

export class App implements OnInit, OnDestroy {
  constructor(private scrollAnimationService: ScrollAnimationService) {}

  ngOnInit() {
    this.scrollAnimationService.init();
  }

  ngOnDestroy() {
    this.scrollAnimationService.destroy();
  }
}
